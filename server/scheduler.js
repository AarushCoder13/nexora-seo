const cron = require('node-cron');
const db = require('./db');
const { crawlAndAudit } = require('./crawler');
const { generateSeoRecommendations } = require('./aiService');
const { dispatchTelegramAuditReport, sendWebhookNotification } = require('./telegram');

let activeJob = null;
let isRunning = false;

function getCronFromInterval(interval) {
  switch (interval) {
    case '1h': return '0 * * * *';
    case '3h': return '0 */3 * * *';
    case '6h': return '0 */6 * * *';
    case '12h': return '0 */12 * * *';
    case '24h': return '0 0 * * *';
    default: return '0 */6 * * *';
  }
}

function calculateNextRun(interval) {
  const now = new Date();
  let hoursToAdd = 6;
  if (interval === '1h') hoursToAdd = 1;
  else if (interval === '3h') hoursToAdd = 3;
  else if (interval === '6h') hoursToAdd = 6;
  else if (interval === '12h') hoursToAdd = 12;
  else if (interval === '24h') hoursToAdd = 24;

  const next = new Date(now.getTime() + hoursToAdd * 60 * 60 * 1000);
  return next.toISOString();
}

async function auditSingleWebsite(site, settings, triggerType = 'scheduled') {
  console.log(`[Scheduler] Auditing website: [${site.name}] ${site.url}...`);
  const audit = await crawlAndAudit(site.url, site.primaryKeywords);
  
  // Tag audit with website ID and name
  const enrichedAudit = {
    ...audit,
    websiteId: site.id,
    websiteName: site.name
  };
  db.addAudit(enrichedAudit);

  // Update website record with last score and audit timestamp
  db.updateWebsite(site.id, {
    lastScore: audit.scores?.overall || 0,
    lastRunAt: new Date().toISOString()
  });

  // Generate actionable AI recommendations for this site
  const siteSettings = {
    ...settings,
    targetWebsite: site.url,
    niche: site.niche,
    primaryKeywords: site.primaryKeywords
  };
  const newRecommendations = await generateSeoRecommendations(audit, siteSettings);

  // Tag recommendations with websiteId
  const taggedRecs = newRecommendations.map(r => ({
    ...r,
    websiteId: site.id,
    websiteName: site.name
  }));

  // Deduplicate against existing pending items for this target site
  const existingRecs = db.readDb().recommendations || [];
  let addedCount = 0;
  for (const rec of taggedRecs) {
    const isDuplicate = existingRecs.some(
      e => e.type === rec.type && (e.targetPage === rec.targetPage || e.websiteId === rec.websiteId) && e.status === 'pending'
    );
    if (!isDuplicate) {
      db.addRecommendation(rec);
      addedCount++;
    }
  }

  // Create In-App Notification
  db.addNotification({
    title: `Audit Completed: ${site.name}`,
    message: `Audited ${site.url}. Overall Health: ${audit.scores?.overall || 0}/100. ${addedCount} new recommendations generated.`,
    type: (audit.scores?.overall || 0) >= 75 ? 'success' : 'warning',
    websiteId: site.id
  });

  // Send Telegram Notification
  if (settings.telegramEnabled && settings.telegramBotToken && settings.telegramChatId) {
    console.log(`[Scheduler] Dispatching Telegram report for ${site.name}...`);
    await dispatchTelegramAuditReport(siteSettings, audit, addedCount);
  }

  // Send Webhook if configured
  if (settings.webhookUrl) {
    await sendWebhookNotification(settings.webhookUrl, {
      title: `[${site.name}] SEO Health: ${audit.scores?.overall || 0}/100`,
      summary: `Automated audit completed for ${site.url}. Detected ${audit.issues?.length || 0} issues. ${addedCount} fixes ready for approval.`,
      url: site.url,
      websiteId: site.id
    });
  }

  return {
    websiteId: site.id,
    websiteName: site.name,
    audit: enrichedAudit,
    newRecommendationsAdded: addedCount
  };
}

async function executeSeoCycle(triggerType = 'scheduled', specificWebsiteId = null) {
  if (isRunning) {
    console.log(`[Scheduler] Cycle already running. Skipping trigger (${triggerType}).`);
    return { success: false, reason: 'Already in progress' };
  }

  isRunning = true;
  console.log(`[Scheduler] Starting SEO Autopilot Cycle (${triggerType})...`);

  try {
    const database = db.readDb();
    const settings = database.settings;
    const allWebsites = database.websites || [];

    // Filter websites to audit
    let targetSites = [];
    if (specificWebsiteId) {
      targetSites = allWebsites.filter(w => w.id === specificWebsiteId);
    } else {
      targetSites = allWebsites.filter(w => w.active);
    }

    if (targetSites.length === 0) {
      console.log('[Scheduler] No active websites found to audit.');
      isRunning = false;
      return { success: false, reason: 'No active websites found' };
    }

    console.log(`[Scheduler] Auditing ${targetSites.length} website(s)...`);
    const results = [];
    for (const site of targetSites) {
      const res = await auditSingleWebsite(site, settings, triggerType);
      results.push(res);
    }

    // Update Global Next Run timestamp
    const nextRun = calculateNextRun(settings.scheduleInterval || '6h');
    db.updateSettings({
      lastRunAt: new Date().toISOString(),
      nextRunAt: nextRun
    });

    isRunning = false;
    console.log(`[Scheduler] Completed SEO Autopilot Cycle for ${targetSites.length} site(s). Next run at: ${nextRun}`);
    return {
      success: true,
      sitesAudited: targetSites.length,
      results,
      nextRunAt: nextRun
    };
  } catch (err) {
    console.error('[Scheduler] Error during SEO cycle:', err);
    isRunning = false;
    db.addNotification({
      title: 'SEO Cycle Error',
      message: `Automated cycle encountered an issue: ${err.message}`,
      type: 'alert'
    });
    return { success: false, error: err.message };
  }
}

function initScheduler() {
  const database = db.readDb();
  const settings = database.settings;

  if (activeJob) {
    activeJob.stop();
    activeJob = null;
  }

  const cronPattern = settings.cronExpression || getCronFromInterval(settings.scheduleInterval || '6h');
  console.log(`[Scheduler] Initializing 24/7 background scheduler for all active websites with cron: "${cronPattern}" (${settings.scheduleInterval || '6h'})`);

  if (settings.autoRunEnabled !== false) {
    activeJob = cron.schedule(cronPattern, async () => {
      console.log('[Scheduler] Cron timer fired! Auditing all active websites...');
      await executeSeoCycle('scheduled');
    });

    if (!settings.nextRunAt) {
      db.updateSettings({
        nextRunAt: calculateNextRun(settings.scheduleInterval || '6h')
      });
    }
  } else {
    console.log('[Scheduler] Auto-scheduler is currently paused.');
  }
}

function reschedule(interval, customCron = null) {
  const cronPattern = customCron || getCronFromInterval(interval);
  db.updateSettings({
    scheduleInterval: interval,
    cronExpression: cronPattern,
    nextRunAt: calculateNextRun(interval)
  });
  initScheduler();
  return { success: true, interval, cronPattern };
}

module.exports = {
  initScheduler,
  executeSeoCycle,
  reschedule,
  isCycleRunning: () => isRunning
};

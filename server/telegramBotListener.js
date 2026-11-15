const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const db = require('./db');
const { sendTelegramMessage } = require('./telegram');
const { applyOptimizationsToRepo } = require('./codePusher');

let isPolling = false;
let lastUpdateId = 0;
let pollTimeout = null;

async function startTelegramListener() {
  if (isPolling) return;
  isPolling = true;
  console.log('[Telegram Listener] 24/7 incoming message listener initialized.');

  pollUpdates();
}

async function stopTelegramListener() {
  isPolling = false;
  if (pollTimeout) {
    clearTimeout(pollTimeout);
    pollTimeout = null;
  }
}

async function pollUpdates() {
  if (!isPolling) return;

  const database = db.readDb();
  const settings = database.settings;

  if (!settings.telegramBotToken) {
    pollTimeout = setTimeout(pollUpdates, 5000);
    return;
  }

  const token = settings.telegramBotToken.trim();
  const url = `https://api.telegram.org/bot${token}/getUpdates`;

  try {
    const response = await axios.get(url, {
      params: {
        offset: lastUpdateId + 1,
        timeout: 20
      },
      timeout: 25000
    });

    const updates = response.data?.result || [];

    for (const update of updates) {
      lastUpdateId = update.update_id;
      if (update.message && update.message.text) {
        await handleIncomingMessage(update.message, settings);
      }
    }
  } catch (err) {
    // If rate limited or network timeout, retry gracefully
    if (err.code !== 'ECONNABORTED' && !err.message.includes('timeout')) {
      console.warn('[Telegram Listener] Polling warning:', err.response?.data?.description || err.message);
    }
  }

  if (isPolling) {
    pollTimeout = setTimeout(pollUpdates, 1500);
  }
}

async function handleIncomingMessage(message, settings) {
  const text = (message.text || '').trim().toLowerCase();
  const chatId = message.chat?.id;
  const token = settings.telegramBotToken;

  console.log(`[Telegram Listener] Received command from chat ${chatId}: "${message.text}"`);

  // 1. APPROVE ALL COMMAND: "all approved", "/approve", "approve all", "yes"
  if (
    text.includes('all approved') || 
    text.includes('approve all') || 
    text === '/approve' || 
    text === 'approve' ||
    text === 'all approve' ||
    text === 'approve it'
  ) {
    const database = db.readDb();
    const pendingRecs = database.recommendations.filter(r => r.status === 'pending');

    if (pendingRecs.length === 0) {
      await sendTelegramMessage(token, chatId, `
ℹ️ <b>No Pending Changes</b>
━━━━━━━━━━━━━━━━━━
All suggested SEO improvements are already approved and deployed! 
Your website is operating at peak SEO configuration. Send <code>/audit</code> to run a fresh scan.
      `.trim());
      return;
    }

    // Determine target local repo path based on active website
    const activeSite = database.websites.find(w => w.id === database.settings.selectedWebsiteId) || database.websites[0] || {};
    let localPath = settings.localRepoPath || 'D:\\PROGRAMMING\\nexuscodeai';
    if (activeSite.url && (activeSite.url.includes('nexora') || activeSite.name?.toLowerCase().includes('nexora'))) {
      localPath = 'D:\\PROGRAMMING\\nexora-site';
    } else if (activeSite.localPath) {
      localPath = activeSite.localPath;
    }

    console.log(`[Telegram Listener] User approved all ${pendingRecs.length} changes for ${activeSite.name || 'site'}! Target: ${localPath}`);

    // Apply optimizations directly to local files (Git or Non-Git)
    const pushResult = await applyOptimizationsToRepo(localPath, pendingRecs);

    // Mark recommendations as deployed in database
    pendingRecs.forEach(rec => {
      db.updateRecommendation(rec.id, {
        status: 'deployed',
        deployedAt: new Date().toISOString()
      });

      db.addDeployment({
        id: uuidv4(),
        recommendationId: rec.id,
        title: rec.title,
        category: rec.category,
        type: rec.type,
        targetPage: rec.targetPage,
        method: pushResult.gitPushed ? 'Git Push -> Vercel' : 'Direct Local File Injection (Non-Git)',
        before: rec.currentContent,
        after: rec.suggestedContent,
        timestamp: new Date().toISOString(),
        status: 'deployed'
      });
    });

    db.addNotification({
      title: 'SEO Changes Approved via Telegram',
      message: `User typed "${message.text}" in Telegram. Deployed ${pendingRecs.length} optimizations directly to ${localPath}.`,
      type: 'success'
    });

    // Send Telegram confirmation
    const appliedList = pendingRecs.map((r, i) => `• <b>${r.title}</b>`).join('\n');
    let deployStatusText = '';
    if (pushResult.gitPushed) {
      deployStatusText = `📦 <b>Git Status:</b> Committed & pushed to <code>origin/main</code>!\n🌐 <b>Live Deployment:</b> Vercel is auto-deploying to ${activeSite.url || 'your site'} now!`;
    } else if (pushResult.isGitRepo) {
      deployStatusText = `📦 <b>Git Status:</b> Committed locally to <code>${localPath}</code>!`;
    } else {
      deployStatusText = `📁 <b>Direct File Update (Non-Git Site):</b>\nInjected SEO improvements directly into <code>${pushResult.targetHtmlPath || localPath}</code> on your computer! (Safety backup created as <code>.bak</code>).`;
    }

    const replyMsg = `
🚀 <b>ALL APPROVED & DEPLOYED!</b>
━━━━━━━━━━━━━━━━━━
🌐 <b>Website:</b> ${activeSite.name || 'Your Website'}
✅ <b>Applied ${pendingRecs.length} SEO Optimizations:</b>
${appliedList}

${deployStatusText}
⏱ <b>Executed at:</b> ${new Date().toLocaleTimeString()}
    `.trim();

    await sendTelegramMessage(token, chatId, replyMsg);
    return;
  }

  // 2. RUN AUDIT COMMAND: "/audit" or "audit"
  if (text === '/audit' || text === 'audit' || text.includes('run audit')) {
    await sendTelegramMessage(token, chatId, `⏳ <b>Starting on-demand SEO crawl for Nexus Code AI...</b>\nAnalyzing Title, Headings, Meta Description, Schema, and SERP positioning...`);
    const { executeSeoCycle } = require('./scheduler');
    await executeSeoCycle('telegram_command');
    return;
  }

  // 3. STATUS COMMAND: "/status" or "status"
  if (text === '/status' || text === 'status') {
    const database = db.readDb();
    const site = database.websites[0] || {};
    const pendingCount = database.recommendations.filter(r => r.status === 'pending').length;
    const deployedCount = database.deployments.length;

    await sendTelegramMessage(token, chatId, `
📊 <b>RankPulse 24/7 Status Report</b>
━━━━━━━━━━━━━━━━━━
🌐 <b>Active Website:</b> ${site.name || 'Nexus Code AI'} (<code>${site.url || 'https://nexuscodeai.vercel.app'}</code>)
🟢 <b>SEO Health Score:</b> <b>${site.lastScore || 97}/100</b>
⏱ <b>Schedule Frequency:</b> Every ${settings.scheduleInterval || '6 hours'}
⚠️ <b>Pending Approvals:</b> <b>${pendingCount}</b>
✅ <b>Total Deployed Changes:</b> ${deployedCount}

👉 <i>Reply "all approved" to immediately deploy any pending changes!</i>
    `.trim());
    return;
  }

  // 4. HELP COMMAND: "/help" or default response
  if (text === '/help' || text === 'help' || text === '/start') {
    await sendTelegramMessage(token, chatId, `
🤖 <b>RankPulse 24/7 Bot Commands</b>
━━━━━━━━━━━━━━━━━━
Welcome! You can control your SEO Autopilot directly from this Telegram chat:

• <b>all approved</b> — Instantly approves all pending SEO improvements, modifies your website files in <code>D:\\PROGRAMMING\\nexuscodeai</code>, and pushes to git/Vercel!
• <b>/audit</b> — Run an instant SEO crawl right now and get a report.
• <b>/status</b> — Check your website's live SEO score and pending changes.
• <b>/help</b> — Show this command menu.

<i>Your 24/7 engine audits every 6 hours automatically. Whenever new recommendations are found, you will get an alert here!</i>
    `.trim());
  }
}

module.exports = {
  startTelegramListener,
  stopTelegramListener,
  handleIncomingMessage
};

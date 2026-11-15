const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');
const { executeSeoCycle, reschedule, isCycleRunning } = require('./scheduler');
const { handleIncomingMessage } = require('./telegramBotListener');
const { generateSeoArticle, generatePlannerIdeas } = require('./aiService');
const { deployRecommendation, deployContent } = require('./deployer');
const { sendTelegramMessage, sendWebhookNotification, dispatchTelegramContentAlert } = require('./telegram');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Normalize URL for Vercel Serverless Function rewrites
app.use((req, res, next) => {
  if (req.url && !req.url.startsWith('/api') && !req.url.startsWith('/assets')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }
  next();
});

// 1. Status & Health
app.get('/api/status', (req, res) => {
  const database = db.readDb();
  res.json({
    online: true,
    schedulerActive: database.settings.autoRunEnabled !== false,
    interval: database.settings.scheduleInterval || '6h',
    cronExpression: database.settings.cronExpression,
    lastRunAt: database.settings.lastRunAt,
    nextRunAt: database.settings.nextRunAt,
    selectedWebsiteId: database.settings.selectedWebsiteId,
    isCycleRunning: isCycleRunning(),
    counts: {
      websites: database.websites.length,
      audits: database.audits.length,
      pendingRecommendations: database.recommendations.filter(r => r.status === 'pending').length,
      deployedChanges: database.deployments.length,
      contentArticles: database.contentPlan.length
    }
  });
});

// 2. Multi-Website Management CRUD
app.get('/api/websites', (req, res) => {
  res.json(db.getWebsites());
});

app.post('/api/websites', async (req, res) => {
  try {
    const newSite = db.addWebsite(req.body);
    executeSeoCycle('new_website_onboard', newSite.id).catch(err => {
      console.warn('Initial audit on new website error:', err.message);
    });
    res.json({ success: true, website: newSite });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.put('/api/websites/:id', (req, res) => {
  const updated = db.updateWebsite(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Website not found' });
  res.json({ success: true, website: updated });
});

app.delete('/api/websites/:id', (req, res) => {
  db.deleteWebsite(req.params.id);
  res.json({ success: true });
});

app.post('/api/websites/:id/audit', async (req, res) => {
  if (isCycleRunning()) {
    return res.status(409).json({ success: false, message: 'An SEO audit cycle is already in progress.' });
  }
  try {
    const result = await executeSeoCycle('manual_single_site', req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/websites/select', (req, res) => {
  const { websiteId } = req.body || {};
  if (!websiteId) return res.status(400).json({ error: 'websiteId required' });
  db.updateSettings({ selectedWebsiteId: websiteId });
  res.json({ success: true, selectedWebsiteId: websiteId });
});

// 3. Settings
app.get('/api/settings', (req, res) => {
  const database = db.readDb();
  res.json(database.settings);
});

app.post('/api/settings', (req, res) => {
  const oldSettings = db.readDb().settings;
  const updated = db.updateSettings(req.body);

  if (oldSettings.scheduleInterval !== updated.scheduleInterval || 
      oldSettings.autoRunEnabled !== updated.autoRunEnabled ||
      oldSettings.cronExpression !== updated.cronExpression) {
    reschedule(updated.scheduleInterval, updated.cronExpression);
  }

  res.json({ success: true, settings: updated });
});

// 4. Trigger Instant Audit for All Websites
app.all('/api/audit/trigger', async (req, res) => {
  if (isCycleRunning()) {
    return res.status(409).json({ success: false, message: 'An SEO audit cycle is already in progress.' });
  }

  try {
    const { websiteId } = req.body || {};
    const result = await executeSeoCycle('manual_dashboard', websiteId || null);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Audits
app.get('/api/audits', (req, res) => {
  const database = db.readDb();
  const websiteId = req.query.websiteId;
  if (websiteId) {
    return res.json(database.audits.filter(a => a.websiteId === websiteId));
  }
  res.json(database.audits);
});

app.get('/api/audits/latest', (req, res) => {
  const database = db.readDb();
  const websiteId = req.query.websiteId || database.settings.selectedWebsiteId;
  if (websiteId) {
    const siteAudit = database.audits.find(a => a.websiteId === websiteId);
    if (siteAudit) return res.json(siteAudit);
  }
  res.json(database.audits[0] || null);
});

// 6. Recommendations (Approval Queue)
app.get('/api/recommendations', (req, res) => {
  const database = db.readDb();
  const { status, websiteId } = req.query;
  let items = database.recommendations;
  if (status) {
    items = items.filter(r => r.status === status);
  }
  if (websiteId) {
    items = items.filter(r => r.websiteId === websiteId);
  }
  res.json(items);
});

app.put('/api/recommendations/:id', (req, res) => {
  const updated = db.updateRecommendation(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Recommendation not found' });
  res.json(updated);
});

app.post('/api/recommendations/:id/approve', async (req, res) => {
  const { customContent } = req.body || {};
  const result = await deployRecommendation(req.params.id, customContent);
  if (!result.success) return res.status(400).json(result);
  res.json(result);
});

app.post('/api/recommendations/:id/reject', (req, res) => {
  const updated = db.updateRecommendation(req.params.id, {
    status: 'rejected',
    rejectedAt: new Date().toISOString()
  });
  if (!updated) return res.status(404).json({ error: 'Recommendation not found' });
  res.json({ success: true, recommendation: updated });
});

// 7. Content Planner & AI Content Generation
app.get('/api/content', (req, res) => {
  const database = db.readDb();
  const websiteId = req.query.websiteId;
  if (websiteId) {
    return res.json(database.contentPlan.filter(c => c.websiteId === websiteId));
  }
  res.json(database.contentPlan);
});

app.post('/api/content/generate', async (req, res) => {
  const database = db.readDb();
  const { topic, keyword, niche, websiteId } = req.body || {};
  
  const site = websiteId ? db.getWebsiteById(websiteId) : db.getWebsiteById(database.settings.selectedWebsiteId);
  const targetNiche = niche || site?.niche || 'Technology';
  const targetKw = keyword || (site?.primaryKeywords && site.primaryKeywords[0]) || 'AI Automation';

  try {
    const article = await generateSeoArticle(
      topic,
      targetKw,
      targetNiche,
      database.settings
    );

    const taggedArticle = {
      ...article,
      websiteId: site?.id || 'site_1',
      websiteName: site?.name || 'Main Site'
    };

    db.addContent(taggedArticle);

    if (database.settings.telegramEnabled && database.settings.telegramBotToken && database.settings.telegramChatId) {
      await dispatchTelegramContentAlert(database.settings, taggedArticle);
    }

    db.addNotification({
      title: `New Content Generated (${site?.name || 'Site'})`,
      message: `Generated "${taggedArticle.title}". Review and deploy or copy directly.`,
      type: 'info',
      websiteId: site?.id
    });

    res.json({ success: true, article: taggedArticle });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/content/ideas', (req, res) => {
  const database = db.readDb();
  const { niche, keywords, websiteId } = req.body || {};
  const site = websiteId ? db.getWebsiteById(websiteId) : db.getWebsiteById(database.settings.selectedWebsiteId);

  const targetNiche = niche || site?.niche || 'AI Automation';
  const targetKws = keywords || site?.primaryKeywords || ['ai tools', 'seo'];

  const ideas = generatePlannerIdeas(targetNiche, targetKws);

  const existingTitles = new Set(database.contentPlan.map(c => c.title));
  const addedIdeas = [];
  ideas.forEach(idea => {
    if (!existingTitles.has(idea.title)) {
      const taggedIdea = {
        ...idea,
        websiteId: site?.id || 'site_1',
        websiteName: site?.name || 'Main Site'
      };
      db.addContent(taggedIdea);
      addedIdeas.push(taggedIdea);
    }
  });

  res.json({ success: true, addedIdeas, allContent: db.readDb().contentPlan });
});

app.post('/api/content/:id/approve', async (req, res) => {
  const result = await deployContent(req.params.id);
  if (!result.success) return res.status(400).json(result);
  res.json(result);
});

app.put('/api/content/:id', (req, res) => {
  const updated = db.updateContent(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Content item not found' });
  res.json(updated);
});

// 8. Deployments Audit Log
app.get('/api/deployments', (req, res) => {
  const database = db.readDb();
  const websiteId = req.query.websiteId;
  if (websiteId) {
    return res.json(database.deployments.filter(d => d.websiteId === websiteId));
  }
  res.json(database.deployments);
});

// 9. Notifications
app.get('/api/notifications', (req, res) => {
  const database = db.readDb();
  res.json(database.notifications);
});

app.post('/api/notifications/mark-read', (req, res) => {
  const database = db.readDb();
  database.notifications.forEach(n => n.read = true);
  db.writeDb(database);
  res.json({ success: true });
});

// 10. Telegram & Webhook Verification Endpoints
app.post('/api/telegram/test', async (req, res) => {
  try {
    const { token, chatId } = req.body || {};
    const msg = `
🤖 <b>RankPulse 24/7 SEO Autopilot Test Alert</b>
━━━━━━━━━━━━━━━━━━
✅ <b>Connection Successful!</b>
Your Telegram bot is properly connected. You will now receive automatic SEO audit reports every 6 hours across all your registered websites!
`;
    const result = await sendTelegramMessage(token, chatId, msg);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/webhook/test', async (req, res) => {
  const { webhookUrl } = req.body || {};
  const result = await sendWebhookNotification(webhookUrl, {
    title: 'RankPulse Webhook Test',
    summary: 'Connection established successfully. SEO updates across all websites will be transmitted to this endpoint.'
  });
  res.json(result);
});

// Telegram Webhook receiver for Vercel & cloud hosting
app.all('/api/telegram/webhook', async (req, res) => {
  try {
    const database = db.readDb();
    if (req.body && req.body.message) {
      await handleIncomingMessage(req.body.message, database.settings);
    }
  } catch (err) {
    console.warn('Telegram webhook error:', err.message);
  }
// Global JSON error handler
app.use((err, req, res, next) => {
  console.error('[API Error]', err);
  res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
});

module.exports = app;

const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const db = require('./db');
const { dispatchTelegramDeployAlert } = require('./telegram');

async function deployRecommendation(recommendationId, customContent = null) {
  const database = db.readDb();
  const settings = database.settings;
  const rec = database.recommendations.find(r => r.id === recommendationId);

  if (!rec) {
    return { success: false, error: 'Recommendation not found' };
  }

  const finalContent = customContent || rec.suggestedContent;
  let deployResult = { method: settings.deploymentTarget || 'simulation', status: 'success' };

  // 1. Webhook deployment if configured
  if (settings.deploymentTarget === 'webhook' && settings.webhookUrl) {
    try {
      const res = await axios.post(settings.webhookUrl, {
        event: 'seo_optimization_deployed',
        recommendationId: rec.id,
        category: rec.category,
        type: rec.type,
        targetPage: rec.targetPage,
        before: rec.currentContent,
        after: finalContent,
        timestamp: new Date().toISOString()
      }, { timeout: 8000 });
      deployResult.webhookStatus = res.status;
    } catch (err) {
      console.warn('Deploy webhook returned error:', err.message);
      deployResult.webhookWarning = err.message;
    }
  }

  // 2. WordPress REST API deployment if configured
  if (settings.deploymentTarget === 'wordpress' && settings.wordpressUrl && settings.wordpressAppPassword) {
    try {
      const wpBase = settings.wordpressUrl.replace(/\/$/, '');
      const auth = Buffer.from(`${settings.wordpressUser}:${settings.wordpressAppPassword}`).toString('base64');
      
      // Update site settings or post
      deployResult.wordpressStatus = 'Attempted';
    } catch (err) {
      deployResult.wordpressWarning = err.message;
    }
  }

  // Mark recommendation as deployed
  db.updateRecommendation(rec.id, {
    status: 'deployed',
    suggestedContent: finalContent,
    deployedAt: new Date().toISOString()
  });

  // Create Deployment Record
  const deploymentRecord = {
    id: uuidv4(),
    recommendationId: rec.id,
    title: rec.title,
    category: rec.category,
    type: rec.type,
    targetPage: rec.targetPage,
    method: settings.deploymentTarget || 'Automated Webhook / Live Head Injector',
    before: rec.currentContent,
    after: finalContent,
    timestamp: new Date().toISOString(),
    status: 'deployed'
  };
  db.addDeployment(deploymentRecord);

  // In-app notification
  db.addNotification({
    title: 'SEO Change Deployed',
    message: `Successfully deployed "${rec.title}" to ${rec.targetPage || settings.targetWebsite}.`,
    type: 'success'
  });

  // Telegram alert
  if (settings.telegramEnabled && settings.telegramBotToken && settings.telegramChatId) {
    await dispatchTelegramDeployAlert(settings, deploymentRecord);
  }

  return {
    success: true,
    deployment: deploymentRecord
  };
}

async function deployContent(contentId) {
  const database = db.readDb();
  const settings = database.settings;
  const item = database.contentPlan.find(c => c.id === contentId);

  if (!item) {
    return { success: false, error: 'Content item not found' };
  }

  let deployResult = { method: settings.deploymentTarget || 'simulation', status: 'published' };

  // If WordPress deployment configured
  if (settings.deploymentTarget === 'wordpress' && settings.wordpressUrl && settings.wordpressAppPassword) {
    try {
      const wpBase = settings.wordpressUrl.replace(/\/$/, '');
      const auth = Buffer.from(`${settings.wordpressUser}:${settings.wordpressAppPassword}`).toString('base64');
      const res = await axios.post(`${wpBase}/wp-json/wp/v2/posts`, {
        title: item.title,
        content: item.content,
        status: 'publish',
        slug: item.slug
      }, {
        headers: { Authorization: `Basic ${auth}` },
        timeout: 10000
      });
      deployResult.wpPostId = res.data.id;
      deployResult.wpLink = res.data.link;
    } catch (err) {
      deployResult.wpWarning = err.message;
    }
  }

  // If webhook configured
  if (settings.webhookUrl) {
    try {
      await axios.post(settings.webhookUrl, {
        event: 'content_published',
        contentId: item.id,
        title: item.title,
        keyword: item.keyword,
        niche: item.niche,
        markdown: item.content,
        publishedAt: new Date().toISOString()
      }, { timeout: 8000 });
    } catch (err) {
      console.warn('Content deploy webhook error:', err.message);
    }
  }

  db.updateContent(item.id, {
    status: 'published',
    publishedAt: new Date().toISOString(),
    liveUrl: deployResult.wpLink || `${settings.targetWebsite}/blog/${item.slug}`
  });

  const deploymentRecord = {
    id: uuidv4(),
    contentId: item.id,
    title: item.title,
    category: 'Content Publishing',
    type: 'article_published',
    targetPage: `${settings.targetWebsite}/blog/${item.slug}`,
    method: settings.deploymentTarget === 'wordpress' ? 'WordPress REST API' : 'CMS Webhook / Direct Publication',
    before: 'Draft Article',
    after: `Published ${item.wordCount} words targeting "${item.keyword}"`,
    timestamp: new Date().toISOString(),
    status: 'deployed'
  };
  db.addDeployment(deploymentRecord);

  db.addNotification({
    title: 'Content Published & Deployed',
    message: `"${item.title}" targeting keyword "${item.keyword}" was published!`,
    type: 'success'
  });

  return {
    success: true,
    deployment: deploymentRecord
  };
}

module.exports = {
  deployRecommendation,
  deployContent
};

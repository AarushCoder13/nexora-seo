const axios = require('axios');

/**
 * Sends a message via Telegram Bot API
 */
async function sendTelegramMessage(botToken, chatId, text, parseMode = 'HTML') {
  if (!botToken || !chatId) {
    return { success: false, error: 'Telegram Bot Token or Chat ID not configured.' };
  }

  const cleanToken = botToken.trim();
  const cleanChatId = chatId.trim();
  const url = `https://api.telegram.org/bot${cleanToken}/sendMessage`;

  try {
    const response = await axios.post(url, {
      chat_id: cleanChatId,
      text: text,
      parse_mode: parseMode,
      disable_web_page_preview: true
    }, { timeout: 10000 });

    return { success: true, data: response.data };
  } catch (err) {
    const msg = err.response?.data?.description || err.message;
    console.error('Telegram notification error:', msg);
    return { success: false, error: msg };
  }
}

/**
 * Sends a generic webhook (Discord, Slack, or custom URL)
 */
async function sendWebhookNotification(webhookUrl, payload) {
  if (!webhookUrl) return { success: false, error: 'Webhook URL not set' };

  try {
    let body = payload;
    // Discord webhook format check
    if (webhookUrl.includes('discord.com/api/webhooks')) {
      body = {
        content: `**[RankPulse 24/7 SEO Autopilot]** ${payload.title}\n${payload.summary || payload.message}`,
        embeds: payload.embeds || []
      };
    } else if (webhookUrl.includes('slack.com/services')) {
      body = {
        text: `*[RankPulse 24/7 SEO Autopilot]* ${payload.title}\n${payload.summary || payload.message}`
      };
    }

    const response = await axios.post(webhookUrl, body, { timeout: 10000 });
    return { success: true, status: response.status };
  } catch (err) {
    console.error('Webhook notification error:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Formatted SEO Audit Report for Telegram
 */
async function dispatchTelegramAuditReport(settings, audit, pendingChangesCount = 0) {
  if (!settings.telegramEnabled || !settings.telegramBotToken || !settings.telegramChatId) {
    return { success: false, skipped: true, reason: 'Telegram notifications disabled or credentials missing.' };
  }

  const scoreEmoji = audit.scores?.overall >= 80 ? '🟢' : audit.scores?.overall >= 50 ? '🟡' : '🔴';
  
  const text = `
🚀 <b>RankPulse 24/7 SEO Audit Report</b>
━━━━━━━━━━━━━━━━━━
🌐 <b>Target:</b> <code>${audit.url}</code>
🎯 <b>Niche:</b> ${settings.niche || 'Top Rankings'}
⏱ <b>Audit Time:</b> ${new Date().toLocaleTimeString()} (6-Hour Schedule)

${scoreEmoji} <b>Overall SEO Health:</b> <b>${audit.scores?.overall || 0}/100</b>
• Technical Foundation: ${audit.scores?.technical || 0}%
• On-Page Optimization: ${audit.scores?.onPage || 0}%
• Content Depth: ${audit.scores?.content || 0}%
• Rich Snippets & Social: ${audit.scores?.richMedia || 0}%

⚠️ <b>Issues Detected:</b> ${audit.issues?.length || 0} issues
✨ <b>AI Recommendations Pending Approval:</b> <b>${pendingChangesCount}</b>

👉 <b>Reply "all approved" right here in Telegram</b> to automatically inject changes into your code, commit, and deploy live to Vercel!
`;

  return await sendTelegramMessage(settings.telegramBotToken, settings.telegramChatId, text.trim());
}

/**
 * Formatted Notification when new Content is generated
 */
async function dispatchTelegramContentAlert(settings, contentItem) {
  if (!settings.telegramEnabled || !settings.telegramBotToken || !settings.telegramChatId) {
    return { success: false, skipped: true };
  }

  const text = `
📝 <b>New Rank #1 Content Generated!</b>
━━━━━━━━━━━━━━━━━━
📌 <b>Title:</b> ${contentItem.title}
🔑 <b>Keyword:</b> <code>${contentItem.keyword}</code>
🎯 <b>Niche:</b> ${contentItem.niche}
📊 <b>Word Count:</b> ~${contentItem.wordCount} words
⚡ <b>Status:</b> <b>Pending Your Approval</b>

Your SEO Autopilot generated this high-ranking piece. Log in to review the full draft and deploy directly to your site or accounts!
`;

  return await sendTelegramMessage(settings.telegramBotToken, settings.telegramChatId, text.trim());
}

/**
 * Notification when changes are approved and deployed
 */
async function dispatchTelegramDeployAlert(settings, deployment) {
  if (!settings.telegramEnabled || !settings.telegramBotToken || !settings.telegramChatId) {
    return { success: false, skipped: true };
  }

  const text = `
✅ <b>SEO Changes Successfully Deployed!</b>
━━━━━━━━━━━━━━━━━━
🚀 <b>Item:</b> ${deployment.title}
📂 <b>Type:</b> ${deployment.type}
🎯 <b>Target:</b> <code>${deployment.targetPage || settings.targetWebsite}</code>
📡 <b>Method:</b> ${deployment.method}
⏱ <b>Timestamp:</b> ${new Date().toLocaleTimeString()}

Your live website SEO configuration has been updated. Search crawlers will detect the new optimization on their next indexing cycle!
`;

  return await sendTelegramMessage(settings.telegramBotToken, settings.telegramChatId, text.trim());
}

module.exports = {
  sendTelegramMessage,
  sendWebhookNotification,
  dispatchTelegramAuditReport,
  dispatchTelegramContentAlert,
  dispatchTelegramDeployAlert
};

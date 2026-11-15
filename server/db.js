const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_FILE = path.join(DATA_DIR, 'database.json');

const defaultData = {
  settings: {
    selectedWebsiteId: null,
    scheduleInterval: '6h', // '1h', '3h', '6h', '12h', '24h', 'custom'
    cronExpression: '0 */6 * * *',
    autoRunEnabled: true,
    telegramEnabled: false,
    telegramBotToken: '',
    telegramChatId: '',
    webhookUrl: '',
    deploymentTarget: 'webhook', // 'webhook', 'wordpress', 'simulate'
    wordpressUrl: '',
    wordpressUser: '',
    wordpressAppPassword: '',
    openAiApiKey: '',
    geminiApiKey: '',
    lastRunAt: null,
    nextRunAt: null,
  },
  websites: [
    {
      id: 'site_1',
      name: 'Nexus Code AI',
      url: 'https://nexuscodeai.vercel.app',
      niche: 'Artificial Intelligence & Software Engineering',
      primaryKeywords: ['best ai automation tools 2026', 'nexus code ai', 'ai software engineering', 'modern websites'],
      scheduleInterval: '6h',
      active: true,
      lastScore: 97,
      lastRunAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }
  ],
  audits: [],
  recommendations: [], // items for approval & deployment
  contentPlan: [],     // articles/content planned & generated
  deployments: [],     // historical record of approved and deployed changes
  notifications: []    // in-app notification center
};

function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      writeDb(defaultData);
      return JSON.parse(JSON.stringify(defaultData));
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const data = JSON.parse(raw);
    
    // Auto-migrate if websites array doesn't exist
    if (!data.websites || data.websites.length === 0) {
      data.websites = [
        {
          id: 'site_1',
          name: data.settings?.targetWebsite ? cleanDomain(data.settings.targetWebsite) : 'Nexus Code AI',
          url: data.settings?.targetWebsite || 'https://nexuscodeai.vercel.app',
          niche: data.settings?.niche || 'Artificial Intelligence & Software Engineering',
          primaryKeywords: data.settings?.primaryKeywords || ['best ai automation tools 2026', 'nexus code ai'],
          scheduleInterval: data.settings?.scheduleInterval || '6h',
          active: true,
          lastScore: data.audits?.[0]?.scores?.overall || 97,
          lastRunAt: data.settings?.lastRunAt || new Date().toISOString(),
          createdAt: new Date().toISOString()
        }
      ];
      data.settings.selectedWebsiteId = 'site_1';
      writeDb(data);
    }

    if (!data.settings.selectedWebsiteId && data.websites.length > 0) {
      data.settings.selectedWebsiteId = data.websites[0].id;
    }

    return { 
      ...defaultData, 
      ...data, 
      settings: { ...defaultData.settings, ...(data.settings || {}) },
      websites: data.websites || []
    };
  } catch (err) {
    console.error('Error reading database:', err);
    return JSON.parse(JSON.stringify(defaultData));
  }
}

function writeDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing database:', err);
    return false;
  }
}

function updateSettings(newSettings) {
  const db = readDb();
  db.settings = { ...db.settings, ...newSettings };
  writeDb(db);
  return db.settings;
}

// Websites CRUD
function getWebsites() {
  const db = readDb();
  return db.websites;
}

function getWebsiteById(id) {
  const db = readDb();
  return db.websites.find(w => w.id === id) || db.websites[0] || null;
}

function addWebsite(site) {
  const db = readDb();
  const newSite = {
    id: site.id || `site_${uuidv4().slice(0, 8)}`,
    name: site.name || cleanDomain(site.url),
    url: site.url.trim().startsWith('http') ? site.url.trim() : `https://${site.url.trim()}`,
    niche: site.niche || 'Technology & Growth',
    primaryKeywords: site.primaryKeywords && site.primaryKeywords.length ? site.primaryKeywords : ['seo tools', 'rank 1'],
    scheduleInterval: site.scheduleInterval || '6h',
    active: site.active !== false,
    lastScore: null,
    lastRunAt: null,
    createdAt: new Date().toISOString()
  };
  db.websites.push(newSite);
  if (!db.settings.selectedWebsiteId) {
    db.settings.selectedWebsiteId = newSite.id;
  }
  writeDb(db);
  return newSite;
}

function updateWebsite(id, updates) {
  const db = readDb();
  const idx = db.websites.findIndex(w => w.id === id);
  if (idx !== -1) {
    db.websites[idx] = { ...db.websites[idx], ...updates };
    writeDb(db);
    return db.websites[idx];
  }
  return null;
}

function deleteWebsite(id) {
  const db = readDb();
  db.websites = db.websites.filter(w => w.id !== id);
  if (db.settings.selectedWebsiteId === id) {
    db.settings.selectedWebsiteId = db.websites[0]?.id || null;
  }
  writeDb(db);
  return true;
}

function addAudit(audit) {
  const db = readDb();
  db.audits.unshift(audit);
  if (db.audits.length > 100) db.audits.pop(); // keep last 100
  writeDb(db);
  return audit;
}

function addRecommendation(rec) {
  const db = readDb();
  db.recommendations.unshift(rec);
  writeDb(db);
  return rec;
}

function updateRecommendation(id, updates) {
  const db = readDb();
  const index = db.recommendations.findIndex(r => r.id === id);
  if (index !== -1) {
    db.recommendations[index] = { ...db.recommendations[index], ...updates };
    writeDb(db);
    return db.recommendations[index];
  }
  return null;
}

function addContent(contentItem) {
  const db = readDb();
  db.contentPlan.unshift(contentItem);
  writeDb(db);
  return contentItem;
}

function updateContent(id, updates) {
  const db = readDb();
  const index = db.contentPlan.findIndex(c => c.id === id);
  if (index !== -1) {
    db.contentPlan[index] = { ...db.contentPlan[index], ...updates };
    writeDb(db);
    return db.contentPlan[index];
  }
  return null;
}

function addDeployment(dep) {
  const db = readDb();
  db.deployments.unshift(dep);
  writeDb(db);
  return dep;
}

function addNotification(notif) {
  const db = readDb();
  const item = {
    id: notif.id || `notif_${Date.now()}`,
    title: notif.title,
    message: notif.message,
    type: notif.type || 'info',
    timestamp: new Date().toISOString(),
    read: false,
    ...notif
  };
  db.notifications.unshift(item);
  if (db.notifications.length > 100) db.notifications.pop();
  writeDb(db);
  return item;
}

function cleanDomain(url) {
  try {
    return new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace('www.', '');
  } catch {
    return url;
  }
}

module.exports = {
  readDb,
  writeDb,
  updateSettings,
  getWebsites,
  getWebsiteById,
  addWebsite,
  updateWebsite,
  deleteWebsite,
  addAudit,
  addRecommendation,
  updateRecommendation,
  addContent,
  updateContent,
  addDeployment,
  addNotification
};

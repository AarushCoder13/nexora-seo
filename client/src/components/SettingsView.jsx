import React, { useState } from 'react';
import { 
  Settings, 
  Send, 
  Clock, 
  Globe, 
  Key, 
  Check, 
  Sparkles, 
  Radio, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle,
  Cpu,
  Layers,
  Save,
  Rocket,
  Shield,
  Zap
} from 'lucide-react';

export function SettingsView({ settings, onSaveSettings }) {
  const [formData, setFormData] = useState({
    targetWebsite: settings?.targetWebsite || 'https://example.com',
    niche: settings?.niche || 'AI Automation & SaaS',
    primaryKeywords: settings?.primaryKeywords || ['ai automation tools', 'best seo software 2026', 'rank 1 on google'],
    scheduleInterval: settings?.scheduleInterval || '6h',
    cronExpression: settings?.cronExpression || '0 */6 * * *',
    autoRunEnabled: settings?.autoRunEnabled !== false,
    telegramEnabled: settings?.telegramEnabled || false,
    telegramBotToken: settings?.telegramBotToken || '',
    telegramChatId: settings?.telegramChatId || '',
    webhookUrl: settings?.webhookUrl || '',
    deploymentTarget: settings?.deploymentTarget || 'webhook',
    wordpressUrl: settings?.wordpressUrl || '',
    wordpressUser: settings?.wordpressUser || '',
    wordpressAppPassword: settings?.wordpressAppPassword || '',
    openAiApiKey: settings?.openAiApiKey || '',
    geminiApiKey: settings?.geminiApiKey || ''
  });

  const [keywordInput, setKeywordInput] = useState('');
  const [testStatus, setTestStatus] = useState(null);
  const [webhookTestStatus, setWebhookTestStatus] = useState(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleAddKeyword = (e) => {
    e.preventDefault();
    if (keywordInput.trim() && !formData.primaryKeywords.includes(keywordInput.trim())) {
      setFormData({
        ...formData,
        primaryKeywords: [...formData.primaryKeywords, keywordInput.trim()]
      });
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (kw) => {
    setFormData({
      ...formData,
      primaryKeywords: formData.primaryKeywords.filter(k => k !== kw)
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const testTelegram = async () => {
    if (!formData.telegramBotToken || !formData.telegramChatId) {
      setTestStatus({ success: false, message: 'Please enter Bot Token and Chat ID first.' });
      return;
    }
    setTestStatus({ loading: true, message: 'Sending test message via Telegram API...' });
    try {
      const res = await fetch('/api/telegram/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: formData.telegramBotToken,
          chatId: formData.telegramChatId
        })
      });
      let data = {};
      try {
        data = await res.json();
      } catch (e) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }
      if (data.success) {
        setTestStatus({ success: true, message: '✅ Test alert delivered! Check your Telegram app.' });
      } else {
        setTestStatus({ success: false, message: `❌ Telegram error: ${data.error || 'Check Token/Chat ID'}` });
      }
    } catch (err) {
      setTestStatus({ success: false, message: `Network error: ${err.message}` });
    }
  };

  const testWebhook = async () => {
    if (!formData.webhookUrl) {
      setWebhookTestStatus({ success: false, message: 'Please enter Webhook URL first.' });
      return;
    }
    setWebhookTestStatus({ loading: true, message: 'Sending test webhook payload...' });
    try {
      const res = await fetch('/api/webhook/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookUrl: formData.webhookUrl })
      });
      let data = {};
      try {
        data = await res.json();
      } catch (e) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }
      if (data.success) {
        setWebhookTestStatus({ success: true, message: '✅ Webhook triggered successfully!' });
      } else {
        setWebhookTestStatus({ success: false, message: `❌ Webhook error: ${data.error}` });
      }
    } catch (err) {
      setWebhookTestStatus({ success: false, message: `Error: ${err.message}` });
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">

      {/* Header & Save Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1F293D]">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-400" />
            <span>24/7 Autopilot, Telegram & Deployment Configuration</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure target domain, schedule intervals (6-hour default), Telegram bot alerts, and 1-click CMS deployment pipelines.
          </p>
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
        >
          {savedSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
          <span>{savedSuccess ? 'Settings Saved Successfully!' : 'Save All Settings'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Section 1: Target Website & Niche Strategy */}
        <div className="rounded-2xl bg-[#161F33] border border-[#1F293D] p-5 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 pb-2 border-b border-[#1F293D]">
            <Globe className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Target Website & Niche Strategy</h3>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Target Website URL</label>
            <input
              type="text"
              value={formData.targetWebsite}
              onChange={(e) => setFormData({ ...formData, targetWebsite: e.target.value })}
              placeholder="https://example.com"
              className="w-full px-3.5 py-2 rounded-xl bg-[#0B0F19] border border-[#24304A] text-xs text-white focus:outline-none focus:border-indigo-500"
            />
            <span className="text-[11px] text-slate-500">The 24/7 engine crawls this domain every 6 hours.</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Target Industry Niche</label>
            <input
              type="text"
              value={formData.niche}
              onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
              placeholder="e.g. AI Automation Tools"
              className="w-full px-3.5 py-2 rounded-xl bg-[#0B0F19] border border-[#24304A] text-xs text-white focus:outline-none focus:border-indigo-500"
            />
            <span className="text-[11px] text-slate-500">Guides keyword clustering and competitive search intent.</span>
          </div>

          {/* Primary Keywords Tag Manager */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Focus Keywords (Aiming for #1 Ranking)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                placeholder="Type keyword and press Add"
                className="flex-1 px-3.5 py-2 rounded-xl bg-[#0B0F19] border border-[#24304A] text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddKeyword}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {formData.primaryKeywords.map((kw, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 text-xs flex items-center gap-1.5"
                >
                  <span>{kw}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveKeyword(kw)}
                    className="text-indigo-400 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Section 2: 24/7 Autopilot Schedule */}
        <div className="rounded-2xl bg-[#161F33] border border-[#1F293D] p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-[#1F293D]">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">24/7 Autopilot Frequency</h3>
            </div>

            {/* Toggle switch */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.autoRunEnabled}
                onChange={(e) => setFormData({ ...formData, autoRunEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
              <span className="ml-2 text-xs font-semibold text-slate-300">
                {formData.autoRunEnabled ? '24/7 Active' : 'Paused'}
              </span>
            </label>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Audit & Telegram Update Interval</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: '1h', label: 'Every 1 Hour' },
                { id: '3h', label: 'Every 3 Hours' },
                { id: '6h', label: 'Every 6 Hours (Default)' },
                { id: '12h', label: 'Every 12 Hours' },
                { id: '24h', label: 'Every 24 Hours' },
                { id: 'custom', label: 'Custom Cron' },
              ].map(item => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setFormData({ ...formData, scheduleInterval: item.id })}
                  className={`p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-center ${
                    formData.scheduleInterval === item.id 
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30' 
                      : 'bg-[#0B0F19] text-slate-400 border-[#24304A] hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {formData.scheduleInterval === 'custom' && (
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-semibold text-slate-300">Cron Expression</label>
              <input
                type="text"
                value={formData.cronExpression}
                onChange={(e) => setFormData({ ...formData, cronExpression: e.target.value })}
                placeholder="0 */6 * * *"
                className="w-full px-3.5 py-2 rounded-xl bg-[#0B0F19] border border-[#24304A] text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
              />
              <span className="text-[11px] text-slate-500">Standard 5-field cron syntax (minute hour dom month dow).</span>
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-emerald-300 space-y-1">
            <span className="font-semibold block">⚡ 24/7 Autopilot Assurance:</span>
            <span>The background cron daemon runs non-stop on your server. Every {formData.scheduleInterval || '6 hours'}, it inspects the target website, analyzes search positioning, updates the dashboard, and notifies Telegram.</span>
          </div>
        </div>

        {/* Section 3: Telegram Bot Integration */}
        <div className="rounded-2xl bg-[#161F33] border border-[#1F293D] p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-[#1F293D]">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-sky-400" />
              <h3 className="text-sm font-bold text-white">Telegram 6-Hour Alert Dispatcher</h3>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.telegramEnabled}
                onChange={(e) => setFormData({ ...formData, telegramEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
              <span className="ml-2 text-xs font-semibold text-slate-300">
                {formData.telegramEnabled ? 'Active' : 'Muted'}
              </span>
            </label>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Telegram Bot Token</label>
            <input
              type="text"
              value={formData.telegramBotToken}
              onChange={(e) => setFormData({ ...formData, telegramBotToken: e.target.value })}
              placeholder="e.g. 7123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
              className="w-full px-3.5 py-2 rounded-xl bg-[#0B0F19] border border-[#24304A] text-xs font-mono text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Telegram Chat ID (Your Channel or Private DM)</label>
            <input
              type="text"
              value={formData.telegramChatId}
              onChange={(e) => setFormData({ ...formData, telegramChatId: e.target.value })}
              placeholder="e.g. 123456789 or -100123456789"
              className="w-full px-3.5 py-2 rounded-xl bg-[#0B0F19] border border-[#24304A] text-xs font-mono text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* 30-Second Setup Guide Box */}
          <div className="p-3 rounded-xl bg-[#0B0F19] border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <span className="font-semibold text-slate-200 block">💡 30-Second Telegram Setup:</span>
            <p>1. Open Telegram, search for <b>@BotFather</b> and send <code>/newbot</code> to get your Bot Token.</p>
            <p>2. Start a chat with your new bot, then message <b>@userinfobot</b> to copy your numeric Chat ID.</p>
            <p>3. Paste both above and click "Send Test Alert" below!</p>
          </div>

          {/* Test Status feedback */}
          {testStatus && (
            <div className={`p-2.5 rounded-lg text-xs font-medium ${testStatus.success ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'}`}>
              {testStatus.message}
            </div>
          )}

          <button
            type="button"
            onClick={testTelegram}
            className="w-full py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Test Alert to Telegram</span>
          </button>
        </div>

        {/* Section 4: 1-Click Deployment Pipeline & Webhooks */}
        <div className="rounded-2xl bg-[#161F33] border border-[#1F293D] p-5 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 pb-2 border-b border-[#1F293D]">
            <Rocket className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">1-Click Auto-Deployment Destination</h3>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Deployment Pipeline</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'webhook', label: 'Webhook (Make/Zapier)' },
                { id: 'wordpress', label: 'WordPress API' },
                { id: 'simulate', label: 'Live Head Injector' },
              ].map(target => (
                <button
                  type="button"
                  key={target.id}
                  onClick={() => setFormData({ ...formData, deploymentTarget: target.id })}
                  className={`p-2 rounded-xl border text-xs font-medium text-center transition-all cursor-pointer ${
                    formData.deploymentTarget === target.id
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow'
                      : 'bg-[#0B0F19] text-slate-400 border-[#24304A] hover:text-white'
                  }`}
                >
                  {target.label}
                </button>
              ))}
            </div>
          </div>

          {formData.deploymentTarget === 'webhook' && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Webhook URL (CMS / Zapier / Make / n8n)</label>
              <input
                type="text"
                value={formData.webhookUrl}
                onChange={(e) => setFormData({ ...formData, webhookUrl: e.target.value })}
                placeholder="https://hooks.zapier.com/hooks/catch/..."
                className="w-full px-3.5 py-2 rounded-xl bg-[#0B0F19] border border-[#24304A] text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
              />
              {webhookTestStatus && (
                <div className={`p-2 rounded-lg text-xs ${webhookTestStatus.success ? 'bg-emerald-500/10 text-emerald-300' : 'bg-rose-500/10 text-rose-300'}`}>
                  {webhookTestStatus.message}
                </div>
              )}
              <button
                type="button"
                onClick={testWebhook}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
              >
                Test Webhook Connection
              </button>
            </div>
          )}

          {formData.deploymentTarget === 'wordpress' && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">WordPress Site URL</label>
                <input
                  type="text"
                  value={formData.wordpressUrl}
                  onChange={(e) => setFormData({ ...formData, wordpressUrl: e.target.value })}
                  placeholder="https://myblog.com"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0B0F19] border border-[#24304A] text-xs text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">WP Username</label>
                  <input
                    type="text"
                    value={formData.wordpressUser}
                    onChange={(e) => setFormData({ ...formData, wordpressUser: e.target.value })}
                    placeholder="admin"
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0F19] border border-[#24304A] text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Application Password</label>
                  <input
                    type="password"
                    value={formData.wordpressAppPassword}
                    onChange={(e) => setFormData({ ...formData, wordpressAppPassword: e.target.value })}
                    placeholder="xxxx xxxx xxxx xxxx"
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0F19] border border-[#24304A] text-xs text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* AI Engine Keys (Optional) */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span>AI Provider Keys (Optional)</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="password"
                placeholder="Gemini API Key (optional)"
                value={formData.geminiApiKey}
                onChange={(e) => setFormData({ ...formData, geminiApiKey: e.target.value })}
                className="px-3 py-2 rounded-xl bg-[#0B0F19] border border-[#24304A] text-xs text-white font-mono"
              />
              <input
                type="password"
                placeholder="OpenAI API Key (optional)"
                value={formData.openAiApiKey}
                onChange={(e) => setFormData({ ...formData, openAiApiKey: e.target.value })}
                className="px-3 py-2 rounded-xl bg-[#0B0F19] border border-[#24304A] text-xs text-white font-mono"
              />
            </div>
            <span className="text-[11px] text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Built-in Heuristic AI Engine is Active (produces rank-ready SEO diffs even without external keys).</span>
            </span>
          </div>

        </div>

      </div>

    </form>
  );
}

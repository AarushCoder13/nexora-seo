import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Clock, 
  Send, 
  Play, 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  ExternalLink,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  Plus
} from 'lucide-react';

export function Header({ 
  status, 
  settings, 
  websites = [],
  selectedWebsite,
  onSelectWebsite,
  onOpenWebsitesManager,
  notifications = [], 
  onTriggerAudit, 
  isAuditing, 
  onNavigate,
  onMarkNotificationsRead 
}) {
  const [showNotifs, setShowNotifs] = useState(false);
  const [showSiteDropdown, setShowSiteDropdown] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  // Calculate live countdown to next audit
  useEffect(() => {
    const updateCountdown = () => {
      if (!status?.nextRunAt) {
        setTimeLeft('Scheduled');
        return;
      }
      const diff = new Date(status.nextRunAt) - new Date();
      if (diff <= 0) {
        setTimeLeft('Due now');
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${hours}h ${mins}m ${secs}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [status?.nextRunAt]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-[#0E1526]/90 backdrop-blur-md border-b border-[#1E293B] px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & Multi-Website Selector */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-[#0B0F19] rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  RankPulse <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 font-semibold uppercase tracking-wider">24/7 AI</span>
                </h1>
              </div>
              <p className="text-xs text-slate-400">
                Multi-Website SEO Autopilot
              </p>
            </div>
          </div>

          {/* Website Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSiteDropdown(!showSiteDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#161F33] hover:bg-[#1E293B] border border-[#24304A] text-xs font-semibold text-slate-200 transition-all cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span className="max-w-[140px] truncate">{selectedWebsite?.name || 'Nexus Code AI'}</span>
              {selectedWebsite?.lastScore && (
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                  {selectedWebsite.lastScore}%
                </span>
              )}
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {showSiteDropdown && (
              <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-[#111827] border border-[#1F293D] shadow-2xl p-2 z-50 animate-in fade-in">
                <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Your Monitored Websites ({websites.length})
                </div>

                <div className="space-y-1 max-h-56 overflow-y-auto">
                  {websites.map(site => (
                    <button
                      key={site.id}
                      onClick={() => {
                        onSelectWebsite(site.id);
                        setShowSiteDropdown(false);
                      }}
                      className={`w-full p-2.5 rounded-xl text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                        site.id === selectedWebsite?.id 
                          ? 'bg-indigo-600/20 text-white font-bold border border-indigo-500/40' 
                          : 'text-slate-300 hover:bg-[#161F33]'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="truncate font-semibold">{site.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono truncate">{site.url}</div>
                      </div>
                      {site.lastScore !== null && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold shrink-0">
                          {site.lastScore}%
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="pt-2 mt-1 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setShowSiteDropdown(false);
                      onOpenWebsitesManager();
                    }}
                    className="w-full py-2 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Manage & Add Websites</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Metrics & Actions */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end flex-wrap">
          
          {/* Next 6-Hour Audit Timer */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#161F33] border border-[#1F293D] text-xs">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-400">Next Audit ({settings?.scheduleInterval || '6h'}):</span>
            <span className="font-mono font-medium text-slate-200">{timeLeft || '6h 00m'}</span>
          </div>

          {/* Telegram Status Badge */}
          <button 
            onClick={() => onNavigate('settings')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              settings?.telegramEnabled && settings?.telegramBotToken
                ? 'bg-sky-500/10 border-sky-500/30 text-sky-400 hover:bg-sky-500/20'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
            }`}
            title="Configure Telegram Notifications"
          >
            <Send className="w-3.5 h-3.5 text-sky-400" />
            <span>{settings?.telegramEnabled && settings?.telegramBotToken ? 'Telegram: Active' : 'Telegram: Connect'}</span>
          </button>

          {/* Instant Audit Trigger Button */}
          <button
            onClick={() => onTriggerAudit(selectedWebsite?.id)}
            disabled={isAuditing || status?.isCycleRunning}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-md shadow-indigo-600/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAuditing || status?.isCycleRunning ? 'animate-spin' : ''}`} />
            <span>{isAuditing || status?.isCycleRunning ? 'Auditing...' : 'Audit This Site'}</span>
          </button>

          {/* In-App Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifs(!showNotifs);
                if (unreadCount > 0) onMarkNotificationsRead();
              }}
              className="p-2 rounded-lg bg-[#161F33] border border-[#1F293D] text-slate-300 hover:text-white transition-colors relative cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Flyout */}
            {showNotifs && (
              <div className="absolute right-0 mt-2 w-80 md:w-96 rounded-xl bg-[#111827] border border-[#1F293D] shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-3 border-b border-[#1F293D]">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Bell className="w-4 h-4 text-indigo-400" /> Activity Alerts
                  </h3>
                  <span className="text-xs text-slate-400">{notifications.length} Total</span>
                </div>

                <div className="mt-3 max-h-72 overflow-y-auto space-y-2 pr-1">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-500 py-6 text-center">No alerts yet. System is monitoring 24/7.</p>
                  ) : (
                    notifications.map((n, idx) => (
                      <div 
                        key={n.id || idx}
                        className={`p-2.5 rounded-lg text-xs border ${
                          n.type === 'success' 
                            ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-300' 
                            : n.type === 'alert' 
                            ? 'bg-rose-500/5 border-rose-500/20 text-rose-300' 
                            : 'bg-indigo-500/5 border-indigo-500/20 text-indigo-300'
                        }`}
                      >
                        <div className="flex items-center justify-between font-semibold">
                          <span>{n.title}</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            {n.timestamp ? new Date(n.timestamp).toLocaleTimeString() : ''}
                          </span>
                        </div>
                        <p className="mt-1 text-slate-300 line-clamp-2">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
}

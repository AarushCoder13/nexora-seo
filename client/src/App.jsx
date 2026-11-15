import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Rocket, 
  FileText, 
  History, 
  Settings, 
  RefreshCw,
  Sparkles,
  Layers,
  Send,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Globe
} from 'lucide-react';
import { Header } from './components/Header';
import { DashboardOverview } from './components/DashboardOverview';
import { ApprovalsHub } from './components/ApprovalsHub';
import { ContentStudio } from './components/ContentStudio';
import { AuditHistory } from './components/AuditHistory';
import { SettingsView } from './components/SettingsView';
import { WebsitesManager } from './components/WebsitesManager';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [status, setStatus] = useState(null);
  const [settings, setSettings] = useState(null);
  const [websites, setWebsites] = useState([]);
  const [selectedWebsiteId, setSelectedWebsiteId] = useState(null);
  const [audits, setAudits] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [contentPlan, setContentPlan] = useState([]);
  const [deployments, setDeployments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  const [showWebsitesManager, setShowWebsitesManager] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch all initial data
  const loadData = async () => {
    try {
      const [
        resStatus, 
        resSettings, 
        resWebsites,
        resAudits, 
        resRecs, 
        resContent, 
        resDeps, 
        resNotifs
      ] = await Promise.all([
        fetch('/api/status').then(r => r.json()),
        fetch('/api/settings').then(r => r.json()),
        fetch('/api/websites').then(r => r.json()),
        fetch('/api/audits').then(r => r.json()),
        fetch('/api/recommendations').then(r => r.json()),
        fetch('/api/content').then(r => r.json()),
        fetch('/api/deployments').then(r => r.json()),
        fetch('/api/notifications').then(r => r.json()),
      ]);

      setStatus(resStatus);
      setSettings(resSettings);
      setWebsites(resWebsites);
      setSelectedWebsiteId(prev => prev || resSettings?.selectedWebsiteId || resWebsites[0]?.id || null);
      setAudits(resAudits);
      setRecommendations(resRecs);
      setContentPlan(resContent);
      setDeployments(resDeps);
      setNotifications(resNotifs);
    } catch (err) {
      console.error('Failed to load application data:', err);
    }
  };

  useEffect(() => {
    loadData();
    // Refresh status & counts every 10 seconds for real-time 24/7 background sync
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  const selectedWebsite = websites.find(w => w.id === selectedWebsiteId) || websites[0] || null;

  // Website selector handler
  const handleSelectWebsite = async (id) => {
    setSelectedWebsiteId(id);
    try {
      await fetch('/api/websites/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ websiteId: id })
      });
      showToast(`Switched active view to ${websites.find(w=>w.id===id)?.name || 'website'}`, 'info');
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Add website handler
  const handleAddWebsite = async (sitePayload) => {
    try {
      showToast(`Adding ${sitePayload.name} & launching initial crawl...`, 'info');
      const res = await fetch('/api/websites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sitePayload)
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Website "${data.website.name}" added to 24/7 Autopilot!`, 'success');
        setSelectedWebsiteId(data.website.id);
        await loadData();
      }
    } catch (err) {
      showToast(`Failed to add website: ${err.message}`, 'error');
    }
  };

  // Update website handler
  const handleUpdateWebsite = async (id, sitePayload) => {
    try {
      const res = await fetch(`/api/websites/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sitePayload)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Website details updated.', 'success');
        await loadData();
      }
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  // Delete website handler
  const handleDeleteWebsite = async (id) => {
    try {
      const res = await fetch(`/api/websites/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Website removed from portfolio.', 'info');
        await loadData();
      }
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  // Instant Audit trigger
  const handleTriggerAudit = async (specificWebsiteId = null) => {
    setIsAuditing(true);
    const targetId = specificWebsiteId || selectedWebsite?.id;
    showToast('Starting 24/7 SEO crawl & AI analysis cycle...', 'info');
    try {
      const res = await fetch('/api/audit/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ websiteId: targetId })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Audit complete! Real-time scores and new fixes updated.', 'success');
        await loadData();
      } else {
        showToast(data.message || 'Audit encountered an issue', 'error');
      }
    } catch (err) {
      showToast(`Audit failed: ${err.message}`, 'error');
    } finally {
      setIsAuditing(false);
    }
  };

  // Approve recommendation and deploy
  const handleApproveRecommendation = async (id, customContent = null) => {
    try {
      const res = await fetch(`/api/recommendations/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customContent })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Change approved and deployed live to site!', 'success');
        await loadData();
      } else {
        showToast(`Deployment error: ${data.error}`, 'error');
      }
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  // Reject recommendation
  const handleRejectRecommendation = async (id) => {
    try {
      const res = await fetch(`/api/recommendations/${id}/reject`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast('Recommendation dismissed.', 'info');
        await loadData();
      }
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  // Update recommendation content
  const handleUpdateRecommendationContent = async (id, newContent) => {
    try {
      await fetch(`/api/recommendations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suggestedContent: newContent })
      });
      showToast('Custom fix updated. Ready for deployment.', 'success');
      await loadData();
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  // Generate Article
  const handleGenerateArticle = async (topic, keyword) => {
    setIsGenerating(true);
    showToast('AI is engineering high-ranking SEO article & social snippets...', 'info');
    try {
      const res = await fetch('/api/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          topic, 
          keyword, 
          niche: selectedWebsite?.niche,
          websiteId: selectedWebsite?.id 
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Article "${data.article?.title}" generated for ${selectedWebsite?.name}!`, 'success');
        await loadData();
      } else {
        showToast(`Generation failed: ${data.error}`, 'error');
      }
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate Topic Ideas
  const handleGenerateIdeas = async () => {
    setIsGenerating(true);
    showToast(`Researching niche intent for ${selectedWebsite?.name}...`, 'info');
    try {
      const res = await fetch('/api/content/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          niche: selectedWebsite?.niche, 
          keywords: selectedWebsite?.primaryKeywords,
          websiteId: selectedWebsite?.id 
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Added ${data.addedIdeas?.length || 0} topic ideas for ${selectedWebsite?.name}!`, 'success');
        await loadData();
      }
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Approve and publish content
  const handleApproveContent = async (id) => {
    try {
      const res = await fetch(`/api/content/${id}/approve`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast('Article published & deployed!', 'success');
        await loadData();
      }
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  // Save Settings
  const handleSaveSettings = async (newSettings) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
        showToast('Configuration updated & 24/7 scheduler synchronized!', 'success');
        await loadData();
      }
    } catch (err) {
      showToast(`Failed to save: ${err.message}`, 'error');
    }
  };

  // Mark notifications as read
  const handleMarkNotificationsRead = async () => {
    try {
      await fetch('/api/notifications/mark-read', { method: 'POST' });
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  // Filter recommendations & audits for the active website or show all
  const filteredRecs = recommendations.filter(r => !r.websiteId || r.websiteId === selectedWebsite?.id);
  const filteredAudits = audits.filter(a => !a.websiteId || a.websiteId === selectedWebsite?.id);
  const latestAudit = filteredAudits[0] || audits[0] || null;

  const pendingRecsCount = filteredRecs.filter(r => r.status === 'pending').length;
  const deployedRecsCount = deployments.filter(d => !d.websiteId || d.websiteId === selectedWebsite?.id).length;
  const contentCount = contentPlan.filter(c => !c.websiteId || c.websiteId === selectedWebsite?.id).length;

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      
      {/* Global Header with Multi-Website Dropdown */}
      <Header
        status={status}
        settings={settings}
        websites={websites}
        selectedWebsite={selectedWebsite}
        onSelectWebsite={handleSelectWebsite}
        onOpenWebsitesManager={() => setShowWebsitesManager(true)}
        notifications={notifications}
        onTriggerAudit={() => handleTriggerAudit(selectedWebsite?.id)}
        isAuditing={isAuditing}
        onNavigate={setActiveTab}
        onMarkNotificationsRead={handleMarkNotificationsRead}
      />

      {/* Navigation Sub-Header Tabs */}
      <nav className="bg-[#0D1322] border-b border-[#1E293B] px-4 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 overflow-x-auto py-2 scrollbar-none">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>SEO Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('approvals')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer relative ${
                activeTab === 'approvals'
                  ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Rocket className="w-3.5 h-3.5" />
              <span>Approval & Deployment Hub</span>
              {pendingRecsCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold border border-amber-500/30">
                  {pendingRecsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('content')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'content'
                  ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Content Planner & AI Writer</span>
              {contentCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-bold border border-cyan-500/30">
                  {contentCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Audit History & Changes Report</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>24/7 Autopilot & Telegram</span>
            </button>
          </div>

          {/* Quick Portfolio Button */}
          <button
            onClick={() => setShowWebsitesManager(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#161F33] hover:bg-[#1E293B] border border-[#24304A] text-xs font-semibold text-indigo-300 transition-all cursor-pointer whitespace-nowrap shrink-0"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            <span>Websites ({websites.length})</span>
          </button>
        </div>
      </nav>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8">
        
        {activeTab === 'dashboard' && (
          <DashboardOverview
            latestAudit={latestAudit}
            settings={settings}
            selectedWebsite={selectedWebsite}
            websites={websites}
            onSelectWebsite={handleSelectWebsite}
            onOpenWebsitesManager={() => setShowWebsitesManager(true)}
            status={status}
            pendingCount={pendingRecsCount}
            deployedCount={deployedRecsCount}
            contentCount={contentCount}
            onNavigate={setActiveTab}
            onTriggerAudit={() => handleTriggerAudit(selectedWebsite?.id)}
            isAuditing={isAuditing}
          />
        )}

        {activeTab === 'approvals' && (
          <ApprovalsHub
            recommendations={filteredRecs}
            onApprove={handleApproveRecommendation}
            onReject={handleRejectRecommendation}
            onUpdateContent={handleUpdateRecommendationContent}
            targetWebsite={selectedWebsite?.url || settings?.targetWebsite}
          />
        )}

        {activeTab === 'content' && (
          <ContentStudio
            contentPlan={contentPlan.filter(c => !c.websiteId || c.websiteId === selectedWebsite?.id)}
            settings={settings}
            onGenerateArticle={handleGenerateArticle}
            onGenerateIdeas={handleGenerateIdeas}
            onApproveContent={handleApproveContent}
            isGenerating={isGenerating}
          />
        )}

        {activeTab === 'history' && (
          <AuditHistory
            audits={filteredAudits}
            deployments={deployments.filter(d => !d.websiteId || d.websiteId === selectedWebsite?.id)}
            settings={settings}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            onSaveSettings={handleSaveSettings}
          />
        )}

      </main>

      {/* Multi-Website Portfolio Modal */}
      {showWebsitesManager && (
        <WebsitesManager
          websites={websites}
          selectedWebsiteId={selectedWebsite?.id}
          onSelectWebsite={handleSelectWebsite}
          onAddWebsite={handleAddWebsite}
          onUpdateWebsite={handleUpdateWebsite}
          onDeleteWebsite={handleDeleteWebsite}
          onAuditWebsite={handleTriggerAudit}
          isAuditing={isAuditing}
          onClose={() => setShowWebsitesManager(false)}
        />
      )}

      {/* Toast Notification Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4">
          <div className={`px-4 py-3 rounded-2xl shadow-2xl border text-xs font-semibold flex items-center gap-2.5 backdrop-blur-md ${
            toast.type === 'success' 
              ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200' 
              : toast.type === 'error'
              ? 'bg-rose-950/90 border-rose-500/40 text-rose-200'
              : 'bg-indigo-950/90 border-indigo-500/40 text-indigo-200'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Global Footer */}
      <footer className="border-t border-[#1E293B] py-6 px-4 text-center text-xs text-slate-500">
        <p>RankPulse 24/7 Multi-Website SEO Engine · Running continuous background audits across all registered websites every {settings?.scheduleInterval || '6 hours'}</p>
      </footer>

    </div>
  );
}

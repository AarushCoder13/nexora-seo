import React from 'react';
import { 
  Activity, 
  ShieldCheck, 
  Search, 
  FileText, 
  Share2, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight, 
  Sparkles,
  Layers,
  TrendingUp,
  Cpu,
  Target,
  ExternalLink,
  Zap,
  Globe,
  Plus,
  RefreshCw
} from 'lucide-react';

export function DashboardOverview({ 
  latestAudit, 
  settings, 
  selectedWebsite,
  websites = [],
  onSelectWebsite,
  onOpenWebsitesManager,
  status, 
  pendingCount, 
  deployedCount, 
  contentCount,
  onNavigate,
  onTriggerAudit,
  isAuditing
}) {
  const scores = latestAudit?.scores || {
    overall: selectedWebsite?.lastScore || 97,
    technical: 95,
    onPage: 90,
    content: 92,
    richMedia: 94
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400 stroke-emerald-500';
    if (score >= 60) return 'text-amber-400 stroke-amber-500';
    return 'text-rose-400 stroke-rose-500';
  };

  const issues = latestAudit?.issues || [];
  const meta = latestAudit?.meta || {};

  return (
    <div className="space-y-6">

      {/* Target Site & Autopilot Mode Highlight */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#161F33] via-[#1A253F] to-[#141C2E] border border-[#24304A] p-6 shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 text-xs font-semibold flex items-center gap-1.5 border border-indigo-500/30">
                <Target className="w-3.5 h-3.5" /> Niche: {selectedWebsite?.niche || 'Artificial Intelligence & Software Engineering'}
              </span>
              <span className="text-xs text-slate-400">· Aiming for #1 Google SERPs</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                Active Website
              </span>
            </div>

            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                {selectedWebsite?.name || 'Nexus Code AI'}
              </h2>
              <a 
                href={selectedWebsite?.url || 'https://nexuscodeai.vercel.app'} 
                target="_blank" 
                rel="noreferrer" 
                className="text-indigo-400 hover:text-white transition-colors font-mono text-xs flex items-center gap-1"
                title="Visit Live Site"
              >
                <span>{selectedWebsite?.url || 'https://nexuscodeai.vercel.app'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <p className="text-xs text-slate-300 max-w-2xl">
              24/7 background crawler is actively auditing this website every {settings?.scheduleInterval || '6 hours'}. 
              All meta tag improvements, structured JSON-LD schemas, and rank-ready content are staged for your 1-click approval.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => onTriggerAudit(selectedWebsite?.id)}
              disabled={isAuditing}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin' : ''}`} />
              <span>Audit Now</span>
            </button>

            <button
              onClick={() => onNavigate('approvals')}
              className="px-4 py-2.5 rounded-xl bg-[#1F293D] hover:bg-[#2A3752] text-slate-200 font-semibold text-xs border border-slate-700/60 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Review Approvals ({pendingCount})</span>
            </button>

            <button
              onClick={onOpenWebsitesManager}
              className="px-4 py-2.5 rounded-xl bg-[#111827] hover:bg-[#1A2338] text-indigo-300 font-semibold text-xs border border-indigo-500/30 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add / Switch Site</span>
            </button>
          </div>
        </div>
      </div>

      {/* Multi-Website Quick Portfolio Bar */}
      {websites.length > 1 && (
        <div className="p-4 rounded-2xl bg-[#161F33] border border-[#1F293D] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-white">Your Monitored Websites ({websites.length})</span>
            </div>
            <button
              onClick={onOpenWebsitesManager}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
            >
              + Manage All Sites
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {websites.map(site => {
              const isSelected = site.id === selectedWebsite?.id;
              return (
                <div
                  key={site.id}
                  onClick={() => onSelectWebsite(site.id)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'bg-indigo-600/15 border-indigo-500/60 text-white shadow-md'
                      : 'bg-[#111827] border-[#1F293D] text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="truncate">
                    <span className="font-bold truncate block">{site.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono truncate block">{site.url.replace(/https?:\/\//, '')}</span>
                  </div>
                  <span className={`text-[11px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                    (site.lastScore || 0) >= 80 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {site.lastScore ? `${site.lastScore}%` : 'Pending'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Primary Metrics & Radial Health Gauge */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Overall SEO Score Card */}
        <div className="rounded-2xl bg-[#161F33] border border-[#1F293D] p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Overall Health</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{scores.overall}</span>
              <span className="text-xs text-slate-400">/ 100</span>
            </div>
            <div className="mt-2 text-xs flex items-center gap-1 text-emerald-400 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Rank #1 Optimized</span>
            </div>
          </div>

          {/* SVG Radial Meter */}
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={getScoreColor(scores.overall)}
                strokeDasharray={`${scores.overall}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
              {scores.overall}%
            </div>
          </div>
        </div>

        {/* Pending Approvals Card */}
        <div 
          onClick={() => onNavigate('approvals')}
          className="rounded-2xl bg-[#161F33] border border-[#1F293D] p-5 cursor-pointer hover:border-indigo-500/50 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Pending Changes</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{pendingCount}</span>
            <span className="text-xs text-amber-400 font-medium">Ready for deployment</span>
          </div>
          <p className="mt-2 text-xs text-slate-400 group-hover:text-indigo-400 flex items-center gap-1 transition-colors">
            <span>Approve & push to site</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </p>
        </div>

        {/* Deployed Changes Card */}
        <div 
          onClick={() => onNavigate('history')}
          className="rounded-2xl bg-[#161F33] border border-[#1F293D] p-5 cursor-pointer hover:border-emerald-500/50 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Changes Deployed</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{deployedCount}</span>
            <span className="text-xs text-emerald-400 font-medium">Live on target</span>
          </div>
          <p className="mt-2 text-xs text-slate-400 group-hover:text-emerald-400 flex items-center gap-1 transition-colors">
            <span>View deployment logs</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </p>
        </div>

        {/* Content Planner Articles Card */}
        <div 
          onClick={() => onNavigate('content')}
          className="rounded-2xl bg-[#161F33] border border-[#1F293D] p-5 cursor-pointer hover:border-cyan-500/50 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Content Articles</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{contentCount}</span>
            <span className="text-xs text-cyan-400 font-medium">Rank #1 guides</span>
          </div>
          <p className="mt-2 text-xs text-slate-400 group-hover:text-cyan-400 flex items-center gap-1 transition-colors">
            <span>Manage content calendar</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </p>
        </div>

      </div>

      {/* 4 Pillars Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-4 rounded-xl bg-[#111827] border border-[#1F293D]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Technical Foundation</span>
            <span className="text-xs font-bold text-white">{scores.technical}%</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
            <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${scores.technical}%` }}></div>
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">HTTPS, Mobile Viewport, Canonical</span>
        </div>

        <div className="p-4 rounded-xl bg-[#111827] border border-[#1F293D]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">On-Page SEO</span>
            <span className="text-xs font-bold text-white">{scores.onPage}%</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${scores.onPage}%` }}></div>
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">Title Tag, Meta Description, H1/H2</span>
        </div>

        <div className="p-4 rounded-xl bg-[#111827] border border-[#1F293D]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Content Depth</span>
            <span className="text-xs font-bold text-white">{scores.content}%</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
            <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${scores.content}%` }}></div>
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">Word Count, Semantic Keyword Intent</span>
        </div>

        <div className="p-4 rounded-xl bg-[#111827] border border-[#1F293D]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Rich Snippets & Social</span>
            <span className="text-xs font-bold text-white">{scores.richMedia}%</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: `${scores.richMedia}%` }}></div>
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">JSON-LD Schema, OpenGraph, Twitter Cards</span>
        </div>

      </div>

      {/* Two Column Layout: Issues & Keyword Dominance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Detected Issues & Quick Actions (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl bg-[#161F33] border border-[#1F293D] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1F293D] pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span>Detected Audit Opportunities ({issues.length})</span>
              </h3>
              <p className="text-xs text-slate-400">Fixes tailored for {selectedWebsite?.name || 'this site'} are staged in the Approval Hub.</p>
            </div>
            <button
              onClick={() => onNavigate('approvals')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 cursor-pointer"
            >
              <span>View All Fixes</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {issues.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="text-sm text-slate-300 font-medium mt-2">Zero critical blockers detected!</p>
                <p className="text-xs text-slate-500">Your site is adhering to high SEO standards. Continuous 6-hour monitoring is active.</p>
              </div>
            ) : (
              issues.slice(0, 5).map((issue, idx) => (
                <div 
                  key={idx}
                  className="flex items-start justify-between gap-4 p-3 rounded-xl bg-[#111827] border border-[#1F293D] hover:border-slate-700 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        issue.severity === 'high' 
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          : issue.severity === 'medium'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                      }`}>
                        {issue.severity || 'Opportunity'}
                      </span>
                      <span className="text-xs font-semibold text-slate-200">{issue.category}</span>
                    </div>
                    <p className="text-xs text-slate-400">{issue.message}</p>
                  </div>

                  <button
                    onClick={() => onNavigate('approvals')}
                    className="shrink-0 text-xs px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white transition-all cursor-pointer font-medium"
                  >
                    View Diff & Approve
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Target Niche & Keyword Analysis (1 col) */}
        <div className="rounded-2xl bg-[#161F33] border border-[#1F293D] p-5 space-y-4">
          <div className="border-b border-[#1F293D] pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-400" />
              <span>Target Keyword Tracking</span>
            </h3>
            <p className="text-xs text-slate-400">Focus terms for {selectedWebsite?.name || 'Site'}.</p>
          </div>

          <div className="space-y-3">
            {(selectedWebsite?.primaryKeywords || []).map((kw, i) => {
              const density = latestAudit?.keywordDensity?.[kw];
              return (
                <div key={i} className="p-3 rounded-xl bg-[#111827] border border-[#1F293D] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white font-mono">{kw}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      density?.inTitle && density?.inH1 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}>
                      {density?.inTitle && density?.inH1 ? 'Optimized' : 'Needs Optimization'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                    <span>In Title: {density?.inTitle ? '✅ Yes' : '❌ No'}</span>
                    <span>In H1: {density?.inH1 ? '✅ Yes' : '❌ No'}</span>
                    <span>Density: {density?.densityPercent || 0}%</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2">
            <button
              onClick={() => onNavigate('content')}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600/30 to-cyan-600/30 border border-indigo-500/30 hover:border-indigo-500/60 text-xs font-semibold text-white flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Generate Content for This Site</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}

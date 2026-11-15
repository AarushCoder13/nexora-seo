import React, { useState } from 'react';
import { 
  History, 
  ShieldCheck, 
  FileText, 
  Download, 
  ExternalLink, 
  Clock, 
  CheckCircle, 
  ArrowRight,
  TrendingUp,
  Filter,
  Check
} from 'lucide-react';

export function AuditHistory({ audits, deployments, settings }) {
  const [activeTab, setActiveTab] = useState('deployments'); // 'deployments' | 'audits'
  const [copied, setCopied] = useState(false);

  const exportReport = (format = 'json') => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      targetWebsite: settings?.targetWebsite,
      niche: settings?.niche,
      scheduleInterval: settings?.scheduleInterval,
      auditsCount: audits.length,
      deploymentsCount: deployments.length,
      latestAudit: audits[0] || null,
      deployedChanges: deployments
    };

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `RankPulse_SEO_Report_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    } else {
      let md = `# RankPulse 24/7 SEO Autopilot Audit & Change Report\n\n`;
      md += `**Website:** ${settings?.targetWebsite}\n`;
      md += `**Niche:** ${settings?.niche}\n`;
      md += `**Generated:** ${new Date().toLocaleString()}\n\n`;
      md += `## Changes Made & Deployed (${deployments.length} Total)\n\n`;
      deployments.forEach((d, i) => {
        md += `### ${i + 1}. [${d.category}] ${d.title}\n`;
        md += `- **Date:** ${new Date(d.timestamp).toLocaleString()}\n`;
        md += `- **Target:** ${d.targetPage}\n`;
        md += `- **Method:** ${d.method}\n`;
        md += `\`\`\`html\n${d.after}\n\`\`\`\n\n`;
      });
      const blob = new Blob([md], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `RankPulse_SEO_Report_${new Date().toISOString().split('T')[0]}.md`;
      a.click();
    }
  };

  return (
    <div className="space-y-6">

      {/* Top Banner & Export Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1F293D]">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-400" />
            <span>Audit History & Deployed Changes Report</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Complete transparency into what the 24/7 autopilot investigated, detected, and deployed to your site.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Tab Selector */}
          <div className="flex items-center p-1 rounded-xl bg-[#111827] border border-[#1F293D] text-xs">
            <button
              onClick={() => setActiveTab('deployments')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                activeTab === 'deployments' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Changes Deployed ({deployments.length})
            </button>
            <button
              onClick={() => setActiveTab('audits')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                activeTab === 'audits' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Audit Cycles ({audits.length})
            </button>
          </div>

          <button
            onClick={() => exportReport('md')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#161F33] hover:bg-[#1E293B] text-slate-200 text-xs font-semibold border border-[#24304A] transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export Markdown</span>
          </button>

          <button
            onClick={() => exportReport('json')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'deployments' ? (
        <div className="space-y-4">
          {deployments.length === 0 ? (
            <div className="text-center py-16 rounded-2xl bg-[#161F33] border border-[#1F293D] p-8">
              <ShieldCheck className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white mt-3">No deployed changes yet</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Go to the Approval Hub to approve proposed meta tag or schema fixes. Once approved, every deployment is logged here.
              </p>
            </div>
          ) : (
            deployments.map((dep, idx) => (
              <div
                key={dep.id || idx}
                className="rounded-2xl bg-[#161F33] border border-[#1F293D] p-5 space-y-3 hover:border-slate-700 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                      {dep.category}
                    </span>
                    <h3 className="text-sm font-bold text-white">{dep.title}</h3>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {new Date(dep.timestamp).toLocaleString()}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">
                      {dep.method}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="p-3 rounded-xl bg-[#0B0F19] border border-rose-500/20 font-mono text-slate-400 overflow-x-auto">
                    <span className="text-[10px] uppercase font-bold text-rose-400 block mb-1">Previous Value:</span>
                    <div className="whitespace-pre-wrap">{dep.before}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0B0F19] border border-emerald-500/20 font-mono text-emerald-300 overflow-x-auto">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">Deployed Value:</span>
                    <div className="whitespace-pre-wrap">{dep.after}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {audits.length === 0 ? (
            <div className="text-center py-16 rounded-2xl bg-[#161F33] border border-[#1F293D] p-8">
              <History className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white mt-3">No audits recorded yet</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Click "Run Audit Now" in the header to run your first automated SEO crawl.
              </p>
            </div>
          ) : (
            audits.map((audit, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-[#161F33] border border-[#1F293D] p-5 space-y-4 hover:border-slate-700 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{audit.url}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                        Status {audit.statusCode || 200}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">
                      Audit executed on {new Date(audit.timestamp).toLocaleString()} ({audit.durationMs || 450}ms)
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Health Score</span>
                      <span className="text-xl font-black text-emerald-400">{audit.scores?.overall || 0}/100</span>
                    </div>
                  </div>
                </div>

                {/* Subscores */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1 text-xs">
                  <div className="p-2.5 rounded-lg bg-[#0B0F19] border border-slate-800 text-center">
                    <span className="text-slate-400 block text-[11px]">Technical</span>
                    <span className="font-bold text-white text-sm">{audit.scores?.technical || 0}%</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#0B0F19] border border-slate-800 text-center">
                    <span className="text-slate-400 block text-[11px]">On-Page</span>
                    <span className="font-bold text-white text-sm">{audit.scores?.onPage || 0}%</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#0B0F19] border border-slate-800 text-center">
                    <span className="text-slate-400 block text-[11px]">Content</span>
                    <span className="font-bold text-white text-sm">{audit.scores?.content || 0}%</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#0B0F19] border border-slate-800 text-center">
                    <span className="text-slate-400 block text-[11px]">Rich Snippets</span>
                    <span className="font-bold text-white text-sm">{audit.scores?.richMedia || 0}%</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
}

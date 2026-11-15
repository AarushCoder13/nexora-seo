import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Rocket, 
  Code, 
  Eye, 
  Edit3, 
  Copy, 
  Check, 
  ExternalLink,
  Sparkles,
  ArrowRight,
  Filter,
  Download,
  Terminal,
  HelpCircle
} from 'lucide-react';

export function ApprovalsHub({ 
  recommendations, 
  onApprove, 
  onReject, 
  onUpdateContent,
  targetWebsite 
}) {
  const [filter, setFilter] = useState('pending'); // 'pending', 'deployed', 'rejected', 'all'
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [showHeadCodeModal, setShowHeadCodeModal] = useState(false);

  const filteredRecs = recommendations.filter(r => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  const handleStartEdit = (rec) => {
    setEditingId(rec.id);
    setEditValue(rec.suggestedContent);
  };

  const handleSaveEdit = (id) => {
    onUpdateContent(id, editValue);
    setEditingId(null);
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Compile all deployed/approved head snippets into a single exportable block
  const generateUnifiedHeadCode = () => {
    const approved = recommendations.filter(r => r.status === 'deployed' || r.status === 'approved');
    let code = `<!-- RankPulse 24/7 Unified SEO Optimization Bundle -->\n`;
    approved.forEach(r => {
      code += `\n<!-- [${r.category}] ${r.title} -->\n`;
      if (r.type === 'title') {
        code += `<title>${r.suggestedContent}</title>\n`;
      } else if (r.type === 'meta_description') {
        code += `<meta name="description" content="${r.suggestedContent}">\n`;
      } else {
        code += `${r.suggestedContent}\n`;
      }
    });
    return code;
  };

  return (
    <div className="space-y-6">

      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1F293D]">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Rocket className="w-5 h-5 text-indigo-400" />
            <span>Human-in-the-Loop Approval & Deployment Hub</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Review AI-engineered SEO fixes. Every change shows exact Before/After diffs. You approve it, and RankPulse deploys it.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-[#111827] border border-[#1F293D] text-xs">
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                filter === 'pending' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Pending ({recommendations.filter(r => r.status === 'pending').length})
            </button>
            <button
              onClick={() => setFilter('deployed')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                filter === 'deployed' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Deployed ({recommendations.filter(r => r.status === 'deployed').length})
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                filter === 'all' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({recommendations.length})
            </button>
          </div>

          {/* Unified Export Button */}
          <button
            onClick={() => setShowHeadCodeModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#161F33] hover:bg-[#1E293B] text-slate-200 text-xs font-semibold border border-[#24304A] transition-all cursor-pointer"
          >
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export &lt;head&gt; Bundle</span>
          </button>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-5">
        {filteredRecs.length === 0 ? (
          <div className="text-center py-16 rounded-2xl bg-[#161F33] border border-[#1F293D] p-8">
            <Sparkles className="w-10 h-10 text-indigo-400 mx-auto" />
            <h3 className="text-base font-bold text-white mt-3">No {filter} items in queue</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              When the background 6-hour crawler finishes an audit, any ranking gaps and meta optimizations will appear here for review.
            </p>
          </div>
        ) : (
          filteredRecs.map((rec) => (
            <div 
              key={rec.id}
              className="rounded-2xl bg-[#161F33] border border-[#1F293D] overflow-hidden shadow-xl hover:border-slate-700 transition-all"
            >
              {/* Card Header */}
              <div className="p-5 border-b border-[#1F293D] bg-[#141C2E] flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                      {rec.category}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      rec.impact === 'High' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}>
                      Impact: {rec.impact}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      rec.status === 'deployed' 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                        : rec.status === 'rejected'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}>
                      Status: {rec.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white">{rec.title}</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5">
                    <span>Target URL:</span>
                    <code className="text-indigo-300 font-mono text-[11px] bg-slate-900/80 px-2 py-0.5 rounded">
                      {rec.targetPage || targetWebsite}
                    </code>
                  </p>
                </div>

                {/* Card Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {rec.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStartEdit(rec)}
                        className="px-3 py-1.5 rounded-lg bg-[#1F293D] hover:bg-[#2A3752] text-slate-300 text-xs font-medium flex items-center gap-1.5 border border-slate-700/60 transition-all cursor-pointer"
                        title="Edit suggested content before approving"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => onReject(rec.id)}
                        className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-medium flex items-center gap-1.5 border border-rose-500/30 transition-all cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>

                      <button
                        onClick={() => onApprove(rec.id)}
                        className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                      >
                        <Rocket className="w-3.5 h-3.5" />
                        <span>Approve & Deploy</span>
                      </button>
                    </>
                  )}

                  {rec.status === 'deployed' && (
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <CheckCircle className="w-3.5 h-3.5" /> Deployed Live
                      </span>
                      <button
                        onClick={() => copyToClipboard(rec.suggestedContent, rec.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                        title="Copy deployed snippet"
                      >
                        {copiedId === rec.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Body: Rationale & Diff View */}
              <div className="p-5 space-y-4">
                
                {/* AI Rationale */}
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/20 text-xs text-indigo-300">
                  <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-indigo-400" />
                  <div>
                    <span className="font-semibold text-white">Why this change will improve ranking: </span>
                    {rec.reason}
                  </div>
                </div>

                {/* Side-by-Side Before vs After Diff View */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Current / Before */}
                  <div className="rounded-xl bg-[#0F1626] border border-rose-500/20 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span> Before (Current Page)
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {rec.currentContent.length} chars
                      </span>
                    </div>

                    <div className="font-mono text-xs text-slate-300 bg-[#0B0F19] p-3 rounded-lg border border-slate-800/80 overflow-x-auto whitespace-pre-wrap break-all max-h-48 overflow-y-auto">
                      {rec.currentContent}
                    </div>
                  </div>

                  {/* AI Suggested / After */}
                  <div className="rounded-xl bg-[#0F1626] border border-emerald-500/20 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span> After (AI Optimized)
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400">
                          {rec.suggestedContent.length} chars
                        </span>
                        <button
                          onClick={() => copyToClipboard(rec.suggestedContent, rec.id)}
                          className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                          title="Copy snippet"
                        >
                          {copiedId === rec.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {editingId === rec.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          rows={4}
                          className="w-full font-mono text-xs text-emerald-300 bg-[#0B0F19] p-3 rounded-lg border border-indigo-500/60 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-2.5 py-1 text-xs rounded bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveEdit(rec.id)}
                            className="px-3 py-1 text-xs rounded bg-indigo-600 text-white font-medium hover:bg-indigo-500 cursor-pointer"
                          >
                            Save Changes
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="font-mono text-xs text-emerald-300 bg-[#0B0F19] p-3 rounded-lg border border-slate-800/80 overflow-x-auto whitespace-pre-wrap break-all max-h-48 overflow-y-auto">
                        {rec.suggestedContent}
                      </div>
                    )}
                  </div>

                </div>

                {/* Google SERP Preview for Title & Meta Description */}
                {(rec.type === 'title' || rec.type === 'meta_description') && (
                  <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                      Live Google SERP Card Preview
                    </span>
                    <div className="space-y-1">
                      <div className="text-xs text-[#202124] dark:text-[#bdc1c6] truncate">
                        {targetWebsite} › {rec.type === 'title' ? 'page' : 'overview'}
                      </div>
                      <div className="text-base text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer font-medium leading-snug">
                        {rec.type === 'title' ? rec.suggestedContent : 'Target Brand | Rank #1 Authority in Niche'}
                      </div>
                      <div className="text-xs text-[#4d5156] dark:text-[#bdc1c6] line-clamp-2 leading-relaxed">
                        {rec.type === 'meta_description' ? rec.suggestedContent : 'Discover how our platform drives top organic search rankings with autonomous 24/7 audits and real-time deployment.'}
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          ))
        )}
      </div>

      {/* Head Code Export Modal */}
      {showHeadCodeModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-[#111827] border border-[#1F293D] shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1F293D]">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Terminal className="w-5 h-5 text-indigo-400" />
                <span>Drop-in HTML &lt;head&gt; SEO Optimization Bundle</span>
              </h3>
              <button 
                onClick={() => setShowHeadCodeModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Copy and paste this snippet directly into the <code className="text-indigo-400">&lt;head&gt;</code> tag of your website. 
              It consolidates all approved title tags, meta descriptions, OpenGraph social cards, and JSON-LD structured schemas.
            </p>

            <pre className="font-mono text-xs text-emerald-300 bg-[#0B0F19] p-4 rounded-xl border border-slate-800 overflow-x-auto max-h-72 whitespace-pre">
              {generateUnifiedHeadCode()}
            </pre>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">Ready for instant production copy</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowHeadCodeModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => copyToClipboard(generateUnifiedHeadCode(), 'modal_bundle')}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 cursor-pointer"
                >
                  {copiedId === 'modal_bundle' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedId === 'modal_bundle' ? 'Copied to Clipboard!' : 'Copy Entire Snippet'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

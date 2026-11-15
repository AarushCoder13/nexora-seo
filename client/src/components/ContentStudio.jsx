import React, { useState } from 'react';
import { 
  FileText, 
  Sparkles, 
  Send, 
  Copy, 
  Check, 
  Calendar, 
  CheckCircle, 
  ExternalLink,
  Share2,
  TrendingUp,
  Target,
  Rocket,
  Edit3,
  Clock,
  Layers,
  Search
} from 'lucide-react';

export function ContentStudio({ 
  contentPlan, 
  settings, 
  onGenerateArticle, 
  onGenerateIdeas, 
  onApproveContent,
  isGenerating 
}) {
  const [selectedArticle, setSelectedArticle] = useState(contentPlan.find(c => c.content) || null);
  const [customTopic, setCustomTopic] = useState('');
  const [customKeyword, setCustomKeyword] = useState('');
  const [copiedKey, setCopiedKey] = useState(null);

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCreateFromCustom = (e) => {
    e.preventDefault();
    if (!customTopic && !customKeyword) return;
    onGenerateArticle(customTopic, customKeyword);
    setCustomTopic('');
    setCustomKeyword('');
  };

  const draftsWithContent = contentPlan.filter(c => c.content);
  const plannedTopics = contentPlan.filter(c => !c.content);

  return (
    <div className="space-y-6">

      {/* Hero Banner: Niche Ranking Blueprint */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950 via-[#161F33] to-[#121B2F] border border-indigo-500/30 p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-bold border border-cyan-500/30 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" /> Niche Dominance Strategy
              </span>
              <span className="text-xs text-slate-400">Targeting #1 Google SERPs in {settings?.niche || 'Your Industry'}</span>
            </div>
            <h2 className="text-xl font-black text-white">AI Content Planner & Production Studio</h2>
            <p className="text-xs text-slate-300 max-w-2xl">
              Generate 1,500+ word search-optimized pillar guides, comparison articles, and social snippets. 
              Review drafts, 1-click approve, and deploy directly to your website or copy to your social accounts.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onGenerateIdeas}
              disabled={isGenerating}
              className="px-4 py-2.5 rounded-xl bg-[#1E293B] hover:bg-[#2A3752] text-slate-200 text-xs font-semibold border border-slate-700/60 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Generate Topic Ideas</span>
            </button>
          </div>
        </div>

        {/* Quick Instant Article Generator Form */}
        <form onSubmit={handleCreateFromCustom} className="mt-5 pt-4 border-t border-indigo-500/20 grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Article Topic (e.g. 10 Best AI Automation Workflows in 2026)"
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-[#0B0F19] border border-[#24304A] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <input
            type="text"
            placeholder="Focus Keyword (e.g. ai automation tools)"
            value={customKeyword}
            onChange={(e) => setCustomKeyword(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-[#0B0F19] border border-[#24304A] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={isGenerating || (!customTopic && !customKeyword)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Generating High-Rank Article...' : 'Generate Rank #1 Article'}</span>
          </button>
        </form>
      </div>

      {/* Main Studio: Left (Topic Calendar / Articles List) & Right (Article Viewer & Social Snippets) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Topics & Drafts (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Generated Articles Ready for Review */}
          <div className="rounded-2xl bg-[#161F33] border border-[#1F293D] p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#1F293D]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Generated Content ({draftsWithContent.length})</span>
              </h3>
              <span className="text-[10px] text-slate-400">Click to view & approve</span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {draftsWithContent.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No articles generated yet. Click "Generate Rank #1 Article" above.</p>
              ) : (
                draftsWithContent.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedArticle(item)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      selectedArticle?.id === item.id 
                        ? 'bg-indigo-600/10 border-indigo-500 text-white shadow'
                        : 'bg-[#111827] border-[#1F293D] text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold line-clamp-1">{item.title}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                        item.status === 'published' 
                          ? 'bg-emerald-500/20 text-emerald-300' 
                          : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {item.status === 'published' ? 'Deployed' : 'Pending'}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Keyword: {item.keyword}</span>
                      <span>~{item.wordCount || 1200} words</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Niche Content Planner Topics */}
          <div className="rounded-2xl bg-[#161F33] border border-[#1F293D] p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#1F293D]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <span>Planned Niche Topics ({plannedTopics.length})</span>
              </h3>
              <button
                onClick={onGenerateIdeas}
                className="text-[10px] text-cyan-400 hover:underline cursor-pointer"
              >
                + Refresh Ideas
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {plannedTopics.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-xs text-slate-500">No scheduled topics.</p>
                  <button
                    onClick={onGenerateIdeas}
                    className="mt-2 text-xs px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white transition-all cursor-pointer"
                  >
                    Generate Planner Strategy
                  </button>
                </div>
              ) : (
                plannedTopics.map((topic) => (
                  <div
                    key={topic.id}
                    className="p-3 rounded-xl bg-[#111827] border border-[#1F293D] space-y-2 text-xs"
                  >
                    <div className="font-semibold text-white line-clamp-2">{topic.title}</div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="text-indigo-400">KD: {topic.difficulty}</span>
                      <span>{topic.estTrafficPotential}</span>
                    </div>
                    <button
                      onClick={() => onGenerateArticle(topic.title, topic.keyword)}
                      disabled={isGenerating}
                      className="w-full py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white font-semibold text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      <span>Generate Full Article Now</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Active Article Station & Social Direct Post (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {selectedArticle ? (
            <div className="rounded-2xl bg-[#161F33] border border-[#1F293D] overflow-hidden shadow-xl">
              
              {/* Header Bar */}
              <div className="p-5 border-b border-[#1F293D] bg-[#141C2E] flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                      Target Keyword: {selectedArticle.keyword}
                    </span>
                    <span className="text-xs text-slate-400">~{selectedArticle.wordCount || 1400} words</span>
                    <span className="text-xs text-indigo-300">· {selectedArticle.estimatedRankPotential || 'Top 3 SERP Potential'}</span>
                  </div>
                  <h3 className="text-lg font-extrabold text-white">{selectedArticle.title}</h3>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => copyToClipboard(selectedArticle.content, 'full_markdown')}
                    className="px-3.5 py-2 rounded-xl bg-[#1E293B] hover:bg-[#2A3752] text-slate-200 text-xs font-semibold border border-slate-700/60 flex items-center gap-1.5 transition-all cursor-pointer"
                    title="Copy Markdown for WordPress, Medium, Ghost, Dev.to"
                  >
                    {copiedKey === 'full_markdown' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'full_markdown' ? 'Copied Markdown!' : 'Copy Markdown'}</span>
                  </button>

                  {selectedArticle.status !== 'published' ? (
                    <button
                      onClick={() => onApproveContent(selectedArticle.id)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                    >
                      <Rocket className="w-3.5 h-3.5" />
                      <span>Approve & Deploy to CMS</span>
                    </button>
                  ) : (
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5" /> Published & Live
                    </span>
                  )}
                </div>
              </div>

              {/* Ready-to-Post Social Channels */}
              <div className="p-4 bg-[#0F1626] border-b border-[#1F293D] grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* LinkedIn Snippet */}
                <div className="p-3.5 rounded-xl bg-[#161F33] border border-[#1F293D] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                      <Share2 className="w-3.5 h-3.5" /> Ready for LinkedIn Posting
                    </span>
                    <button
                      onClick={() => copyToClipboard(selectedArticle.socialSnippets?.linkedin || `🚀 Read our new guide on ${selectedArticle.keyword}!`, 'linkedin_snip')}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'linkedin_snip' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-3 italic">
                    {selectedArticle.socialSnippets?.linkedin || `Discover how to master ${selectedArticle.keyword} and secure top rankings. Complete breakdown inside!`}
                  </p>
                </div>

                {/* X / Twitter Thread Starter */}
                <div className="p-3.5 rounded-xl bg-[#161F33] border border-[#1F293D] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Send className="w-3.5 h-3.5 text-cyan-400" /> Ready for X / Telegram Posting
                    </span>
                    <button
                      onClick={() => copyToClipboard(selectedArticle.socialSnippets?.twitter || `Dominating ${selectedArticle.keyword} in 2026. 🧵👇`, 'twitter_snip')}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'twitter_snip' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-3 italic">
                    {selectedArticle.socialSnippets?.twitter || `Stop losing organic traffic to competitors. Here is the modern 2026 framework for dominating "${selectedArticle.keyword}" 🧵👇`}
                  </p>
                </div>

              </div>

              {/* Full Article Content Reader */}
              <div className="p-6 max-h-[600px] overflow-y-auto space-y-4 font-sans text-sm text-slate-300 leading-relaxed bg-[#0B0F19]">
                <pre className="whitespace-pre-wrap font-sans text-xs md:text-sm text-slate-200">
                  {selectedArticle.content}
                </pre>
              </div>

            </div>
          ) : (
            <div className="rounded-2xl bg-[#161F33] border border-[#1F293D] p-12 text-center space-y-4">
              <FileText className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No article selected</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Select an article from the left panel to review its full SEO text, copy social snippets, or approve it for deployment.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

import React, { useState } from 'react';
import { 
  Globe, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  ExternalLink, 
  Activity, 
  RefreshCw, 
  ShieldCheck, 
  Sparkles,
  Layers,
  ArrowRight,
  TrendingUp,
  X
} from 'lucide-react';

export function WebsitesManager({ 
  websites, 
  selectedWebsiteId, 
  onSelectWebsite, 
  onAddWebsite, 
  onUpdateWebsite, 
  onDeleteWebsite,
  onAuditWebsite,
  isAuditing,
  onClose
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formName, setFormName] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formNiche, setFormNiche] = useState('');
  const [formKeywords, setFormKeywords] = useState('');
  const [kwInput, setKwInput] = useState('');

  const handleStartAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setFormName('');
    setFormUrl('');
    setFormNiche('');
    setFormKeywords(['best ai automation tools 2026', 'seo rank 1']);
  };

  const handleStartEdit = (site) => {
    setEditingId(site.id);
    setIsAdding(false);
    setFormName(site.name);
    setFormUrl(site.url);
    setFormNiche(site.niche);
    setFormKeywords(site.primaryKeywords || []);
  };

  const handleAddKw = (e) => {
    e.preventDefault();
    if (kwInput.trim() && !formKeywords.includes(kwInput.trim())) {
      setFormKeywords([...formKeywords, kwInput.trim()]);
      setKwInput('');
    }
  };

  const handleRemoveKw = (kw) => {
    setFormKeywords(formKeywords.filter(k => k !== kw));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formUrl.trim()) return;

    const payload = {
      name: formName.trim() || formUrl.replace(/https?:\/\//, '').replace('www.', '').split('/')[0],
      url: formUrl.trim(),
      niche: formNiche.trim() || 'General Business & Technology',
      primaryKeywords: formKeywords.length ? formKeywords : ['seo tools', 'rank 1']
    };

    if (editingId) {
      onUpdateWebsite(editingId, payload);
      setEditingId(null);
    } else {
      onAddWebsite(payload);
      setIsAdding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#111827] border border-[#1F293D] shadow-2xl p-6 space-y-6">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1F293D]">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2.5">
              <Globe className="w-5 h-5 text-indigo-400" />
              <span>Multi-Website Portfolio Manager</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Monitor, crawl, and improve SEO across all your websites 24/7.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {!isAdding && !editingId && (
              <button
                onClick={handleStartAdd}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Website</span>
              </button>
            )}

            {onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-[#161F33] hover:bg-[#1E293B] text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Add / Edit Form Card */}
        {(isAdding || editingId) && (
          <form onSubmit={handleSubmit} className="p-5 rounded-2xl bg-[#161F33] border border-indigo-500/40 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>{editingId ? 'Edit Website Details' : 'Add New Website to 24/7 Autopilot'}</span>
              </span>
              <button
                type="button"
                onClick={() => { setIsAdding(false); setEditingId(null); }}
                className="text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Website Name / Label</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Nexus Code AI"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0B0F19] border border-[#24304A] text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Website URL (Required)</label>
                <input
                  type="text"
                  required
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  placeholder="https://nexuscodeai.vercel.app"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0B0F19] border border-[#24304A] text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Industry Niche</label>
              <input
                type="text"
                value={formNiche}
                onChange={(e) => setFormNiche(e.target.value)}
                placeholder="e.g. AI Automation & Software Engineering"
                className="w-full px-3.5 py-2 rounded-xl bg-[#0B0F19] border border-[#24304A] text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Keyword tags */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Target Keywords (Aiming for #1 Position)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={kwInput}
                  onChange={(e) => setKwInput(e.target.value)}
                  placeholder="Type keyword and press Add"
                  className="flex-1 px-3.5 py-2 rounded-xl bg-[#0B0F19] border border-[#24304A] text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddKw}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {formKeywords.map((kw, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 text-xs flex items-center gap-1.5"
                  >
                    <span>{kw}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveKw(kw)}
                      className="text-indigo-400 hover:text-white"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => { setIsAdding(false); setEditingId(null); }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 cursor-pointer"
              >
                {editingId ? 'Save Changes' : 'Add Website & Start 24/7 Autopilot'}
              </button>
            </div>
          </form>
        )}

        {/* Websites List Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {websites.map((site) => {
            const isSelected = site.id === selectedWebsiteId;
            return (
              <div
                key={site.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                  isSelected 
                    ? 'bg-[#16223B] border-indigo-500/60 shadow-xl shadow-indigo-500/10' 
                    : 'bg-[#161F33] border-[#1F293D] hover:border-slate-700'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                      {site.niche || 'Technology'}
                    </span>

                    <div className="flex items-center gap-2">
                      {site.lastScore !== null && (
                        <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                          site.lastScore >= 80 
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}>
                          {site.lastScore}% Score
                        </span>
                      )}

                      <span className={`w-2.5 h-2.5 rounded-full ${site.active ? 'bg-emerald-400' : 'bg-slate-600'}`} title={site.active ? '24/7 Monitoring Active' : 'Paused'}></span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>{site.name}</span>
                    </h3>
                    <a
                      href={site.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-mono text-indigo-300 hover:text-indigo-200 flex items-center gap-1 mt-0.5"
                    >
                      <span>{site.url}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* Keywords pills */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {(site.primaryKeywords || []).slice(0, 3).map((kw, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-[#0B0F19] text-slate-400 border border-slate-800">
                        {kw}
                      </span>
                    ))}
                    {(site.primaryKeywords || []).length > 3 && (
                      <span className="text-[10px] px-1.5 py-0.5 text-slate-500">
                        +{site.primaryKeywords.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onAuditWebsite(site.id)}
                      disabled={isAuditing}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                      title="Run SEO Crawl on this website"
                    >
                      <RefreshCw className={`w-3 h-3 ${isAuditing ? 'animate-spin' : ''}`} />
                      <span>Audit Now</span>
                    </button>

                    <button
                      onClick={() => handleStartEdit(site)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                      title="Edit website"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {websites.length > 1 && (
                      <button
                        onClick={() => onDeleteWebsite(site.id)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                        title="Delete website"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      onSelectWebsite(site.id);
                      if (onClose) onClose();
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Active View</span>
                      </>
                    ) : (
                      <>
                        <span>Switch to This Site</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

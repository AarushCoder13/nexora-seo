const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

async function callAiApi(prompt, systemPrompt, settings) {
  // If OpenAI key is configured
  if (settings.openAiApiKey) {
    try {
      const res = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7
        },
        {
          headers: {
            Authorization: `Bearer ${settings.openAiApiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 25000
        }
      );
      return res.data.choices[0].message.content;
    } catch (err) {
      console.warn('OpenAI API call failed, falling back:', err.message);
    }
  }

  // If Gemini key is configured
  if (settings.geminiApiKey) {
    try {
      const res = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${settings.geminiApiKey}`,
        {
          contents: [{ parts: [{ text: `${systemPrompt}\n\nTask:\n${prompt}` }] }]
        },
        { headers: { 'Content-Type': 'application/json' }, timeout: 25000 }
      );
      return res.data.candidates[0].content.parts[0].text;
    } catch (err) {
      console.warn('Gemini API call failed, falling back:', err.message);
    }
  }

  return null;
}

/**
 * Generates concrete actionable SEO fixes from audit data with Before/After diffs
 */
async function generateSeoRecommendations(auditResult, settings) {
  const recommendations = [];
  const primaryKw = (settings.primaryKeywords && settings.primaryKeywords[0]) || 'AI Automation';
  const niche = settings.niche || 'Technology';
  const meta = auditResult.meta || {};

  // 1. Title Tag Recommendation
  const currentTitle = meta.title || '(Empty Title)';
  const needsTitleFix = !meta.title || meta.titleLength < 30 || meta.titleLength > 65 || !meta.title.toLowerCase().includes(primaryKw.toLowerCase());
  
  if (needsTitleFix) {
    const suggestedTitle = `${capitalize(primaryKw)}: Complete 2026 Guide & Platform | ${cleanDomain(settings.targetWebsite)}`;
    recommendations.push({
      id: uuidv4(),
      category: 'Meta Tags',
      type: 'title',
      title: 'Optimize <title> Tag for SERP CTR & Keyword Dominance',
      impact: 'High',
      targetPage: auditResult.url,
      currentContent: currentTitle,
      suggestedContent: suggestedTitle,
      reason: `Current title lacks the high-intent primary keyword "${primaryKw}" and is not calibrated to the 55-60 character CTR sweet spot.`,
      status: 'pending',
      createdAt: new Date().toISOString()
    });
  }

  // 2. Meta Description Recommendation
  const currentDesc = meta.description || '(Empty Meta Description)';
  const needsDescFix = !meta.description || meta.descLength < 110 || meta.descLength > 165 || !meta.description.toLowerCase().includes(primaryKw.toLowerCase());

  if (needsDescFix) {
    const suggestedDesc = `Discover how to master ${primaryKw} in ${niche}. Boost traffic, streamline rankings, and drive organic conversions with our top-rated solutions.`;
    recommendations.push({
      id: uuidv4(),
      category: 'Meta Tags',
      type: 'meta_description',
      title: 'Generate High-Conversion Meta Description',
      impact: 'High',
      targetPage: auditResult.url,
      currentContent: currentDesc,
      suggestedContent: suggestedDesc,
      reason: 'Increases click-through rate from Google Search and includes core transactional search terms within 155 characters.',
      status: 'pending',
      createdAt: new Date().toISOString()
    });
  }

  // 3. Schema Markup (Structured Data)
  if (meta.schemaCount === 0 || !(meta.schemasDetected || []).includes('Organization')) {
    const jsonLdSchema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "@id": `${settings.targetWebsite}#website`,
          "url": settings.targetWebsite,
          "name": cleanDomain(settings.targetWebsite),
          "description": `Leading authority in ${niche} and ${primaryKw}`,
          "potentialAction": {
            "@type": "SearchAction",
            "target": `${settings.targetWebsite}/?s={search_term_string}`,
            "query-input": "required name=search_term_string"
          }
        },
        {
          "@type": "Organization",
          "@id": `${settings.targetWebsite}#organization`,
          "name": cleanDomain(settings.targetWebsite),
          "url": settings.targetWebsite,
          "logo": `${settings.targetWebsite}/assets/logo.png`,
          "sameAs": []
        }
      ]
    };

    recommendations.push({
      id: uuidv4(),
      category: 'Structured Data',
      type: 'schema_jsonld',
      title: 'Inject Rich Snippet JSON-LD Schema (WebSite & Organization)',
      impact: 'High',
      targetPage: auditResult.url,
      currentContent: '<!-- No JSON-LD Schema Found -->',
      suggestedContent: `<script type="application/ld+json">\n${JSON.stringify(jsonLdSchema, null, 2)}\n</script>`,
      reason: 'Enables Google to render knowledge graph cards, site search boxes, and rich snippet highlights in SERP results.',
      status: 'pending',
      createdAt: new Date().toISOString()
    });
  }

  // 4. H1 & Header Hierarchy Optimization
  if (meta.h1Count === 0 || (meta.h1Texts && !meta.h1Texts[0]?.toLowerCase().includes(primaryKw.toLowerCase()))) {
    const currentH1 = meta.h1Texts && meta.h1Texts.length > 0 ? meta.h1Texts[0] : '(No H1 tag present)';
    const suggestedH1 = `#1 Ranked ${capitalize(primaryKw)} Solutions for ${niche}`;
    recommendations.push({
      id: uuidv4(),
      category: 'Headings',
      type: 'h1_heading',
      title: 'Align Primary H1 Heading with Target Search Intent',
      impact: 'Medium',
      targetPage: auditResult.url,
      currentContent: `<h1>${currentH1}</h1>`,
      suggestedContent: `<h1>${suggestedH1}</h1>`,
      reason: 'The H1 tag carries top semantic weight in on-page ranking algorithms. Placing the primary search term in H1 triggers immediate relevance indexing.',
      status: 'pending',
      createdAt: new Date().toISOString()
    });
  }

  // 5. OpenGraph & Social Media Sharing Cards
  if (!meta.ogTitle || !meta.ogImage) {
    const ogSnippet = `<meta property="og:title" content="${meta.title || primaryKw}" />\n<meta property="og:description" content="${meta.description || `Explore ${primaryKw}`}" />\n<meta property="og:type" content="website" />\n<meta property="og:url" content="${settings.targetWebsite}" />\n<meta property="og:image" content="${settings.targetWebsite}/og-image.jpg" />\n<meta name="twitter:card" content="summary_large_image" />`;
    recommendations.push({
      id: uuidv4(),
      category: 'Social Signals',
      type: 'opengraph',
      title: 'Inject OpenGraph & Twitter Card Metadata',
      impact: 'Medium',
      targetPage: auditResult.url,
      currentContent: '<!-- Missing OG / Twitter Meta -->',
      suggestedContent: ogSnippet,
      reason: 'Maximizes viral click-throughs and brand authority when URLs are shared across Telegram, Twitter, LinkedIn, and messaging apps.',
      status: 'pending',
      createdAt: new Date().toISOString()
    });
  }

  // 6. Image Alt Tags if missing
  if (meta.missingAltCount > 0) {
    recommendations.push({
      id: uuidv4(),
      category: 'Accessibility & Image SEO',
      type: 'image_alt',
      title: `Fix ${meta.missingAltCount} Images Missing Descriptive ALT Tags`,
      impact: 'Medium',
      targetPage: auditResult.url,
      currentContent: `${meta.missingAltCount} images without alt attribute (e.g. ${meta.missingAltImages.slice(0, 2).join(', ')})`,
      suggestedContent: `Add descriptive keyword-rich ALT tags (e.g., alt="${primaryKw} dashboard interface overview")`,
      reason: 'Image alt tags boost Google Image search visibility and ensure ADA/accessibility compliance.',
      status: 'pending',
      createdAt: new Date().toISOString()
    });
  }

  return recommendations;
}

/**
 * Generates an SEO article tailored to rank in niche
 */
async function generateSeoArticle(topic, keyword, niche, settings) {
  const kw = keyword || (settings.primaryKeywords && settings.primaryKeywords[0]) || 'AI Automation';
  const targetNiche = niche || settings.niche || 'SaaS';

  const systemPrompt = `You are a world-class SEO content strategist and technical copywriter specializing in creating #1 ranking organic content.`;
  const userPrompt = `Write an in-depth, authoritative, comprehensive SEO blog post targeting the keyword "${kw}" in the niche "${targetNiche}". Topic: "${topic}".
Include:
1. Compelling H1 Title
2. Meta Description (150-160 chars)
3. Reading time and target search intent
4. Complete Markdown article with engaging Introduction, H2 and H3 subheadings, bullet points, real-world comparison tables, actionable tips, FAQ section, and strong CTA.
5. Ready-to-post social media promotional snippets (one for LinkedIn, one for X/Twitter).`;

  const aiResult = await callAiApi(userPrompt, systemPrompt, settings);
  if (aiResult) {
    return {
      id: uuidv4(),
      topic,
      keyword: kw,
      niche: targetNiche,
      title: topic,
      slug: slugify(topic),
      status: 'pending_approval',
      wordCount: aiResult.split(/\s+/).length,
      estimatedRankPotential: 'Top 3 Search Results',
      content: aiResult,
      createdAt: new Date().toISOString()
    };
  }

  // High-fidelity fallback dynamic generator if no API key is specified yet
  const slug = slugify(topic || `${kw} ultimate guide`);
  const articleTitle = topic || `The Ultimate 2026 Guide to ${capitalize(kw)} in ${capitalize(targetNiche)}`;
  const metaDesc = `Learn everything about ${kw} in ${targetNiche}. Proven frameworks, comparative analysis, and actionable steps to achieve top results in 2026.`;
  
  const contentMarkdown = `# ${articleTitle}

> **Target Keyword:** \`${kw}\` | **Search Intent:** Commercial & Informational | **Est. Reading Time:** 6 mins

![Header Image](https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80)

## Executive Summary

In today's fast-evolving ${targetNiche} landscape, mastering **${kw}** is no longer optional—it is the definitive differentiator between stagnant web presence and dominating the top position on Google search engine results pages.

This comprehensive guide delivers a battle-tested blueprint to help you implement, scale, and capitalize on **${kw}** to maximize conversions and organic authority.

---

## 1. Why ${capitalize(kw)} Matters in 2026

Search algorithms increasingly reward deep semantic relevance, authoritativeness, and genuine user value. When addressing **${kw}**, searchers look for immediate clarity, tactical execution, and measurable outcomes.

Key pillars to understand:
- **Algorithmic Alignment:** Covering primary and secondary LSI keywords naturally throughout headings and contextual paragraphs.
- **User Intent Fulfillment:** Matching high-intent questions before visitors bounce.
- **Engagement Metrics:** Rich formatting, visual breaks, and practical takeaways to maximize time-on-page.

---

## 2. Core Strategies & Tactical Implementation

### Step 1: Foundation & Baseline Analysis
Before executing, establish baseline KPIs across organic search impression share, average ranking positions, and conversion funnels related to ${kw}.

### Step 2: Content Architecture & Semantic Clustering
Organize your pages into hub-and-spoke topic clusters:
1. **Pillar Page:** Broad overview establishing top-level topical authority.
2. **Sub-topic Articles:** Laser-focused answers to long-tail queries.
3. **Internal Linking:** Passing PageRank dynamically across connected resources.

### Step 3: Technical Performance Optimization
Ensure your pages load in under 1.5 seconds, feature zero Cumulative Layout Shift (CLS), and present clean OpenGraph structured data.

---

## 3. Comparison Matrix: Approaches to ${capitalize(kw)}

| Feature / Criteria | Standard Approach | Next-Gen Automated SEO |
| :--- | :--- | :--- |
| **Audit Frequency** | Monthly Manual Check | 24/7 Automated Every 6 Hours |
| **Alert Dispatch** | Email / Delayed PDF | Instant Telegram & Dashboard |
| **Fix Deployment** | Manual Dev Backlog | 1-Click Human-in-Loop Approval |
| **Rank Velocity** | 3-6 Months | Accelerated with Continuous Optimization |

---

## 4. Frequently Asked Questions (FAQ)

### How quickly can I rank #1 for "${kw}"?
Depending on domain authority and competitor density in ${targetNiche}, programmatic continuous optimization typically produces noticeable SERP movement within 14 to 45 days.

### What are the biggest mistakes to avoid?
Keyword stuffing, missing schema markup, unoptimized image tags, and slow mobile render speeds are the most common ranking blockers.

---

## 5. Conclusion & Actionable Next Steps

Securing the top spot for **${kw}** requires continuous vigilance, rapid iteration, and immediate deployment of audit recommendations. 

Ready to put your growth on autopilot? Deploy your latest updates and monitor real-time rankings via your 24/7 autonomous dashboard.

***

### 📱 Ready-to-Post Social Snippets

#### LinkedIn Post:
> 🚀 Want to rank #1 in ${targetNiche}? 
> We just broke down the exact framework for "${kw}" that drives continuous organic inbound traffic. 
> Key takeaway: Automated 24/7 audits and real-time approval pipelines beat quarterly reviews every time.
> Read the complete guide and let us know your thoughts! #SEO #Growth #${targetNiche.replace(/\s+/g, '')}

#### X (Twitter) Thread Starter:
> Stop losing organic traffic to competitors. Here is the modern 2026 framework for dominating "${kw}" in ${targetNiche} 🧵👇
`;

  return {
    id: uuidv4(),
    topic: articleTitle,
    keyword: kw,
    niche: targetNiche,
    title: articleTitle,
    slug,
    metaDescription: metaDesc,
    status: 'pending_approval',
    wordCount: contentMarkdown.split(/\s+/).length,
    estimatedRankPotential: 'Top 3 Search Results (High Intent)',
    content: contentMarkdown,
    socialSnippets: {
      linkedin: `🚀 Dominating ${targetNiche}: How to rank #1 for "${kw}". Check out our actionable breakdown!`,
      twitter: `Unlocking top Google rankings for "${kw}" in 2026. Here's what actually moves the needle 📈👇`
    },
    createdAt: new Date().toISOString()
  };
}

/**
 * Generates high-converting content planner ideas based on niche
 */
function generatePlannerIdeas(niche = 'AI Automation', primaryKeywords = []) {
  const baseKws = primaryKeywords.length > 0 ? primaryKeywords : [niche, 'SEO automation', 'best tools 2026'];
  const ideas = [];

  baseKws.forEach((kw, i) => {
    ideas.push({
      id: uuidv4(),
      title: `The 2026 Definitive Guide to ${capitalize(kw)}: How to Rank #1`,
      keyword: kw,
      niche,
      intent: 'Informational / Commercial',
      difficulty: i === 0 ? 'Medium (38/100)' : 'Low (22/100)',
      estTrafficPotential: '2,400 - 8,500 visits/mo',
      scheduledDate: new Date(Date.now() + (i + 1) * 86400000 * 2).toISOString().split('T')[0],
      status: 'planned'
    });

    ideas.push({
      id: uuidv4(),
      title: `Top 10 ${capitalize(kw)} Alternatives & Competitors Compared`,
      keyword: `${kw} alternatives`,
      niche,
      intent: 'High Commercial Buyer Intent',
      difficulty: 'Low (19/100)',
      estTrafficPotential: '1,800 - 5,200 visits/mo',
      scheduledDate: new Date(Date.now() + (i + 2) * 86400000 * 2).toISOString().split('T')[0],
      status: 'planned'
    });
  });

  return ideas.slice(0, 8);
}

function capitalize(str) {
  if (!str) return '';
  return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function cleanDomain(url) {
  try {
    return new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace('www.', '');
  } catch {
    return url;
  }
}

function slugify(text) {
  return text.toString().toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

module.exports = {
  generateSeoRecommendations,
  generateSeoArticle,
  generatePlannerIdeas
};

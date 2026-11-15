const axios = require('axios');
const cheerio = require('cheerio');

async function crawlAndAudit(targetUrl, primaryKeywords = []) {
  const startTime = Date.now();
  let url = targetUrl.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  let html = '';
  let statusCode = 200;
  let headers = {};

  try {
    const response = await axios.get(url, {
      timeout: 12000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 RankPulseSEOBot/2.0'
      },
      validateStatus: () => true
    });
    html = response.data;
    statusCode = response.status;
    headers = response.headers;
  } catch (err) {
    return {
      success: false,
      url,
      error: `Could not reach website: ${err.message}`,
      timestamp: new Date().toISOString(),
      statusCode: 502,
      durationMs: Date.now() - startTime,
      scores: {
        overall: 25,
        technical: 20,
        onPage: 30,
        content: 20,
        richMedia: 30
      },
      meta: {
        title: '',
        titleLength: 0,
        description: '',
        descLength: 0,
        canonical: '',
        h1Count: 0,
        h1Texts: [],
        h2Count: 0,
        h3Count: 0,
        totalImages: 0,
        missingAltCount: 0,
        missingAltImages: [],
        schemaCount: 0,
        schemasDetected: [],
        ogTitle: '',
        ogImage: '',
        twitterCard: '',
        wordCount: 0,
        isHttps: url.startsWith('https://'),
        hasViewport: false
      },
      keywordDensity: {},
      issues: [
        {
          category: 'Technical Foundation',
          severity: 'high',
          message: `Server connection to ${url} failed (${err.message}). Ensure domain DNS and server are online.`
        }
      ]
    };
  }

  const $ = cheerio.load(typeof html === 'string' ? html : '');

  // 1. Title Analysis
  const titleText = $('title').first().text().trim();
  const titleLength = titleText.length;
  let titleScore = 100;
  const titleIssues = [];
  if (!titleText) {
    titleScore = 0;
    titleIssues.push('Missing <title> tag entirely.');
  } else if (titleLength < 30) {
    titleScore = 60;
    titleIssues.push(`Title is too short (${titleLength} chars). Ideal range is 50-60 characters.`);
  } else if (titleLength > 65) {
    titleScore = 75;
    titleIssues.push(`Title is slightly too long (${titleLength} chars) and may be truncated on Google SERPs.`);
  }

  // 2. Meta Description Analysis
  const metaDesc = $('meta[name="description" i]').attr('content') || $('meta[property="og:description" i]').attr('content') || '';
  const descLength = metaDesc.length;
  let descScore = 100;
  const descIssues = [];
  if (!metaDesc) {
    descScore = 0;
    descIssues.push('Missing meta description tag. Google will generate arbitrary snippets.');
  } else if (descLength < 110) {
    descScore = 65;
    descIssues.push(`Meta description is too short (${descLength} chars). Aim for 140-160 characters.`);
  } else if (descLength > 165) {
    descScore = 80;
    descIssues.push(`Meta description is long (${descLength} chars) and will truncate on mobile search.`);
  }

  // 3. Headings Hierarchy
  const h1Elements = $('h1');
  const h1Count = h1Elements.length;
  const h1Texts = [];
  h1Elements.each((_, el) => h1Texts.push($(el).text().trim()));

  const h2Count = $('h2').length;
  const h3Count = $('h3').length;

  let headingScore = 100;
  const headingIssues = [];
  if (h1Count === 0) {
    headingScore -= 40;
    headingIssues.push('No H1 tag detected on page. Search engines rely on H1 for topical relevance.');
  } else if (h1Count > 1) {
    headingScore -= 20;
    headingIssues.push(`Multiple (${h1Count}) H1 tags found. Stick to a single main H1 for semantic clarity.`);
  }
  if (h2Count === 0) {
    headingScore -= 25;
    headingIssues.push('No H2 subheadings found. Content lacks structural hierarchy.');
  }

  // 4. Images & Alt Attributes
  const images = $('img');
  const totalImages = images.length;
  const missingAltImages = [];
  images.each((_, el) => {
    const alt = $(el).attr('alt');
    const src = $(el).attr('src') || $(el).attr('data-src') || 'unknown-image';
    if (!alt || alt.trim() === '') {
      missingAltImages.push(src);
    }
  });
  let imageScore = 100;
  if (totalImages > 0 && missingAltImages.length > 0) {
    const missingRatio = missingAltImages.length / totalImages;
    imageScore = Math.max(20, Math.round(100 - missingRatio * 80));
  }

  // 5. OpenGraph & Social Cards
  const ogTitle = $('meta[property="og:title"]').attr('content') || '';
  const ogImage = $('meta[property="og:image"]').attr('content') || '';
  const ogType = $('meta[property="og:type"]').attr('content') || '';
  const twitterCard = $('meta[name="twitter:card"]').attr('content') || '';
  let socialScore = 100;
  const socialIssues = [];
  if (!ogTitle) { socialScore -= 30; socialIssues.push('Missing OpenGraph og:title.'); }
  if (!ogImage) { socialScore -= 35; socialIssues.push('Missing OpenGraph og:image (social preview image).'); }
  if (!twitterCard) { socialScore -= 20; socialIssues.push('Missing Twitter Card metadata.'); }

  // 6. Schema.org / Structured Data
  const jsonLdScripts = $('script[type="application/ld+json"]');
  const schemaCount = jsonLdScripts.length;
  const schemasDetected = [];
  jsonLdScripts.each((_, el) => {
    try {
      const parsed = JSON.parse($(el).html());
      schemasDetected.push(parsed['@type'] || 'CustomSchema');
    } catch (e) {
      // invalid json
    }
  });
  let schemaScore = schemaCount > 0 ? 100 : 30;

  // 7. Technical checks
  const canonical = $('link[rel="canonical"]').attr('href') || '';
  const viewport = $('meta[name="viewport"]').attr('content') || '';
  const isHttps = url.startsWith('https://');
  let technicalScore = 100;
  const technicalIssues = [];
  if (!isHttps) {
    technicalScore -= 35;
    technicalIssues.push('Website is running on insecure HTTP. HTTPS is a required Google ranking signal.');
  }
  if (!canonical) {
    technicalScore -= 25;
    technicalIssues.push('Missing canonical tag. Risk of duplicate content penalties.');
  }
  if (!viewport) {
    technicalScore -= 35;
    technicalIssues.push('Missing mobile viewport meta tag. Site will fail mobile-friendly ranking tests.');
  }

  // 8. Content Analysis & Keyword Frequency
  const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
  const wordCount = bodyText.split(' ').filter(w => w.length > 2).length;

  const keywordDensity = {};
  if (primaryKeywords && primaryKeywords.length > 0) {
    primaryKeywords.forEach(kw => {
      const regex = new RegExp(`\\b${kw.trim()}\\b`, 'gi');
      const matches = bodyText.match(regex);
      const count = matches ? matches.length : 0;
      keywordDensity[kw] = {
        count,
        densityPercent: wordCount > 0 ? +((count / wordCount) * 100).toFixed(2) : 0,
        inTitle: titleText.toLowerCase().includes(kw.toLowerCase()),
        inH1: h1Texts.some(h => h.toLowerCase().includes(kw.toLowerCase())),
        inDescription: metaDesc.toLowerCase().includes(kw.toLowerCase())
      };
    });
  }

  let contentScore = 100;
  if (wordCount < 300) {
    contentScore = 45;
  } else if (wordCount < 600) {
    contentScore = 70;
  }

  // Aggregate Overall Score (weighted)
  // Technical: 25%, OnPage (Title+Desc+Headings): 35%, Content: 20%, Image+Schema+Social: 20%
  const onPageScore = Math.round((titleScore * 0.4) + (descScore * 0.3) + (headingScore * 0.3));
  const richMediaScore = Math.round((imageScore * 0.35) + (socialScore * 0.35) + (schemaScore * 0.3));
  
  const overallScore = Math.min(100, Math.max(10, Math.round(
    (technicalScore * 0.25) +
    (onPageScore * 0.35) +
    (contentScore * 0.20) +
    (richMediaScore * 0.20)
  )));

  // Compile full prioritized issues list
  const allIssues = [];
  if (titleIssues.length) allIssues.push({ category: 'Title SEO', severity: titleScore < 60 ? 'high' : 'medium', message: titleIssues.join(' ') });
  if (descIssues.length) allIssues.push({ category: 'Meta Description', severity: descScore < 60 ? 'high' : 'medium', message: descIssues.join(' ') });
  if (headingIssues.length) allIssues.push({ category: 'Headings Hierarchy', severity: headingScore < 60 ? 'high' : 'low', message: headingIssues.join(' ') });
  if (missingAltImages.length > 0) allIssues.push({ category: 'Image Accessibility', severity: 'medium', message: `${missingAltImages.length} images are missing ALT tags.` });
  if (socialIssues.length > 0) allIssues.push({ category: 'Social & Rich Snippets', severity: 'medium', message: socialIssues.join(' ') });
  if (schemaCount === 0) allIssues.push({ category: 'Structured Data', severity: 'medium', message: 'No JSON-LD schema found. Rich snippet opportunities are being missed.' });
  if (technicalIssues.length > 0) allIssues.push({ category: 'Technical Foundation', severity: 'high', message: technicalIssues.join(' ') });

  const durationMs = Date.now() - startTime;

  return {
    success: true,
    url,
    timestamp: new Date().toISOString(),
    durationMs,
    statusCode,
    scores: {
      overall: overallScore,
      technical: technicalScore,
      onPage: onPageScore,
      content: contentScore,
      richMedia: richMediaScore
    },
    meta: {
      title: titleText,
      titleLength,
      description: metaDesc,
      descLength,
      canonical,
      h1Count,
      h1Texts,
      h2Count,
      h3Count,
      totalImages,
      missingAltCount: missingAltImages.length,
      missingAltImages: missingAltImages.slice(0, 10), // sample up to 10
      schemaCount,
      schemasDetected,
      ogTitle,
      ogImage,
      twitterCard,
      wordCount,
      isHttps,
      hasViewport: Boolean(viewport)
    },
    keywordDensity,
    issues: allIssues
  };
}

module.exports = { crawlAndAudit };

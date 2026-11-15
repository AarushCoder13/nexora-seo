const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const cheerio = require('cheerio');

/**
 * Applies approved SEO optimizations directly into local website files
 * Supports both Git repos (commits & pushes) and Non-Git sites (direct local HTML modification)
 */
async function applyOptimizationsToRepo(repoPath, recommendations) {
  if (!repoPath || !fs.existsSync(repoPath)) {
    return { success: false, error: `Directory does not exist: ${repoPath}` };
  }

  const results = {
    repoPath,
    modifiedFiles: [],
    isGitRepo: false,
    gitCommitted: false,
    gitPushed: false,
    appliedRecommendations: []
  };

  try {
    // 1. Locate index.html across root, public/site, public, or site subfolders
    let targetHtmlPath = null;
    const candidatePaths = [
      path.join(repoPath, 'index.html'),
      path.join(repoPath, 'public', 'site', 'index.html'),
      path.join(repoPath, 'public', 'index.html'),
      path.join(repoPath, 'site', 'index.html'),
      path.join(repoPath, 'nexora-desk.html')
    ];

    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        targetHtmlPath = p;
        break;
      }
    }

    if (targetHtmlPath) {
      let html = fs.readFileSync(targetHtmlPath, 'utf-8');
      const $ = cheerio.load(html, { decodeEntities: false });

      recommendations.forEach(rec => {
        if (rec.type === 'title') {
          const titleContent = rec.suggestedContent.replace(/<\/?title>/gi, '').trim();
          if ($('title').length > 0) {
            $('title').first().text(titleContent);
          } else {
            $('head').append(`\n  <title>${titleContent}</title>`);
          }
          results.appliedRecommendations.push('Title Tag');
        } else if (rec.type === 'meta_description') {
          const descMatch = rec.suggestedContent.match(/content=["']([^"']+)["']/i);
          const descContent = descMatch ? descMatch[1] : rec.suggestedContent;
          if ($('meta[name="description" i]').length > 0) {
            $('meta[name="description" i]').attr('content', descContent);
          } else {
            $('head').append(`\n  <meta name="description" content="${descContent}">`);
          }
          results.appliedRecommendations.push('Meta Description');
        } else if (rec.type === 'schema_jsonld') {
          let schemaRaw = rec.suggestedContent;
          if (schemaRaw.includes('<script')) {
            const match = schemaRaw.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
            if (match) schemaRaw = match[1];
          }
          try {
            const parsed = JSON.parse(schemaRaw);
            $('head').append(`\n  <script type="application/ld+json">\n${JSON.stringify(parsed, null, 2)}\n  </script>`);
            results.appliedRecommendations.push('Schema.org JSON-LD');
          } catch (e) {
            $('head').append(`\n  ${rec.suggestedContent}`);
            results.appliedRecommendations.push('Schema.org Markup');
          }
        } else if (rec.type === 'opengraph') {
          $('head').append(`\n  ${rec.suggestedContent}`);
          results.appliedRecommendations.push('OpenGraph & Twitter Cards');
        } else if (rec.type === 'h1_heading') {
          const h1Match = rec.suggestedContent.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
          const h1Text = h1Match ? h1Match[1] : rec.suggestedContent;
          if ($('h1').length > 0) {
            $('h1').first().html(h1Text);
          }
          results.appliedRecommendations.push('Primary H1 Heading');
        }
      });

      // Create a safety backup
      fs.writeFileSync(`${targetHtmlPath}.bak`, html, 'utf-8');
      fs.writeFileSync(targetHtmlPath, $.html(), 'utf-8');
      results.modifiedFiles.push(path.basename(targetHtmlPath));
      results.targetHtmlPath = targetHtmlPath;
    }

    // 2. Git operations ONLY if .git exists in the target directory
    const gitDir = path.join(repoPath, '.git');
    if (fs.existsSync(gitDir)) {
      results.isGitRepo = true;
      try {
        const gitStatus = execSync(`git -C "${repoPath}" status --porcelain`, { encoding: 'utf-8' });
        if (gitStatus.trim().length > 0) {
          execSync(`git -C "${repoPath}" add .`, { stdio: 'pipe' });
          const commitMsg = `SEO Autopilot: Approved optimizations deployed (${results.appliedRecommendations.join(', ')})`;
          execSync(`git -C "${repoPath}" commit -m "${commitMsg}"`, { stdio: 'pipe' });
          results.gitCommitted = true;

          try {
            execSync(`git -C "${repoPath}" push`, { stdio: 'pipe' });
            results.gitPushed = true;
          } catch (pushErr) {
            results.pushWarning = pushErr.message;
          }
        } else {
          results.alreadyUpToDate = true;
        }
      } catch (gitErr) {
        results.gitWarning = gitErr.message;
      }
    } else {
      results.isGitRepo = false;
      results.message = 'Direct local HTML file injection applied (Non-Git project).';
    }

    results.success = true;
    return results;
  } catch (err) {
    console.error('Error applying optimizations:', err);
    return { success: false, error: err.message };
  }
}

module.exports = {
  applyOptimizationsToRepo
};

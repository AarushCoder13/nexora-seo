# RankPulse 24/7 | Autonomous SEO Engine & Content Autopilot

> **A 24/7 autonomous SEO agent that crawls your website every 6 hours, detects ranking opportunities, sends updates to Telegram and your dashboard, generates rank #1 content, and provides a 1-click Approval & Deployment workflow.**

---

## 🌟 Key Features

### 1. ⏱ 24/7 Background Autopilot Engine
- Runs continuously in the background via `node-cron`.
- **Default Schedule:** Every 6 hours (`0 */6 * * *`).
- **Flexible Controls:** Switch to 1h, 3h, 6h, 12h, 24h, or custom cron syntax anytime from the Settings page.
- **Instant Manual Audits:** Click **"Run Audit Now"** in the header anytime for an immediate crawl and analysis.

### 2. 🔍 Automated Deep SEO Audits
- **Technical Foundation:** HTTPS validation, canonical tags, mobile viewport responsiveness, robots.txt.
- **On-Page Optimization:** Title tag length & keyword placement, Meta description CTR calibration, H1/H2/H3 semantic structure.
- **Structured Data:** Detects missing JSON-LD schemas and generates Schema.org `WebSite`, `Organization`, and `SearchAction` markup.
- **Image Accessibility:** Detects missing image `ALT` tags and suggests keyword-rich replacements.
- **Overall SEO Health Score (0-100):** Weighted calculation across Technical (25%), On-Page (35%), Content (20%), and Rich Media/Social (20%).

### 3. 📱 Telegram Bot & Webhook Alert Dispatcher
- **Automatic 6-Hour Dispatch:** Sends a clean HTML-formatted summary directly to your Telegram channel or DM.
- **Telegram Details Included:** SEO Health Score, +/- delta, number of issues found, newly generated recommendations ready for approval, and direct link to dashboard.
- **Instant Verification:** Includes a **"Send Test Alert to Telegram"** button to verify your Bot Token and Chat ID with 1 click.
- **Webhook Support:** Also supports Discord, Slack, Zapier, Make, and n8n webhooks.

### 4. 🚀 Human-in-the-Loop "Approval & Deployment" Hub
- **"You approve it, it deploys it":** Every AI recommendation is staged in a review queue.
- **Interactive Diff Viewer:** Side-by-side Before (Current Page) vs. After (AI Optimized) code comparison.
- **Live Google SERP Simulator:** Preview how your title and meta description will render on Google search results.
- **Inline Editor:** Edit any proposed text or tag before approving.
- **1-Click "Approve & Deploy":** Immediately deploys the change via Webhook, WordPress REST API, or live `<head>` bundle.
- **Unified `<head>` Export:** 1-Click button to export all approved optimizations as a single drop-in snippet.

### 5. ✍️ Content Planner & AI Article Generator (#1 Niche Dominance)
- **Niche Dominance Strategy:** Designed to target position #1 for high-intent search terms.
- **Content Calendar:** View scheduled topics with Keyword Difficulty (KD), search intent, and traffic potential.
- **1-Click AI Article Generator:** Creates 1,500+ word comprehensive guides with H1, H2/H3 outline, comparison tables, FAQs, and strong CTAs.
- **Direct-to-Social Snippets:** Auto-generates ready-to-post snippets for **LinkedIn** and **X (Twitter) threads** so you can post directly to your social accounts.
- **CMS Publish:** 1-Click "Approve & Deploy to CMS" or copy full Markdown.

### 6. 📊 Complete Audit & Changes History Report ("What it did")
- **Deployments Changelog:** Exact record of all approved changes with timestamp, target URL, deployment method, and Before/After diffs.
- **Audit Cycles Log:** Historical record of every 6-hour crawl with performance metrics.
- **Export Reports:** Download full reports in **Markdown** or **JSON** format.

---

## 🚀 Quick Start Guide

### 1. Launching the Application
The server runs on **Port 4000**:
```bash
# Start the full-stack server (daemon running 24/7 background scheduler)
npm start
```
Open **[http://localhost:4000](http://localhost:4000)** in your browser.

*(For active frontend development with hot-reloading: `npm run dev`)*

---

## ⚙️ 30-Second Telegram Setup
1. In Telegram, search for `@BotFather` and send `/newbot`. Follow the prompt to get your **Bot Token**.
2. Start a conversation with your bot (press `/start`), then message `@userinfobot` to get your numeric **Chat ID**.
3. In RankPulse, navigate to **"24/7 Autopilot & Telegram"** (Settings tab).
4. Paste your **Bot Token** and **Chat ID**, toggle **Telegram: Active**, and click **"Send Test Alert to Telegram"**.
5. You're set! Every 6 hours, you will receive real-time SEO audit reports and approval alerts directly on your phone.

---

## 📡 Deployment Modes
Configure your deployment mode in **Settings > 1-Click Auto-Deployment Destination**:
1. **Webhook (Zapier / Make / n8n / Custom CMS):** Dispatches JSON payloads with approved changes to your endpoint.
2. **WordPress REST API:** Directly pushes articles and metadata to your WordPress site.
3. **Live Head Injector / Drop-in Code:** Click **"Export <head> Bundle"** in the Approval Hub to copy a unified `<head>` tag block containing all approved title tags, meta tags, and JSON-LD schemas.

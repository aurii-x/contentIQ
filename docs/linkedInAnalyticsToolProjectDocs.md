# LinkedIn Analytics Tool — Project Documentation

Owner: Santhosh Thiruchendru
Started: 14th July 2026

---

## 1. Scope

### 1.1 Goal

Build a personal tool that tracks the performance of my LinkedIn posts and articles over time, since LinkedIn's native dashboard only retains a short rolling window and doesn't tell me what to do next. The tool should let me see trends across weeks and months, not just a single snapshot, and eventually help me decide what to post next based on what's actually worked.

### 1.2 Why I'm doing this

I'm actively posting on LinkedIn to increase visibility during my job search. LinkedIn's built in analytics are shallow and short lived. Third party tools exist (Shield, Inlytics, Buffer) but cost $12 to $25/month for something I can build myself, and building it doubles as a hands on AI/ML and data platform credential alongside AURI-X, which is useful for the Staff PM and TPM roles I'm targeting.

### 1.3 High level requirements

- Track post level performance over time (not just a point in time snapshot)
- Support both personal profile posts and, later, Straventis company page content
- Visualize trends: which content pillar performs best, engagement rate over time, follower growth
- Eventually recommend what to post next based on historical performance
- Low or no ongoing cost
- Should not require me to babysit it daily once V2.0 (API) is live

### 1.4 Specific metrics to track

| Metric | Source | Notes |
|---|---|---|
| Impressions | Post/Content Analytics export or API | Per post and aggregated |
| Reactions | Post/Content Analytics export or API | |
| Comments | Post/Content Analytics export or API | Weighted higher, strongest engagement signal |
| Shares/Reposts | Post/Content Analytics export or API | |
| Engagement rate | Calculated | (Reactions + Comments + Shares) / Impressions |
| New followers | Audience Analytics export or API | Daily granularity |
| Content pillar | Manually tagged | Platform Thinking, Career Reflection, AI/ML, Industry News, Personal Story |
| Content type | Manually tagged | Original vs. Repost vs. Repost+Commentary |
| Post publish date/time | Export or API | For best-time-to-post analysis later |

---

## 2. High Level Architecture

### V1.0 (current phase)
```
LinkedIn Export (xlsx/csv, manual download)
        │
        ▼
  Parsing script (Python)
        │
        ▼
  Master dataset (CSV or SQLite, stored in GitHub repo)
        │
        ▼
  Dashboard (static HTML + Chart.js, or Python notebook)
        │
        ▼
  Hosted on GitHub Pages (free, read-only, public or unlisted)
```

### V2.0 (once LinkedIn API access is approved)
```
LinkedIn Community Management API (memberCreatorPostAnalytics)
        │
        ▼
  Scheduled script (GitHub Actions cron, runs daily)
        │
        ▼
  Same master dataset, now auto-updated instead of manual drop-in
        │
        ▼
  Same dashboard, no code changes needed
```

The point of this architecture: **V1.0's dashboard and data format should be built so V2.0 just swaps the data source, not the whole system.** The parsing script becomes the API-calling script later; the dataset schema and dashboard don't change.

---

## 3. Design Decisions

### 3.1 Python vs. Google Apps Script

**Decision: Python.**

| Factor | Python | Google Apps Script |
|---|---|---|
| Hosting fit | Runs anywhere, fits GitHub Actions for V2.0 automation | Tied to Google ecosystem, harder to run on a schedule outside Sheets |
| LinkedIn API calls | Full control, standard `requests`/`oauth` libraries | Possible but clunkier, less documentation for LinkedIn specifically |
| Portfolio value | Directly relevant to AI/ML platform roles you're targeting | Less relevant as a technical credential |
| Charting | Chart.js (JS) or matplotlib/plotly (Python) both fine for static dashboards | Limited to Google Sheets charts unless exporting |
| Where you're already strongest | You've been working in Python/data pipelines conceptually (OnePipeline, ML matching) | N/A |

Google Apps Script would be reasonable if the end goal were "a Google Sheet that updates itself." Since the goal is a real dashboard and eventually an automated pipeline, Python + GitHub fits better and builds a more relevant skill.

### 3.2 Hosting: GitHub + GitHub Pages

- **Data** lives in the same repo as versioned CSV/JSON files, so there's a full history, not just the latest snapshot.
- **Dashboard** is a static site (HTML + Chart.js) published via GitHub Pages, free, no server to maintain.
- **V2.0 automation** uses GitHub Actions (a free scheduled job) to call the LinkedIn API daily and commit updated data automatically.

This keeps everything in one place, versioned, free, and portfolio-visible if you ever want to link it.

---

## 4. Roadmap

- **V1.0** — Manual CSV/Excel ingestion, basic analytics: posts/articles, comments, likes, histogram chart, timeline view of post performance
- **V2.0** — Standalone via official LinkedIn API (Community Management API, `memberCreatorPostAnalytics`), no more manual exports
- **V3.0** — AI layer analyzing the data and generating content recommendations
- **V4.0** — Include Straventis company page analytics alongside personal profile
- **V5.0** — Advanced features, TBD once the above is stable

---

## 5. Working Approach

Given the goal of avoiding open ended, moving-target sessions, each ClickUp task should be scoped to something completable in a single sitting (roughly 1 to 2 hours), with a clear "done" definition. Tasks are grouped into sprints matching the roadmap phases above, starting with V1.0 only, since V2.0 onward depends on the still-pending LinkedIn API approval.

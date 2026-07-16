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

## 5. Data Mapping — LinkedIn Export to Output Files

`scripts/parse_linkedin_export.py` reads one LinkedIn "Content Analytics" export (.xlsx) and writes to three files, each at a different grain (per post, per day, per export run). They're kept separate rather than merged into one table, since forcing different grains into a single file breaks aggregation (a daily total isn't a property of any one post, and a per-export summary isn't a property of any one day).

### 5.1 `data/master.csv` — one row per post

| Field | Source in export | How it's derived |
|---|---|---|
| `date` | **TOP POSTS** sheet → "Post Publish Date" | Taken directly |
| `post_url` | **TOP POSTS** sheet → "Post URL" | Taken directly. A stable numeric post ID is extracted from this URL internally to match the same post across exports, since LinkedIn changes the tracking suffix (e.g. `-nhUU` vs `-RZeU`) week to week |
| `post_topic` | **TOP POSTS** sheet → "Post URL" | Not a real export field. Decoded from the URL slug (URL-unescaped, bold Unicode characters normalized back to plain letters). A rough starting guess, worth cleaning up by hand |
| `content_type` | *Not in the export* | Blank. Manual: Original / Repost / Repost+Commentary |
| `pillar` | *Not in the export* | Blank. Manual: Platform Thinking / Career Reflection / AI or ML / Industry News / Personal Story |
| `impressions` | **TOP POSTS** sheet → "Impressions" (impression-ranked table) | Taken directly |
| `reactions` | *Not in the export* | Blank. LinkedIn only reports a combined engagement total per post, not the reaction/comment/share split |
| `comments` | *Not in the export* | Blank, same reason |
| `shares` | *Not in the export* | Blank, same reason |
| `total_engagements` | **TOP POSTS** sheet → "Engagements" (engagement-ranked table) | Taken directly |
| `engagement_rate` | *Calculated* | `total_engagements ÷ impressions` |
| `new_followers` | **FOLLOWERS** sheet → "New followers" | Matched to the post's publish date. Since this is a daily total, only the first post published that day gets the count, later same-day posts are left blank to avoid double-counting |

Re-running the script against a new export refreshes `impressions`, `total_engagements`, `engagement_rate`, and `new_followers` for existing posts, but preserves any manually filled `post_topic`, `content_type`, or `pillar` rather than overwriting them.

### 5.2 `data/daily_totals.csv` — one row per date

| Field | Source in export | How it's derived |
|---|---|---|
| `date` | **ENGAGEMENT** sheet → "Date" | Taken directly |
| `impressions` | **ENGAGEMENT** sheet → "Impressions" | Account-wide total for that day, across all posts combined |
| `engagements` | **ENGAGEMENT** sheet → "Engagements" | Account-wide total for that day |
| `engagement_rate` | *Calculated* | `engagements ÷ impressions` |
| `new_followers` | **FOLLOWERS** sheet → "New followers" | Direct join on date, no approximation needed here since both are already daily |

This is the cleaner home for daily follower counts, no "first post of the day" guesswork required, since every row is already one date. Re-running the script overwrites a given date's row with the latest numbers, which matters because LinkedIn keeps revising a day's totals for several days after it happens (e.g. 7/12's impressions grew from 74 to 128 by the time the next week's export was pulled).

### 5.3 `data/discovery_log.csv` — one row per script run (append-only)

| Field | Source in export | How it's derived |
|---|---|---|
| `pulled_at` | *Not in the export* | Timestamp of when the script was run, not when the data happened |
| `range_start` | **DISCOVERY** sheet → "Overall Performance" range | Split from the "M/D/YYYY - M/D/YYYY" string |
| `range_end` | **DISCOVERY** sheet → "Overall Performance" range | Split from the same string |
| `total_impressions` | **DISCOVERY** sheet → "Impressions" | LinkedIn's own reported total for the whole export's date range |
| `total_members_reached` | **DISCOVERY** sheet → "Members reached" | LinkedIn's own reported total for the whole range |

This file is never de-duplicated or overwritten, every run adds a new line. It exists as a sanity check, since DISCOVERY is a single range-level summary rather than daily data, you can eyeball it against the sum of `daily_totals.csv` for the same range to confirm nothing's being mis-parsed.

### 5.4 What's in the export but not used yet

- **DEMOGRAPHICS** sheet (top companies, titles, locations) isn't post performance data, and doesn't fit this schema. Worth revisiting once V3.0 (AI recommendations) needs audience context.

---

## 6. Working Approach

Given the goal of avoiding open ended, moving-target sessions, each ClickUp task should be scoped to something completable in a single sitting (roughly 1 to 2 hours), with a clear "done" definition. Tasks are grouped into sprints matching the roadmap phases above, starting with V1.0 only, since V2.0 onward depends on the still-pending LinkedIn API approval.
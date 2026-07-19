#!/usr/bin/env python3
"""
tag_posts.py

Applies content_type and pillar tags to posts already parsed into
data/master.csv. Matches on a keyword found in each post's post_topic
field, so it only needs to be run once, re-running is safe and won't
overwrite tags that are already set correctly.

Usage:
    python3 tag_posts.py
"""

import csv
from pathlib import Path

MASTER_PATH = Path("data/master.csv")

# Add to this list as you publish new posts. Each entry: a keyword found
# in the post's URL/topic slug, mapped to (content_type, pillar).
TAGS = {
    "platform thinking ive noticed": ("Original", "Platform Thinking"),
    "productmanagement-platformthinking": ("Original", "Platform Thinking"),
    "hughes was basically the 1940s elon musk": ("Article", "Career Reflection"),
    "innovation-history-entrepreneurship": ("Article", "Career Reflection"),
    "ever wonder who the elon": ("Original", "Career Reflection"),
    "storytelling-innovation-leadership": ("Original", "Career Reflection"),
    "nobody knew what would": ("Repost+Commentary", "Career Reflection"),
    "careeradvice-leadership-techcareers": ("Repost+Commentary", "Career Reflection"),
    "output inference and prediction why engineers": ("Original", "AI or ML"),
    "machinelearning-ai-datascience": ("Original", "AI or ML"),
    "perforces 2026 platform engineering report": ("Repost (plain)", "AI or ML"),
    "this resonates and it echoes something ive": ("Repost+Commentary", "Personal Story"),
    "burnout-worklifebalance-leadership": ("Repost+Commentary", "Personal Story"),
    "agentic homes a frictionless": ("Original", "Artificial Intelligence"),
    "agenticai-smarthome-aiethics": ("Original", "Artificial Intelligence"),
    "the rise of agentic software development": ("Original", "Artificial Intelligence"),
    "aieconomics-tokeneconomy-generativeai": ("Original", "Artificial Intelligence"),
    "linkedin pulse": ("Repost+Commentary", "Industry News"),
    "linkedin-pulse": ("Repost+Commentary", "Industry News"),
    "the line that stayed with me": ("Repost+Commentary", "Industry News"),
    "leadership-businessstrategy-management": ("Repost+Commentary", "Industry News"),
    "platformthinking-enterprisearchitecture-platformengineering": ("Original", "Enterprise Architecture"),
    "why platform thinking needs": ("Article", "Enterprise Architecture"),
    "the electric middle manager": ("Article", "Personal Story"),
    "nikola-tesla": ("Article", "Personal Story"),
}


def main():
    if not MASTER_PATH.exists():
        print(f"Could not find {MASTER_PATH}. Run this from your ContentIQ project root.")
        return

    with open(MASTER_PATH, newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))

    tagged, skipped = 0, 0
    for row in rows:
        if row.get("content_type") and row.get("pillar"):
            continue  # already tagged, don't overwrite manual edits
        key = (row.get("post_topic") or "").lower() + " " + (row.get("post_url") or "").lower()
        matched = False
        for k, (ctype, pillar) in TAGS.items():
            if k in key:
                row["content_type"] = ctype
                row["pillar"] = pillar
                tagged += 1
                matched = True
                break
        if not matched:
            skipped += 1

    with open(MASTER_PATH, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)

    print(f"Tagged {tagged} post(s). {skipped} post(s) had no matching keyword, left blank.")
    print("Untagged posts are likely older, pre-campaign posts, safe to ignore or tag by hand if you want them included.")


if __name__ == "__main__":
    main()

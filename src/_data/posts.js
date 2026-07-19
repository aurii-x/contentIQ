const fs = require("fs");
const path = require("path");

function parseCSV(filePath) {
  const raw = fs.readFileSync(filePath, "utf-8").trim();
  const lines = raw.split(/\r?\n/);
  const headers = lines[0].split(",");
  return lines.slice(1).map((line) => {
    // Simple CSV split is fine here, our data has no embedded commas in quotes
    const values = line.split(",");
    const row = {};
    headers.forEach((h, i) => { row[h] = values[i] !== undefined ? values[i] : ""; });
    return row;
  });
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

function postIdFromUrl(url) {
  const match = url.match(/(?:share|ugcPost)-(\d+)/);
  return match ? match[1] : url;
}

module.exports = function () {
  const masterPath = path.join(__dirname, "master.csv");
  const snapshotPath = path.join(__dirname, "post_snapshots.csv");

  const master = parseCSV(masterPath);
  const snapshots = parseCSV(snapshotPath);

  // Only include posts that have been manually tagged with a content_type,
  // untagged historical posts stay out of the dashboard for now.
  const tagged = master.filter((r) => r.content_type && r.content_type.trim() !== "");

  const posts = tagged.map((r) => {
    const pid = postIdFromUrl(r.post_url);
    const history = snapshots
      .filter((s) => s.post_id === pid)
      .map((s) => ({
        pulled_at: s.pulled_at,
        impressions: Number(s.impressions) || 0,
        engagements: Number(s.total_engagements) || 0,
      }))
      .sort((a, b) => new Date(a.pulled_at) - new Date(b.pulled_at));

    return {
      id: pid,
      slug: slugify(r.post_topic || pid),
      date: r.date,
      url: r.post_url,
      topic: r.post_topic,
      contentType: r.content_type,
      pillar: r.pillar,
      impressions: Number(r.impressions) || 0,
      engagements: Number(r.total_engagements) || 0,
      engagementRate: Number(r.engagement_rate) || 0,
      history,
    };
  });

  // Newest first
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));

  return posts;
};

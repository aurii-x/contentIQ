const fs = require("fs");
const path = require("path");

function parseCSV(filePath) {
  const raw = fs.readFileSync(filePath, "utf-8").trim();
  const lines = raw.split(/\r?\n/);
  const headers = lines[0].split(",");
  return lines.slice(1).map((line) => {
    const values = line.split(",");
    const row = {};
    headers.forEach((h, i) => { row[h] = values[i] !== undefined ? values[i] : ""; });
    return row;
  });
}

module.exports = function () {
  const filePath = path.join(__dirname, "daily_totals.csv");
  const rows = parseCSV(filePath);
  return rows
    .map((r) => ({
      date: r.date,
      impressions: Number(r.impressions) || 0,
      engagements: Number(r.engagements) || 0,
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
};

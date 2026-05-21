require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { crawlAllSources } = require("./crawler");
const { sendJobEmail } = require("./mailer");

// ─── Output helpers ───────────────────────────────────────────────────────────

const RESULTS_DIR = path.join(__dirname, "results");
if (!fs.existsSync(RESULTS_DIR)) fs.mkdirSync(RESULTS_DIR);

function saveJSON(jobs) {
  const file = path.join(RESULTS_DIR, "jobs.json");
  fs.writeFileSync(file, JSON.stringify(jobs, null, 2));
  console.log(`💾 Saved JSON → ${file}`);
}

function saveCSV(jobs) {
  const file = path.join(RESULTS_DIR, "jobs.csv");
  const header = "Source,Title,Company,Location,Link,Posted Date\n";
  const rows = jobs.map((j) => {
    const escape = (v) => `"${String(v).replace(/"/g, '""')}"`;
    return [j.source, j.title, j.company, j.location, j.link, j.postedDate]
      .map(escape)
      .join(",");
  });
  fs.writeFileSync(file, header + rows.join("\n"));
  console.log(`💾 Saved CSV  → ${file}`);
}

function printSummary(jobs) {
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  🇹🇿  Tanzania Tech Jobs — Crawl Summary");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Group by source
  const bySource = jobs.reduce((acc, j) => {
    acc[j.source] = (acc[j.source] || []);
    acc[j.source].push(j);
    return acc;
  }, {});

  for (const [source, list] of Object.entries(bySource)) {
    console.log(`\n📌 ${source} (${list.length} jobs)`);
    console.log("─".repeat(50));
    list.slice(0, 5).forEach((j, i) => {
      console.log(`  ${i + 1}. ${j.title}`);
      console.log(`     🏢 ${j.company}  📍 ${j.location}`);
      console.log(`     🔗 ${j.link.slice(0, 80)}${j.link.length > 80 ? "…" : ""}`);
    });
    if (list.length > 5) console.log(`     … and ${list.length - 5} more`);
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`  Total unique tech jobs found: ${jobs.length}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

// ─── Run ──────────────────────────────────────────────────────────────────────

async function main() {
  try {
    const jobs = await crawlAllSources();
    printSummary(jobs);
    saveJSON(jobs);
    saveCSV(jobs);
    await sendJobEmail(jobs);
    console.log("\n✨ Done! Check the results/ directory for output files.\n");
  } catch (err) {
    console.error("Fatal error:", err);
    process.exit(1);
  }
}

main();
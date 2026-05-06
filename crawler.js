const axios = require("axios");
const cheerio = require("cheerio");

// ─── Helpers ────────────────────────────────────────────────────────────────

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const BASE_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Accept-Encoding": "gzip, deflate, br",
  "Cache-Control": "no-cache",
  Pragma: "no-cache",
  "Upgrade-Insecure-Requests": "1",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-User": "?1",
  Connection: "keep-alive",
};

async function fetchHTML(url, extraHeaders = {}) {
  const response = await axios.get(url, {
    headers: { ...BASE_HEADERS, ...extraHeaders },
    timeout: 15000,
  });
  return response.data;
}

// ─── Source: Fuzu Tanzania ───────────────────────────────────────────────────

async function crawlFuzu() {
  const jobs = [];
  const queries = ["software+engineer", "developer"];

  for (const q of queries) {
    try {
      const url = `https://www.fuzu.com/tanzania/jobs?q=${q}`;
      console.log(`  [Fuzu] Fetching: ${url}`);
      const html = await fetchHTML(url, { Referer: "https://www.fuzu.com/" });
      const $ = cheerio.load(html);

      $("article, .job-card, [class*='job'], [class*='card']").each((_, el) => {
        const title =
          $(el).find("h2, h3, h4, [class*='title'], [class*='name']").first().text().trim() ||
          $(el).find("a").first().text().trim();

        const company =
          $(el).find("[class*='company'], [class*='employer'], [class*='org']").first().text().trim();

        const location =
          $(el).find("[class*='location'], [class*='place'], [class*='city']").first().text().trim();

        const link = $(el).find("a[href]").first().attr("href");
        const fullLink = link
          ? link.startsWith("http")
            ? link
            : "https://www.fuzu.com" + link
          : url;

        if (title && title.length > 3) {
          jobs.push({
            source: "Fuzu",
            title,
            company: company || "N/A",
            location: location || "Tanzania",
            link: fullLink,
            postedDate: new Date().toISOString().split("T")[0],
          });
        }
      });
    } catch (err) {
      console.warn(`  [Fuzu] Error: ${err.message}`);
    }
    await delay(1500);
  }
  return jobs;
}

// ─── Source: LinkedIn (public search) ───────────────────────────────────────

async function crawlLinkedIn() {
  const jobs = [];
  const queries = ["software engineer", "developer"];

  for (const q of queries) {
    try {
      const encoded = encodeURIComponent(q);
      const url = `https://www.linkedin.com/jobs/search/?keywords=${encoded}&location=Tanzania&f_TPR=r604800`;
      console.log(`  [LinkedIn] Fetching: ${url}`);
      const html = await fetchHTML(url);
      const $ = cheerio.load(html);

      $(".base-card, .job-search-card, [class*='job-card']").each((_, el) => {
        const title = $(el)
          .find(".base-search-card__title, h3, [class*='title']")
          .first()
          .text()
          .trim();

        const company = $(el)
          .find(".base-search-card__subtitle, h4, [class*='company']")
          .first()
          .text()
          .trim();

        const location = $(el)
          .find(".job-search-card__location, [class*='location']")
          .first()
          .text()
          .trim();

        const link = $(el).find("a[href*='/jobs/view/']").first().attr("href");

        if (title && title.length > 3) {
          jobs.push({
            source: "LinkedIn",
            title,
            company: company || "N/A",
            location: location || "Tanzania",
            link: link || url,
            postedDate: new Date().toISOString().split("T")[0],
          });
        }
      });
    } catch (err) {
      console.warn(`  [LinkedIn] Error: ${err.message}`);
    }
    await delay(2000);
  }
  return jobs;
}

// ─── Source: Mabumbe Jobs ────────────────────────────────────────────────────
// Paginate the /jobs/ listing; search is blocked (403) so we scrape all and
// rely on filterRelevant() to keep only tech roles.

async function crawlMabumbe() {
  const jobs = [];
  const maxPages = 5;

  for (let page = 1; page <= maxPages; page++) {
    const url =
      page === 1
        ? "https://mabumbe.com/jobs/"
        : `https://mabumbe.com/jobs/page/${page}/`;
    try {
      console.log(`  [Mabumbe] Fetching page ${page}: ${url}`);
      const html = await fetchHTML(url, {
        Referer: "https://mabumbe.com/",
        "Sec-Fetch-Site": "same-origin",
      });
      const $ = cheerio.load(html);

      const articles = $("article.job_listing, li.job_listing, .job-listing-item, article[class*='job']");
      if (articles.length === 0) break;

      articles.each((_, el) => {
        const title =
          $(el).find("h2 a, h3 a, .position a, [class*='job-title'] a").first().text().trim() ||
          $(el).find("h2, h3, .position, [class*='job-title']").first().text().trim();

        const company = $(el)
          .find(".company, [class*='company'], [class*='employer']")
          .first()
          .text()
          .trim();

        const location = $(el)
          .find(".location, [class*='location'], [class*='place']")
          .first()
          .text()
          .trim();

        const link = $(el).find("a[href]").first().attr("href");
        const fullLink = link
          ? link.startsWith("http")
            ? link
            : "https://mabumbe.com" + link
          : url;

        if (title && title.length > 3) {
          jobs.push({
            source: "Mabumbe",
            title,
            company: company || "N/A",
            location: location || "Tanzania",
            link: fullLink,
            postedDate: new Date().toISOString().split("T")[0],
          });
        }
      });
    } catch (err) {
      if (err.response?.status === 404) break;
      console.warn(`  [Mabumbe] Error page ${page}: ${err.message}`);
      break;
    }
    await delay(1000);
  }
  return jobs;
}

// ─── Source: Ajira Yako ──────────────────────────────────────────────────────
// Uses custom theme (noo_job post type). Paginate /jobs/ and filter via
// filterRelevant() rather than per-keyword search (search returns 0 results).

async function crawlAjiraYako() {
  const jobs = [];
  const maxPages = 5;

  for (let page = 1; page <= maxPages; page++) {
    const url =
      page === 1
        ? "https://ajirayako.co.tz/jobs/"
        : `https://ajirayako.co.tz/jobs/page/${page}/`;
    try {
      console.log(`  [AjiraYako] Fetching page ${page}: ${url}`);
      const html = await fetchHTML(url, { Referer: "https://ajirayako.co.tz/" });
      const $ = cheerio.load(html);

      const articles = $("article.noo_job");
      if (articles.length === 0) break;

      articles.each((_, el) => {
        const title = $(el).find("h3.loop-item-title a, h2.loop-item-title a").first().text().trim();

        const company =
          $(el).find(".job-company a span").first().text().trim() ||
          $(el).find(".job-company span").first().text().trim() ||
          $(el).find(".job-company").first().text().trim();

        const location =
          $(el).find(".job-location a, .job-location span, .job-location").first().text().trim();

        const link =
          $(el).find("h3.loop-item-title a, h2.loop-item-title a").first().attr("href") ||
          $(el).find("a.job-details-link").first().attr("href");

        if (title && title.length > 3) {
          jobs.push({
            source: "AjiraYako",
            title,
            company: company || "N/A",
            location: location || "Tanzania",
            link: link || url,
            postedDate: new Date().toISOString().split("T")[0],
          });
        }
      });
    } catch (err) {
      if (err.response?.status === 404) break;
      console.warn(`  [AjiraYako] Error page ${page}: ${err.message}`);
      break;
    }
    await delay(1000);
  }
  return jobs;
}

// ─── Deduplication ───────────────────────────────────────────────────────────

function deduplicateJobs(jobs) {
  const seen = new Set();
  return jobs.filter((job) => {
    const key = `${job.title.toLowerCase().trim()}|${job.company.toLowerCase().trim()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ─── Filter relevant results ─────────────────────────────────────────────────
// Matched against title only to avoid false positives from company names
// (e.g. "Engineering Services Ltd" matching a mechanic role).

function filterRelevant(jobs) {
  const devPatterns = [
    /\bsoftware\b/i,
    /\bdeveloper\b/i,
    /\bprogrammer\b/i,
    /\bprogramming\b/i,
    /\bcoding\b/i,
    /\bfrontend\b/i,
    /\bback.?end\b/i,
    /\bfull.?stack\b/i,
    /\bweb\s+dev/i,
    /\bmobile\s+dev/i,
    /\bandroid\b/i,
    /\bios\s+dev/i,
    /\breact\b/i,
    /\bnode\.?js\b/i,
    /\bpython\b/i,
    /\bdjango\b/i,
    /\bjavascript\b/i,
    /\btypescript\b/i,
    /\bphp\b/i,
    /\bjava\s+dev/i,
    /\bdevops\b/i,
    /\bsite\s+reliability/i,
    /\bcloud\s+engineer/i,
    /\baws\b/i,
    /\bazure\b/i,
    /\bdata\s+engineer/i,
    /\bdata\s+scientist/i,
    /\bdata\s+analyst/i,
    /\bmachine\s+learning\b/i,
    /\bdeep\s+learning\b/i,
    /\bartificial\s+intelligence\b/i,
    /\bui\s*[/\\]\s*ux\b/i,
    /\bux\s+design/i,
    /\bui\s+design/i,
    /\bsystems?\s+(developer|analyst|architect|engineer)\b/i,
    /\bnetwork\s+engineer\b/i,
    /\bcyber\s*security\b/i,
    /\binfosec\b/i,
    /\b(it|ict)\s+(officer|manager|specialist|analyst|director|engineer)\b/i,
    /\btechnology\s+(manager|officer|lead|director)\b/i,
    /\bdigital\s+transform/i,
    /\bweb\s+design/i,
    /\bweb\s+applic/i,
    /\bapi\s+(developer|engineer)\b/i,
    /\bdatabase\s+(developer|administrator|engineer|admin)\b/i,
  ];

  return jobs.filter((job) => {
    const title = job.title.toLowerCase();
    return devPatterns.some((pattern) => pattern.test(title));
  });
}

// ─── Main Export ─────────────────────────────────────────────────────────────

async function crawlAllSources() {
  console.log("\n🔍 Starting Tanzania Tech Job Crawler...\n");
  const allJobs = [];

  console.log("📡 Crawling Fuzu...");
  allJobs.push(...(await crawlFuzu()));

  console.log("📡 Crawling LinkedIn...");
  allJobs.push(...(await crawlLinkedIn()));

  console.log("📡 Crawling Mabumbe...");
  allJobs.push(...(await crawlMabumbe()));

  console.log("📡 Crawling AjiraYako...");
  allJobs.push(...(await crawlAjiraYako()));

  const filtered = filterRelevant(allJobs);
  const unique = deduplicateJobs(filtered);

  console.log(`\n✅ Raw jobs found: ${allJobs.length}`);
  console.log(`✅ After filtering & deduplication: ${unique.length}`);

  return unique;
}

module.exports = { crawlAllSources };

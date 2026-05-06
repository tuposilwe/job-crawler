# 🇹🇿 Tanzania Tech Job Crawler

A Node.js web crawler that searches for **Software Engineer** and **Developer** jobs in Tanzania across multiple job boards.

## 📡 Sources Crawled

| Source            | URL                              | Focus                      |
|-------------------|----------------------------------|----------------------------|
| Fuzu              | fuzu.com/tanzania                | African job board          |
| BrighterMonday    | brightermonday.co.tz             | East Africa jobs           |
| LinkedIn          | linkedin.com/jobs                | Global, filtered Tanzania  |
| Indeed Tanzania   | tz.indeed.com                    | Large aggregator           |
| JobsInTanzania    | jobsintanzania.co.tz             | Local Tanzania board       |

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Run the crawler
```bash
node index.js
```

### 3. View results
Results are saved in the `results/` directory:
- `results/jobs.json` — Full structured data
- `results/jobs.csv`  — Spreadsheet-friendly format

---

## 📁 Project Structure

```
job-crawler/
├── crawler.js      # Core crawling logic (all sources)
├── index.js        # Entry point, output & summary
├── results/        # Output directory (auto-created)
│   ├── jobs.json
│   └── jobs.csv
└── README.md
```

---

## ⚙️ How It Works

1. **Fetch** — Uses `axios` to GET each job listing page with browser-like headers
2. **Parse** — Uses `cheerio` (server-side jQuery) to extract job cards
3. **Filter** — Keeps only tech-relevant listings (software, developer, engineer, etc.)
4. **Deduplicate** — Removes duplicate listings across sources
5. **Output** — Saves JSON + CSV and prints a console summary

---

## 🔧 Configuration

Edit the keyword arrays in `crawler.js` to customize:

```js
// In filterRelevant():
const techKeywords = ["software", "developer", "engineer", "react", ...];

// In each crawler function:
const queries = ["software+engineer", "developer"];
```

---

## 📝 Output Format

Each job object looks like:
```json
{
  "source": "BrighterMonday",
  "title": "Software Engineer",
  "company": "ACME Corp",
  "location": "Dar es Salaam, Tanzania",
  "link": "https://www.brightermonday.co.tz/jobs/...",
  "postedDate": "2024-01-15"
}
```

---

## ⚠️ Notes

- Some sites (LinkedIn, Indeed) may return limited results or block scrapers intermittently. The crawler handles errors gracefully and continues.
- Be respectful of rate limits — delays are built in between requests.
- For heavy usage, consider adding proxies or using the official APIs where available.

---

## 📦 Dependencies

- [`axios`](https://axios-http.com/) — HTTP client
- [`cheerio`](https://cheerio.js.org/) — HTML parsing
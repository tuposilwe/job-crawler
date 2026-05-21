# Tanzania Tech Job Crawler

A Node.js web crawler that searches for software and developer jobs in Tanzania across multiple job boards, then emails you a formatted report twice daily.

## Sources

| Source       | URL                          |
|--------------|------------------------------|
| Fuzu         | fuzu.com/tanzania            |
| LinkedIn     | linkedin.com/jobs            |
| Mabumbe      | mabumbe.com                  |
| AjiraYako    | ajirayako.co.tz              |

## Requirements

- Node.js 18+
- A Gmail account with 2FA enabled
- A Gmail App Password (not your main password)

## Installation

```bash
git clone https://github.com/tuposilwe/job-crawler.git
cd job-crawler
npm install
```

## Configuration

Copy the example env file and fill in your credentials:

```bash
cp .env.example .env
```

```env
MAIL_HOST=mail.example.com
MAIL_PORT=465
MAIL_USERNAME=noreply@example.com
MAIL_PASSWORD=your-mail-password
MAIL_FROM_ADDRESS=noreply@example.com
EMAIL_TO=recipient@gmail.com
```

## Usage

Run manually:

```bash
node index.js
```

Results are saved to `results/jobs.json` and `results/jobs.csv`, and an email is sent to `EMAIL_TO`.

## VPS Scheduled Runs (8 AM & 5 PM Tanzania Time)

Open the cron editor on your VPS:

```bash
crontab -e
```

Add these two lines (UTC times — Tanzania is UTC+3):

```
0 5  * * * cd /path/to/job-crawler && node index.js >> /var/log/job-crawler.log 2>&1
0 14 * * * cd /path/to/job-crawler && node index.js >> /var/log/job-crawler.log 2>&1
```

Verify the schedule:

```bash
crontab -l
```

View logs:

```bash
tail -f /var/log/job-crawler.log
```

## Output Format

Each job entry:

```json
{
  "source": "Mabumbe",
  "title": "Software Engineer",
  "company": "ACME Corp",
  "location": "Dar es Salaam, Tanzania",
  "link": "https://mabumbe.com/jobs/...",
  "postedDate": "2026-05-20"
}
```

## Project Structure

```
job-crawler/
├── crawler.js      # Scraping logic for all sources
├── index.js        # Entry point — runs crawler, saves files, sends email
├── mailer.js       # Nodemailer email module
├── results/        # Output directory (auto-created)
│   ├── jobs.json
│   └── jobs.csv
├── .env.example    # Environment variable template
└── README.md
```

## Dependencies

- [axios](https://axios-http.com) — HTTP client
- [cheerio](https://cheerio.js.org) — HTML parsing
- [nodemailer](https://nodemailer.com) — Email sending
- [dotenv](https://github.com/motdotla/dotenv) — Environment variables

const nodemailer = require("nodemailer");

function buildHtml(jobs) {
  const bySource = jobs.reduce((acc, j) => {
    (acc[j.source] = acc[j.source] || []).push(j);
    return acc;
  }, {});

  const sections = Object.entries(bySource)
    .map(([source, list]) => {
      const rows = list
        .map(
          (j) => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee">${j.title}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee">${j.company}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee">${j.location}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee">
            <a href="${j.link}" style="color:#1a73e8">View</a>
          </td>
        </tr>`
        )
        .join("");

      return `
      <h3 style="margin:24px 0 8px;color:#1a73e8">${source} (${list.length})</h3>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px">
        <thead>
          <tr style="background:#f1f3f4">
            <th style="padding:8px 12px;text-align:left">Title</th>
            <th style="padding:8px 12px;text-align:left">Company</th>
            <th style="padding:8px 12px;text-align:left">Location</th>
            <th style="padding:8px 12px;text-align:left">Link</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>`;
    })
    .join("");

  const now = new Date().toLocaleString("en-TZ", { timeZone: "Africa/Dar_es_Salaam" });

  return `
  <div style="font-family:Arial,sans-serif;max-width:900px;margin:0 auto;padding:20px">
    <h2 style="color:#202124">🇹🇿 Tanzania Tech Jobs — ${now}</h2>
    <p style="color:#5f6368">Found <strong>${jobs.length}</strong> unique tech jobs across all sources.</p>
    ${sections}
    <p style="margin-top:32px;font-size:12px;color:#9aa0a6">Sent by Tanzania Tech Job Crawler</p>
  </div>`;
}

async function sendJobEmail(jobs) {
  const host = process.env.MAIL_HOST;
  const port = parseInt(process.env.MAIL_PORT || "465", 10);
  const user = process.env.MAIL_USERNAME;
  const pass = process.env.MAIL_PASSWORD;
  const from = process.env.MAIL_FROM_ADDRESS || user;
  const to = process.env.EMAIL_TO;

  if (!host || !user || !pass || !to) {
    console.warn("⚠ Email skipped — MAIL_HOST, MAIL_USERNAME, MAIL_PASSWORD or EMAIL_TO not set in .env");
    return;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  const now = new Date().toLocaleDateString("en-TZ", { timeZone: "Africa/Dar_es_Salaam" });

  await transporter.sendMail({
    from: `"Job Crawler" <${from}>`,
    to,
    subject: `Tanzania Tech Jobs — ${jobs.length} found (${now})`,
    html: buildHtml(jobs),
  });

  console.log(`📧 Email sent to ${to} (${jobs.length} jobs)`);
}

module.exports = { sendJobEmail };

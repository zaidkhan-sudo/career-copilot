/**
 * Postmark Email Service
 * ======================
 * Handles all email sending via Postmark API.
 */

import * as postmark from "postmark";

let clientInstance: postmark.ServerClient | null = null;

function getClient(): postmark.ServerClient {
  if (!clientInstance) {
    const apiKey = process.env.POSTMARK_API_KEY;
    if (!apiKey) throw new Error("POSTMARK_API_KEY is required");
    clientInstance = new postmark.ServerClient(apiKey);
  }
  return clientInstance;
}

const FROM_EMAIL = process.env.POSTMARK_FROM_EMAIL || "delivered@resend.dev";

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const toSafeText = (value: string | number | undefined) =>
  escapeHtml(String(value ?? ""));

/**
 * Send new jobs notification email
 */
export async function sendNewJobsEmail(
  to: string,
  jobs: {
    title: string;
    company: string;
    location: string;
    salary?: string;
    source: string;
    score?: number;
    url?: string;
  }[]
): Promise<boolean> {
  if (!jobs.length) return false;

  const jobRows = jobs
    .map(
      (j) => {
        const safeTitle = toSafeText(j.title);
        const safeCompany = toSafeText(j.company);
        const safeLocation = toSafeText(j.location);
        const safeSalary = j.salary ? toSafeText(j.salary) : "";
        const safeSource = toSafeText(j.source);
        const safeUrl = j.url ? escapeHtml(j.url) : "";
        return `
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #1e293b;">
          <div style="font-weight:600;color:#f8fafc;font-size:15px;">${safeTitle}</div>
          <div style="color:#94a3b8;font-size:13px;margin-top:2px;">${safeCompany} · ${safeLocation}</div>
          ${j.salary ? `<div style="color:#22d3ee;font-size:12px;margin-top:2px;">${safeSalary}</div>` : ""}
        </td>
        <td style="padding:12px 16px;border-bottom:1px solid #1e293b;text-align:center;">
          <span style="background:${(j.score || 0) >= 80 ? "#065f46" : "#1e293b"};color:${(j.score || 0) >= 80 ? "#6ee7b7" : "#94a3b8"};padding:4px 12px;border-radius:20px;font-size:13px;font-weight:600;">
            ${j.score || "—"}%
          </span>
        </td>
        <td style="padding:12px 16px;border-bottom:1px solid #1e293b;text-align:center;">
          <span style="color:#64748b;font-size:12px;">${safeSource}</span>
        </td>
        <td style="padding:12px 16px;border-bottom:1px solid #1e293b;text-align:center;">
          ${j.url ? `<a href="${safeUrl}" style="color:#818cf8;font-size:13px;text-decoration:none;">View →</a>` : ""}
        </td>
      </tr>`;
      }
    )
    .join("");

  const html = `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
  <body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
    <div style="max-width:640px;margin:0 auto;padding:32px 16px;">
      <!-- Header -->
      <div style="text-align:center;margin-bottom:32px;">
        <h1 style="color:#f8fafc;font-size:28px;margin:0;">🚀 CareerPilot</h1>
        <p style="color:#64748b;font-size:14px;margin-top:8px;">New opportunities discovered for you</p>
      </div>
      
      <!-- Stats -->
      <div style="background:linear-gradient(135deg,#1e1b4b 0%,#0f172a 100%);border:1px solid #334155;border-radius:12px;padding:24px;margin-bottom:24px;text-align:center;">
        <div style="font-size:36px;font-weight:700;color:#818cf8;">${jobs.length}</div>
        <div style="color:#94a3b8;font-size:14px;margin-top:4px;">New Jobs Found</div>
        <div style="color:#64748b;font-size:12px;margin-top:8px;">${new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</div>
      </div>

      <!-- Jobs Table -->
      <table style="width:100%;border-collapse:collapse;background:#0f172a;border:1px solid #334155;border-radius:12px;overflow:hidden;">
        <thead>
          <tr style="background:#1e293b;">
            <th style="padding:12px 16px;text-align:left;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;">Job</th>
            <th style="padding:12px 16px;text-align:center;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;">Match</th>
            <th style="padding:12px 16px;text-align:center;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;">Source</th>
            <th style="padding:12px 16px;text-align:center;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;">Link</th>
          </tr>
        </thead>
        <tbody>${jobRows}</tbody>
      </table>

      <!-- CTA -->
      <div style="text-align:center;margin-top:32px;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/dashboard" 
           style="background:linear-gradient(135deg,#6366f1,#22d3ee);color:white;padding:14px 32px;border-radius:10px;font-weight:600;font-size:15px;text-decoration:none;display:inline-block;">
          View Dashboard →
        </a>
      </div>

      <!-- Footer -->
      <div style="text-align:center;margin-top:40px;padding-top:24px;border-top:1px solid #1e293b;">
        <p style="color:#475569;font-size:12px;">CareerPilot — Your AI Job-Hunting Teammate</p>
      </div>
    </div>
  </body>
  </html>`;

  try {
    await getClient().sendEmail({
      From: FROM_EMAIL,
      To: to,
      Subject: `🚀 ${jobs.length} new job${jobs.length > 1 ? "s" : ""} found — CareerPilot`,
      HtmlBody: html,
      TextBody: `CareerPilot found ${jobs.length} new jobs for you. Visit your dashboard to review them.`,
      MessageStream: "outbound",
    });
    return true;
  } catch (error) {
    console.error("Postmark send error:", error);
    return false;
  }
}

/**
 * Send an application/outreach email on behalf of the user
 */
export async function sendApplicationEmail(
  to: string,
  subject: string,
  htmlBody: string,
  textBody: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const result = await getClient().sendEmail({
      From: FROM_EMAIL,
      To: to,
      Subject: subject,
      HtmlBody: htmlBody,
      TextBody: textBody,
      MessageStream: "outbound",
    });
    return { success: true, messageId: result.MessageID };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Postmark send error:", msg);
    return { success: false, error: msg };
  }
}

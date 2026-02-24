// FILE: src/lib/email.server.ts
//
// Gmail SMTP support email sender (FREE).
// - Uses Nodemailer (SMTP)
// - Safe for Next.js App Router (server-only usage)
// - Validates required env vars at runtime with helpful errors
//
// Install:
//   npm i nodemailer
//   npm i -D @types/nodemailer
//
// Required .env (recommended):
//   SMTP_HOST=smtp.gmail.com
//   SMTP_PORT=465
//   SMTP_SECURE=true
//   SMTP_USER=vidalbargenius@gmail.com
//   SMTP_PASS=YOUR_GMAIL_APP_PASSWORD
//   SMTP_FROM=Vidal Bar Genius <vidalbargenius@gmail.com>
//   SUPPORT_INBOX=vidalbargenius@gmail.com

import "server-only";
import nodemailer from "nodemailer";

type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean; // true for 465, false for 587 (STARTTLS)
  user: string;
  pass: string;
  from: string; // "Name <email@domain>"
  inbox: string; // where support emails go
};

function mustGetEnv(key: string): string {
  const v = process.env[key];
  if (!v || !v.trim()) {
    throw new Error(`[email] Missing required env var: ${key}`);
  }
  return v.trim();
}

function getSmtpConfig(): SmtpConfig {
  const host = mustGetEnv("SMTP_HOST");
  const portRaw = mustGetEnv("SMTP_PORT");
  const secureRaw = (process.env.SMTP_SECURE ?? "").trim();

  const port = Number(portRaw);
  if (!Number.isFinite(port) || port <= 0) {
    throw new Error(`[email] Invalid SMTP_PORT: "${portRaw}"`);
  }

  // Default secure based on port if SMTP_SECURE not provided
  const secure =
    secureRaw.length > 0
      ? secureRaw === "true" || secureRaw === "1"
      : port === 465;

  const user = mustGetEnv("SMTP_USER");
  const pass = mustGetEnv("SMTP_PASS");
  const from = mustGetEnv("SMTP_FROM");
  const inbox = mustGetEnv("SUPPORT_INBOX");

  return { host, port, secure, user, pass, from, inbox };
}

// Cache transporter across hot reloads in dev.
// This avoids reconnect overhead and flakiness.
declare global {
  // eslint-disable-next-line no-var
  var __smtpTransporter: nodemailer.Transporter | undefined;
}

function getTransporter(): nodemailer.Transporter {
  if (global.__smtpTransporter) return global.__smtpTransporter;

  const cfg = getSmtpConfig();

  const transporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: {
      user: cfg.user,
      pass: cfg.pass,
    },
  });

  global.__smtpTransporter = transporter;
  return transporter;
}

export type SendSupportEmailInput = {
  ticketId: string;
  name: string;
  email: string;
  message: string;
  appUrl?: string; // optional for links
};

export async function sendSupportEmail(input: SendSupportEmailInput): Promise<{
  messageId?: string;
  accepted: string[];
  rejected: string[];
}> {
  const cfg = getSmtpConfig();
  const transporter = getTransporter();

  // Simple, clean email content. You can enhance later with HTML templates.
  const subject = `Vidal Bar Genius Support (#${input.ticketId})`;

  const text = [
    `New support message received`,
    ``,
    `Ticket: ${input.ticketId}`,
    `From: ${input.name} <${input.email}>`,
    ``,
    `Message:`,
    input.message,
    ``,
    input.appUrl ? `App: ${input.appUrl}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
    <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; line-height:1.45">
      <h2 style="margin:0 0 12px 0">New support message</h2>
      <div><b>Ticket:</b> ${escapeHtml(input.ticketId)}</div>
      <div><b>From:</b> ${escapeHtml(input.name)} &lt;${escapeHtml(input.email)}&gt;</div>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:12px 0" />
      <div style="white-space:pre-wrap">${escapeHtml(input.message)}</div>
      ${
        input.appUrl
          ? `<hr style="border:none;border-top:1px solid #e5e7eb;margin:12px 0" /><div><b>App:</b> ${escapeHtml(
              input.appUrl
            )}</div>`
          : ""
      }
    </div>
  `;

  const info = await transporter.sendMail({
    from: cfg.from,
    to: cfg.inbox,
    replyTo: input.email, // so you can reply directly to the user
    subject,
    text,
    html,
  });

  return {
    messageId: info.messageId,
    accepted: (info.accepted ?? []).map(String),
    rejected: (info.rejected ?? []).map(String),
  };
}

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
/**
 * Resend client + transactional email templates.
 * Server-only. Never import into client components.
 */

import { Resend } from 'resend';

const API_KEY = process.env.RESEND_API_KEY;
const FROM    = process.env.RESEND_FROM_EMAIL || 'hello@muem.com';
const NOTIFY  = process.env.ADMIN_NOTIFY_EMAIL;

const resend = API_KEY ? new Resend(API_KEY) : null;

interface ContactNotifyParams {
  name:       string;
  email:      string;
  lookingFor: string;
  message:    string;
  submittedAt?: Date;
}

/** Send the admin a notification when a public contact form is submitted. */
export async function sendContactNotification(p: ContactNotifyParams): Promise<void> {
  if (!resend || !NOTIFY) {
    console.warn('[email] Resend or ADMIN_NOTIFY_EMAIL not configured — skipping notification');
    return;
  }

  const when = (p.submittedAt ?? new Date()).toLocaleString('en-GB', { timeZone: 'Asia/Makassar' });

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1a1a1a;">
      <h2 style="margin:0 0 4px;font-size:18px;font-weight:600;">New inquiry from ${escapeHtml(p.name)}</h2>
      <p style="margin:0 0 24px;color:#666;font-size:13px;">${when}</p>

      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr><td style="padding:8px 0;color:#666;width:120px;">Email</td><td><a href="mailto:${escapeHtml(p.email)}">${escapeHtml(p.email)}</a></td></tr>
        <tr><td style="padding:8px 0;color:#666;">Looking for</td><td>${escapeHtml(p.lookingFor)}</td></tr>
      </table>

      <h3 style="margin:24px 0 8px;font-size:14px;font-weight:600;">Message</h3>
      <div style="white-space:pre-wrap;padding:16px;background:#f6f6f6;border-radius:8px;font-size:14px;line-height:1.55;">${escapeHtml(p.message)}</div>

      <p style="margin-top:24px;font-size:12px;color:#999;">
        View in <a href="${process.env.NEXT_PUBLIC_BASE_URL || ''}/admin/inbox">Muem CMS inbox →</a>
      </p>
    </div>
  `;

  const text = `New inquiry from ${p.name}\n\nEmail: ${p.email}\nLooking for: ${p.lookingFor}\n\nMessage:\n${p.message}\n\nSubmitted ${when}`;

  try {
    await resend.emails.send({
      from:    `Muem Studio <${FROM}>`,
      to:      NOTIFY,
      replyTo: p.email,
      subject: `New inquiry — ${p.name} · ${p.lookingFor}`,
      html,
      text,
    });
  } catch (e) {
    console.error('[email.sendContactNotification]', e);
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g, '&#39;');
}

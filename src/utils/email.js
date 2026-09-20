import nodemailer from 'nodemailer';

// Lazily-created SMTP transporter so the server still boots if SMTP isn't configured.
let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false, // 587 uses STARTTLS
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    // Fail fast instead of hanging the request forever if the SMTP port is
    // slow/blocked on the host.
    connectionTimeout: 10000, // 10s to establish the connection
    greetingTimeout: 10000,   // 10s to receive the SMTP greeting
    socketTimeout: 15000,     // 15s socket inactivity
  });
  return transporter;
};

export const isEmailConfigured = () =>
  !!process.env.BREVO_API_KEY || !!getTransporter();

const fromName = () => process.env.EMAIL_FROM_NAME || 'Munaz';
const fromEmail = () => process.env.EMAIL_FROM || process.env.SMTP_USER;

// Send via Brevo's HTTPS API (port 443 — works even where SMTP ports are blocked).
const sendViaApi = async ({ to, subject, html, text }) => {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY,
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({
      sender: { name: fromName(), email: fromEmail() },
      to: [{ email: to }],
      subject,
      htmlContent: html,
      textContent: text || html?.replace(/<[^>]+>/g, ' '),
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Brevo API send failed (${res.status}): ${body}`);
  }
  return true;
};

// Send via SMTP (nodemailer).
const sendViaSmtp = async ({ to, subject, html, text }) => {
  const t = getTransporter();
  if (!t) return false;
  await t.sendMail({
    from: `"${fromName()}" <${fromEmail()}>`,
    to,
    subject,
    text: text || html?.replace(/<[^>]+>/g, ' '),
    html,
  });
  return true;
};

/**
 * Send an email. Prefers the Brevo HTTPS API (more reliable / not port-blocked)
 * when BREVO_API_KEY is set, otherwise falls back to SMTP.
 * Returns true on success, false if nothing is configured.
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  if (process.env.BREVO_API_KEY) {
    return sendViaApi({ to, subject, html, text });
  }
  if (getTransporter()) {
    return sendViaSmtp({ to, subject, html, text });
  }
  console.warn('[email] No email transport configured — skipping send to', to);
  return false;
};

/**
 * Branded password-reset email.
 */
export const sendPasswordResetEmail = async (to, resetUrl, name = '') => {
  const html = `
  <div style="font-family: Arial, Helvetica, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #1f2937;">
    <h1 style="font-size: 22px; font-style: italic; color: #7E57C2; margin: 0 0 16px;">Munaz</h1>
    <h2 style="font-size: 18px; margin: 0 0 12px;">Reset your password</h2>
    <p style="font-size: 14px; line-height: 1.6; color: #4b5563;">
      Hi ${name || 'there'}, we received a request to reset your Munaz account password.
      Click the button below to choose a new one. This link expires in 30 minutes.
    </p>
    <p style="margin: 24px 0;">
      <a href="${resetUrl}" style="background: #7E57C2; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 8px; display: inline-block;">
        Reset Password
      </a>
    </p>
    <p style="font-size: 12px; color: #9ca3af; line-height: 1.6;">
      If the button doesn't work, copy and paste this link into your browser:<br/>
      <a href="${resetUrl}" style="color: #7E57C2; word-break: break-all;">${resetUrl}</a>
    </p>
    <p style="font-size: 12px; color: #9ca3af; line-height: 1.6; margin-top: 24px;">
      Didn't request this? You can safely ignore this email — your password won't change.
    </p>
  </div>`;

  return sendEmail({ to, subject: 'Reset your Munaz password', html });
};

export default { sendEmail, sendPasswordResetEmail, isEmailConfigured };

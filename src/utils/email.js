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

/**
 * Branded order-confirmation email sent to the customer after they place an order.
 */
export const sendOrderConfirmationEmail = async (to, order) => {
  const rupee = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
  const a = order.shippingAddress || {};
  const items = order.items || [];

  const itemRows = items.map((it) => `
    <tr>
      <td style="padding:8px 0;font-size:13px;color:#374151;">
        ${it.name}${(it.size || it.color) ? `<br/><span style="font-size:11px;color:#9ca3af;">${[it.size, it.color].filter(Boolean).join(' · ')}</span>` : ''}
      </td>
      <td style="padding:8px 0;font-size:13px;color:#6b7280;text-align:center;">×${it.quantity}</td>
      <td style="padding:8px 0;font-size:13px;color:#111827;text-align:right;font-weight:600;">${rupee(it.price * it.quantity)}</td>
    </tr>`).join('');

  const paymentLabel = order.paymentMethod === 'cod' ? 'Cash on Delivery'
    : order.paymentMethod ? order.paymentMethod.toUpperCase() : '';

  const html = `
  <div style="font-family: Arial, Helvetica, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; color: #1f2937;">
    <div style="text-align:center; margin-bottom: 20px;">
      <span style="font-size: 26px; font-weight: 700; font-style: italic; color: #7E57C2;">Muna<span style="color:#EC4899;">z</span></span>
    </div>
    <div style="background:#F3E8FF; border-radius:12px; padding:20px; text-align:center; margin-bottom:20px;">
      <h2 style="font-size:18px; margin:0 0 6px; color:#111827;">Thank you for your order! 🎉</h2>
      <p style="font-size:13px; color:#6b7280; margin:0;">Order <strong>#${order.orderNumber}</strong> is confirmed.</p>
    </div>

    <table style="width:100%; border-collapse:collapse; margin-bottom:16px;">
      <thead>
        <tr style="border-bottom:1px solid #e5e7eb;">
          <th style="text-align:left; font-size:11px; text-transform:uppercase; color:#9ca3af; padding-bottom:6px;">Item</th>
          <th style="text-align:center; font-size:11px; text-transform:uppercase; color:#9ca3af; padding-bottom:6px;">Qty</th>
          <th style="text-align:right; font-size:11px; text-transform:uppercase; color:#9ca3af; padding-bottom:6px;">Amount</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
    </table>

    <table style="width:100%; border-top:2px solid #111827; padding-top:8px;">
      <tr><td style="font-size:13px; color:#6b7280; padding-top:8px;">Items Total</td><td style="font-size:13px; text-align:right; padding-top:8px;">${rupee(order.itemsTotal)}</td></tr>
      <tr><td style="font-size:13px; color:#6b7280;">Shipping</td><td style="font-size:13px; text-align:right;">${order.shippingCost ? rupee(order.shippingCost) : 'Free'}</td></tr>
      <tr><td style="font-size:15px; font-weight:700; color:#111827; padding-top:6px;">Total</td><td style="font-size:15px; font-weight:700; text-align:right; color:#111827; padding-top:6px;">${rupee(order.totalAmount)}</td></tr>
    </table>

    <div style="background:#f9fafb; border-radius:10px; padding:16px; margin-top:20px;">
      <p style="font-size:11px; text-transform:uppercase; color:#9ca3af; margin:0 0 6px; font-weight:600;">Delivering To</p>
      <p style="font-size:13px; color:#374151; margin:0; line-height:1.6;">
        <strong>${a.fullName || ''}</strong><br/>
        ${a.address || ''}<br/>
        ${a.city || ''}${a.city ? ', ' : ''}${a.state || ''} - ${a.pincode || ''}<br/>
        ${a.phone ? `Phone: ${a.phone}` : ''}
      </p>
      <p style="font-size:12px; color:#6b7280; margin:10px 0 0;">Payment: ${paymentLabel}</p>
    </div>

    <p style="font-size:12px; color:#9ca3af; text-align:center; margin-top:24px; line-height:1.6;">
      We'll notify you when your order ships.<br/>
      Thank you for shopping with Munaz 💜
    </p>
  </div>`;

  return sendEmail({
    to,
    subject: `Order Confirmed #${order.orderNumber} — Munaz`,
    html,
  });
};

export default { sendEmail, sendPasswordResetEmail, sendOrderConfirmationEmail, isEmailConfigured };

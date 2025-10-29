import nodemailer from 'nodemailer';
import { pool } from '../db.js';

const supportEmail = process.env.SUPPORT_EMAIL || 'support@chefsghana.com';

const requiredEnv = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASSWORD'];
requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing environment variable: ${key}`);
  }
});

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_SECURE === 'true' || Number(process.env.EMAIL_PORT) === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const renderListItems = (items = []) =>
  items
    .filter(Boolean)
    .map((item) => `<li style="margin-bottom: 4px;">${item}</li>`)
    .join('');

const buildEmailBody = ({
  membershipId,
  membershipType,
  personal,
  contact,
  identification,
  professional,
  emergencyContact,
  payment,
}) => {
  const fullName = [personal.firstName, personal.middleName, personal.lastName]
    .filter(Boolean)
    .join(' ');

  const professionalEntries = professional && typeof professional === 'object'
    ? Object.entries(professional)
        .filter(([, value]) => value !== null && value !== undefined && value !== '')
        .map(([key, value]) => `${key.replace(/_/g, ' ')}: ${Array.isArray(value) ? value.join(', ') : value}`)
    : [];

  return `
  <div style="font-family: Arial, sans-serif; color: #0f172a;">
    <h2 style="color: #0d9488;">New Membership Registration</h2>
    <p>A new member registration has been submitted via the website.</p>

    <h3 style="color: #0d9488;">Membership</h3>
    <ul style="list-style: none; padding: 0;">
      ${renderListItems([
        `<strong>Membership ID:</strong> ${membershipId}`,
        `<strong>Type:</strong> ${membershipType}`,
        `<strong>Reference:</strong> ${payment.reference}`,
        `<strong>Amount Paid:</strong> GH₵${Number(payment.amount).toFixed(2)}`,
        `<strong>Payment Status:</strong> ${payment.status ?? 'success'}`,
      ])}
    </ul>

    <h3 style="color: #0d9488;">Applicant</h3>
    <ul style="list-style: none; padding: 0;">
      ${renderListItems([
        `<strong>Name:</strong> ${fullName}`,
        `<strong>Email:</strong> ${contact.email}`,
        `<strong>Phone:</strong> ${contact.phone}`,
        contact.alternativePhone && `<strong>Alternate Phone:</strong> ${contact.alternativePhone}`,
        `<strong>Date of Birth:</strong> ${personal.dateOfBirth}`,
        `<strong>Gender:</strong> ${personal.gender}`,
        `<strong>Nationality:</strong> ${personal.nationality}`,
        `<strong>ID Type:</strong> ${identification.idType}`,
        `<strong>ID Number:</strong> ${identification.idNumber}`,
        `<strong>Address:</strong> ${contact.streetAddress}, ${contact.city}, ${contact.region}`,
        contact.digitalAddress && `<strong>Digital Address:</strong> ${contact.digitalAddress}`,
      ])}
    </ul>

    <h3 style="color: #0d9488;">Emergency Contact</h3>
    <ul style="list-style: none; padding: 0;">
      ${renderListItems([
        `<strong>Name:</strong> ${emergencyContact?.name ?? 'N/A'}`,
        `<strong>Relationship:</strong> ${emergencyContact?.relationship ?? 'N/A'}`,
        `<strong>Phone:</strong> ${emergencyContact?.phone ?? 'N/A'}`,
      ])}
    </ul>

    ${professionalEntries.length
      ? `<h3 style="color: #0d9488;">Professional / Additional Details</h3>
         <ul style="list-style: none; padding: 0;">
           ${renderListItems(professionalEntries)}
         </ul>`
      : ''}

    <p style="margin-top: 24px;">Please log into the admin dashboard to review and approve the registration.</p>
  </div>
  `;
};

export const sendRegistrationEmail = async (details) => {
  const html = buildEmailBody(details);

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: supportEmail,
    subject: `New ${details.membershipType} registration - ${details.membershipId}`,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);

    await pool.execute(
      `INSERT INTO email_notifications (registration_id, recipient_email, subject, body, status, sent_at)
       VALUES (?, ?, ?, ?, 'sent', NOW())`,
      [details.registrationId ?? null, supportEmail, mailOptions.subject, html]
    );

    return info;
  } catch (error) {
    await pool.execute(
      `INSERT INTO email_notifications (registration_id, recipient_email, subject, body, status, error_message, created_at)
       VALUES (?, ?, ?, ?, 'failed', ?, NOW())`,
      [details.registrationId ?? null, supportEmail, mailOptions.subject, html, error.message]
    );

    throw error;
  }
};

// Send an arbitrary HTML email and log to email_notifications
export const sendHtmlEmail = async ({ to, subject, html, registrationId = null }) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: to || supportEmail,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    await pool.execute(
      `INSERT INTO email_notifications (registration_id, recipient_email, subject, body, status, sent_at)
       VALUES (?, ?, ?, ?, 'sent', NOW())`,
      [registrationId, mailOptions.to, subject, html]
    );
    return info;
  } catch (error) {
    await pool.execute(
      `INSERT INTO email_notifications (registration_id, recipient_email, subject, body, status, error_message, created_at)
       VALUES (?, ?, ?, ?, 'failed', ?, NOW())`,
      [registrationId, mailOptions.to, subject, html, error.message]
    );
    throw error;
  }
};

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logoPath = path.resolve(__dirname, '../../public/logo.png');

let transporter = null;

export const getTransporter = () => {
  dotenv.config();
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      pool: true,
      maxConnections: 3,
      maxMessages: 100,
      connectionTimeout: 4000, // 4s timeout
      greetingTimeout: 3000,   // 3s greeting
      socketTimeout: 5000,     // 5s socket
      auth: {
        user,
        pass: pass.replace(/\s+/g, ''), // Strip any spaces from the 16-character app password
      },
    });
  }

  return transporter;
};

/**
 * Sends a 6-digit OTP email to the recipient with the brand logo.
 * @param {string} toEmail - Recipient email address
 * @param {string} otp - 6-digit OTP code
 * @param {string} [purpose='login'] - Purpose of OTP ('login' or 'registration')
 * @returns {Promise<{ success: boolean, simulated?: boolean, error?: string }>}
 */
export const sendOtpEmail = async (toEmail, otp, purpose = 'login') => {
  const mailer = getTransporter();

  if (!mailer) {
    console.warn(`[OTP EMAIL] EMAIL_USER or EMAIL_PASS not set in server/.env. OTP for ${toEmail} is: ${otp}`);
    return {
      success: true,
      simulated: true,
      message: 'Email credentials not configured in server/.env. Code generated in demo mode.',
    };
  }

  const title = purpose === 'registration' 
    ? 'Verify Your Registration' 
    : (purpose === 'reset' || purpose === 'forgot_password')
    ? 'Reset Your Password'
    : 'Verify Your Login';
  const actionText = purpose === 'registration' 
    ? 'complete your registration' 
    : (purpose === 'reset' || purpose === 'forgot_password')
    ? 'reset your account password'
    : 'securely log in';

  const attachments = [];
  const hasLogo = fs.existsSync(logoPath);
  if (hasLogo) {
    attachments.push({
      filename: 'logo.png',
      path: logoPath,
      cid: 'joshpetshub-logo',
    });
  }

  const logoImgTag = hasLogo
    ? `<img src="cid:joshpetshub-logo" alt="JOSH PETS HUB Logo" width="46" height="46" style="width: 46px; height: 46px; object-fit: contain; display: block; border: 0; outline: none; margin: 0 auto 10px auto;" />`
    : '';

  const mailOptions = {
    from: `"JOSH PETS HUB" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `${otp} is your verification code - JOSH PETS HUB`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; }
          .card { max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.06); }
          .header { background: #1e3a2b; color: #ffffff; padding: 32px 24px 28px; text-align: center; }
          .header h1 { margin: 0; font-size: 23px; font-weight: 800; letter-spacing: 1.5px; color: #ffffff; line-height: 1.2; text-transform: uppercase; }
          .header p { margin: 6px 0 0; font-size: 13px; opacity: 0.88; color: #d1fae5; }
          .content { padding: 32px 24px; text-align: center; }
          .badge { display: inline-block; background: #dcfce7; color: #166534; font-size: 11px; font-weight: 700; padding: 5px 14px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 14px; }
          .title { font-size: 21px; font-weight: 800; color: #0f172a; margin-bottom: 8px; }
          .desc { font-size: 14px; color: #64748b; line-height: 1.55; margin-bottom: 24px; }
          .otp-box { background: #f0fdf4; border: 2px dashed #86efac; border-radius: 14px; padding: 20px; font-size: 38px; font-weight: 800; letter-spacing: 8px; color: #1e3a2b; margin-bottom: 24px; user-select: all; font-family: 'Courier New', Courier, monospace; }
          .footer { background: #f8fafc; padding: 20px 24px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center; line-height: 1.6; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            ${logoImgTag}
            <h1>JOSH PETS HUB</h1>
            <p>Your Trusted Multi-Service Pet Platform</p>
          </div>
          <div class="content">
            <span class="badge">Security Verification</span>
            <div class="title">${title}</div>
            <div class="desc">Please use the verification code below to ${actionText} to your account. This code will expire in <strong>1 minute (60 seconds)</strong>.</div>
            <div class="otp-box">${otp}</div>
            <p style="font-size: 13px; color: #64748b; margin: 0; line-height: 1.5;">If you did not request this verification code, please ignore this email or contact support.</p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} JOSH PETS HUB. All rights reserved.<br>
            Chennai, Tamil Nadu, India
          </div>
        </div>
      </body>
      </html>
    `,
    attachments,
  };

  try {
    // 5-second safe timeout to prevent SMTP from stalling serverless execution
    const sendPromise = mailer.sendMail(mailOptions);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('SMTP network timeout after 5s')), 5000)
    );
    const info = await Promise.race([sendPromise, timeoutPromise]);
    console.log(`[OTP EMAIL] Sent successfully to ${toEmail}. Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[OTP EMAIL ERROR] Failed to send email to ${toEmail}:`, err.message);
    return { success: false, error: err.message };
  }
};

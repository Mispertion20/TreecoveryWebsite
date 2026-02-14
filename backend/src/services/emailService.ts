import { Resend } from 'resend';

// Initialize Resend only if API key is provided (email service is optional)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@treecovery.kz';
const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'info@treecovery.kz';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string
): Promise<void> {
  if (!resend) {
    // In development, log the token instead of sending email
    console.log('📧 [DEV] Password reset token for', email, ':', resetToken);
    console.log('📧 [DEV] Reset URL:', `${FRONTEND_URL}/reset-password?token=${resetToken}`);
    return;
  }

  const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}`;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Reset Your Password - Treecovery',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">Treecovery</h1>
          </div>
          <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1f2937; margin-top: 0;">Password Reset Request</h2>
            <p>Hello,</p>
            <p>You requested to reset your password for your Treecovery account. Click the button below to reset your password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Reset Password</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #6b7280; font-size: 14px;">${resetUrl}</p>
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              <strong>Note:</strong> This link will expire in 1 hour. If you didn't request this password reset, please ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
              © ${new Date().getFullYear()} Treecovery. All rights reserved.
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
        Password Reset Request
        
        Hello,
        
        You requested to reset your password for your Treecovery account. 
        Visit the following link to reset your password:
        
        ${resetUrl}
        
        This link will expire in 1 hour. If you didn't request this password reset, please ignore this email.
        
        © ${new Date().getFullYear()} Treecovery. All rights reserved.
      `,
    });
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
}

/**
 * Send welcome email (optional - for email verification)
 */
export async function sendWelcomeEmail(email: string, name?: string): Promise<void> {
  if (!resend) {
    console.log('📧 [DEV] Welcome email would be sent to', email);
    return;
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Welcome to Treecovery!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Treecovery</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">Treecovery</h1>
          </div>
          <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1f2937; margin-top: 0;">Welcome${name ? `, ${name}` : ''}!</h2>
            <p>Thank you for joining Treecovery, the platform for tracking and managing green spaces in Kazakhstan.</p>
            <p>You can now:</p>
            <ul>
              <li>Explore green spaces on the interactive map</li>
              <li>View detailed information about trees and parks</li>
              <li>Contribute to environmental data (if you're an admin)</li>
            </ul>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${FRONTEND_URL}" style="background-color: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Get Started</a>
            </div>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
              © ${new Date().getFullYear()} Treecovery. All rights reserved.
            </p>
          </div>
        </body>
        </html>
      `,
    });
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    // Don't throw - welcome email is not critical
  }
}

/**
 * Send contact form email
 */
export async function sendContactEmail(
  name: string,
  email: string,
  subject: string,
  message: string
): Promise<void> {
  if (!resend) {
    // In development, log the contact form submission
    console.log('📧 [DEV] Contact form submission:');
    console.log('📧 [DEV] From:', name, `<${email}>`);
    console.log('📧 [DEV] Subject:', subject);
    console.log('📧 [DEV] Message:', message);
    return;
  }

  try {
    // Send email to admin/contact email
    await resend.emails.send({
      from: FROM_EMAIL,
      to: CONTACT_EMAIL,
      replyTo: email,
      subject: `Contact Form: ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Contact Form Submission</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">Treecovery Contact Form</h1>
          </div>
          <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1f2937; margin-top: 0;">New Contact Form Submission</h2>
            <div style="background-color: white; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
              <p style="margin: 0 0 10px 0;"><strong>Name:</strong> ${name}</p>
              <p style="margin: 0 0 10px 0;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
              <p style="margin: 0 0 10px 0;"><strong>Subject:</strong> ${subject}</p>
            </div>
            <div style="background-color: white; padding: 20px; border-radius: 6px;">
              <p style="margin: 0 0 10px 0;"><strong>Message:</strong></p>
              <p style="margin: 0; white-space: pre-wrap;">${message.replace(/\n/g, '<br>')}</p>
            </div>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
              You can reply directly to this email to respond to ${name}.
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
        Treecovery Contact Form - New Submission
        
        Name: ${name}
        Email: ${email}
        Subject: ${subject}
        
        Message:
        ${message}
        
        ---
        You can reply directly to this email to respond to ${name}.
      `,
    });

    // Send confirmation email to user
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Thank you for contacting Treecovery',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Thank you for contacting Treecovery</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">Treecovery</h1>
          </div>
          <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1f2937; margin-top: 0;">Thank you for contacting us!</h2>
            <p>Hello ${name},</p>
            <p>We've received your message and will get back to you within 24-48 hours.</p>
            <div style="background-color: white; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 0 0 10px 0;"><strong>Subject:</strong> ${subject}</p>
              <p style="margin: 0;"><strong>Your message:</strong></p>
              <p style="margin: 10px 0 0 0; color: #6b7280; white-space: pre-wrap;">${message.replace(/\n/g, '<br>')}</p>
            </div>
            <p>If you have any urgent questions, please don't hesitate to reach out again.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
              © ${new Date().getFullYear()} Treecovery. All rights reserved.
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
        Thank you for contacting Treecovery!
        
        Hello ${name},
        
        We've received your message and will get back to you within 24-48 hours.
        
        Subject: ${subject}
        
        Your message:
        ${message}
        
        If you have any urgent questions, please don't hesitate to reach out again.
        
        © ${new Date().getFullYear()} Treecovery. All rights reserved.
      `,
    });
  } catch (error) {
    console.error('Failed to send contact email:', error);
    throw new Error('Failed to send contact email');
  }
}

/**
 * Send notification email
 */
export async function sendNotificationEmail(
  email: string,
  type: string,
  message: string,
  link?: string
): Promise<void> {
  if (!resend) {
    console.log('📧 [DEV] Notification email would be sent to', email);
    console.log('📧 [DEV] Type:', type);
    console.log('📧 [DEV] Message:', message);
    if (link) {
      console.log('📧 [DEV] Link:', link);
    }
    return;
  }

  const subjectMap: Record<string, string> = {
    adoption_update: 'Tree Adoption Update - Treecovery',
    report_response: 'Report Response - Treecovery',
    comment_reply: 'New Comment Reply - Treecovery',
    admin_action: 'Account Update - Treecovery',
    system_announcement: 'System Announcement - Treecovery',
    other: 'Notification - Treecovery',
  };

  const subject = subjectMap[type] || subjectMap.other;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">Treecovery</h1>
          </div>
          <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1f2937; margin-top: 0;">${subject.replace(' - Treecovery', '')}</h2>
            <div style="background-color: white; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
              <p style="margin: 0; white-space: pre-wrap;">${message.replace(/\n/g, '<br>')}</p>
            </div>
            ${link ? `
              <div style="text-align: center; margin: 30px 0;">
                <a href="${link}" style="background-color: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">View Details</a>
              </div>
            ` : ''}
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
              © ${new Date().getFullYear()} Treecovery. All rights reserved.
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
        ${subject}
        
        ${message}
        
        ${link ? `\nView details: ${link}` : ''}
        
        © ${new Date().getFullYear()} Treecovery. All rights reserved.
      `,
    });
  } catch (error) {
    console.error('Failed to send notification email:', error);
    // Don't throw - notification emails are not critical
  }
}


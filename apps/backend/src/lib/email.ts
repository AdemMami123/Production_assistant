import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'

// Email transporter singleton
let transporter: Transporter | null = null

/**
 * Get or create the email transporter
 */
export function getEmailTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })
  }
  return transporter
}

/**
 * Send a team invitation email
 */
export async function sendTeamInvitationEmail(
  recipientEmail: string,
  recipientName: string,
  teamName: string,
  inviterName: string,
  role: 'leader' | 'member'
): Promise<void> {
  const transporter = getEmailTransporter()

  const roleDescription = role === 'leader' ? 'Team Leader' : 'Team Member'

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 10px 10px 0 0;
      text-align: center;
    }
    .content {
      background: #f9fafb;
      padding: 30px;
      border-radius: 0 0 10px 10px;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 0;
      font-weight: 600;
    }
    .team-info {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      border-left: 4px solid #667eea;
    }
    .footer {
      text-align: center;
      color: #6b7280;
      font-size: 14px;
      margin-top: 30px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎉 Team Invitation</h1>
  </div>
  <div class="content">
    <p>Hi ${recipientName},</p>
    
    <p><strong>${inviterName}</strong> has invited you to join their team!</p>
    
    <div class="team-info">
      <h2 style="margin-top: 0; color: #667eea;">Team: ${teamName}</h2>
      <p style="margin: 10px 0;">
        <strong>Your Role:</strong> ${roleDescription}
      </p>
      ${
        role === 'leader'
          ? '<p style="color: #059669; margin: 10px 0;">✓ You will have full team management permissions</p>'
          : '<p style="color: #2563eb; margin: 10px 0;">✓ You can view and update team tasks</p>'
      }
    </div>
    
    <p>Click the button below to log in to your account and start collaborating:</p>
    
    <center>
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" class="button">
        View in Dashboard
      </a>
    </center>
    
    <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
      You're receiving this email because someone added you to a team in Productivity Assistant.
      If you didn't expect this invitation, you can safely ignore this email.
    </p>
  </div>
  
  <div class="footer">
    <p>Productivity Assistant - Team Collaboration Made Easy</p>
  </div>
</body>
</html>
  `

  await transporter.sendMail({
    from: `"Productivity Assistant" <${process.env.SMTP_USER}>`,
    to: recipientEmail,
    subject: `You've been invited to join ${teamName}!`,
    html: htmlContent,
  })
}

/**
 * Send a generic notification email
 */
export async function sendNotificationEmail(
  recipientEmail: string,
  subject: string,
  htmlContent: string
): Promise<void> {
  const transporter = getEmailTransporter()

  await transporter.sendMail({
    from: `"Productivity Assistant" <${process.env.SMTP_USER}>`,
    to: recipientEmail,
    subject,
    html: htmlContent,
  })
}

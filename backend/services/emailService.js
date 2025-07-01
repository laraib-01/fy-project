import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create a transporter object using Mailtrap for testing
const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST || 'sandbox.smtp.mailtrap.io',
  port: process.env.MAILTRAP_PORT || 2525,
  auth: {
    user: process.env.MAILTRAP_USER || 'cdf787936257c9',
    pass: process.env.MAILTRAP_PASS || '524a2dd07a91ec',
  },
  debug: process.env.NODE_ENV !== 'production', // Enable debug mode in development
  logger: process.env.NODE_ENV !== 'production', // Log emails in development
});

// Rest of the code remains the same
export const sendPasswordResetEmail = async (to, resetToken, name) => {
  try {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'EduConnect'}" <${process.env.EMAIL_FROM_ADDRESS || process.env.MAILTRAP_USER}>`,
      to,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>Hello ${name},</p>
          <p>We received a request to reset your password for your EduConnect account.</p>
          <p>Please click the button below to reset your password:</p>
          <p style="margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #4CAF50; color: white; padding: 12px 25px; 
                      text-decoration: none; border-radius: 4px; font-weight: bold;">
              Reset Password
            </a>
          </p>
          <p>Or copy and paste this link into your browser:</p>
          <p><a href="${resetUrl}" style="color: #4CAF50; word-break: break-all;">${resetUrl}</a></p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request a password reset, please ignore this email.</p>
          <p>Thanks,<br>The EduConnect Team</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error("Failed to send password reset email");
  }
};

export const sendPasswordResetConfirmation = async (to, name) => {
  try {
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'EduConnect'}" <${process.env.EMAIL_FROM_ADDRESS || process.env.MAILTRAP_USER}>`,
      to,
      subject: 'Password Reset Successful',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Successful</h2>
          <p>Hello ${name},</p>
          <p>Your password has been successfully reset.</p>
          <p>If you did not make this change, please contact our support team immediately.</p>
          <p>Thanks,<br>The EduConnect Team</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending password reset confirmation email:", error);
    throw new Error("Failed to send password reset confirmation email");
  }
};

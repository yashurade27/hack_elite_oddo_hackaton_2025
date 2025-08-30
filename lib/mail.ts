import nodemailer from "nodemailer";

// Create a transport with Gmail settings from environment variables
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendMail({ 
  to, 
  subject, 
  text, 
  html 
}: { 
  to: string; 
  subject: string; 
  text?: string; 
  html?: string;
}) {
  try {
    const result = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      text,
      html,
    });
    
    console.log(`✅ Email sent successfully to: ${to}`);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("❌ Failed to send email:", error);
    return { success: false, error };
  }
}
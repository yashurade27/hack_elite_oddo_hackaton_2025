import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendMail({
  to,
  subject,
  text,
  html,
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
  } catch (error: any) {
    console.error("❌ Failed to send email:", error.message, error.response);
    return { success: false, error };
  }
}

export interface TicketEmailData {
  ticketNumber: string;
  qrCode: string;
  eventTitle: string;
  venueName: string;
  startDate: Date;
  attendeeName: string;
  additionalInfo?: string;
}
export async function sendTicketEmail(
  recipientEmail: string,
  tickets: TicketEmailData[]
) {
  const html = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background:#f9f9f9; padding:20px; border-radius:10px;">
    <h2 style="text-align:center; color:#2c5282; margin-bottom:20px;">
      🎟️ Your Tickets for <span style="color:#3182ce;">${tickets[0].eventTitle}</span>
    </h2>
    <p style="font-size:15px; color:#333;">Hello <strong>${tickets[0].attendeeName}</strong>,</p>
    <p style="font-size:14px; color:#444;">Thank you for your booking. Here are your e-tickets:</p>

    ${tickets
      .map(
        (t) => `
        <div style="background:#fff; border:1px solid #e2e8f0; border-radius:12px; margin:15px 0; padding:20px; display:flex; align-items:center; box-shadow:0 2px 6px rgba(0,0,0,0.08);">
          <div style="flex:1;">
            <h3 style="margin:0; color:#2d3748;">${t.eventTitle}</h3>
            <p style="margin:6px 0; font-size:14px; color:#4a5568;">
              <strong>Ticket #:</strong> ${t.ticketNumber}<br/>
              <strong>Venue:</strong> ${t.venueName}<br/>
              <strong>Date:</strong> ${t.startDate.toDateString()}<br/>
              ${t.additionalInfo ? `<strong>Info:</strong> ${t.additionalInfo}<br/>` : ""}
            </p>
          </div>
          <div style="margin-left:20px; text-align:center;">
            <img src="${t.qrCode}" alt="QR Code" style="width:120px; height:120px; border:4px solid #e2e8f0; border-radius:8px;" />
            <p style="font-size:12px; color:#718096; margin-top:6px;">Scan at entry</p>
          </div>
        </div>
      `
      )
      .join("")}

    <div style="background:#edf2f7; padding:15px; border-radius:8px; margin-top:25px; font-size:13px; color:#2d3748;">
      <p style="margin:0 0 6px;"><strong>✅ Important Instructions:</strong></p>
      <ul style="margin:0; padding-left:18px;">
        <li>Bring this e-ticket (printed or digital).</li>
        <li>Carry a valid government ID proof.</li>
        <li>Each QR code is unique & valid for one entry only.</li>
        <li>Arrive at least 30 minutes before the event starts.</li>
      </ul>
    </div>

    <p style="text-align:center; margin-top:20px; font-size:13px; color:#555;">
      Powered by <strong style="color:#3182ce;">EventHive</strong>
    </p>
  </div>
  `;

  return sendMail({
    to: recipientEmail,
    subject: `🎟️ Your Tickets for ${tickets[0].eventTitle}`,
    html,
  });
}
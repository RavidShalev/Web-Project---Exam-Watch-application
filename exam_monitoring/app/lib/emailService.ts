import nodemailer from "nodemailer";

// Email utility for sending 2FA codes
// Uses Gmail SMTP (you can change to any email provider)

// Create reusable transporter object using SMTP
const transporter = nodemailer.createTransport({
  service: "gmail", // Using Gmail service
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address (set in .env file)
    pass: process.env.EMAIL_PASS, // Your Gmail App Password (not regular password!)
  },
});

// Function: Send 2FA code to user's email
export async function sendTwoFactorCode(userEmail: string, userName: string, code: string) {
  try {
    // Email content
    const mailOptions = {
      from: `"Exam Watch" <${process.env.EMAIL_USER}>`, // Sender name and email
      to: userEmail, // Recipient email
      subject: "קוד אימות דו-שלבי - Exam Watch", // Email subject
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #17cf97;">שלום ${userName},</h2>
          <p style="font-size: 16px;">התקבלה בקשה להתחברות לחשבון שלך במערכת Exam Watch.</p>
          <p style="font-size: 16px;">קוד האימות שלך הוא:</p>
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px;">
            <h1 style="color: #17cf97; font-size: 36px; letter-spacing: 5px; margin: 0;">${code}</h1>
          </div>
          <p style="font-size: 14px; color: #666;">
            ⏱️ קוד זה תקף ל-<strong>10 דקות</strong> בלבד.
          </p>
          <p style="font-size: 14px; color: #666;">
            🔒 אם לא ביקשת קוד זה, התעלם ממייל זה. החשבון שלך מוגן.
          </p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
          <p style="font-size: 12px; color: #999;">
            מייל זה נשלח אוטומטית ממערכת Exam Watch. אין להשיב למייל זה.
          </p>
        </div>
      `,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}

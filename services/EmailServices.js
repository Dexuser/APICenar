import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail", // Default to Gmail if not specified
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to send an email
// It takes an object with 'to', 'subject', and 'html' properties
export async function sendEmail({ to, subject, html }) {
  try {
    const info = await transporter.sendMail({
      from: `${process.env.EMAIL_USER}`,
      to,
      subject,
      html,
    });

    console.log("Email sent successfully:", info.response);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

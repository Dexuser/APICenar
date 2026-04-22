import { BrevoClient } from '@getbrevo/brevo';
import {} from '@getbrevo/brevo'

const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
});

export async function sendEmail({ to, subject, html }) {
  try {

    const result = await brevo.transactionalEmails.sendTransacEmail({
      subject: subject,
      textContent: html,
      sender: { name: "AppCenar", email: process.env.BREVO_SENDER_EMAIL},
      to: [{ email: to, }],
    });

    console.log('Email sent:', result);

    return result;
  } catch (error) {
    console.error("Error enviando email:", error);
    throw error;
  }
}
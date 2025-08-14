
'use server';
/**
 * @fileOverview An email sending flow.
 *
 * - sendEmail - A function that handles sending emails.
 * - EmailPayload - The input type for the sendEmail function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { Resend } from 'resend';

// This flow is defined but not yet used.
// It will be integrated into the application logic later.

const EmailPayloadSchema = z.object({
  to: z.string().email().describe('The recipient email address.'),
  from: z.string().email().describe('The sender email address. Must be a verified domain on Resend.'),
  subject: z.string().describe('The subject of the email.'),
  html: z.string().describe('The HTML content of the email.'),
});
export type EmailPayload = z.infer<typeof EmailPayloadSchema>;

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmailFlow = ai.defineFlow(
  {
    name: 'sendEmailFlow',
    inputSchema: EmailPayloadSchema,
    outputSchema: z.void(),
  },
  async (payload) => {
    // Ensure the API key is available
    if (!process.env.RESEND_API_KEY) {
        console.error("Resend API Key is not configured. Cannot send email.");
        // In a real app, you might want to throw an error
        // or handle this more gracefully.
        return;
    }
    
    try {
      await resend.emails.send({
        from: payload.from,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
      });
      console.log(`Email sent successfully to ${payload.to}`);
    } catch (error) {
      console.error("Failed to send email:", error);
      // Optionally re-throw the error if you want the caller to handle it
      // throw error;
    }
  }
);

export async function sendEmail(payload: EmailPayload): Promise<void> {
  return sendEmailFlow(payload);
}

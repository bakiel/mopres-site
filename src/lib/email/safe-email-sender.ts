import { Resend } from 'resend';

// Initialize the Resend client
const resendApiKey = process.env.RESEND_API_KEY || 'dummy-key-for-build';
const resend = new Resend(resendApiKey);

/**
 * Promise-Safe Email Sending Function
 * Handles the "object Promise" issue by ensuring everything is resolved
 */
export async function sendEmailSafely(options: {
  to: string[];
  subject: string;
  html: string | Promise<string>;
  text?: string | Promise<string>;
  attachments?: Array<{
    filename: string;
    content: string | Promise<string>;
  }>;
  cc?: string[];
  bcc?: string[];
  replyTo?: string;
}): Promise<{ success: boolean; error?: string }> {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'dummy-key-for-build') {
    return {
      success: false,
      error: 'Email service is not configured: RESEND_API_KEY is missing',
    };
  }

  try {
    console.log(`📧 Attempting to send email: "${options.subject}" to ${options.to.join(', ')}`);
    
    // Ensure 'to' has valid recipients
    if (!options.to || options.to.length === 0 || !options.to[0]) {
      return {
        success: false,
        error: 'No recipient email address provided',
      };
    }
    
    // Ensure html is not a Promise
    let resolvedHtml = options.html;
    if (resolvedHtml instanceof Promise) {
      console.warn('⚠️ HTML content is a Promise! Resolving it before sending...');
      resolvedHtml = await resolvedHtml;
    }
    
    // Ensure text is not a Promise (if provided)
    let resolvedText = options.text;
    if (resolvedText instanceof Promise) {
      console.warn('⚠️ Text content is a Promise! Resolving it before sending...');
      resolvedText = await resolvedText;
    }
    
    // Handle attachments - ensure they're not Promises
    let resolvedAttachments = options.attachments;
    if (resolvedAttachments && resolvedAttachments.length > 0) {
      // Check if any attachment content is a Promise
      const needsResolution = resolvedAttachments.some(att => att.content instanceof Promise);
      
      if (needsResolution) {
        console.warn('⚠️ Some attachment contents are Promises! Resolving them...');
        resolvedAttachments = await Promise.all(
          resolvedAttachments.map(async (att) => ({
            ...att,
            content: att.content instanceof Promise ? await att.content : att.content
          }))
        );
      }
    }

    // Send the email with all resolved content
    const { data, error } = await resend.emails.send({
      from: 'MoPres Fashion <onboarding@resend.dev>', // Using Resend's verified domain
      to: options.to,
      subject: options.subject,
      html: resolvedHtml,
      text: resolvedText,
      attachments: resolvedAttachments,
      cc: options.cc,
      bcc: options.bcc,
      reply_to: options.replyTo || 'info@mopres.co.za',
    });

    if (error) {
      console.error('❌ Error from Resend API:', error);
      let errorDetails = error.message;
      if (error.statusCode) {
        errorDetails += ` (Status: ${error.statusCode})`;
      }
      return {
        success: false,
        error: errorDetails,
      };
    }

    console.log(`✅ Email sent successfully with ID: ${data?.id}`);
    return {
      success: true,
    };
  } catch (error) {
    console.error('❌ Exception when sending email:', error);
    
    return {
      success: false,
      error: error instanceof Error 
        ? `${error.name}: ${error.message}` 
        : 'Unknown error occurred while sending email',
    };
  }
}
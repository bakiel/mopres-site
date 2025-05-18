import { Resend } from 'resend';

// Initialize the Resend client
// Make sure to add RESEND_API_KEY to your .env file
const resendApiKey = process.env.RESEND_API_KEY;

// Log if API key is missing but don't crash
if (!resendApiKey) {
  console.warn('⚠️ RESEND_API_KEY is not set in environment variables');
}

// Create the Resend client
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export type Attachment = {
  filename: string;
  content: string; // Base64 encoded content
};

type SendEmailParams = {
  to: string[];
  subject: string;
  html: string;
  text?: string;
  attachments?: Attachment[];
  cc?: string[];
  bcc?: string[];
  replyTo?: string;
};

/**
 * Sends an email using the Resend API
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
  attachments,
  cc,
  bcc,
  replyTo,
}: SendEmailParams): Promise<{ success: boolean; error?: string }> {
  // Enhanced error handling and logging
  if (!resendApiKey) {
    const error = 'RESEND_API_KEY is not set in environment variables';
    console.error('❌ ' + error);
    return {
      success: false,
      error: 'Email service is not properly configured: API key missing',
    };
  }

  if (!resend) {
    const error = 'Resend client could not be initialized';
    console.error('❌ ' + error);
    return {
      success: false,
      error: 'Email service is not configured properly',
    };
  }

  try {
    console.log(`📧 Attempting to send email: "${subject}" to ${to.join(', ')}`);
    
    // Verify that 'to' has valid recipients
    if (!to || to.length === 0 || !to[0]) {
      const error = 'No recipient email address provided';
      console.error('❌ ' + error);
      return {
        success: false,
        error,
      };
    }
    
    // FIX: Ensure html parameter is not a Promise
    let resolvedHtml = html;
    if (html instanceof Promise) {
      console.warn('⚠️ HTML content is a Promise! Resolving it before sending...');
      resolvedHtml = await html;
    }
    
    // Log email size for debugging
    const estimatedSize = Buffer.from(resolvedHtml || '').length / 1024;
    console.log(`Email content size: ~${estimatedSize.toFixed(2)} KB`);
    
    // Handle attachments size and ensure they're not Promises
    let resolvedAttachments = attachments;
    if (attachments && attachments.length > 0) {
      // Check if any attachment content is a Promise
      const needsResolution = attachments.some(att => att.content instanceof Promise);
      
      if (needsResolution) {
        console.warn('⚠️ Some attachment contents are Promises! Resolving them...');
        resolvedAttachments = await Promise.all(
          attachments.map(async (att) => ({
            ...att,
            content: att.content instanceof Promise ? await att.content : att.content
          }))
        );
      }
      
      let totalAttachmentSize = 0;
      for (const attachment of resolvedAttachments) {
        // Estimate base64 size (base64 adds ~33% overhead)
        const base64Size = Buffer.from(attachment.content, 'base64').length / 1024;
        totalAttachmentSize += base64Size;
        console.log(`Attachment: ${attachment.filename}, size: ~${base64Size.toFixed(2)} KB`);
      }
      console.log(`Total attachments size: ~${totalAttachmentSize.toFixed(2)} KB`);
      
      // Warn if attachments are large
      if (totalAttachmentSize > 5000) {
        console.warn('⚠️ Large attachment size may cause issues with email delivery');
      }
    }

    const { data, error } = await resend.emails.send({
      from: 'MoPres Fashion <onboarding@resend.dev>', // Using Resend's verified domain
      to,
      subject,
      html: resolvedHtml,
      text,
      attachments: resolvedAttachments,
      cc,
      bcc,
      reply_to: replyTo || 'info@mopres.co.za',
    });

    if (error) {
      console.error('❌ Error from Resend API:', error);
      // Enhanced error details
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
    // Log detailed error information
    console.error('❌ Exception when sending email:');
    if (error instanceof Error) {
      console.error(`- Name: ${error.name}`);
      console.error(`- Message: ${error.message}`);
      console.error(`- Stack: ${error.stack}`);
    } else {
      console.error(error);
    }
    
    return {
      success: false,
      error: error instanceof Error 
        ? `${error.name}: ${error.message}` 
        : 'Unknown error occurred while sending email',
    };
  }
}

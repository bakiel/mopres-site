/**
 * Promise-Safe Email Utility for MoPres
 * 
 * This module provides a robust, promise-safe wrapper around the email
 * sending functionality to fix issues with [object Promise] appearing in emails
 * and attachments not working properly.
 * 
 * Simply use this instead of the direct Resend functionality.
 */

// Import dependencies
const { Resend } = require('resend');

/**
 * Safely checks if a value is a Promise and awaits it if necessary
 * @param {any} value The value to check
 * @returns {Promise<any>} The resolved value
 */
async function ensureResolved(value) {
  // Check if it's a Promise
  if (value instanceof Promise) {
    // Log warning for debugging
    console.warn('⚠️ Promise detected! Awaiting it before use...');
    return await value;
  }
  return value;
}

/**
 * Safely checks if a value is an object with Promise properties and resolves them
 * @param {Object} obj The object to check
 * @returns {Promise<Object>} The object with all promises resolved
 */
async function resolveObjectPromises(obj) {
  // If not an object or null, just return it
  if (!obj || typeof obj !== 'object') return obj;
  
  // Create a copy of the object with all promises resolved
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = await ensureResolved(value);
  }
  
  return result;
}

/**
 * Safely sends an email with proper Promise handling
 * @param {Object} options Email options
 * @param {string} options.apiKey Resend API key
 * @param {string} options.from Sender email
 * @param {string[]} options.to Recipients
 * @param {string} options.subject Email subject
 * @param {string|Promise<string>} options.html Email HTML content
 * @param {string} [options.text] Plain text content
 * @param {Array} [options.attachments] Attachments
 * @param {string[]} [options.cc] CC recipients
 * @param {string[]} [options.bcc] BCC recipients
 * @param {string} [options.replyTo] Reply-to address
 * @returns {Promise<Object>} Result of sending
 */
async function sendPromiseSafeEmail({
  apiKey,
  from,
  to,
  subject,
  html,
  text,
  attachments,
  cc,
  bcc,
  replyTo
}) {
  try {
    // Check if API key is provided
    if (!apiKey) {
      throw new Error('Resend API key is required');
    }
    
    // Initialize Resend
    const resend = new Resend(apiKey);
    
    // Ensure all values are properly resolved
    const resolvedHtml = await ensureResolved(html);
    const resolvedText = await ensureResolved(text);
    
    // Handle attachments if provided
    let resolvedAttachments;
    if (attachments && Array.isArray(attachments)) {
      resolvedAttachments = await Promise.all(attachments.map(async (attachment) => {
        // Ensure content is resolved
        const content = await ensureResolved(attachment.content);
        return {
          ...attachment,
          content
        };
      }));
    }
    
    // Prepare email options with all promises resolved
    const emailOptions = {
      from,
      to,
      subject,
      html: resolvedHtml,
      text: resolvedText,
      attachments: resolvedAttachments,
      cc,
      bcc,
      reply_to: replyTo
    };
    
    // Send the email
    const { data, error } = await resend.emails.send(emailOptions);
    
    if (error) {
      throw new Error(`Resend API error: ${error.message}`);
    }
    
    return {
      success: true,
      id: data?.id,
      message: 'Email sent successfully'
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message,
      details: error.stack
    };
  }
}

/**
 * Creates a reusable email sender with a specific API key
 * @param {string} apiKey Resend API key
 * @returns {Function} Configured email sender function
 */
function createEmailSender(apiKey) {
  return async function(options) {
    return sendPromiseSafeEmail({
      ...options,
      apiKey
    });
  };
}

// Export the module
module.exports = {
  sendPromiseSafeEmail,
  createEmailSender,
  ensureResolved,
  resolveObjectPromises
};

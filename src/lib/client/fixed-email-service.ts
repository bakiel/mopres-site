'use client';

/**
 * Fixed client-side service for sending order emails
 * This version properly handles Promise-related issues
 */

/**
 * Send order confirmation and invoice emails for an order
 * @param orderId - The ID of the order
 * @param generateNewInvoice - Whether to generate a new invoice or use existing one
 * @returns Promise with the result
 */
export async function sendOrderEmails(
  orderId: string,
  generateNewInvoice: boolean = false
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    console.log(`📧 Sending order emails for order ${orderId}`);
    
    // First, set a timeout for the fetch operation
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
    
    const response = await fetch('/api/orders/send-emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer mopres-order-emails-api-key-2025`
      },
      body: JSON.stringify({
        orderId,
        generateNewInvoice
      }),
      signal: controller.signal
    }).finally(() => {
      clearTimeout(timeoutId);
    });
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    console.log(`Response content type: ${contentType}`);
    
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json();
        console.log('Received JSON response:', data);
      } catch (parseError) {
        console.error('Error parsing JSON response:', parseError);
        const text = await response.text();
        console.error('Response text:', text);
        throw new Error('Failed to parse JSON response from server');
      }
    } else {
      // If not JSON, get text and log it for debugging
      const text = await response.text();
      console.error('Non-JSON response from server:', text);
      
      // Try to check if it's an HTML error page (common in Next.js when there's a server error)
      if (text.includes('DOCTYPE html') || text.includes('<html')) {
        console.error('Received HTML instead of JSON. This indicates a server-side error.');
        throw new Error('Server returned an error page instead of JSON. Check server logs for details.');
      } else {
        throw new Error('Server returned non-JSON response. This may indicate a server error.');
      }
    }
    
    if (!response.ok) {
      console.error('Server returned error status:', response.status, response.statusText);
      return {
        success: false,
        error: data?.error || `Server error (${response.status}): ${response.statusText}`
      };
    }
    
    return {
      success: true,
      message: data.message || 'Order emails sent successfully'
    };
  } catch (error) {
    console.error('Error sending order emails:', error);
    
    // More specific error messages based on error type
    if (error instanceof TypeError && error.message.includes('NetworkError')) {
      return {
        success: false,
        error: 'Network error: Unable to connect to the server. Please check your internet connection.'
      };
    }
    
    if (error instanceof DOMException && error.name === 'AbortError') {
      return {
        success: false,
        error: 'Request timed out. The server took too long to respond.'
      };
    }
    
    return {
      success: false,
      error: error instanceof Error 
        ? `Error: ${error.message}` 
        : 'Unknown error occurred while sending emails'
    };
  }
}

/**
 * Send only the invoice email for an order
 * @param orderId - The ID of the order
 * @returns Promise with the result
 */
export async function sendInvoiceEmail(
  orderId: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const response = await fetch('/api/invoices/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer invoice-mopres-api-key-2025`
      },
      body: JSON.stringify({
        orderId
      })
    });
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // If not JSON, get text and log it for debugging
      const text = await response.text();
      console.error('Non-JSON response from server:', text);
      throw new Error('Server returned non-JSON response. This may indicate a server error.');
    }
    
    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to send invoice email'
      };
    }
    
    return {
      success: true,
      message: data.message || 'Invoice email sent successfully'
    };
  } catch (error) {
    console.error('Error sending invoice email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
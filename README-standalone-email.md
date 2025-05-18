# MoPres Standalone Email Solution

This module provides a standalone, Promise-safe email service for MoPres, specifically designed to avoid `[object Promise]` issues and unreliable PDF attachments.

## Overview

The prior email system using React Email templates was encountering issues with Promise handling, resulting in `[object Promise]` being displayed in emails and issues with PDF attachments. This new solution:

1. **Bypasses React Email completely** - Uses direct HTML templates instead of React components
2. **Prevents Promise-related issues** - Uses fully synchronous code for template generation
3. **Provides more reliable PDF handling** - Uses HTML-based invoices with an optional PDF attachment approach
4. **Works in multiple environments** - Functions in both Edge Function and Node.js environments

## Components

### 1. Standalone Email Service
**File**: `/src/lib/email/standalone-email-service.ts`

This core service handles:
- Order data fetching
- Invoice HTML generation 
- Order confirmation email HTML generation
- Email sending with proper attachment handling
- HTML invoice storage as a fallback for PDF attachments

### 2. Standalone Edge Function
**File**: `/supabase/functions/send-invoice-email-standalone/index.ts`

A Supabase Edge Function that:
- Takes the same API as the original function
- Uses the standalone approach for email generation
- Handles PDF attachments when available
- Stores HTML versions of invoices as a backup
- Provides links to online invoice versions when PDFs aren't available

### 3. Node.js Script for Direct Email Sending
**File**: `/scripts/send-invoice-email.js`

A command-line tool that:
- Allows sending invoice emails from the command line
- Supports testing with a different recipient
- Can enable/disable invoice attachments
- Provides detailed output for debugging

### 4. Test Script for Validating the Standalone Service
**File**: `/test-standalone-email.js`

A debugging tool that:
- Tests each component of the standalone email service
- Generates and saves HTML templates for inspection
- Validates order data fetching
- Allows optional test email sending

## Usage

### Sending Emails from Edge Function

Make HTTP requests to the Edge Function URL with:

```json
{
  "orderRef": "ORDER12345",
  "includeInvoice": true,
  "testEmail": "test@example.com" // Optional
}
```

### Sending Emails from Command Line

```bash
# Send invoice email to customer
node scripts/send-invoice-email.js ORDER12345

# Send to test email without invoice
node scripts/send-invoice-email.js ORDER12345 --test-email=test@example.com --no-invoice
```

### Testing the Implementation

```bash
# Run the test script to validate services
node test-standalone-email.js ORDER12345 test@example.com
```

## Implementation Details

### HTML Templates

The solution uses direct HTML generation instead of React components:

1. **Invoice Template**: A professionally formatted HTML invoice with styling
2. **Order Confirmation Template**: Customer-friendly email with order details and payment instructions

Both templates are generated synchronously, avoiding any Promise-related issues.

### PDF Handling Strategy

1. **Primary Option**: Attach PDF from storage if available
2. **Backup Option**: Generate and store HTML invoice, provide link in email
3. **Fallback Option**: Include all details directly in email if HTML storage fails

### Error Handling

- Comprehensive error logging throughout the process
- Graceful fallbacks when attachments can't be generated
- Detailed error responses from the Edge Function

## Benefits

1. **No more `[object Promise]` issues** - All HTML generation is synchronous
2. **More reliable PDF handling** - Provides multiple approaches to ensure invoices are accessible
3. **Direct debugging** - Test scripts make it easy to diagnose issues
4. **Simplified maintenance** - No React Email dependencies to manage
5. **Self-contained solution** - Can function independently of complex template rendering systems

## Deployment

To deploy the new standalone Edge Function:

```bash
cd supabase/functions/send-invoice-email-standalone
supabase functions deploy
```

Make sure to set the following environment variables:
- `SB_URL` - Supabase URL
- `SB_SERVICE_ROLE_KEY` - Supabase service role key
- `RESEND_API_KEY` - Resend API key
- `EMAIL_FROM` - Sender email address (optional, defaults to info@mopres.co.za)

## Future Improvements

- Add a PDF generation service using Puppeteer or a similar library
- Implement a queue system for handling email sending in batches
- Add tracking and analytics for email delivery and opening

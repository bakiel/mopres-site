# Invoice Email System Implementation Guide

## Overview

This document provides step-by-step instructions for implementing the invoice email system using the Resend API in MoPres. The system allows for generating and sending invoice PDFs via email to customers.

## Features

- **React Email Templates**: Professional, responsive email designs with MoPres branding
- **PDF Attachments**: Automatic PDF generation and attachment to emails
- **Supabase Integration**: PDF storage and edge functions for email delivery
- **Client-Side Interface**: Email invoice button in the order details page
- **Server-Side Processing**: Secure API endpoints and Supabase Edge Functions
- **Proper Banking Info**: All banking details included for EFT payments

## Prerequisites

Before starting the implementation, ensure you have:

1. A [Resend](https://resend.com) account (for email delivery)
2. Access to your Supabase project settings
3. Node.js and npm installed for development

## Installation Steps

### 1. Install Required Packages

```bash
# Add Resend and React Email packages
npm install resend @react-email/components
```

### 2. Configure Environment Variables

Copy the example environment variables file and fill in the values:

```bash
cp .env.example .env.local
```

Add the following values to your `.env.local` file:

- **RESEND_API_KEY**: Your Resend API key (from resend.com dashboard)
- **NEXT_PUBLIC_INVOICE_API_KEY**: Create a secure key for API authentication
- **SUPABASE_SERVICE_ROLE_KEY**: Your Supabase service role key (for server operations)

### 3. Deploy Supabase Edge Functions

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy edge functions
supabase functions deploy upload-invoice
supabase functions deploy send-invoice-email

# Set the environment variables for the functions
supabase secrets set RESEND_API_KEY=your_resend_api_key
```

### 4. Create a Storage Bucket for Invoices

If you haven't already created an 'invoices' bucket in Supabase Storage:

1. Go to your Supabase dashboard
2. Navigate to Storage
3. Create a new bucket named 'invoices'
4. Configure the bucket for public access:
   - Set the access control to "Public"
   - Enable file previews for PDFs

## How It Works

### Email Sending Process

1. The customer views their order details in the browser
2. When they click "Send Invoice Email":
   - The system checks if a PDF already exists in storage
   - If not, it generates one and uploads it
   - The email is sent with the PDF attached

### File Structure

```
/src
  /app
    /api
      /invoices
        /send-email
          route.ts      # API endpoint for sending emails
  /lib
    /email
      /templates
        InvoiceEmail.tsx  # React Email template
      invoice-service.ts  # Service for generating & sending invoices
      pdf-utils.ts        # Utilities for PDF generation & handling
      render-template.ts  # Utility to render React Email templates
      resend.ts           # Resend API client wrapper
  /components
    OrderDetailsClient.tsx  # Updated with "Send Invoice" button
    InvoiceTemplateOptimized.tsx  # Invoice template for PDFs

/supabase
  /functions
    /upload-invoice
      index.ts  # Edge function to upload PDF to storage
    /send-invoice-email
      index.ts  # Edge function to send emails with attachments
```

## Testing

A test script is provided to verify the email sending functionality:

```bash
# Run the test script
node scripts/test-invoice-email.js
```

The script will:
1. Find a recent order
2. Check if an invoice PDF exists in storage
3. Test sending an email with the invoice attached

## Troubleshooting

### Common Issues

1. **Email not sending**: 
   - Check your Resend API key
   - Verify domain verification in Resend dashboard

2. **PDF not generating**:
   - Check the browser console for errors
   - Ensure html2canvas and jsPDF are properly loaded

3. **Edge function errors**:
   - Check Supabase logs for detailed error information
   - Ensure environment variables are correctly set

### Debugging Tips

- Use `console.log` statements in edge functions and check logs in Supabase dashboard
- Test email sending directly with the Resend API in a separate script
- Verify PDF generation works properly before testing email sending

## Future Enhancements

1. **Invoice Queue System**: Implement a queue for high-volume periods
2. **Email Templates Admin**: Create an admin interface for editing email templates
3. **Read Receipts**: Track when customers open invoice emails
4. **Scheduling**: Allow scheduling invoice emails for specific times

## Support

For questions or issues with this implementation, contact support@mopres.co.za.

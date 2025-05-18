# MoPres Invoice Email System - Handoff Document

## Overview

This document provides the necessary context and information to continue developing and maintaining the MoPres Invoice Email System. It's designed to help future developers understand the current implementation, available tools, and ongoing tasks.

## Project Structure

The invoice email system spans several areas of the application:

```
/src
  /app
    /api/invoices                  # API endpoints
      /send-email/route.ts         # Sends invoice emails
      /test-email/route.ts         # Simple test endpoint
      /upload/route.ts             # Uploads PDFs to storage
    /checkout/confirmation         # Order confirmation page
      page.tsx                     # Includes invoice email integration
  /components
    InvoiceTemplateOptimized.tsx   # Invoice PDF template
  /lib
    /email                         # Email service layer
      /templates                   # React Email templates
        InvoiceEmail.tsx           # Invoice email template
      invoice-service.ts           # Invoice service
      pdf-utils.ts                 # PDF utilities
      render-template.ts           # React Email renderer
      resend.ts                    # Resend API client

/supabase
  /functions                       # Supabase Edge Functions
    /upload-invoice                # PDF storage function
    /send-invoice-email            # Email sending function

/scripts                           # Utility scripts
  test-resend.js                   # Test Resend API
  upload-test-invoice.js           # Upload test invoice
  send-pending-invoices.js         # Bulk send invoices
  
/docs                              # Documentation
  invoice-email-resend-implementation.md  # Implementation guide
  invoice-email-maintenance.md            # Maintenance guide
  DEPLOYMENT-GUIDE.md                     # Deployment instructions
  DOMAIN-VERIFICATION-GUIDE.md            # Domain verification guide
```

## Key Components

1. **Email Service Layer**:
   - Resend API integration for reliable email delivery
   - React Email templates for professional emails
   - PDF generation and handling utilities

2. **API Endpoints**:
   - NextJS API routes for invoice operations
   - Supabase Edge Functions for server-side processing

3. **UI Integration**:
   - Order Confirmation page with automatic email sending
   - Email and Download buttons for user-triggered actions

4. **Storage**:
   - Supabase Storage for invoice PDFs
   - Public URLs for invoice access

## Available Tools

### API Keys and Credentials

- **Resend API Key**: `re_ErrSkKC1_JsQNApC189RYtU8Z5aEiB1T8`
- **Supabase URL**: `https://gfbedvoexpulmmfitxje.supabase.co`
- **Supabase Service Role Key**: `[REDACTED - DO NOT COMMIT ACTUAL KEY HERE, STORE IN ENV VARS]`
- **Invoice API Key**: `invoice-mopres-api-key-2025`

### Testing Scripts

- **test-resend.js**: Tests basic email sending
- **create-bucket.js**: Creates/verifies 'invoices' storage bucket
- **upload-test-invoice.js**: Creates and uploads a test invoice
- **get-order-id.js**: Finds a valid order for testing
- **test-api-simple.js**: Tests the API endpoint
- **send-pending-invoices.js**: Bulk sends pending invoices

### Deployment Tools

- **setup-invoice-email.sh**: Sets up Supabase environment
- **deploy-functions.sh**: Deploys edge functions
- **update-domain.js**: Updates email addresses after domain verification

## Current Status

The invoice email system is fully implemented and ready for deployment. The system:

1. Automatically generates and sends invoice emails when an order is confirmed
2. Provides UI buttons for manually sending/downloading invoices
3. Stores all invoices in Supabase for future reference

## Next Steps

1. **Deploy Edge Functions**:
   - Follow the instructions in DEPLOYMENT-GUIDE.md
   - Use the Supabase token for authentication

2. **Deploy to Vercel**:
   - Add the environment variables as specified
   - Make sure to include the fix for Next.js App Router compatibility

3. **Verify Domain**:
   - Follow the steps in DOMAIN-VERIFICATION-GUIDE.md
   - Run update-domain.js after verification

4. **Test Live System**:
   - Complete a test purchase
   - Verify email delivery

## Common Operations

### Adding a New Email Template

1. Create a new file in `/src/lib/email/templates/`
2. Import and use it in the appropriate service

### Modifying the Invoice Template

1. Edit `/src/components/InvoiceTemplateOptimized.tsx`
2. Test with the download functionality before deploying

### Troubleshooting Failed Emails

1. Check Resend dashboard for delivery issues
2. Verify Supabase Storage access
3. Check server logs for API errors
4. Use testing scripts to verify components

## Documentation References

- [README-invoice-email.md](./README-invoice-email.md): Overview of the system
- [invoice-email-resend-implementation.md](./docs/invoice-email-resend-implementation.md): Detailed implementation guide
- [invoice-email-maintenance.md](./docs/invoice-email-maintenance.md): Maintenance instructions
- [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md): Deployment steps
- [DOMAIN-VERIFICATION-GUIDE.md](./DOMAIN-VERIFICATION-GUIDE.md): Domain verification guide

## Support Channels

For issues with the invoice email system:

- **Technical Support**: support@mopres.co.za
- **Email Service**: [Resend Dashboard](https://resend.com/dashboard)
- **Storage Service**: [Supabase Dashboard](https://app.supabase.com)

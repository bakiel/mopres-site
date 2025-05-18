# MoPres Invoice Email System

This document provides an overview and instructions for using the MoPres Invoice Email System.

## Overview

The Invoice Email System automates the process of sending professionally formatted invoice emails to customers after they complete their purchase. The system includes:

1. PDF invoice generation
2. Secure storage in Supabase
3. Professional email delivery via Resend
4. Order tracking and customer communications

## Features

- Professional HTML email template with MoPres branding
- Attached PDF invoice
- Online invoice viewing via public URL
- Payment instructions with banking details
- Mobile-responsive design
- Personalized customer information

## Configuration

### Environment Variables

Make sure these environment variables are set:

```
RESEND_API_KEY=your_resend_api_key
SUPABASE_URL=https://gfbedvoexpulmmfitxje.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
```

### Domain Verification

For production use, you need to verify your domain (mopres.co.za) with Resend:

1. Follow the steps in [DOMAIN-VERIFICATION-GUIDE.md](./docs/DOMAIN-VERIFICATION-GUIDE.md)
2. Update the "from" email in `src/lib/email/resend.ts` to use your verified domain

## Usage

### Automatic Invoice Emails

Invoices are automatically sent when an order is confirmed. The `OrderConfirmation` page includes code to:

1. Generate the invoice PDF
2. Upload it to Supabase storage
3. Send the invoice email to the customer

### Manual Testing

To manually test the invoice email system:

```bash
# Run the test script
node scripts/test-official-invoice.js
```

This will:
1. Find a recent order in your database
2. Generate a test invoice if needed
3. Send an invoice email using the API endpoint

### API Endpoint

The system exposes an API endpoint for sending invoice emails:

```
POST /api/invoices/send-email
```

Required headers:
- Content-Type: application/json
- Authorization: Bearer invoice-mopres-api-key-2025

Request body:
```json
{
  "orderId": "order-uuid-here"
}
```

## Implementation Details

### Key Components

1. **Email Template** (`src/lib/email/templates/InvoiceEmail.tsx`)
   - React Email template for the invoice email

2. **Email Service** (`src/lib/email/invoice-service.ts`)
   - Service for rendering and sending emails

3. **Resend Integration** (`src/lib/email/resend.ts`)
   - Configuration for the Resend email service

4. **API Endpoint** (`src/app/api/invoices/send-email/route.ts`)
   - API route for sending invoice emails

5. **Order Confirmation Page** (`src/app/checkout/confirmation/page.tsx`)
   - Frontend integration for automatic email sending

### Customizations

To customize the invoice email:

1. Edit the InvoiceEmail.tsx template
2. Update the styling to match your branding
3. Modify the content and layout as needed

## Production Deployment

Before deploying to production:

1. Verify your domain with Resend
2. Test the system thoroughly
3. Go through the [INVOICE-EMAIL-PRODUCTION-CHECKLIST.md](./docs/INVOICE-EMAIL-PRODUCTION-CHECKLIST.md)

## Troubleshooting

Common issues and solutions:

1. **Email not sending**
   - Check that RESEND_API_KEY is valid
   - Verify server logs for specific errors

2. **PDF generation issues**
   - Ensure the invoice template is properly formatted
   - Check that the 'invoices' bucket exists in Supabase

3. **Domain verification errors**
   - Follow the domain verification guide
   - Make sure DNS records are properly set

## Support

For assistance with the invoice email system:

- Technical support: info@mopres.co.za
- Documentation: See the [docs](./docs) directory

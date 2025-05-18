# MoPres Invoice Email System - Setup Guide

This guide will help you set up the invoice email system with your specific configuration.

## Prerequisites

- Access to your Supabase project: `gfbedvoexpulmmfitxje`
- Access to your Resend account
- Node.js installed on your machine

## 1. Environment Setup

Your `.env.local` file has been created with:
- Resend API Key
- Supabase Service Role Key
- Invoice API Key for securing the endpoint

## 2. Supabase Storage Setup

You need to create an "invoices" bucket in Supabase storage:

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project: `gfbedvoexpulmmfitxje`
3. Navigate to Storage in the left sidebar
4. Click "Create bucket"
5. Name the bucket "invoices"
6. Set the bucket visibility to "Public"
7. Configure CORS if needed (typically not required for this use case)

## 3. Deploy Edge Functions

You can use the provided setup script:

```bash
./setup-invoice-email.sh
```

Or deploy manually:

```bash
# Login to Supabase
supabase login

# Link your project
supabase link --project-ref gfbedvoexpulmmfitxje

# Set secrets
supabase secrets set RESEND_API_KEY=re_ErrSkKC1_JsQNApC189RYtU8Z5aEiB1T8

# Deploy functions
supabase functions deploy upload-invoice
supabase functions deploy send-invoice-email
```

## 4. Test the System

Run the test script to verify the email delivery:

```bash
node scripts/test-invoice-email.js
```

The script will:
1. Find a recent order
2. Check if an invoice PDF exists in storage
3. Test sending an email to the customer

## 5. Domain Verification (Important!)

For optimal email deliverability with Resend:

1. Go to [Resend Dashboard](https://resend.com/domains)
2. Add and verify your domain: `mopres.co.za`
3. Follow the DNS verification instructions
4. Once verified, update the "from" address in:
   - `/src/lib/email/resend.ts`
   - `/supabase/functions/send-invoice-email/index.ts`

## Troubleshooting

### Email Delivery Issues
- Check Resend logs in their dashboard
- Verify domain configuration
- Test with a personal email first

### PDF Generation Issues
- Check browser console for errors
- Ensure InvoiceTemplateOptimized component renders correctly

### Edge Function Issues
- Check logs in Supabase dashboard
- Verify API keys and environment variables

For any additional help, refer to the comprehensive documentation in:
`/Users/mac/Downloads/Mopres/mopres-nextjs/docs/invoice-email-resend-implementation.md`

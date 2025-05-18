# Supabase Edge Functions Deployment Guide

Follow these steps to deploy the invoice email system functions to Supabase:

## Prerequisites
- Supabase CLI installed
- Your access token: `sbp_489c09a0ba1c1d5ea6e6b29972589981a73041ff`

## Step 1: Login to Supabase CLI

```bash
supabase login
```

When prompted, paste your access token:
```
sbp_489c09a0ba1c1d5ea6e6b29972589981a73041ff
```

## Step 2: Link Your Project

```bash
supabase link --project-ref gfbedvoexpulmmfitxje
```

If prompted for a database password, leave it blank by just pressing Enter.

## Step 3: Set Secrets

```bash
supabase secrets set RESEND_API_KEY=re_ErrSkKC1_JsQNApC189RYtU8Z5aEiB1T8
```

## Step 4: Deploy Functions

```bash
supabase functions deploy upload-invoice
supabase functions deploy send-invoice-email
```

## Step 5: Verify Deployment

Check that your functions are deployed by listing them:

```bash
supabase functions list
```

You should see both functions listed.

## Step 6: Test the Functions

Run the test script to verify the email sending works:

```bash
node scripts/test-invoice-email.js
```

## Step 7: Configure for Production

After you've verified your domain `mopres.co.za` in Resend, run:

```bash
node update-domain.js
```

Then redeploy the send-invoice-email function:

```bash
supabase functions deploy send-invoice-email
```

## Vercel Environment Variables

When deploying to Vercel, add these environment variables:

- `RESEND_API_KEY`: re_ErrSkKC1_JsQNApC189RYtU8Z5aEiB1T8
- `SUPABASE_SERVICE_ROLE_KEY`: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmYmVkdm9leHB1bG1tZml0eGplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTI0NjU1MCwiZXhwIjoyMDYwODIyNTUwfQ.I3wR6D-H9_BBJRjjY1CiD2pnX7aRgRbkgnOzCnmh70s
- `NEXT_PUBLIC_INVOICE_API_KEY`: invoice-mopres-api-key-2025

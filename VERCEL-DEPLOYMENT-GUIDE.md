# Vercel Deployment Guide for MoPres Invoice Email System

This guide will help you deploy the MoPres Next.js application with the invoice email system to Vercel.

## Prerequisites

- A [Vercel](https://vercel.com) account
- Your GitHub repository connected to Vercel
- Access to the required API keys

## Step 1: Prepare Your Repository

Ensure that all the invoice email system files are committed to your GitHub repository:

```bash
# From your project directory
git add .
git commit -m "Add invoice email system with Resend API"
git push
```

## Step 2: Create a New Vercel Project

If you don't already have a Vercel project:

1. Go to [https://vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Configure the project with Next.js framework preset
4. Click "Deploy"

## Step 3: Add Environment Variables

After the initial deployment, add your environment variables:

1. Go to your project dashboard in Vercel
2. Navigate to "Settings" → "Environment Variables"
3. Add the following variables:

| Name | Value | Environments |
|------|-------|--------------|
| `RESEND_API_KEY` | `re_ErrSkKC1_JsQNApC189RYtU8Z5aEiB1T8` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmYmVkdm9leHB1bG1tZml0eGplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTI0NjU1MCwiZXhwIjoyMDYwODIyNTUwfQ.I3wR6D-H9_BBJRjjY1CiD2pnX7aRgRbkgnOzCnmh70s` | Production, Preview, Development |
| `NEXT_PUBLIC_INVOICE_API_KEY` | `invoice-mopres-api-key-2025` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://gfbedvoexpulmmfitxje.supabase.co` | Production, Preview, Development |

4. Click "Save"

## Step 4: Redeploy Your Application

After adding the environment variables:

1. Go to the "Deployments" tab
2. Click "Redeploy" on your latest deployment
3. Wait for the deployment to complete

## Step 5: Configure Custom Domain

If you want to use mopres.co.za as your domain:

1. Go to "Settings" → "Domains"
2. Add your domain: `mopres.co.za`
3. Follow Vercel's instructions to verify domain ownership
4. Update DNS records as instructed

## Step 6: Test the Deployment

After deployment is complete:

1. Visit your deployed site (e.g., https://mopres-site.vercel.app/ or your custom domain)
2. Navigate to an order details page
3. Test the "Send Invoice Email" functionality

## Step 7: Monitor and Troubleshoot

Use Vercel's built-in monitoring tools:

1. Check "Logs" for any errors
2. Use "Functions" to inspect API route performance
3. Set up "Analytics" to track usage patterns

## Important Notes

- Make sure your Supabase Edge Functions are deployed (see `DEPLOYMENT-GUIDE.md`)
- Verify your domain in Resend for production emails (see `DOMAIN-VERIFICATION-GUIDE.md`)
- The initial emails will use the Resend onboarding domain until domain verification is complete

## Custom Build Settings (If Needed)

If you encounter build issues, you may need to customize your build settings:

1. Go to "Settings" → "General"
2. Under "Build & Development Settings":
   - Framework Preset: Next.js
   - Build Command: `next build`
   - Output Directory: `.next`
   - Install Command: `npm install`
   - Development Command: `next dev`

## Continuous Deployment

Vercel will automatically deploy changes when you push to your repository. To customize this behavior:

1. Go to "Settings" → "Git"
2. Configure Production Branch and Preview Branches as needed

The invoice email system is now deployed and ready to use!

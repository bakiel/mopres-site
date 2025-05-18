# Resend Domain Verification Guide for mopres.co.za

This guide will help you verify the mopres.co.za domain in Resend to enable sending emails from your custom domain.

## Why Verify Your Domain?

- **Better Deliverability**: Emails from verified domains are less likely to be marked as spam
- **Professional Branding**: Send emails from info@mopres.co.za instead of onboarding@resend.dev
- **Sender Reputation**: Build a positive sending reputation for your domain

## Step 1: Access Resend Dashboard

1. Go to [https://resend.com/login](https://resend.com/login)
2. Log in with your credentials
3. Navigate to [https://resend.com/domains](https://resend.com/domains)

## Step 2: Add Your Domain

1. Click "Add Domain"
2. Enter `mopres.co.za` as your domain
3. Click "Add"

## Step 3: Set Up DNS Records

Resend will provide DNS records that you need to add to your domain's DNS configuration. Typically, you'll need to add:

1. **TXT Records** for domain verification
2. **DKIM Records** for email authentication
3. **SPF Records** to authorize Resend to send on your behalf
4. **DMARC Records** for enhanced security

Copy these records and add them to your DNS provider for mopres.co.za (likely where you registered the domain or your hosting provider's control panel).

## Step 4: Verify Domain

After adding the DNS records:

1. Click "Verify Domain" in the Resend dashboard
2. Wait for the verification process to complete (can take up to 24 hours due to DNS propagation)

## Step 5: Update Email Addresses

Once the domain is verified, run the update script to use your verified domain:

```bash
node update-domain.js
```

This will update the email addresses in the code from:
- `onboarding@resend.dev` to `info@mopres.co.za`
- `bakielisrael@gmail.com` to `info@mopres.co.za` (for reply-to)

## Step 6: Redeploy

After updating the domain, redeploy your application:

1. Redeploy the Supabase function:
   ```bash
   supabase functions deploy send-invoice-email
   ```

2. Push changes to your Vercel deployment

## Testing

After domain verification, test sending an email to ensure everything works correctly:

```bash
node test-resend.js
```

## Troubleshooting

If verification fails:
- Check that DNS records are correctly added
- Ensure you have the proper access to modify DNS settings
- Some DNS providers may take longer to propagate changes
- Contact your domain registrar if you need help adding DNS records

## Additional Information

- Your verified domain will be listed in the Resend dashboard under [https://resend.com/domains](https://resend.com/domains)
- You can add multiple verified domains if needed
- Domain verification is a one-time process but may need to be refreshed if you change DNS providers

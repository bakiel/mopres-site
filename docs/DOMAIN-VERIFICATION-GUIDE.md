# Domain Verification Guide for MoPres Emails

To ensure professional email delivery with your own domain (mopres.co.za), follow these steps to verify your domain with Resend.

## Prerequisites

- Access to your domain's DNS settings (via your domain registrar like GoDaddy, Namecheap, etc.)
- A Resend account (https://resend.com)

## Step 1: Add your domain in Resend

1. Log in to your [Resend Dashboard](https://resend.com/domains)
2. Click "Add Domain"
3. Enter your domain: `mopres.co.za`
4. Click "Add"

## Step 2: Add DNS records

Resend will provide you with the necessary DNS records to add to your domain. Typically, you'll need to add:

1. **TXT Record** for domain verification
2. **DKIM Records** (typically 3 CNAME records)
3. **Return-Path Record** (MX record)

Copy these records exactly as provided by Resend.

## Step 3: Configure your domain's DNS

1. Log in to your domain registrar or DNS provider
2. Navigate to the DNS management section
3. Add each of the records provided by Resend
   - Make sure to use the exact record type (TXT, CNAME, MX)
   - Copy the values precisely
   - Use the recommended TTL (Time To Live) values, often 3600 seconds (1 hour)

## Step 4: Verify the domain

1. Return to the Resend dashboard
2. Click "Verify" for your domain
3. Resend will check if the DNS records are properly configured

Note: DNS changes can take up to 24-48 hours to propagate globally, though they often take effect within a few hours.

## Step 5: Update the application code

Once your domain is verified:

1. Update the `from` email address in the `src/lib/email/resend.ts` file:

```typescript
from: 'MoPres Fashion <info@mopres.co.za>',
```

2. Deploy the changes to your production environment

## Troubleshooting

If domain verification fails:

1. Double-check all DNS records for typos
2. Ensure you've added all required records
3. Wait at least a few hours for DNS propagation
4. Use a DNS lookup tool like [MX Toolbox](https://mxtoolbox.com/) to verify your records

## Testing

After successful verification:

1. Run the test script to verify delivery:
   ```
   node scripts/test-official-invoice.js
   ```

2. Check the recipient's inbox for proper email delivery
3. Verify that the email appears from "MoPres Fashion <info@mopres.co.za>"

## Support

If you encounter issues with domain verification, contact Resend support at: https://resend.com/support

# MoPres Email System Deployment Checklist

## Pre-Deployment

### Configuration

- [ ] Set up Resend API key in environment variables
  - Add `RESEND_API_KEY` to `.env.local` and deployment environment
  - Verify API key has sufficient sending quota

- [ ] Set up Supabase storage configuration
  - Create `invoices` bucket in Supabase storage if not exists
  - Set appropriate permissions for invoice PDFs
  - Verify storage paths in email services

### Dependencies

- [ ] Install required dependencies
  ```bash
  npm install puppeteer react-email-components @react-email/components resend
  ```

- [ ] Add required browser dependencies for PDF generation (if deploying to Linux)
  ```bash
  apt-get update && apt-get install -y \
  ca-certificates \
  fonts-liberation \
  libappindicator3-1 \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libc6 \
  libcairo2 \
  libcups2 \
  libdbus-1-3 \
  libexpat1 \
  libfontconfig1 \
  libgbm1 \
  libgcc1 \
  libglib2.0-0 \
  libgtk-3-0 \
  libnspr4 \
  libnss3 \
  libpango-1.0-0 \
  libpangocairo-1.0-0 \
  libstdc++6 \
  libx11-6 \
  libx11-xcb1 \
  libxcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxext6 \
  libxfixes3 \
  libxi6 \
  libxrandr2 \
  libxrender1 \
  libxss1 \
  libxtst6 \
  lsb-release \
  wget \
  xdg-utils
  ```

### Testing

- [ ] Run email system test script
  ```bash
  node scripts/test-email-system.js
  ```

- [ ] Run PDF generation test script
  ```bash
  node scripts/test-pdf-generation.js
  ```

- [ ] Verify generated test PDF for correctness
  - Check layout and formatting
  - Verify all order details are included
  - Check that fonts and images load correctly

- [ ] Test API endpoints with Postman or similar tool
  - Test `/api/orders/send-emails` endpoint
  - Test `/api/invoices/send-email` endpoint
  - Verify authentication works as expected

## Deployment

### Code Deployment

- [ ] Deploy email templates
  - `OrderConfirmationEmail.tsx`
  - `InvoiceEmail.tsx`

- [ ] Deploy email services
  - `order-service.ts`
  - `invoice-service.ts` (update existing)
  - `resend.ts` (update existing)

- [ ] Deploy API endpoints
  - `/api/orders/send-emails/route.ts`
  - Verify existing `/api/invoices/send-email/route.ts`

- [ ] Deploy client-side services
  - `email-service.ts` 

- [ ] Deploy UI components
  - `SendEmailsCard.tsx`
  - UI utility components

- [ ] Deploy documentation
  - `EMAIL-SYSTEM.md`
  - `EMAIL-SYSTEM-REVIEW.md`

### Database & Storage

- [ ] Verify Supabase storage bucket exists
  - Create `invoices` bucket if not already present
  - Set appropriate permissions

### Environment Variables

- [ ] Set environment variables in production
  - `RESEND_API_KEY`
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

## Post-Deployment

### Verification

- [ ] Test email sending in production environment
  - Send a test order confirmation email
  - Send a test invoice email
  - Verify emails are received correctly

- [ ] Verify PDF generation in production
  - Check that PDFs are generated correctly
  - Verify PDFs are stored in Supabase storage
  - Check that PDF attachments work in emails

- [ ] Test admin interface
  - Verify SendEmailsCard component works in production
  - Check that error handling works correctly
  - Verify success notifications display properly

### Monitoring

- [ ] Set up monitoring for email sends
  - Monitor Resend dashboard for delivery rates
  - Set up alerts for failed emails

- [ ] Set up logging for PDF generation
  - Monitor for PDF generation failures
  - Set up alerts for repeated failures

### Documentation

- [ ] Update user documentation
  - Add information about new email features to admin guide
  - Update customer-facing documentation about order emails

- [ ] Train admin users
  - Provide instructions on using the email functionality
  - Explain error scenarios and resolution steps

## Rollback Plan

In case of issues with the new email system, follow these steps to roll back:

1. Revert to previous version of the code
   ```bash
   git revert [deployment-commit-hash]
   ```

2. Redeploy the previous version
   ```bash
   # Deploy command for your platform
   ```

3. If needed, manually restart email-related services
   ```bash
   # Service restart commands for your platform
   ```

4. Notify users of the temporary rollback

## Sign-Off

- [ ] Development team sign-off
  - Lead developer: ___________________ Date: ___________
  
- [ ] QA team sign-off
  - QA lead: __________________________ Date: ___________
  
- [ ] Product owner sign-off
  - Product owner: _____________________ Date: ___________
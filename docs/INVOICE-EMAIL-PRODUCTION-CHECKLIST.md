# Invoice Email System Production Checklist

Use this checklist to ensure the MoPres invoice email system is properly configured for production deployment.

## Environment Variables

- [ ] `RESEND_API_KEY` is set in production environment
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is set in production environment
- [ ] `SUPABASE_URL` is properly configured (gfbedvoexpulmmfitxje.supabase.co)

## Domain Configuration

- [ ] Domain (mopres.co.za) is verified in Resend
- [ ] All required DNS records are properly set:
  - [ ] TXT record for verification
  - [ ] DKIM records (CNAMEs)
  - [ ] Return-Path record (MX)
- [ ] Email `from` address in code is updated to use verified domain:
  - [ ] Using `info@mopres.co.za` instead of `onboarding@resend.dev`

## Storage Configuration

- [ ] 'invoices' bucket exists in Supabase storage
- [ ] Bucket is set to public for invoice downloads
- [ ] Proper CORS settings are configured

## Security Checks

- [ ] API endpoints use proper authentication
- [ ] API keys are properly secured
- [ ] Access credentials are not exposed in client-side code

## Code Integration

- [ ] InvoiceEmail template is finalized and tested
- [ ] SendEmail function is using proper production configuration
- [ ] API route for sending invoice emails is functioning

## Testing

- [ ] Test email delivery to multiple email providers:
  - [ ] Gmail
  - [ ] Outlook
  - [ ] Yahoo
  - [ ] Other common providers
- [ ] Test email rendering on:
  - [ ] Desktop email clients
  - [ ] Mobile email clients
  - [ ] Web email clients
- [ ] Test PDF attachment:
  - [ ] Verify PDF opens correctly
  - [ ] Check PDF content is accurate
  - [ ] Ensure proper formatting
- [ ] Test "View Invoice Online" link

## Error Handling

- [ ] Proper error logging is in place
- [ ] Error handling for failed email deliveries
- [ ] System can recover from temporary failures
- [ ] Notifications for critical failures are configured

## Monitoring

- [ ] Email sending metrics are tracked
- [ ] Resend dashboard is monitored for delivery issues
- [ ] System logs are properly captured and stored

## Documentation

- [ ] Development documentation is updated
- [ ] User documentation (for store admins) is created
- [ ] API documentation is completed

## Backup Plan

- [ ] Alternative email delivery method is documented
- [ ] Process for resending failed emails is established
- [ ] Manual invoice email procedure is documented

## Final Validation

- [ ] Complete end-to-end test with a real order
- [ ] Verify all components work together properly
- [ ] Get final approval from stakeholders

## Post-Deployment

- [ ] Monitor initial emails in production
- [ ] Check for any delivery issues or spam filtering
- [ ] Collect feedback from recipients
- [ ] Review email analytics

---

Completed Date: _______________________

Approved By: _________________________

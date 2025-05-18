# MoPres Invoice Email System - Maintenance Guide

This guide provides information on maintaining and troubleshooting the invoice email system after deployment.

## Regular Maintenance Tasks

### 1. Monitor Email Deliverability

- Check the Resend dashboard regularly to monitor email deliverability rates
- Review any bounced or failed emails
- Ensure your domain verification remains valid

### 2. Update Content as Needed

If you need to update the email template:
- Edit `/src/lib/email/templates/InvoiceEmail.tsx`
- Redeploy the application

If you need to update invoice template:
- Edit `/src/components/InvoiceTemplateOptimized.tsx`
- Redeploy the application

### 3. Check Storage Usage

- Monitor your Supabase storage usage regularly
- Consider implementing a cleanup policy for older invoices if storage grows too large

## Troubleshooting Guide

### Invoice Email Not Sending

1. **Check API Logs**:
   - Review server logs for errors in the API endpoints
   - Check the Resend dashboard for failed deliveries

2. **Verify Storage Access**:
   - Ensure the 'invoices' bucket in Supabase is accessible
   - Check that the SUPABASE_SERVICE_ROLE_KEY has proper permissions

3. **Test Individual Components**:
   - Use `test-resend.js` to verify email delivery
   - Use `create-bucket.js` to check storage bucket access
   - Use `upload-test-invoice.js` to test PDF uploading

### PDF Generation Issues

1. **Check Browser Console**:
   - Look for errors related to PDF generation
   - Verify that html2canvas and jsPDF are loading correctly

2. **Test with a Simple PDF**:
   - Use minimal content to test PDF generation
   - Check for memory issues with large PDFs

3. **Check HTML Structure**:
   - Ensure the invoice template's HTML is correctly structured
   - Verify that all images have proper CORS headers

### API Failures

1. **Check Environment Variables**:
   - Verify all required API keys are set
   - Ensure the keys haven't expired

2. **Check Request Format**:
   - Verify the API is being called with correct parameters
   - Check that the authentication headers are correct

3. **Check Supabase Edge Functions**:
   - Deploy any updated edge functions
   - Verify the functions have the correct environment variables

## Advanced Maintenance

### Implementing Automatic Retry

For improved reliability, consider implementing a retry mechanism:

1. Create a database table to track email sending status
2. Update the API to record attempts and results
3. Create a scheduled function to retry failed emails

### Data Retention Policy

Implement a data retention policy for invoices:

1. Decide how long to keep invoice PDFs (e.g., 7 years for tax purposes)
2. Create a scheduled task to archive or delete old invoices
3. Implement notification for users about the retention policy

### Performance Optimization

If you notice performance issues:

1. Optimize PDF generation parameters for better compression
2. Consider generating PDFs on the server-side only
3. Implement caching for frequently accessed invoices

## Contact Information

For assistance with the invoice email system:

- **Technical Support**: support@mopres.co.za
- **Email Service Issues**: Check the [Resend Status Page](https://status.resend.com)
- **Supabase Issues**: Check the [Supabase Status Page](https://status.supabase.com)

## Documentation References

- [Resend API Documentation](https://resend.com/docs)
- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [React Email Documentation](https://react.email/docs)
- [Implementation Guide](./invoice-email-resend-implementation.md)

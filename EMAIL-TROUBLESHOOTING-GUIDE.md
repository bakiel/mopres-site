# MoPres Email System Troubleshooting Guide

## Overview of Fixes

The email system for MoPres has been updated with the following improvements:

### 1. Enhanced Error Logging
- Added detailed error logging throughout the email sending pipeline
- Improved error messages with more specific information about failure points
- Added context-aware logging for better debugging

### 2. Improved PDF Generation
- Enhanced PDF generation with Puppeteer using more reliable browser launch options
- Added better error handling for PDF generation failures
- Implemented detailed logging during each step of the PDF generation process
- Added progressive backoff waiting strategy for ensuring templates are accessible

### 3. Robust API Error Handling
- Improved JSON parsing of API responses with fallbacks
- Better handling of non-JSON responses (e.g., HTML error pages)
- Added timeout handling for API requests
- Improved error message classification for better user feedback

### 4. UI/UX Improvements
- Enhanced toast notifications with more specific error messages
- Added loading indicator during email sending process
- Implemented better pre-sending stabilization wait periods
- Improved error messages displayed to users

## Testing the Email System

### 1. API Testing
Use the provided `test-email-api.js` script to directly test the email API:
```bash
# First, edit the script to add a valid order ID
nano test-email-api.js

# Then run the test
node test-email-api.js
```

### 2. Puppeteer Environment Testing
Test if Puppeteer is working correctly for PDF generation:
```bash
node test-puppeteer.js
```
This will create a test PDF and check if the Puppeteer environment is properly configured.

### 3. Resend Email API Testing
Test the Resend API connection:
```bash
node test-resend.js
```
This will send a test email using the Resend API to verify your configuration.

## Common Issues and Solutions

### Issue: "Failed to send order emails" Error
This is a general error that could have multiple causes:

#### Possible causes:
1. **Resend API key is missing or invalid**
   - Check your `.env.local` file for `RESEND_API_KEY`
   - Verify the API key is valid with `node test-resend.js`

2. **PDF generation is failing**
   - Test Puppeteer with `node test-puppeteer.js`
   - Check if you need to install additional dependencies for Puppeteer

3. **Network connectivity issues**
   - Ensure your server can connect to external services
   - Check for firewall rules blocking outgoing connections

### Issue: "Could not find invoice container in cloned document"
This happens when the PDF generation process can't find the invoice element.

#### Solution:
- The fix implemented ensures more reliable element selection and provides fallbacks
- Added proper waiting for element rendering before attempting PDF generation

### Issue: SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON
This happens when the API returns HTML instead of JSON.

#### Solution:
- Improved the client-side email service to better handle non-JSON responses
- Added better logging of response content for debugging
- Updated error handling to provide more useful error messages

## Email Configuration

For the email system to work properly, you need:

1. A valid Resend API key in `.env.local`:
   ```
   RESEND_API_KEY=re_yourApiKeyHere
   ```

2. Proper Supabase configuration:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

3. Ensure you have a Supabase storage bucket named `invoices` for storing generated PDFs

## Development Notes

### Debugging
- Enable more verbose logging by modifying the error logging in `src/lib/email/resend.ts`
- Check both client-side console and server-side logs for errors
- Use the testing scripts to isolate specific components of the system

### Performance Considerations
- PDF generation is resource-intensive, especially with Puppeteer
- If deployment has limited resources, consider optimizing image sizes in invoice templates
- Consider implementing a queue system for high-volume email sending scenarios

## Future Improvements

1. **Queue system for emails**: Implement a queue to handle email sending asynchronously
2. **Email templates in database**: Store email templates in the database for easier updates
3. **Retry mechanism**: Add automatic retry for failed email sending
4. **Web-based preview**: Allow admins to preview invoices before sending

## Support

If you encounter issues with the email system, gather the following information for support:

1. Server logs showing the error
2. Browser console output when clicking "Send Order Emails"
3. Results of running the test scripts
4. Details of your deployment environment

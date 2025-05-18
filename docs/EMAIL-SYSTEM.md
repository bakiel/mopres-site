# MoPres Email System Documentation

## Overview

This document provides a comprehensive guide to the MoPres email system for sending order confirmations and invoices to customers. The system is designed to be reliable, maintainable, and visually appealing, aligning with the MoPres luxury brand identity.

## Key Features

1. **Order Confirmation Emails**
   - Sent immediately after an order is placed
   - Includes order summary, shipping information, and next steps
   - Customized for payment method (EFT payment instructions for EFT orders)

2. **Invoice Emails**
   - Includes PDF invoice attachment
   - Professionally designed to match brand identity
   - Can be sent automatically or manually from the admin panel

3. **Admin Controls**
   - Interface for manually sending/resending emails
   - Option to generate new invoices
   - Email sending status tracking

## Architecture

The email system consists of the following components:

### 1. Email Templates

- React Email components for consistent, responsive design
- Two primary templates:
  - `OrderConfirmationEmail.tsx`: For order confirmations
  - `InvoiceEmail.tsx`: For invoices with PDF attachments

### 2. Email Services

- `order-service.ts`: Handles order confirmation emails
- `invoice-service.ts`: Handles invoice emails with PDF attachments
- `resend.ts`: Core email sending functionality using Resend API

### 3. PDF Generation

- Server-side invoice PDF generation
- Uses Puppeteer to render and capture invoice HTML
- Stores generated PDFs in Supabase storage

### 4. API Endpoints

- `/api/orders/send-emails`: Sends both confirmation and invoice emails
- `/api/invoices/send-email`: Sends only the invoice email

### 5. Client Components

- `SendEmailsCard.tsx`: Admin UI for sending emails
- Integration with OrderDetailsClient for customer-facing invoice downloads

## Implementation Details

### Email Sending Flow

1. **Automatic Flow (on order placement)**
   - Order created in database
   - System triggers `sendOrderEmails` function
   - Email service processes the order data
   - Invoice PDF is generated and stored
   - Both emails are sent to the customer

2. **Manual Flow (from admin)**
   - Admin selects an order
   - Clicks "Send Order Emails" button
   - API generates/retrieves invoice PDF
   - Both emails are sent to the customer

### Invoice PDF Generation

The system uses a two-pronged approach for invoice generation:

1. **Server-side Generation (for emails)**
   - Renders the invoice template with order data
   - Uses Puppeteer to capture as PDF
   - Stores in Supabase storage for future use

2. **Client-side Generation (for downloads)**
   - Uses enhanced PDF generator with retry mechanism
   - Falls back to HTML if PDF generation fails
   - Offers direct download to customers

## Configuration

### Environment Variables

Required environment variables:

```
RESEND_API_KEY=re_...
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### API Keys

The system uses simple API key authentication:

- `/api/orders/send-emails`: Uses `mopres-order-emails-api-key-2025`
- `/api/invoices/send-email`: Uses `invoice-mopres-api-key-2025`

## Usage Examples

### Sending Emails from Admin Panel

```typescript
import { sendOrderEmails } from '@/lib/client/email-service';

// Inside a component/handler
const handleSendEmails = async (orderId: string) => {
  const { success, error } = await sendOrderEmails(orderId);
  
  if (success) {
    // Show success message
  } else {
    // Handle error
  }
};
```

### Sending Only Invoice Email

```typescript
import { sendInvoiceEmail } from '@/lib/client/email-service';

// Inside a component/handler
const handleSendInvoice = async (orderId: string) => {
  const { success, error } = await sendInvoiceEmail(orderId);
  
  if (success) {
    // Show success message
  } else {
    // Handle error
  }
};
```

## Customization

### Email Templates

To customize email templates, edit the following files:

- `/src/lib/email/templates/OrderConfirmationEmail.tsx`
- `/src/lib/email/templates/InvoiceEmail.tsx`

### Invoice Template

To customize the invoice design, edit:

- `/src/components/InvoiceTemplateOptimized.tsx`

## Troubleshooting

### Common Issues

1. **Emails not sending**
   - Check Resend API key validity
   - Verify customer email format
   - Check server logs for error details

2. **PDF generation failing**
   - Ensure Puppeteer dependencies are installed
   - Check for DOM rendering issues in the invoice template
   - Try client-side PDF generation as fallback

3. **Missing Images in Emails**
   - Verify all image URLs are accessible
   - Ensure Supabase storage is properly configured
   - Check image dimensions and formats

## Future Improvements

1. **Email Tracking**
   - Implement open and click tracking
   - Add read receipts for invoices

2. **Additional Email Types**
   - Shipping confirmation emails
   - Delivery notification emails
   - Order status update emails

3. **Enhanced Personalization**
   - Product recommendations in emails
   - Customer-specific styling options
   - Dynamic content based on purchase history

## Conclusion

The MoPres email system provides a robust solution for sending professional, branded emails to customers. Its modular design allows for easy maintenance and future enhancements, while the dual-approach to PDF generation ensures reliability.

For any issues or questions, please contact the development team at dev@mopres.co.za.

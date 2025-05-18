import React from 'react';
import { render } from '@react-email/render';

// Function to convert a React component to an HTML string
export async function renderEmailTemplate(
  Component: React.ComponentType<any>,
  props: any
): Promise<string> {
  try {
    const html = render(
      React.createElement(Component, props),
      {
        pretty: true
      }
    );
    
    // Add DOCTYPE and HTML structure for email clients if needed
    return `
<!DOCTYPE html>
<html>
  ${html}
</html>
    `.trim();
  } catch (error) {
    console.error('Error rendering email template:', error);
    // Fallback to a simple HTML template
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>MoPres Fashion - Invoice</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 20px; border-bottom: 3px solid #AF8F53; padding-bottom: 20px;">
      <img src="https://gfbedvoexpulmmfitxje.supabase.co/storage/v1/object/public/assets/Mopres_Gold_luxury_lifestyle_logo.png" 
           alt="MoPres Fashion" width="150" height="64" style="margin: 0 auto;">
    </div>
    <h1 style="color: #AF8F53; text-align: center; margin-bottom: 20px;">Your Invoice #${props.order.order_ref}</h1>
    <p>Dear ${props.order.customer_name},</p>
    <p>Thank you for your recent purchase from MoPres Fashion. Your invoice is attached to this email.</p>
    <p>To view your invoice online, please click the link below:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${props.invoiceUrl}" 
         style="background-color: #AF8F53; color: white; padding: 12px 25px; text-decoration: none; font-weight: bold; border-radius: 4px;">
        View Invoice Online
      </a>
    </div>
    <p><strong>Invoice Reference:</strong> ${props.order.order_ref}</p>
    <p><strong>Amount Due:</strong> R ${props.order.total_amount.toFixed(2)}</p>
    <p>If you have any questions, please contact us at info@mopres.co.za</p>
    <div style="margin-top: 30px;">
      <p>Warm regards,<br>The MoPres Fashion Team</p>
    </div>
    <div style="border-top: 1px solid #e5e5e5; margin-top: 30px; padding-top: 20px; text-align: center; color: #8c8c8c; font-size: 12px;">
      <p>MoPres Fashion | 6680 Witrugeend Street, 578 Heuwelsig Estates | Cetisdal, Centurion, South Africa</p>
      <p>© ${new Date().getFullYear()} MoPres Fashion. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }
}

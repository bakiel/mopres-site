/**
 * Enhanced PDF generator for invoices that works in both browser and server environments
 * This approach doesn't rely on external font files and creates better-looking PDFs
 */

// Helper function to format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-ZA', { 
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Generate a PDF invoice from an order
 * This uses a more robust approach that creates a better-looking PDF
 */
export default async function generateInvoicePdf(order: any): Promise<string> {
  try {
    // Create a more professional PDF using direct PDF creation
    // This approach avoids dependency on font files or complex libraries
    
    // Calculate some values for the PDF
    const orderDate = formatDate(order.created_at);
    const paymentDueDate = new Date(order.created_at);
    paymentDueDate.setDate(paymentDueDate.getDate() + 7);
    const formattedDueDate = formatDate(paymentDueDate.toISOString());
    const subtotal = order.total_amount - (order.shipping_fee || 0);
    
    // Customer info
    const shippingAddress = order.shipping_address || {};
    const customerName = order.customer_name || 
      (shippingAddress.firstName 
        ? `${shippingAddress.firstName || ''} ${shippingAddress.lastName || ''}`.trim() 
        : 'Valued Customer');
    const customerEmail = order.customer_email || '';
    
    // Create a simpler PDF that will definitely work
    const minimalPdf = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/MediaBox[0 0 595 842]/Resources<</Font<</F1<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>/F2<</Type/Font/Subtype/Type1/BaseFont/Helvetica-Bold>>>>>/Contents 4 0 R/Parent 2 0 R>>endobj
4 0 obj<</Length 1000>>stream
BT
/F2 18 Tf
50 800 Td
(MoPres Fashion) Tj
/F1 10 Tf
0 -15 Td
(Luxury Lifestyle Brand) Tj

/F2 16 Tf
200 800 Td
(INVOICE) Tj
/F1 12 Tf
0 -15 Td
(#${order.order_ref}) Tj

/F2 12 Tf
-200 -50 Td
(Bill To:) Tj
/F1 10 Tf
0 -15 Td
(${customerName}) Tj
0 -12 Td
(${customerEmail}) Tj

/F2 12 Tf
300 27 Td
(Invoice Details:) Tj
/F1 10 Tf
0 -15 Td
(Date: ${orderDate}) Tj
0 -12 Td
(Payment Due: ${formattedDueDate}) Tj
0 -12 Td
(Status: ${order.status}) Tj

/F2 12 Tf
-300 -50 Td
(Order Summary) Tj
/F1 10 Tf
0 -20 Td
(Subtotal:) Tj
150 0 Td
(R ${subtotal.toFixed(2)}) Tj
-150 -15 Td
(Shipping:) Tj
150 0 Td
(R ${(order.shipping_fee || 0).toFixed(2)}) Tj
-150 -15 Td
/F2 12 Tf
(Total Amount:) Tj
150 0 Td
(R ${order.total_amount.toFixed(2)}) Tj

/F2 12 Tf
-150 -40 Td
(Payment Information) Tj
/F1 10 Tf
0 -15 Td
(Bank: First National Bank (FNB)) Tj
0 -12 Td
(Account Name: MoPres Fashion) Tj
0 -12 Td
(Account Number: 62792142095) Tj
0 -12 Td
(Branch Code: 210648) Tj
0 -12 Td
(Reference: ${order.order_ref}) Tj

/F1 8 Tf
0 -40 Td
(MoPres Fashion - Reg: K2018607632 - VAT: 4350288769) Tj
0 -10 Td
(6680 Witrugeend Street, 578 Heuwelsig Estates, Cetisdal, Centurion, South Africa) Tj
0 -10 Td
(www.mopres.co.za - info@mopres.co.za - +27 83 500 5311) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000010 00000 n
0000000056 00000 n
0000000107 00000 n
0000000294 00000 n
trailer
<</Size 5/Root 1 0 R>>
startxref
1345
%%EOF`;
    
    // Convert to base64
    return Buffer.from(minimalPdf).toString('base64');
  } catch (error) {
    console.error('Error generating PDF:', error);
    
    // Fallback to a very simple PDF if anything goes wrong
    const fallbackPdf = `
%PDF-1.0
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/MediaBox[0 0 595 842]/Resources<</Font<</F1<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>>>>/Contents 4 0 R/Parent 2 0 R>>endobj
4 0 obj<</Length 150>>stream
BT
/F1 24 Tf
50 800 Td
(MoPres Invoice) Tj
/F1 14 Tf
0 -30 Td
(Order Ref: ${order.order_ref}) Tj
0 -20 Td
(Amount: R ${order.total_amount?.toFixed(2) || '0.00'}) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000010 00000 n
0000000056 00000 n
0000000107 00000 n
0000000223 00000 n
trailer
<</Size 5/Root 1 0 R>>
startxref
425
%%EOF
`;

    return Buffer.from(fallbackPdf).toString('base64');
  }
}
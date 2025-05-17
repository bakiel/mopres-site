import React from 'react';
import { QRCodeCanvas } from 'qrcode.react'; // Import QR Code component
import { getProductImageUrl } from '@/lib/supabaseClient';

// Updated type to be compatible with OrderDetailsClient
interface OrderItem {
  id: string;
  quantity: number;
  price: number; // Price per item at time of order
  products: { // Assuming a join to products table
    name: string;
    sku?: string;
  } | null;
  size?: string; // If applicable
}

interface Order {
  id: string;
  created_at: string;
  order_ref: string;
  total_amount: number;
  shipping_fee: number;
  status: string;
  customer_email?: string; // Changed to optional to match OrderDetailsClient
  shipping_address: { // Assuming JSONB structure
    firstName?: string; // Made optional
    lastName?: string; // Made optional
    addressLine1?: string; // Made optional
    addressLine2?: string;
    city?: string; // Made optional
    province?: string; // Made optional
    postalCode?: string; // Made optional
    country?: string; // Made optional
    phone?: string;
  } | null;
  order_items: OrderItem[];
}

interface InvoiceTemplateProps {
  order: Order;
  invoiceRef: React.Ref<HTMLDivElement>; // Use React.Ref to allow null
}

const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({ order, invoiceRef }) => {
  // Removed null check as the parent component already handles this

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };

   const formatCurrency = (amount: number) => {
     return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);
   }

   const subtotal = order.total_amount - order.shipping_fee; // Calculate subtotal

  // Basic template structure - Use Tailwind for styling
  // NOTE: html2canvas might have limitations with complex CSS like flex/grid.
  // Consider using simpler table layouts if rendering issues occur.
  return (
    // This div will be captured by html2canvas. Style it like an A4 page.
    // Position it off-screen so it doesn't interfere with the main UI.
    <div
      ref={invoiceRef}
      id="invoice-content"
      className="bg-white text-black font-sans" // Use a common font
      style={{
        position: 'absolute',
        left: '-9999px', // Position off-screen
        top: '-9999px',
        width: '210mm', // A4 width
        minHeight: '297mm', // A4 height
        padding: '48px', // Increased padding
        boxShadow: '0 0 10px rgba(0,0,0,0.1)', // Optional shadow for visibility if debugging
        color: '#333333', // Default text color
        fontSize: '12px', // Base font size
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #AF8F53', paddingBottom: '20px', marginBottom: '30px' }}>
        <div>
          {/* Use inline style for base64 image or ensure image is accessible */}
          <img src="/Mopres_Gold_luxury_lifestyle_logo.png" alt="MoPres Logo" style={{ height: '70px', marginBottom: '15px' }} />
          <h1 style={{ color: '#AF8F53', fontSize: '28px', fontWeight: 'bold', margin: 0, textTransform: 'uppercase' }}>Invoice</h1>
        </div>
        <div style={{ textAlign: 'right', fontSize: '11px', color: '#555' }}>
          <p style={{ margin: '0 0 3px 0', fontWeight: 'bold', color: '#333' }}>MoPres (Pty) Ltd</p>
          <p style={{ margin: '0 0 3px 0' }}>[Your Company Address Line 1]</p>
          <p style={{ margin: '0 0 3px 0' }}>[City, Postal Code]</p>
          <p style={{ margin: '0 0 3px 0' }}>VAT Reg: [Your VAT Number]</p>
          <p style={{ margin: '0 0 3px 0' }}>info@mopres.co.za | +27 83 500 5311</p>
        </div>
      </div>
      {/* Order Details */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', fontSize: '12px' }}>
        <div>
          <p style={{ margin: '0 0 5px 0' }}><strong style={{ color: '#555' }}>Billed To:</strong></p>
          <p style={{ margin: '0 0 3px 0', fontWeight: '500' }}>{order.shipping_address?.firstName} {order.shipping_address?.lastName}</p>
          <p style={{ margin: '0 0 3px 0' }}>{order.customer_email}</p>
          <p style={{ margin: '0 0 3px 0' }}>{order.shipping_address?.addressLine1}</p>
          {order.shipping_address?.addressLine2 && <p style={{ margin: '0 0 3px 0' }}>{order.shipping_address.addressLine2}</p>}
          <p style={{ margin: '0 0 3px 0' }}>{order.shipping_address?.city}, {order.shipping_address?.province}, {order.shipping_address?.postalCode}</p>
          <p style={{ margin: '0 0 3px 0' }}>{order.shipping_address?.country}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: '0 0 5px 0' }}><strong style={{ color: '#555' }}>Invoice No:</strong> {order.order_ref}</p>
          <p style={{ margin: '0 0 3px 0' }}><strong style={{ color: '#555' }}>Date Issued:</strong> {formatDate(order.created_at)}</p>
          <p style={{ margin: '0 0 3px 0' }}><strong style={{ color: '#555' }}>Order Status:</strong> {order.status}</p>
        </div>
      </div>
      {/* Items Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '30px' }}>
        <thead>
          <tr style={{ backgroundColor: '#AF8F53', color: '#FFFFFF', borderBottom: '1px solid #AF8F53', fontWeight: 'bold' }}>
            <th style={{ padding: '10px', textAlign: 'left', borderRight: '1px solid #d9c7a9' }}>Item</th>
            <th style={{ padding: '10px', textAlign: 'center', borderRight: '1px solid #d9c7a9' }}>Qty</th>
            <th style={{ padding: '10px', textAlign: 'right', borderRight: '1px solid #d9c7a9' }}>Unit Price</th>
            <th style={{ padding: '10px', textAlign: 'right' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {order.order_items.map((item) => (
            <tr key={item.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
              <td style={{ padding: '10px', borderRight: '1px solid #e0e0e0', verticalAlign: 'top' }}>
                {item.products?.name || 'Product not found'}
                {item.size && <span style={{ fontSize: '11px', color: '#666', display: 'block', marginTop: '2px' }}>Size: {item.size}</span>}
                {item.products?.sku && <span style={{ fontSize: '11px', color: '#666', display: 'block', marginTop: '2px' }}>SKU: {item.products.sku}</span>}
              </td>
              <td style={{ padding: '10px', textAlign: 'center', borderRight: '1px solid #e0e0e0', verticalAlign: 'top' }}>{item.quantity}</td>
              <td style={{ padding: '10px', textAlign: 'right', borderRight: '1px solid #e0e0e0', verticalAlign: 'top' }}>{formatCurrency(item.price)}</td>
              <td style={{ padding: '10px', textAlign: 'right', verticalAlign: 'top' }}>{formatCurrency(item.price * item.quantity)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Totals Section */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '30px' }}>
        <div style={{ width: '280px', fontSize: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#555' }}>Subtotal:</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ color: '#555' }}>Shipping:</span>
            <span>{order.shipping_fee === 0 ? 'FREE' : formatCurrency(order.shipping_fee)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #cccccc', paddingTop: '12px', fontWeight: 'bold', fontSize: '16px' }}>
            <span style={{ color: '#333333' }}>Total Due:</span>
            <span style={{ color: '#AF8F53' }}>{formatCurrency(order.total_amount)}</span>
          </div>
        </div>
      </div>
      {/* Payment Instructions & QR Code */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderTop: '1px solid #e0e0e0', paddingTop: '20px', fontSize: '12px', color: '#444' }}>
       <div>
           <h4 style={{ fontWeight: 'bold', marginBottom: '10px', color: '#333', fontSize: '13px' }}>Payment Instructions (EFT/Bank Deposit)</h4>
           <p style={{ margin: '0 0 4px 0' }}>Please use the Invoice No. (<strong style={{ color: '#333' }}>{order.order_ref}</strong>) as your payment reference.</p>
           <p style={{ margin: '4px 0' }}><strong style={{ color: '#333' }}>Bank:</strong> FNB</p>
           <p style={{ margin: '4px 0' }}><strong style={{ color: '#333' }}>Account Name:</strong> MoPres (Pty) Ltd</p>
           <p style={{ margin: '4px 0' }}><strong style={{ color: '#333' }}>Account Number:</strong> 628XXXXXXXX</p>
           <p style={{ margin: '4px 0' }}><strong style={{ color: '#333' }}>Branch Code:</strong> 250655</p>
           <p style={{ margin: '10px 0 4px 0' }}>Email proof of payment to: payments@mopres.co.za</p>
       </div>
        {/* QR Code Section */}
        <div style={{ textAlign: 'right', paddingTop: '10px' }}>
            <p style={{ fontSize: '11px', marginBottom: '5px', color: '#555' }}>Scan for Order Ref:</p>
            <QRCodeCanvas
               value={order.order_ref} // Value to encode
               size={72} // Slightly larger QR code
               bgColor={"#ffffff"}
               fgColor={"#000000"}
               level={"L"} // Error correction level
               includeMargin={false}
            />
        </div>
     </div>
      {/* Footer */}
      <div style={{ borderTop: '2px solid #AF8F53', paddingTop: '20px', marginTop: '40px', fontSize: '11px', textAlign: 'center', color: '#666' }}>
        <p style={{ margin: '0 0 5px 0' }}>Thank you for your business!</p>
        <p style={{ margin: 0 }}>www.mopres.co.za</p>
      </div>
    </div>
  );
};

export default InvoiceTemplate;
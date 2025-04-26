import React from 'react';
import { QRCodeCanvas } from 'qrcode.react'; // Import QR Code component
import { getProductImageUrl } from '@/lib/supabaseClient';

// TODO: Define proper types for Order and OrderItem based on Supabase schema
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
  shipping_cost: number;
  status: string;
  user_email: string;
  shipping_address: { // Assuming JSONB structure
    firstName: string;
    lastName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  order_items: OrderItem[];
}

interface InvoiceTemplateProps {
  order: Order | null;
  invoiceRef: React.Ref<HTMLDivElement>; // Use React.Ref to allow null
}

const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({ order, invoiceRef }) => {
  // Handle null order gracefully
  if (!order) {
    return <div ref={invoiceRef} style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>Loading order data...</div>;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };

   const formatCurrency = (amount: number) => {
     return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);
   }

   const subtotal = order.total_amount - order.shipping_cost; // Calculate subtotal

  // Basic template structure - Use Tailwind for styling
  // NOTE: html2canvas might have limitations with complex CSS like flex/grid.
  // Consider using simpler table layouts if rendering issues occur.
  return (
    // This div will be captured by html2canvas. Style it like an A4 page.
    // Position it off-screen so it doesn't interfere with the main UI.
    <div
      ref={invoiceRef}
      id="invoice-content"
      className="bg-white text-black p-10 font-sans" // Use a common font
      style={{
        position: 'absolute',
        left: '-9999px', // Position off-screen
        top: '-9999px',
        width: '210mm', // A4 width
        minHeight: '297mm', // A4 height
        boxShadow: '0 0 10px rgba(0,0,0,0.1)', // Optional shadow for visibility if debugging
        color: '#000000', // Ensure text color is black for PDF
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #AF8F53', paddingBottom: '15px', marginBottom: '20px' }}>
        <div>
          {/* Use inline style for base64 image or ensure image is accessible */}
          <img src="/Mopres_Gold_luxury_lifestyle_logo.png" alt="MoPres Logo" style={{ height: '60px', marginBottom: '10px' }} />
          <h1 style={{ color: '#AF8F53', fontSize: '24px', fontWeight: 'bold', margin: 0 }}>INVOICE</h1>
        </div>
        <div style={{ textAlign: 'right', fontSize: '10px', color: '#333' }}>
          <p style={{ margin: '0 0 2px 0', fontWeight: 'bold' }}>MoPres (Pty) Ltd</p>
          <p style={{ margin: '0 0 2px 0' }}>[Your Company Address Line 1]</p>
          <p style={{ margin: '0 0 2px 0' }}>[City, Postal Code]</p>
          <p style={{ margin: '0 0 2px 0' }}>VAT Reg: [Your VAT Number]</p>
          <p style={{ margin: '0 0 2px 0' }}>info@mopres.co.za | +27 83 500 5311</p>
        </div>
      </div>

      {/* Order Details */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', fontSize: '11px' }}>
        <div>
          <p style={{ margin: '0 0 4px 0' }}><strong style={{ color: '#555' }}>Billed To:</strong></p>
          <p style={{ margin: 0 }}>{order.shipping_address?.firstName} {order.shipping_address?.lastName}</p>
          <p style={{ margin: '2px 0' }}>{order.user_email}</p>
          <p style={{ margin: '2px 0' }}>{order.shipping_address?.addressLine1}</p>
          {order.shipping_address?.addressLine2 && <p style={{ margin: '2px 0' }}>{order.shipping_address.addressLine2}</p>}
          <p style={{ margin: '2px 0' }}>{order.shipping_address?.city}, {order.shipping_address?.province}, {order.shipping_address?.postalCode}</p>
          <p style={{ margin: '2px 0' }}>{order.shipping_address?.country}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: '0 0 4px 0' }}><strong style={{ color: '#555' }}>Invoice No:</strong> {order.order_ref}</p>
          <p style={{ margin: '2px 0' }}><strong style={{ color: '#555' }}>Date Issued:</strong> {formatDate(order.created_at)}</p>
          <p style={{ margin: '2px 0' }}><strong style={{ color: '#555' }}>Order Status:</strong> {order.status}</p>
        </div>
      </div>

      {/* Items Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', marginBottom: '25px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2', color: '#333', borderBottom: '1px solid #ccc' }}>
            <th style={{ padding: '8px', textAlign: 'left', borderRight: '1px solid #ccc' }}>Item</th>
            <th style={{ padding: '8px', textAlign: 'center', borderRight: '1px solid #ccc' }}>Qty</th>
            <th style={{ padding: '8px', textAlign: 'right', borderRight: '1px solid #ccc' }}>Unit Price</th>
            <th style={{ padding: '8px', textAlign: 'right' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {order.order_items.map((item) => (
            <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '8px', borderRight: '1px solid #eee' }}>
                {item.products?.name || 'Product not found'}
                {item.size && <span style={{ fontSize: '10px', color: '#666' }}> (Size: {item.size})</span>}
                {item.products?.sku && <span style={{ fontSize: '10px', color: '#666', display: 'block' }}>SKU: {item.products.sku}</span>}
              </td>
              <td style={{ padding: '8px', textAlign: 'center', borderRight: '1px solid #eee' }}>{item.quantity}</td>
              <td style={{ padding: '8px', textAlign: 'right', borderRight: '1px solid #eee' }}>{formatCurrency(item.price)}</td>
              <td style={{ padding: '8px', textAlign: 'right' }}>{formatCurrency(item.price * item.quantity)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals Section */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '25px' }}>
        <div style={{ width: '250px', fontSize: '11px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span style={{ color: '#555' }}>Subtotal:</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#555' }}>Shipping:</span>
            <span>{order.shipping_cost === 0 ? 'FREE' : formatCurrency(order.shipping_cost)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #ccc', paddingTop: '8px', fontWeight: 'bold', fontSize: '13px' }}>
            <span style={{ color: '#000' }}>Total Due:</span>
            <span style={{ color: '#AF8F53' }}>{formatCurrency(order.total_amount)}</span>
          </div>
        </div>
      </div>

      {/* Payment Instructions & QR Code */}
       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderTop: '1px solid #eee', paddingTop: '15px', fontSize: '11px', color: '#444' }}>
        <div>
            <h4 style={{ fontWeight: 'bold', marginBottom: '8px', color: '#000' }}>Payment Instructions (EFT/Bank Deposit)</h4>
            <p style={{ margin: '2px 0' }}>Please use the Invoice No. (<strong style={{ color: '#000' }}>{order.order_ref}</strong>) as your payment reference.</p>
        <p style={{ margin: '2px 0' }}><strong style={{ color: '#000' }}>Bank:</strong> FNB</p>
        <p style={{ margin: '2px 0' }}><strong style={{ color: '#000' }}>Account Name:</strong> MoPres (Pty) Ltd</p>
        <p style={{ margin: '2px 0' }}><strong style={{ color: '#000' }}>Account Number:</strong> 628XXXXXXXX</p>
        <p style={{ margin: '2px 0' }}><strong style={{ color: '#000' }}>Branch Code:</strong> 250655</p>
        <p style={{ margin: '8px 0 2px 0' }}>Email proof of payment to: payments@mopres.co.za</p>
        </div>
         {/* QR Code Section */}
         <div style={{ textAlign: 'right' }}>
             <p style={{ fontSize: '10px', marginBottom: '5px', color: '#555' }}>Scan for Order Ref:</p>
             <QRCodeCanvas
                value={order.order_ref} // Value to encode
                size={64} // Size of the QR code
                bgColor={"#ffffff"}
                fgColor={"#000000"}
                level={"L"} // Error correction level
                includeMargin={false}
             />
         </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '2px solid #AF8F53', paddingTop: '15px', marginTop: '30px', fontSize: '10px', textAlign: 'center', color: '#666' }}>
        <p>Thank you for your business!</p>
        <p>www.mopres.co.za</p>
      </div>
    </div>
  );
};

export default InvoiceTemplate;

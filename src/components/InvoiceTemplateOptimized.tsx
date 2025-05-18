import React, { useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

// Types for order information
interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  products: {
    name: string;
    sku?: string;
  } | null;
  size?: string;
}

interface Order {
  id: string;
  created_at: string;
  order_ref: string;
  total_amount: number;
  shipping_fee: number;
  status: string;
  customer_email?: string;
  shipping_address: {
    firstName?: string;
    lastName?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    province?: string;
    postalCode?: string;
    country?: string;
    phone?: string;
  } | null;
  order_items: OrderItem[];
}

interface InvoiceTemplateProps {
  order: Order;
  invoiceRef: React.RefObject<HTMLDivElement>;
}

// Clean, professional invoice template that fits A4 perfectly - without overlap issues
const InvoiceTemplateOptimized: React.FC<InvoiceTemplateProps> = ({ order, invoiceRef }) => {
  // Debug logging for template rendering
  useEffect(() => {
    console.log("Invoice template rendered with order:", order.order_ref);
    console.log("InvoiceRef exists:", !!invoiceRef);
    
    if (invoiceRef?.current) {
      console.log("Invoice element is accessible in DOM");
      console.log(`Invoice dimensions: ${invoiceRef.current.offsetWidth}x${invoiceRef.current.offsetHeight}`);
    } else {
      console.log("Invoice element is NOT accessible yet");
    }
  }, [order.order_ref, invoiceRef]);

  // Utility functions for formatting
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-ZA', {
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
      });
    } catch (error) {
      console.error(`Error formatting date: ${dateString}`, error);
      return 'Invalid date';
    }
  };

  const formatCurrency = (amount: number) => {
    try {
      if (isNaN(amount)) {
        console.warn(`Invalid amount for formatting: ${amount}`);
        return 'R 0.00';
      }
      return new Intl.NumberFormat('en-ZA', { 
        style: 'currency', 
        currency: 'ZAR',
        minimumFractionDigits: 2
      }).format(amount).replace(/ZAR/g, 'R');
    } catch (error) {
      console.error(`Error formatting currency: ${amount}`, error);
      return 'R 0.00';
    }
  };

  // Calculate financial values with safety checks
  const subtotal = !isNaN(order.total_amount) && !isNaN(order.shipping_fee) 
    ? order.total_amount - order.shipping_fee
    : 0;
  
  // Payment due date (7 days from order date)
  let paymentDueDate: Date;
  try {
    paymentDueDate = new Date(order.created_at);
    paymentDueDate.setDate(paymentDueDate.getDate() + 7);
    if (isNaN(paymentDueDate.getTime())) {
      paymentDueDate = new Date();
      paymentDueDate.setDate(paymentDueDate.getDate() + 7);
    }
  } catch (error) {
    console.error('Error creating payment due date', error);
    paymentDueDate = new Date();
    paymentDueDate.setDate(paymentDueDate.getDate() + 7);
  }
  
  // Payment string for QR code
  const paymentString = `bank:FNB;acc:62792142095;ref:${order.order_ref || 'UNKNOWN'};amount:${!isNaN(order.total_amount) ? order.total_amount.toFixed(2) : 0}`;
  const formattedPhone = order.shipping_address?.phone || '0659387000';

  // Clean, minimalist invoice template - no VAT
  return (
    <div
      ref={invoiceRef}
      id="invoice-content"
      className="font-poppins"
      style={{
        width: '210mm', // A4 width
        height: 'auto', // Auto height for content
        minHeight: '297mm', // A4 height
        padding: '15px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        color: '#333333',
        fontFamily: 'var(--font-poppins), Arial, sans-serif',
        fontSize: '11px',
        lineHeight: '1.3',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden', // Prevent overflows
      }}
    >
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        {/* Logo */}
        <div style={{ width: '100px' }}>
          <img 
            src="/Mopres_Gold_luxury_lifestyle_logo.png" 
            alt="MoPres Logo" 
            style={{ width: '100%', height: 'auto' }} 
          />
        </div>
        
        {/* Company Info */}
        <div style={{ textAlign: 'right' }}>
          <p style={{ 
            margin: '0 0 1px 0',
            fontWeight: '500',
            fontSize: '11px',
            lineHeight: '1.2'
          }}>
            MoPres Fashion<br />
            6680 Witrugeend Street<br />
            578 Heuwelsig Estates<br />
            Cetisdal, Centurion<br />
            South Africa<br />
            Reg: K2018607632<br />
            VAT: 4350288769<br />
            info@mopres.co.za | +27 83 500 5311
          </p>
        </div>
      </div>
      
      {/* Invoice Title */}
      <div style={{ marginBottom: '12px' }}>
        <h1 style={{ 
          color: '#AF8F53',
          fontSize: '24px',
          fontWeight: 'bold',
          margin: '0 0 8px 0',
          letterSpacing: '1px'
        }}>
          INVOICE
        </h1>
        <hr style={{ 
          height: '1px', 
          backgroundColor: '#AF8F53', 
          border: 'none',
          margin: '0'
        }} />
      </div>
      
      {/* Billing and Invoice Details */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        marginBottom: '12px',
        fontSize: '10px',
      }}>
        {/* Billing Info */}
        <div style={{ width: '48%' }}>
          <h3 style={{
            fontSize: '12px',
            fontWeight: 'bold',
            margin: '0 0 4px 0'
          }}>Billed To:</h3>
          <p style={{ margin: '0 0 1px 0', lineHeight: '1.2' }}>
            {order.shipping_address?.firstName} {order.shipping_address?.lastName}<br />
            {order.customer_email}<br />
            {order.shipping_address?.addressLine1}<br />
            {order.shipping_address?.addressLine2 && <>{order.shipping_address.addressLine2}<br/></>}
            {order.shipping_address?.city}, {order.shipping_address?.province}, {order.shipping_address?.postalCode}<br />
            {order.shipping_address?.country}<br />
            {formattedPhone}
          </p>
        </div>
        
        {/* Invoice Details */}
        <div style={{ width: '48%', textAlign: 'right' }}>
          <h3 style={{
            fontSize: '12px',
            fontWeight: 'bold',
            margin: '0 0 4px 0'
          }}>Invoice Details:</h3>
          <p style={{ margin: '0 0 1px 0', lineHeight: '1.2' }}>
            <strong>Invoice No:</strong> {order.order_ref}<br />
            <strong>Date Issued:</strong> {formatDate(order.created_at)}<br />
            <strong>Order Status:</strong> {order.status.toLowerCase()}<br />
            <strong>Payment Due:</strong> {formatDate(paymentDueDate.toISOString())}
          </p>
        </div>
      </div>
      
      {/* Order Items Table */}
      <div style={{ marginBottom: '15px' }}>
        {/* Table Header */}
        <div style={{
          backgroundColor: '#AF8F53',
          padding: '8px',
          display: 'flex',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '11px',
        }}>
          <div style={{ flex: '1', textAlign: 'left' }}>Item</div>
          <div style={{ width: '60px', textAlign: 'center' }}>Qty</div>
          <div style={{ width: '100px', textAlign: 'right' }}>Unit Price</div>
          <div style={{ width: '100px', textAlign: 'right' }}>Total</div>
        </div>
        
        {/* Table Rows */}
        {order.order_items.map((item, index) => (
          <div 
            key={item.id}
            style={{
              display: 'flex',
              padding: '6px 8px',
              backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9f9f9',
              borderBottom: '1px solid #eee',
              fontSize: '11px',
            }}
          >
            <div style={{ flex: '1' }}>
              <div style={{ fontWeight: '600' }}>{item.products?.name || 'Product not found'}</div>
              {item.size && <div style={{ fontSize: '10px', marginTop: '2px' }}>Size: {item.size}</div>}
            </div>
            <div style={{ width: '60px', textAlign: 'center' }}>{item.quantity}</div>
            <div style={{ width: '100px', textAlign: 'right' }}>R {item.price.toFixed(2)}</div>
            <div style={{ width: '100px', textAlign: 'right', fontWeight: '600' }}>R {(item.price * item.quantity).toFixed(2)}</div>
          </div>
        ))}
        
        {/* Totals */}
        <div style={{ marginTop: '10px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            padding: '6px 8px',
            backgroundColor: '#f5f5f5',
            fontSize: '11px',
          }}>
            <div style={{ fontWeight: '600' }}>Subtotal</div>
            <div style={{ width: '100px', textAlign: 'right', fontWeight: '600' }}>R {subtotal.toFixed(2)}</div>
          </div>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            padding: '6px 8px',
            backgroundColor: '#f5f5f5',
            fontSize: '11px',
          }}>
            <div style={{ fontWeight: '600' }}>Shipping</div>
            <div style={{ width: '100px', textAlign: 'right', fontWeight: '600' }}>R {order.shipping_fee.toFixed(2)}</div>
          </div>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            padding: '8px',
            backgroundColor: '#222',
            color: 'white',
            fontSize: '12px',
          }}>
            <div style={{ fontWeight: '600' }}>TOTAL</div>
            <div style={{ 
              width: '100px', 
              textAlign: 'right', 
              fontWeight: '700',
              color: '#AF8F53'
            }}>R {order.total_amount.toFixed(2)}</div>
          </div>
        </div>
      </div>
      
      {/* Payment Details */}
      <div style={{ 
        marginBottom: '15px',
        padding: '15px',
        position: 'relative',
      }}>
        <h3 style={{ 
          fontSize: '16px', 
          fontWeight: 'bold',
          color: '#AF8F53',
          textAlign: 'center',
          margin: '0 0 15px 0',
          borderBottom: '1px solid #AF8F53',
          paddingBottom: '8px',
        }}>
          PAYMENT DETAILS
        </h3>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start' 
        }}>
          <div style={{ width: '65%' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', rowGap: '6px', fontSize: '11px' }}>
              <div style={{ fontWeight: '600' }}>Bank:</div>
              <div>First National Bank (FNB)</div>
              
              <div style={{ fontWeight: '600' }}>Account Name:</div>
              <div>MoPres Fashion</div>
              
              <div style={{ fontWeight: '600' }}>Account Type:</div>
              <div>GOLD BUSINESS ACCOUNT</div>
              
              <div style={{ fontWeight: '600' }}>Account Number:</div>
              <div>62792142095</div>
              
              <div style={{ fontWeight: '600' }}>Branch Code:</div>
              <div>210648</div>
              
              <div style={{ fontWeight: '600' }}>Branch Name:</div>
              <div>JUBILEE MALL</div>
              
              <div style={{ fontWeight: '600', color: '#AF8F53' }}>Reference:</div>
              <div style={{ fontWeight: 'bold', color: '#AF8F53' }}>{order.order_ref}</div>
            </div>
            
            <div style={{ marginTop: '10px', fontSize: '11px' }}>
              Email proof of payment to: <span style={{ fontWeight: '600' }}>payments@mopres.co.za</span>
            </div>
          </div>
          
          <div style={{ width: '30%', textAlign: 'center' }}>
            <div style={{ fontWeight: '600', marginBottom: '6px', fontSize: '12px' }}>
              SCAN TO PAY
            </div>
            <div style={{ 
              backgroundColor: 'white',
              padding: '8px',
              display: 'inline-block'
            }}>
              <QRCodeCanvas
                value={paymentString}
                size={100}
                bgColor={"#ffffff"}
                fgColor={"#000000"}
                level={"M"}
                includeMargin={false}
              />
            </div>
            <div style={{ marginTop: '6px', fontSize: '10px' }}>
              Amount: <span style={{ fontWeight: '600', color: '#AF8F53' }}>R {order.total_amount.toFixed(2)}</span><br/>
              Reference: <span style={{ fontWeight: '600' }}>{order.order_ref}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Terms & Conditions */}
      <div style={{ marginBottom: '15px' }}>
        <h3 style={{ 
          fontSize: '14px', 
          fontWeight: 'bold', 
          margin: '0 0 8px 0'
        }}>Terms & Conditions</h3>
        
        <ul style={{ 
          margin: '0', 
          padding: '0 0 0 18px', 
          listStyle: 'disc',
          fontSize: '11px',
          lineHeight: '1.4'
        }}>
          <li style={{ marginBottom: '3px' }}>Payment is due immediately upon receipt of invoice.</li>
          <li style={{ marginBottom: '3px' }}>Returns accepted within 14 days of purchase with original packaging.</li>
          <li style={{ marginBottom: '3px' }}>Shipping typically takes 3-5 business days within South Africa.</li>
        </ul>
      </div>
      
      {/* Footer */}
      <div style={{ 
        borderTop: '1px solid #AF8F53',
        textAlign: 'center',
        fontSize: '11px',
        paddingTop: '12px',
        marginTop: 'auto',
        marginBottom: '5px'
      }}>
        <div style={{ marginBottom: '5px', color: '#AF8F53', fontWeight: '600' }}>
          Thank you for your business!
        </div>
        <div>
          MoPres Fashion • Reg: K2018607632 • VAT: 4350288769<br />
          www.mopres.co.za • info@mopres.co.za • +27 83 500 5311
        </div>
      </div>
    </div>
  );
};

export default InvoiceTemplateOptimized;
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

  // Company VAT calculation (assuming 15% VAT included in the total)
  const vatRate = 0.15;
  const preTaxAmount = subtotal / (1 + vatRate);
  const vatAmount = subtotal - preTaxAmount;

  // Create payment string for QR code
  const paymentString = `bank:FNB;acc:62792142095;name:MoPres Fashion;branch:210648;amount:${order.total_amount.toFixed(2)};ref:${order.order_ref}`;

  // Define brand colors based on MoPres brand guidelines
  const colors = {
    gold: '#AF8F53',
    lightGold: '#CCAD69',
    deepGold: '#81672C',
    black: '#0A0A0A',
    ivory: '#F5F5F3',
    platinum: '#BFBFBF',
    red: '#C1121F',
    textDark: '#222222',
    textLight: '#6c757d',
    backgroundLight: '#F9F9F9',
    borderLight: '#E9ECEF'
  };

  // Basic template structure - Use Tailwind for styling
  // NOTE: html2canvas might have limitations with complex CSS like flex/grid.
  // Consider using simpler table layouts if rendering issues occur.
  return (
    // This div will be captured by html2canvas. Style it like an A4 page.
    // Position it off-screen so it doesn't interfere with the main UI.
    <div
      ref={invoiceRef}
      id="invoice-content"
      style={{
        position: 'absolute',
        left: '-9999px', // Position off-screen
        top: '-9999px',
        width: '210mm', // A4 width
        minHeight: '297mm', // A4 height
        padding: '48px', // Increased padding
        boxShadow: '0 2px 20px rgba(0,0,0,0.08)', // Subtle shadow for depth
        color: colors.textDark, // Default text color
        fontSize: '12px', // Base font size
        fontFamily: 'Montserrat, Arial, sans-serif', // Brand font
        backgroundColor: '#FFFFFF',
        borderRadius: '2px',
        borderTop: `8px solid ${colors.gold}`, // Gold accent bar at top
      }}
    >
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        paddingBottom: '22px', 
        marginBottom: '30px',
        borderBottom: `1px solid ${colors.borderLight}`,
        position: 'relative'
      }}>
        <div style={{ position: 'relative' }}>
          {/* Use inline style for base64 image or ensure image is accessible */}
          <img 
            src="/Mopres_Gold_luxury_lifestyle_logo.png" 
            alt="MoPres Logo" 
            style={{ 
              height: '80px', 
              marginBottom: '15px',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
            }} 
          />
          <h1 style={{ 
            color: colors.gold, 
            fontSize: '32px', 
            fontWeight: 'bold', 
            margin: '5px 0 0 0', 
            textTransform: 'uppercase',
            fontFamily: 'Poppins, Helvetica, Arial, sans-serif',
            letterSpacing: '-0.5px'
          }}>
            Invoice
          </h1>
          
          {/* Invoice Number Accent Badge */}
          <div style={{
            position: 'absolute',
            top: '110px',
            left: '0',
            backgroundColor: colors.backgroundLight,
            padding: '6px 12px',
            borderRadius: '4px',
            border: `1px solid ${colors.borderLight}`,
          }}>
            <p style={{ 
              margin: 0, 
              fontWeight: '600', 
              color: colors.gold,
              fontFamily: 'Poppins, Helvetica, Arial, sans-serif',
              fontSize: '14px'
            }}>
              #{order.order_ref}
            </p>
          </div>
        </div>
        
        <div style={{ 
          textAlign: 'right', 
          fontSize: '11px', 
          color: colors.textLight,
          backgroundColor: colors.backgroundLight,
          padding: '18px',
          borderRadius: '4px',
          border: `1px solid ${colors.borderLight}`,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <p style={{ margin: '0 0 3px 0', fontWeight: 'bold', color: colors.textDark, fontSize: '13px' }}>MoPres Fashion</p>
          <p style={{ margin: '0 0 3px 0' }}>6680 Witrugeend Street</p>
          <p style={{ margin: '0 0 3px 0' }}>578 Heuwelsig Estates</p>
          <p style={{ margin: '0 0 3px 0' }}>Cetisdal, Centurion</p>
          <p style={{ margin: '0 0 3px 0' }}>South Africa</p>
          <p style={{ margin: '8px 0 3px 0', borderTop: `1px solid ${colors.borderLight}`, paddingTop: '8px' }}>Reg: K2018607632</p>
          <p style={{ margin: '0 0 3px 0' }}>VAT: 4350288769</p>
          <p style={{ margin: '8px 0 0 0', borderTop: `1px solid ${colors.borderLight}`, paddingTop: '8px' }}>
            <span style={{ fontWeight: '500', color: colors.gold }}>info@mopres.co.za | +27 83 500 5311</span>
          </p>
        </div>
      </div>
      
      {/* Order Details */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginBottom: '35px', 
        fontSize: '12px',
        gap: '30px'
      }}>
        <div style={{
          backgroundColor: colors.backgroundLight,
          padding: '18px',
          borderRadius: '4px',
          border: `1px solid ${colors.borderLight}`,
          flex: '1'
        }}>
          <p style={{ 
            margin: '0 0 10px 0', 
            fontFamily: 'Poppins, Helvetica, Arial, sans-serif',
            fontSize: '14px',
            color: colors.gold,
            fontWeight: '600',
            borderBottom: `1px solid ${colors.borderLight}`,
            paddingBottom: '8px'
          }}>Billed To</p>
          <p style={{ margin: '0 0 4px 0', fontWeight: '600', fontSize: '13px' }}>
            {order.shipping_address?.firstName} {order.shipping_address?.lastName}
          </p>
          <p style={{ margin: '0 0 4px 0' }}>{order.customer_email}</p>
          <p style={{ margin: '0 0 2px 0' }}>{order.shipping_address?.addressLine1}</p>
          {order.shipping_address?.addressLine2 && <p style={{ margin: '0 0 2px 0' }}>{order.shipping_address.addressLine2}</p>}
          <p style={{ margin: '0 0 2px 0' }}>{order.shipping_address?.city}, {order.shipping_address?.province}, {order.shipping_address?.postalCode}</p>
          <p style={{ margin: '0 0 2px 0' }}>{order.shipping_address?.country}</p>
          {order.shipping_address?.phone && <p style={{ margin: '8px 0 0 0', paddingTop: '8px', borderTop: `1px solid ${colors.borderLight}` }}>
            <span style={{ fontWeight: '500' }}>Phone: </span>{order.shipping_address.phone}
          </p>}
        </div>
        
        <div style={{
          flex: '1',
          backgroundColor: colors.backgroundLight,
          padding: '18px',
          borderRadius: '4px',
          border: `1px solid ${colors.borderLight}`
        }}>
          <p style={{ 
            margin: '0 0 10px 0', 
            fontFamily: 'Poppins, Helvetica, Arial, sans-serif',
            fontSize: '14px',
            color: colors.gold,
            fontWeight: '600',
            borderBottom: `1px solid ${colors.borderLight}`,
            paddingBottom: '8px',
            textAlign: 'right'
          }}>Invoice Details</p>
          <table style={{ width: '100%', fontSize: '12px' }}>
            <tbody>
              <tr>
                <td style={{ padding: '4px 0', fontWeight: '500', color: colors.textLight }}>Date Issued:</td>
                <td style={{ padding: '4px 0', textAlign: 'right' }}>{formatDate(order.created_at)}</td>
              </tr>
              <tr>
                <td style={{ padding: '4px 0', fontWeight: '500', color: colors.textLight }}>Order Status:</td>
                <td style={{ padding: '4px 0', textAlign: 'right' }}>
                  <span style={{
                    display: 'inline-block',
                    backgroundColor: order.status.toLowerCase() === 'completed' ? '#e6f4ea' : '#fff8e6',
                    color: order.status.toLowerCase() === 'completed' ? '#34a853' : '#f6b73c',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '600'
                  }}>
                    {order.status}
                  </span>
                </td>
              </tr>
              <tr>
                <td style={{ padding: '4px 0', fontWeight: '500', color: colors.textLight }}>Payment Due:</td>
                <td style={{ padding: '4px 0', textAlign: 'right' }}>{formatDate(order.created_at)}</td> {/* Due immediately */}
              </tr>
              <tr>
                <td colSpan={2} style={{ padding: '15px 0 5px 0' }}>
                  <div style={{ 
                    width: '100%', 
                    textAlign: 'center', 
                    padding: '8px',
                    backgroundColor: '#0A0A0A',
                    borderRadius: '4px',
                    color: '#FFFFFF',
                    fontFamily: 'Poppins, Helvetica, Arial, sans-serif',
                    fontWeight: '600'
                  }}>
                    {formatCurrency(order.total_amount)} Due Now
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Items Table */}
      <div style={{ 
        borderRadius: '4px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        marginBottom: '35px'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ 
              backgroundColor: colors.gold, 
              color: '#FFFFFF', 
              fontWeight: 'bold',
              fontFamily: 'Poppins, Helvetica, Arial, sans-serif'
            }}>
              <th style={{ padding: '12px 15px', textAlign: 'left' }}>Item</th>
              <th style={{ padding: '12px 15px', textAlign: 'center', width: '60px' }}>Qty</th>
              <th style={{ padding: '12px 15px', textAlign: 'right', width: '120px' }}>Unit Price</th>
              <th style={{ padding: '12px 15px', textAlign: 'right', width: '120px' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {order.order_items.map((item, index) => (
              <tr key={item.id} style={{ 
                borderBottom: index === order.order_items.length - 1 ? 'none' : `1px solid ${colors.borderLight}`,
                backgroundColor: index % 2 === 0 ? '#FFFFFF' : colors.backgroundLight
              }}>
                <td style={{ padding: '14px 15px', verticalAlign: 'top' }}>
                  <p style={{ margin: '0 0 2px 0', fontWeight: '500' }}>{item.products?.name || 'Product not found'}</p>
                  {item.size && <span style={{ fontSize: '11px', color: colors.textLight, display: 'block', marginTop: '4px' }}>Size: {item.size}</span>}
                  {item.products?.sku && <span style={{ fontSize: '11px', color: colors.textLight, display: 'block', marginTop: '2px' }}>SKU: {item.products.sku}</span>}
                </td>
                <td style={{ padding: '14px 15px', textAlign: 'center', verticalAlign: 'top' }}>
                  <span style={{ 
                    display: 'inline-block',
                    backgroundColor: '#f1f1f1',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '600',
                    minWidth: '30px'
                  }}>
                    {item.quantity}
                  </span>
                </td>
                <td style={{ padding: '14px 15px', textAlign: 'right', verticalAlign: 'top', fontWeight: '500' }}>{formatCurrency(item.price)}</td>
                <td style={{ padding: '14px 15px', textAlign: 'right', verticalAlign: 'top', fontWeight: '600' }}>{formatCurrency(item.price * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Totals Section */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '35px' }}>
        <div style={{ 
          width: '300px', 
          fontSize: '13px',
          backgroundColor: colors.backgroundLight,
          padding: '20px',
          borderRadius: '4px',
          border: `1px solid ${colors.borderLight}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ color: colors.textLight, fontWeight: '500' }}>Subtotal:</span>
            <span style={{ fontWeight: '500' }}>{formatCurrency(subtotal)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ color: colors.textLight, fontWeight: '500' }}>VAT (15%):</span>
            <span style={{ fontWeight: '500' }}>{formatCurrency(vatAmount)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
            <span style={{ color: colors.textLight, fontWeight: '500' }}>Shipping:</span>
            <span style={{ fontWeight: '500' }}>
              {order.shipping_fee === 0 ? (
                <span style={{ color: '#34a853', fontWeight: '600' }}>FREE</span>
              ) : formatCurrency(order.shipping_fee)}
            </span>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            borderTop: `1px solid ${colors.borderLight}`, 
            paddingTop: '15px', 
            marginTop: '5px',
            fontWeight: 'bold', 
            fontSize: '16px',
            fontFamily: 'Poppins, Helvetica, Arial, sans-serif'
          }}>
            <span style={{ color: colors.textDark }}>Total Due:</span>
            <span style={{ color: colors.gold }}>{formatCurrency(order.total_amount)}</span>
          </div>
        </div>
      </div>
      
      {/* Payment Instructions & QR Code */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        gap: '30px',
        borderRadius: '4px',
        overflow: 'hidden',
        marginBottom: '35px',
        border: `1px solid ${colors.gold}`,
        backgroundColor: '#FFF9E6'
      }}>
        <div style={{ 
          flex: '1',
          padding: '20px'
        }}>
          <h4 style={{ 
            fontWeight: 'bold', 
            marginTop: 0,
            marginBottom: '15px', 
            color: colors.gold, 
            fontSize: '14px',
            fontFamily: 'Poppins, Helvetica, Arial, sans-serif'
          }}>Payment Instructions (EFT/Bank Deposit)</h4>
          
          <table style={{ width: '100%', fontSize: '12px' }}>
            <tbody>
              <tr>
                <td style={{ padding: '4px 0', fontWeight: '500', color: colors.textLight, width: '35%' }}>Bank:</td>
                <td style={{ padding: '4px 0' }}>First National Bank (FNB)</td>
              </tr>
              <tr>
                <td style={{ padding: '4px 0', fontWeight: '500', color: colors.textLight }}>Account Name:</td>
                <td style={{ padding: '4px 0' }}>MoPres Fashion</td>
              </tr>
              <tr>
                <td style={{ padding: '4px 0', fontWeight: '500', color: colors.textLight }}>Account Type:</td>
                <td style={{ padding: '4px 0' }}>GOLD BUSINESS ACCOUNT</td>
              </tr>
              <tr>
                <td style={{ padding: '4px 0', fontWeight: '500', color: colors.textLight }}>Account Number:</td>
                <td style={{ padding: '4px 0' }}>62792142095</td>
              </tr>
              <tr>
                <td style={{ padding: '4px 0', fontWeight: '500', color: colors.textLight }}>Branch Code:</td>
                <td style={{ padding: '4px 0' }}>210648</td>
              </tr>
              <tr>
                <td style={{ padding: '4px 0', fontWeight: '500', color: colors.textLight }}>Branch Name:</td>
                <td style={{ padding: '4px 0' }}>JUBILEE MALL</td>
              </tr>
              <tr>
                <td style={{ padding: '4px 0', fontWeight: '500', color: colors.textLight }}>Swift Code:</td>
                <td style={{ padding: '4px 0' }}>FIRNZAJU</td>
              </tr>
              <tr>
                <td style={{ padding: '4px 0', fontWeight: '600', color: colors.gold }}>Reference:</td>
                <td style={{ padding: '4px 0', fontWeight: '600', color: colors.gold }}>{order.order_ref}</td>
              </tr>
            </tbody>
          </table>
          
          <div style={{ 
            marginTop: '15px', 
            backgroundColor: '#FFFFFF',
            padding: '10px',
            borderRadius: '4px',
            border: `1px solid ${colors.borderLight}`,
            fontSize: '12px'
          }}>
            <p style={{ margin: '0' }}>
              <span style={{ fontWeight: '600' }}>Important:</span> Please email your proof of payment to{' '}
              <span style={{ color: colors.gold, fontWeight: '600' }}>payments@mopres.co.za</span>
            </p>
          </div>
        </div>
        
        {/* QR Code Section */}
        <div style={{ 
          width: '180px',
          textAlign: 'center', 
          backgroundColor: colors.black,
          color: '#FFFFFF',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <p style={{ 
            fontSize: '14px', 
            marginBottom: '15px',
            fontWeight: '600',
            fontFamily: 'Poppins, Helvetica, Arial, sans-serif'
          }}>
            Scan to Pay
          </p>
          
          <div style={{ 
            backgroundColor: '#FFFFFF',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '15px'
          }}>
            <QRCodeCanvas
              value={paymentString} // Payment data encoded
              size={120} // QR code size
              bgColor={"#ffffff"}
              fgColor={"#000000"}
              level={"M"} // Medium error correction level
              includeMargin={true}
            />
          </div>
          
          <p style={{ 
            fontSize: '11px',
            margin: '0 0 5px 0',
            fontWeight: '500',
            color: colors.gold
          }}>
            Amount: {formatCurrency(order.total_amount)}
          </p>
          <p style={{ 
            fontSize: '11px',
            margin: '0',
            fontWeight: '500',
            color: colors.gold
          }}>
            Reference: {order.order_ref}
          </p>
        </div>
      </div>
      
      {/* Policies Section */}
      <div style={{ 
        marginBottom: '35px', 
        fontSize: '12px', 
        color: colors.textLight,
        backgroundColor: colors.backgroundLight,
        padding: '20px',
        borderRadius: '4px',
        border: `1px solid ${colors.borderLight}`
      }}>
        <h4 style={{ 
          fontWeight: 'bold', 
          marginTop: 0,
          marginBottom: '12px', 
          color: colors.textDark, 
          fontSize: '14px',
          fontFamily: 'Poppins, Helvetica, Arial, sans-serif'
        }}>
          Terms & Conditions
        </h4>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '20px', rowGap: '6px' }}>
          <p style={{ margin: '0', display: 'flex', alignItems: 'flex-start' }}>
            <span style={{ 
              color: colors.gold, 
              fontSize: '16px', 
              marginRight: '8px',
              lineHeight: 1
            }}>•</span>
            Payment is due immediately upon receipt
          </p>
          <p style={{ margin: '0', display: 'flex', alignItems: 'flex-start' }}>
            <span style={{ 
              color: colors.gold, 
              fontSize: '16px', 
              marginRight: '8px',
              lineHeight: 1
            }}>•</span>
            Returns accepted within 14 days with packaging
          </p>
          <p style={{ margin: '0', display: 'flex', alignItems: 'flex-start' }}>
            <span style={{ 
              color: colors.gold, 
              fontSize: '16px', 
              marginRight: '8px',
              lineHeight: 1
            }}>•</span>
            Shipping takes 3-5 business days in South Africa
          </p>
          <p style={{ margin: '0', display: 'flex', alignItems: 'flex-start' }}>
            <span style={{ 
              color: colors.gold, 
              fontSize: '16px', 
              marginRight: '8px',
              lineHeight: 1
            }}>•</span>
            Full terms at www.mopres.co.za/terms
          </p>
        </div>
      </div>
      
      {/* Footer */}
      <div style={{ 
        backgroundColor: colors.black,
        borderRadius: '4px',
        padding: '25px 20px',
        marginTop: '10px',
        fontSize: '11px',
        textAlign: 'center',
        color: '#999999',
        position: 'relative'
      }}>
        <img 
          src="/Mopres_Gold_luxury_lifestyle_logo.png" 
          alt="MoPres Logo" 
          style={{ 
            height: '40px', 
            marginBottom: '15px' 
          }} 
        />
        
        <p style={{ margin: '0 0 5px 0', color: '#FFFFFF', fontSize: '13px', fontWeight: '500' }}>
          Thank you for your business!
        </p>
        
        <p style={{ margin: '12px 0 5px 0' }}>
          MoPres Fashion • Reg: K2018607632 • VAT: 4350288769
        </p>
        
        <p style={{ margin: 0 }}>
          <span style={{ color: colors.gold }}>www.mopres.co.za</span> • 
          <span style={{ color: colors.gold }}> info@mopres.co.za</span> • 
          <span style={{ color: colors.gold }}> +27 83 500 5311</span>
        </p>
      </div>
    </div>
  );
};

export default InvoiceTemplate;
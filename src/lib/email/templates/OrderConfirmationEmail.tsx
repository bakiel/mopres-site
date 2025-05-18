import * as React from 'react';
import { 
  Html, 
  Body, 
  Head, 
  Heading, 
  Container, 
  Preview, 
  Section, 
  Text, 
  Img, 
  Row, 
  Column, 
  Hr, 
  Link,
  Button,
  Font
} from '@react-email/components';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  products: {
    name: string;
    sku?: string;
    images?: string[];
  } | null;
  size?: string;
}

interface OrderConfirmationEmailProps {
  order: {
    order_ref: string;
    customer_name: string;
    total_amount: number;
    shipping_fee: number;
    created_at: string;
    status: string;
    order_items: OrderItem[];
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
    };
    payment_method?: string | null;
  };
  estimatedDelivery: string;
  orderUrl: string;
  productImages: { [productId: string]: string };
}

export const OrderConfirmationEmail = ({ 
  order, 
  estimatedDelivery,
  orderUrl,
  productImages,
}: OrderConfirmationEmailProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', { 
      style: 'currency', 
      currency: 'ZAR' 
    }).format(amount);
  };

  const subtotal = order.total_amount - order.shipping_fee;

  return (
    <Html>
      <Head>
        <title>MoPres Fashion - Your Order #{order.order_ref} Confirmation</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <Font
          fontFamily="Montserrat"
          fallbackFontFamily="Helvetica"
          webFont={{
            url: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
        <Font
          fontFamily="Poppins"
          fallbackFontFamily="Arial"
          webFont={{
            url: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>Thank you for your order! Your MoPres Fashion order #{order.order_ref} has been received</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={headerSection}>
            <Img
              src="https://gfbedvoexpulmmfitxje.supabase.co/storage/v1/object/public/assets/Mopres_Gold_luxury_lifestyle_logo.png"
              width="180"
              height="76"
              alt="MoPres Fashion"
              style={logo}
            />
          </Section>
          
          {/* Hero Banner */}
          <Section style={heroBanner}>
            <Row>
              <Column>
                <Heading style={heroHeading}>Thank You For Your Order!</Heading>
                <Text style={heroSubheading}>Your order has been received and is being processed</Text>
              </Column>
            </Row>
          </Section>
          
          {/* Order Badge */}
          <Section style={orderBadgeSection}>
            <Row>
              <Column style={orderBadgeColumn}>
                <Text style={orderBadgeText}>
                  Order <span style={{ padding: '0 3px' }}>|</span> #{order.order_ref}
                </Text>
              </Column>
            </Row>
          </Section>
          
          {/* Main Content */}
          <Section style={section}>
            <Text style={greeting}>
              Hello {order.shipping_address.firstName || 'Valued Customer'},
            </Text>
            
            <Text style={text}>
              Thank you for shopping with MoPres Fashion! We're thrilled to confirm that we've 
              received your order. Our team is already working on processing it so you can enjoy 
              your luxury fashion items as soon as possible.
            </Text>
            
            {/* Order Summary Box */}
            <Section style={summaryBoxWrapper}>
              <Section style={summaryBox}>
                <Row>
                  <Column>
                    <Text style={summaryHeading}>
                      Order Summary
                    </Text>
                  </Column>
                </Row>
                
                <Section style={summaryContent}>
                  <Row style={summaryRow}>
                    <Column style={summaryLabel}>Order Number:</Column>
                    <Column style={summaryValue}>{order.order_ref}</Column>
                  </Row>
                  <Row style={summaryRow}>
                    <Column style={summaryLabel}>Order Date:</Column>
                    <Column style={summaryValue}>{formatDate(order.created_at)}</Column>
                  </Row>
                  <Row style={summaryRow}>
                    <Column style={summaryLabel}>Payment Method:</Column>
                    <Column style={summaryValue}>{order.payment_method === 'eft' ? 'EFT / Bank Deposit' : (order.payment_method || 'N/A')}</Column>
                  </Row>
                  <Row style={summaryRow}>
                    <Column style={summaryLabel}>Order Status:</Column>
                    <Column style={summaryValue}>
                      <span style={{ 
                        backgroundColor: order.status.toLowerCase() === 'completed' ? '#e6f4ea' : (order.status.toLowerCase() === 'pending_payment' ? '#fff8e6' : '#f1f1f1'),
                        color: order.status.toLowerCase() === 'completed' ? '#34a853' : (order.status.toLowerCase() === 'pending_payment' ? '#f6b73c' : '#666666'),
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600',
                      }}>
                        {order.status.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </Column>
                  </Row>
                  <Row style={summaryRow}>
                    <Column style={summaryLabel}>Est. Delivery:</Column>
                    <Column style={summaryValue}>{estimatedDelivery}</Column>
                  </Row>
                </Section>
              </Section>
            </Section>
            
            {/* View Order Button */}
            <Section style={actionsSection}>
              <Link href={orderUrl} style={viewOrderButton}>
                View Order Details
              </Link>
            </Section>
            
            {/* Shipping Address */}
            <Text style={sectionHeading}>
              Shipping Address
            </Text>
            
            <Section style={addressBoxWrapper}>
              <Section style={addressBox}>
                <Text style={addressText}>
                  {order.shipping_address.firstName} {order.shipping_address.lastName}<br />
                  {order.shipping_address.addressLine1}<br />
                  {order.shipping_address.addressLine2 && <>{order.shipping_address.addressLine2}<br /></>}
                  {order.shipping_address.city}, {order.shipping_address.province}, {order.shipping_address.postalCode}<br />
                  {order.shipping_address.country}<br />
                  {order.shipping_address.phone && <>Phone: {order.shipping_address.phone}</>}
                </Text>
              </Section>
            </Section>
            
            {/* Order Items */}
            <Text style={sectionHeading}>
              Order Items
            </Text>
            
            {/* Products Table */}
            <Section style={productsTableWrapper}>
              {order.order_items.map((item, index) => (
                <Section key={item.id} style={index > 0 ? productItemDivided : productItem}>
                  <Row>
                    {/* Product Image */}
                    <Column style={productImageColumn}>
                      <Img
                        src={productImages[item.id] || 'https://gfbedvoexpulmmfitxje.supabase.co/storage/v1/object/public/assets/product-placeholder.png'}
                        width="80"
                        height="80"
                        alt={item.products?.name || 'Product'}
                        style={productImage}
                      />
                    </Column>
                    
                    {/* Product Info */}
                    <Column style={productInfoColumn}>
                      <Text style={productName}>
                        {item.products?.name || 'Product'}
                      </Text>
                      {item.size && (
                        <Text style={productMeta}>
                          Size: {item.size}
                        </Text>
                      )}
                      <Text style={productMeta}>
                        Quantity: {item.quantity}
                      </Text>
                      <Text style={productPrice}>
                        {formatCurrency(item.price)}
                      </Text>
                    </Column>
                    
                    {/* Item Total */}
                    <Column style={productTotalColumn}>
                      <Text style={productTotal}>
                        {formatCurrency(item.price * item.quantity)}
                      </Text>
                    </Column>
                  </Row>
                </Section>
              ))}
            </Section>
            
            {/* Order Totals */}
            <Section style={orderTotalsWrapper}>
              <Row style={totalRow}>
                <Column style={totalLabel}>Subtotal:</Column>
                <Column style={totalValue}>{formatCurrency(subtotal)}</Column>
              </Row>
              <Row style={totalRow}>
                <Column style={totalLabel}>Shipping:</Column>
                <Column style={totalValue}>
                  {order.shipping_fee === 0 ? (
                    <span style={{ color: '#34a853', fontWeight: '600' }}>FREE</span>
                  ) : formatCurrency(order.shipping_fee)}
                </Column>
              </Row>
              <Row style={totalRowFinal}>
                <Column style={totalLabelFinal}>Total:</Column>
                <Column style={totalValueFinal}>{formatCurrency(order.total_amount)}</Column>
              </Row>
            </Section>
            
            {/* Payment Instructions for EFT */}
            {order.payment_method === 'eft' && (
              <>
                <Text style={sectionHeading}>
                  Payment Instructions
                </Text>
                
                <Text style={text}>
                  Your order is awaiting payment. Please transfer the full amount to our bank account 
                  using the details below. For faster processing, include your order number as payment reference:
                </Text>
                
                <Section style={bankingInfoBoxWrapper}>
                  <Section style={bankingInfoBox}>
                    <Row style={bankingRow}>
                      <Column style={bankingLabel}>Bank:</Column>
                      <Column style={bankingValue}>First National Bank (FNB)</Column>
                    </Row>
                    <Row style={bankingRow}>
                      <Column style={bankingLabel}>Account Name:</Column>
                      <Column style={bankingValue}>MoPres Fashion</Column>
                    </Row>
                    <Row style={bankingRow}>
                      <Column style={bankingLabel}>Account Type:</Column>
                      <Column style={bankingValue}>GOLD BUSINESS ACCOUNT</Column>
                    </Row>
                    <Row style={bankingRow}>
                      <Column style={bankingLabel}>Account Number:</Column>
                      <Column style={bankingValue}>62792142095</Column>
                    </Row>
                    <Row style={bankingRow}>
                      <Column style={bankingLabel}>Branch Code:</Column>
                      <Column style={bankingValue}>210648</Column>
                    </Row>
                    <Row style={bankingRow}>
                      <Column style={bankingLabel}>Branch Name:</Column>
                      <Column style={bankingValue}>JUBILEE MALL</Column>
                    </Row>
                    <Row style={bankingRow}>
                      <Column style={bankingLabel}>Reference:</Column>
                      <Column style={bankingValueAccent}>{order.order_ref}</Column>
                    </Row>
                  </Section>
                </Section>
                
                <Text style={text}>
                  After making payment, please email your proof of payment to <Link href="mailto:payments@mopres.co.za" style={link}>payments@mopres.co.za</Link> to help us process your order faster.
                </Text>
              </>
            )}
            
            {/* What's Next */}
            <Text style={sectionHeading}>
              What's Next?
            </Text>
            
            <Section style={stepsWrapper}>
              <Section style={step}>
                <Text style={stepNumber}>1</Text>
                <Text style={stepTitle}>Order Processing</Text>
                <Text style={stepDescription}>
                  We're preparing your items for shipment. You'll receive updates via email.
                </Text>
              </Section>
              
              <Section style={step}>
                <Text style={stepNumber}>2</Text>
                <Text style={stepTitle}>Shipping</Text>
                <Text style={stepDescription}>
                  Once your order ships, we'll send you tracking information so you can follow its journey.
                </Text>
              </Section>
              
              <Section style={step}>
                <Text style={stepNumber}>3</Text>
                <Text style={stepTitle}>Delivery</Text>
                <Text style={stepDescription}>
                  Your luxury items will be delivered to your specified address. Estimated delivery: {estimatedDelivery}.
                </Text>
              </Section>
            </Section>
            
            {/* Divider */}
            <Hr style={divider} />
            
            {/* Help Section */}
            <Text style={helpText}>
              If you have any questions about your order, please contact our customer service team:
            </Text>
            
            <Section style={contactBoxWrapper}>
              <Section style={contactBox}>
                <Text style={contactItem}>
                  <Img 
                    src="https://gfbedvoexpulmmfitxje.supabase.co/storage/v1/object/public/assets/email-icon.png" 
                    width="18" 
                    height="18" 
                    alt="Email" 
                    style={contactIcon} 
                  />
                  <Link href="mailto:support@mopres.co.za" style={contactLink}>support@mopres.co.za</Link>
                </Text>
                <Text style={contactItem}>
                  <Img 
                    src="https://gfbedvoexpulmmfitxje.supabase.co/storage/v1/object/public/assets/phone-icon.png" 
                    width="18" 
                    height="18" 
                    alt="Phone" 
                    style={contactIcon} 
                  />
                  +27 83 500 5311
                </Text>
                <Text style={contactItem}>
                  <Img 
                    src="https://gfbedvoexpulmmfitxje.supabase.co/storage/v1/object/public/assets/web-icon.png" 
                    width="18" 
                    height="18" 
                    alt="Website" 
                    style={contactIcon} 
                  />
                  <Link href="https://www.mopres.co.za" style={contactLink}>www.mopres.co.za</Link>
                </Text>
              </Section>
            </Section>
            
            {/* Signature */}
            <Section style={signatureWrapper}>
              <Text style={signature}>
                Thank you for choosing MoPres Fashion!<br />
                <span style={{ fontWeight: '600', color: '#333333', fontStyle: 'normal' }}>The MoPres Fashion Team</span>
              </Text>
            </Section>
          </Section>
          
          {/* Footer */}
          <Section style={footer}>
            <Img
              src="https://gfbedvoexpulmmfitxje.supabase.co/storage/v1/object/public/assets/Mopres_Gold_luxury_lifestyle_logo.png"
              width="120"
              height="50"
              alt="MoPres Fashion"
              style={footerLogo}
            />
            
            {/* Social Links */}
            <Section style={socialLinks}>
              <Link href="https://www.instagram.com/mopresfashion" style={socialLink}>
                <Img 
                  src="https://gfbedvoexpulmmfitxje.supabase.co/storage/v1/object/public/assets/instagram-icon.png" 
                  width="26" 
                  height="26" 
                  alt="Instagram" 
                />
              </Link>
              <Link href="https://www.facebook.com/mopresfashion" style={socialLink}>
                <Img 
                  src="https://gfbedvoexpulmmfitxje.supabase.co/storage/v1/object/public/assets/facebook-icon.png" 
                  width="26" 
                  height="26" 
                  alt="Facebook" 
                />
              </Link>
              <Link href="https://www.pinterest.com/mopresfashion" style={socialLink}>
                <Img 
                  src="https://gfbedvoexpulmmfitxje.supabase.co/storage/v1/object/public/assets/pinterest-icon.png" 
                  width="26" 
                  height="26" 
                  alt="Pinterest" 
                />
              </Link>
            </Section>
            
            <Text style={footerText}>
              MoPres Fashion | 6680 Witrugeend Street, 578 Heuwelsig Estates
            </Text>
            <Text style={footerText}>
              Cetisdal, Centurion, South Africa
            </Text>
            
            <Text style={footerText}>
              © {new Date().getFullYear()} MoPres Fashion. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: '#f9f9f9',
  fontFamily: 'Montserrat, Helvetica, Arial, sans-serif',
  padding: '40px 0',
  margin: 0,
  color: '#444444',
};

const container = {
  margin: '0 auto',
  backgroundColor: '#ffffff',
  border: '1px solid #e8e8e8',
  borderRadius: '8px',
  maxWidth: '600px',
  width: '100%',
  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
  overflow: 'hidden',
};

const headerSection = {
  padding: '30px 0',
  textAlign: 'center' as const,
  backgroundColor: '#0A0A0A',
  borderBottom: '1px solid #222222',
};

const logo = {
  margin: '0 auto',
};

const heroBanner = {
  backgroundColor: '#AF8F53',
  padding: '30px 20px',
  textAlign: 'center' as const,
};

const heroHeading = {
  fontFamily: 'Poppins, Helvetica, Arial, sans-serif',
  fontSize: '28px',
  lineHeight: '1.3',
  fontWeight: '700',
  color: '#FFFFFF',
  margin: '0 0 10px 0',
  textAlign: 'center' as const,
  letterSpacing: '-0.5px',
};

const heroSubheading = {
  fontFamily: 'Montserrat, Helvetica, Arial, sans-serif',
  fontSize: '16px',
  lineHeight: '1.5',
  fontWeight: '400',
  color: '#FFFFFF',
  margin: '0',
  textAlign: 'center' as const,
  opacity: '0.9',
};

const orderBadgeSection = {
  padding: '0',
  marginTop: '-18px',
  textAlign: 'center' as const,
};

const orderBadgeColumn = {
  textAlign: 'center' as const,
};

const orderBadgeText = {
  fontFamily: 'Poppins, Helvetica, Arial, sans-serif',
  backgroundColor: '#0A0A0A',
  color: '#FFFFFF',
  fontSize: '14px',
  fontWeight: '600',
  padding: '8px 20px',
  borderRadius: '50px',
  display: 'inline-block',
  margin: '0 auto',
  letterSpacing: '0.5px',
};

const section = {
  padding: '40px',
};

const greeting = {
  fontSize: '17px',
  lineHeight: '1.5',
  color: '#333333',
  margin: '0 0 18px 0',
  fontWeight: '600',
  fontFamily: 'Poppins, Helvetica, Arial, sans-serif',
};

const text = {
  fontSize: '15px',
  lineHeight: '1.6',
  color: '#444444',
  margin: '0 0 25px 0',
};

const sectionHeading = {
  fontFamily: 'Poppins, Helvetica, Arial, sans-serif',
  fontSize: '20px',
  lineHeight: '1.3',
  fontWeight: '600',
  color: '#0A0A0A',
  margin: '35px 0 15px 0',
  letterSpacing: '-0.5px',
};

const summaryBoxWrapper = {
  margin: '30px 0',
};

const summaryBox = {
  backgroundColor: '#FFFFFF',
  borderRadius: '8px',
  overflow: 'hidden',
  border: '1px solid #eeeeee',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
};

const summaryHeading = {
  fontFamily: 'Poppins, Helvetica, Arial, sans-serif',
  backgroundColor: '#0A0A0A',
  color: '#FFFFFF',
  padding: '15px 20px',
  margin: '0',
  fontSize: '16px',
  fontWeight: '600',
  letterSpacing: '0.3px',
};

const summaryContent = {
  padding: '20px',
};

const summaryRow = {
  margin: '0 0 12px 0',
};

const summaryLabel = {
  width: '40%',
  fontSize: '14px',
  color: '#666666',
  fontWeight: '500',
  paddingRight: '10px',
};

const summaryValue = {
  width: '60%',
  fontSize: '14px',
  color: '#333333',
  fontWeight: '500',
};

const actionsSection = {
  margin: '30px 0',
  textAlign: 'center' as const,
};

const viewOrderButton = {
  backgroundColor: '#AF8F53',
  borderRadius: '6px',
  color: '#FFFFFF',
  display: 'inline-block',
  fontSize: '15px',
  fontWeight: 'bold',
  fontFamily: 'Poppins, Helvetica, Arial, sans-serif',
  textDecoration: 'none',
  textAlign: 'center' as const,
  padding: '15px 30px',
  boxShadow: '0 3px 6px rgba(0, 0, 0, 0.1)',
  letterSpacing: '0.5px',
  transition: 'all 0.3s ease',
};

const addressBoxWrapper = {
  margin: '20px 0',
};

const addressBox = {
  backgroundColor: '#f9f9f9',
  borderRadius: '8px',
  padding: '20px 22px',
  margin: '0',
  border: '1px solid #eeeeee',
  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.03)',
};

const addressText = {
  fontSize: '14px',
  lineHeight: '1.6',
  color: '#444444',
  margin: '0',
};

const productsTableWrapper = {
  margin: '20px 0',
  border: '1px solid #eeeeee',
  borderRadius: '8px',
  overflow: 'hidden',
  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.03)',
};

const productItem = {
  padding: '15px 20px',
  backgroundColor: '#ffffff',
};

const productItemDivided = {
  padding: '15px 20px',
  backgroundColor: '#ffffff',
  borderTop: '1px solid #eeeeee',
};

const productImageColumn = {
  width: '80px',
  paddingRight: '15px',
};

const productImage = {
  borderRadius: '4px',
  border: '1px solid #eeeeee',
  overflow: 'hidden',
};

const productInfoColumn = {
  paddingRight: '15px',
};

const productName = {
  fontFamily: 'Poppins, Helvetica, Arial, sans-serif',
  fontSize: '14px',
  lineHeight: '1.4',
  fontWeight: '600',
  color: '#333333',
  margin: '0 0 5px 0',
};

const productMeta = {
  fontSize: '12px',
  lineHeight: '1.4',
  color: '#666666',
  margin: '0 0 3px 0',
};

const productPrice = {
  fontSize: '13px',
  lineHeight: '1.4',
  fontWeight: '500',
  color: '#333333',
  margin: '5px 0 0 0',
};

const productTotalColumn = {
  textAlign: 'right' as const,
  width: '90px',
  verticalAlign: 'top' as const,
};

const productTotal = {
  fontFamily: 'Poppins, Helvetica, Arial, sans-serif',
  fontSize: '14px',
  lineHeight: '1.4',
  fontWeight: '600',
  color: '#333333',
  margin: '0',
};

const orderTotalsWrapper = {
  margin: '30px 0',
  padding: '0 20px',
};

const totalRow = {
  margin: '0 0 10px 0',
};

const totalRowFinal = {
  margin: '20px 0 0 0',
  paddingTop: '15px',
  borderTop: '2px solid #eeeeee',
};

const totalLabel = {
  textAlign: 'right' as const,
  paddingRight: '10px',
  fontSize: '14px',
  color: '#666666',
  fontWeight: '500',
  width: '60%',
};

const totalValue = {
  textAlign: 'right' as const,
  fontSize: '14px',
  color: '#333333',
  fontWeight: '500',
  width: '40%',
};

const totalLabelFinal = {
  textAlign: 'right' as const,
  paddingRight: '10px',
  fontSize: '16px',
  color: '#333333',
  fontWeight: '600',
  fontFamily: 'Poppins, Helvetica, Arial, sans-serif',
  width: '60%',
};

const totalValueFinal = {
  textAlign: 'right' as const,
  fontSize: '16px',
  color: '#AF8F53',
  fontWeight: '700',
  fontFamily: 'Poppins, Helvetica, Arial, sans-serif',
  width: '40%',
  letterSpacing: '0.3px',
};

const stepsWrapper = {
  margin: '20px 0',
};

const step = {
  marginBottom: '20px',
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'flex-start' as const,
};

const stepNumber = {
  backgroundColor: '#AF8F53',
  color: '#FFFFFF',
  width: '24px',
  height: '24px',
  borderRadius: '50%',
  display: 'inline-block',
  textAlign: 'center' as const,
  lineHeight: '24px',
  fontSize: '12px',
  fontWeight: '600',
  marginBottom: '8px',
};

const stepTitle = {
  fontFamily: 'Poppins, Helvetica, Arial, sans-serif',
  fontSize: '15px',
  lineHeight: '1.4',
  fontWeight: '600',
  color: '#333333',
  margin: '0 0 5px 0',
};

const stepDescription = {
  fontSize: '14px',
  lineHeight: '1.5',
  color: '#666666',
  margin: '0',
};

const bankingInfoBoxWrapper = {
  margin: '20px 0',
};

const bankingInfoBox = {
  backgroundColor: '#f9f9f9',
  borderRadius: '8px',
  padding: '20px 22px',
  margin: '0',
  border: '1px solid #eeeeee',
  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.03)',
};

const bankingRow = {
  margin: '0 0 10px 0',
};

const bankingLabel = {
  width: '40%',
  fontSize: '14px',
  color: '#666666',
  fontWeight: '500',
  paddingRight: '10px',
};

const bankingValue = {
  width: '60%',
  fontSize: '14px',
  color: '#333333',
  fontWeight: '500',
};

const bankingValueAccent = {
  width: '60%',
  fontSize: '15px',
  color: '#AF8F53',
  fontWeight: '700',
  letterSpacing: '0.3px',
};

const divider = {
  borderColor: '#eeeeee',
  margin: '40px 0',
  height: '1px',
};

const helpText = {
  fontSize: '15px',
  lineHeight: '1.6',
  color: '#444444',
  margin: '0 0 20px 0',
};

const contactBoxWrapper = {
  margin: '20px 0',
};

const contactBox = {
  backgroundColor: '#f9f9f9',
  borderRadius: '8px',
  padding: '20px 22px',
  margin: '0',
  border: '1px solid #eeeeee',
  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.03)',
};

const contactItem = {
  fontSize: '15px',
  lineHeight: '1.5',
  color: '#444444',
  margin: '10px 0',
  display: 'flex',
  alignItems: 'center',
};

const contactIcon = {
  marginRight: '12px',
  verticalAlign: 'middle',
};

const contactLink = {
  color: '#AF8F53',
  textDecoration: 'none',
  fontWeight: '500',
};

const signatureWrapper = {
  margin: '35px 0 0 0',
  textAlign: 'center' as const,
};

const signature = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#666666',
  margin: '0',
  fontStyle: 'italic',
  textAlign: 'center' as const,
  padding: '0 15px',
};

const link = {
  color: '#AF8F53',
  textDecoration: 'underline',
  fontWeight: '500',
};

const footer = {
  padding: '35px 25px',
  textAlign: 'center' as const,
  backgroundColor: '#0A0A0A',
  color: '#ffffff',
};

const footerLogo = {
  margin: '0 auto 20px auto',
  opacity: '1',
};

const footerText = {
  fontSize: '12px',
  lineHeight: '1.5',
  color: '#999999',
  margin: '6px 0',
};

const socialLinks = {
  margin: '25px 0 20px 0',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

const socialLink = {
  margin: '0 10px',
  display: 'inline-block',
};

export default OrderConfirmationEmail;
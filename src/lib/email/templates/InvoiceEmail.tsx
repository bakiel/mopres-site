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

interface InvoiceEmailProps {
  order: {
    order_ref: string;
    customer_name: string;
    total_amount: number;
    created_at: string;
  };
  invoiceUrl: string;
}

export const InvoiceEmail = ({ 
  order, 
  invoiceUrl 
}: InvoiceEmailProps) => {
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

  const paymentDueDate = new Date(order.created_at);
  paymentDueDate.setDate(paymentDueDate.getDate() + 7); // Payment due 7 days after order

  return (
    <Html>
      <Head>
        <title>MoPres Fashion - Your Invoice #{order.order_ref}</title>
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
      <Preview>MoPres Fashion - Your Invoice #{order.order_ref} is Ready for Payment</Preview>
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
                <Heading style={heroHeading}>Your Invoice is Ready</Heading>
                <Text style={heroSubheading}>Thank you for choosing MoPres Fashion</Text>
              </Column>
            </Row>
          </Section>
          
          {/* Invoice Badge */}
          <Section style={invoiceBadgeSection}>
            <Row>
              <Column style={invoiceBadgeColumn}>
                <Text style={invoiceBadgeText}>
                  Invoice <span style={{ padding: '0 3px' }}>|</span> #{order.order_ref}
                </Text>
              </Column>
            </Row>
          </Section>
          
          {/* Main Content */}
          <Section style={section}>
            <Text style={greeting}>
              Dear {order.customer_name},
            </Text>
            
            <Text style={text}>
              Thank you for your recent purchase from MoPres Fashion. Your invoice has been 
              prepared and is attached to this email for your records. We appreciate your 
              business and are committed to providing you with exceptional quality and service.
            </Text>
            
            {/* Summary Box */}
            <Section style={summaryBoxWrapper}>
              <Section style={summaryBox}>
                <Row>
                  <Column>
                    <Text style={summaryHeading}>
                      Invoice Summary
                    </Text>
                  </Column>
                </Row>
                
                <Section style={summaryContent}>
                  <Row style={summaryRow}>
                    <Column style={summaryLabel}>Invoice Number:</Column>
                    <Column style={summaryValue}>{order.order_ref}</Column>
                  </Row>
                  <Row style={summaryRow}>
                    <Column style={summaryLabel}>Date Issued:</Column>
                    <Column style={summaryValue}>{formatDate(order.created_at)}</Column>
                  </Row>
                  <Row style={summaryRow}>
                    <Column style={summaryLabel}>Payment Due:</Column>
                    <Column style={summaryValue}>{formatDate(paymentDueDate.toISOString())}</Column>
                  </Row>
                  <Row style={summaryAmount}>
                    <Column style={summaryLabel}>Amount Due:</Column>
                    <Column style={summaryValueAmount}>{formatCurrency(order.total_amount)}</Column>
                  </Row>
                </Section>
              </Section>
            </Section>
            
            {/* Action Buttons */}
            <Section style={actionsSection}>
              <Row>
                <Column style={{ width: '48%', paddingRight: '2%' }}>
                  <Link href={invoiceUrl} style={viewButton}>
                    View Invoice
                  </Link>
                </Column>
                <Column style={{ width: '48%', paddingLeft: '2%' }}>
                  <Link href="#payment-instructions" style={payButton}>
                    Make Payment
                  </Link>
                </Column>
              </Row>
            </Section>
            
            {/* Payment Instructions */}
            <Text style={paymentHeading} id="payment-instructions">
              Payment Instructions
            </Text>
            
            <Text style={text}>
              Please transfer the full amount to our bank account using the details below. 
              For faster processing, include your invoice number as payment reference:
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
            
            {/* Important Notice */}
            <Section style={importantNoticeWrapper}>
              <Text style={importantText}>
                <strong>Important:</strong> Please use your order reference <strong>{order.order_ref}</strong> as the payment reference 
                so we can match your payment to your order and process it promptly.
              </Text>
            </Section>
            
            <Text style={text}>
              After making payment, please email your proof of payment to <Link href="mailto:payments@mopres.co.za" style={link}>payments@mopres.co.za</Link> to help us process your order faster.
            </Text>
            
            {/* Divider */}
            <Hr style={divider} />
            
            {/* Help Section */}
            <Text style={helpText}>
              If you have any questions or need assistance, please contact our customer service team:
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
                  <Link href="mailto:info@mopres.co.za" style={contactLink}>info@mopres.co.za</Link>
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
                Thank you for your business,<br />
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

const invoiceBadgeSection = {
  padding: '0',
  marginTop: '-18px',
  textAlign: 'center' as const,
};

const invoiceBadgeColumn = {
  textAlign: 'center' as const,
};

const invoiceBadgeText = {
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

const importantText = {
  fontSize: '15px',
  lineHeight: '1.6',
  color: '#444444',
  margin: '0',
  padding: '15px 20px',
  backgroundColor: '#FFF9E6',
  borderLeft: '4px solid #AF8F53',
  borderRadius: '4px',
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

const summaryAmount = {
  margin: '20px 0 0 0',
  borderTop: '1px solid #e8e8e8',
  paddingTop: '20px',
};

const summaryLabel = {
  width: '40%',
  fontSize: '14px',
  color: '#666666',
  fontWeight: '500',
};

const summaryValue = {
  width: '60%',
  fontSize: '14px',
  color: '#333333',
  fontWeight: '500',
};

const summaryValueAmount = {
  width: '60%',
  fontSize: '20px',
  color: '#AF8F53',
  fontWeight: '700',
  fontFamily: 'Poppins, Helvetica, Arial, sans-serif',
  letterSpacing: '0.3px',
};

const actionsSection = {
  margin: '35px 0',
};

const viewButton = {
  backgroundColor: '#AF8F53',
  borderRadius: '6px',
  color: '#FFFFFF',
  display: 'block',
  fontSize: '15px',
  fontWeight: 'bold',
  fontFamily: 'Poppins, Helvetica, Arial, sans-serif',
  textDecoration: 'none',
  textAlign: 'center' as const,
  padding: '15px 20px',
  width: '100%',
  boxShadow: '0 3px 6px rgba(0, 0, 0, 0.1)',
  letterSpacing: '0.5px',
  transition: 'all 0.3s ease',
};

const payButton = {
  backgroundColor: '#0A0A0A',
  borderRadius: '6px',
  color: '#FFFFFF',
  display: 'block',
  fontSize: '15px',
  fontWeight: 'bold',
  fontFamily: 'Poppins, Helvetica, Arial, sans-serif',
  textDecoration: 'none',
  textAlign: 'center' as const,
  padding: '15px 20px',
  width: '100%',
  boxShadow: '0 3px 6px rgba(0, 0, 0, 0.1)',
  letterSpacing: '0.5px',
  transition: 'all 0.3s ease',
};

const paymentHeading = {
  fontFamily: 'Poppins, Helvetica, Arial, sans-serif',
  fontSize: '20px',
  lineHeight: '1.3',
  fontWeight: '600',
  color: '#0A0A0A',
  margin: '45px 0 15px 0',
  letterSpacing: '-0.5px',
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

const importantNoticeWrapper = {
  margin: '25px 0',
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

export default InvoiceEmail;
-- Settings Tables Migration

-- Store settings table
CREATE TABLE IF NOT EXISTS public.store_settings (
  setting_key VARCHAR PRIMARY KEY,
  setting_value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Add RLS policies for store_settings
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can read store settings" 
  ON public.store_settings 
  FOR SELECT 
  USING (
    (auth.jwt() ->> 'role')::text = 'admin'
  );

CREATE POLICY "Admin users can insert store settings" 
  ON public.store_settings 
  FOR INSERT 
  WITH CHECK (
    (auth.jwt() ->> 'role')::text = 'admin'
  );

CREATE POLICY "Admin users can update store settings" 
  ON public.store_settings 
  FOR UPDATE 
  USING (
    (auth.jwt() ->> 'role')::text = 'admin'
  );

-- Admin users table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email VARCHAR NOT NULL UNIQUE,
  first_name VARCHAR,
  last_name VARCHAR,
  role VARCHAR NOT NULL DEFAULT 'viewer',
  permissions JSONB,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can read admin_users" 
  ON public.admin_users 
  FOR SELECT 
  USING (
    (auth.jwt() ->> 'role')::text = 'admin'
  );

CREATE POLICY "Admin users can insert admin_users" 
  ON public.admin_users 
  FOR INSERT 
  WITH CHECK (
    (auth.jwt() ->> 'role')::text = 'admin'
  );

CREATE POLICY "Admin users can update admin_users" 
  ON public.admin_users 
  FOR UPDATE 
  USING (
    (auth.jwt() ->> 'role')::text = 'admin'
  );

-- Email templates table
CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  subject VARCHAR NOT NULL,
  content TEXT NOT NULL,
  variables JSONB,
  type VARCHAR NOT NULL,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for email_templates
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can read email_templates" 
  ON public.email_templates 
  FOR SELECT 
  USING (
    (auth.jwt() ->> 'role')::text = 'admin'
  );

CREATE POLICY "Admin users can insert email_templates" 
  ON public.email_templates 
  FOR INSERT 
  WITH CHECK (
    (auth.jwt() ->> 'role')::text = 'admin'
  );

CREATE POLICY "Admin users can update email_templates" 
  ON public.email_templates 
  FOR UPDATE 
  USING (
    (auth.jwt() ->> 'role')::text = 'admin'
  );

-- Payment settings table
CREATE TABLE IF NOT EXISTS public.payment_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  method VARCHAR NOT NULL,
  configuration JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for payment_settings
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can read payment_settings" 
  ON public.payment_settings 
  FOR SELECT 
  USING (
    (auth.jwt() ->> 'role')::text = 'admin'
  );

CREATE POLICY "Admin users can insert payment_settings" 
  ON public.payment_settings 
  FOR INSERT 
  WITH CHECK (
    (auth.jwt() ->> 'role')::text = 'admin'
  );

CREATE POLICY "Admin users can update payment_settings" 
  ON public.payment_settings 
  FOR UPDATE 
  USING (
    (auth.jwt() ->> 'role')::text = 'admin'
  );

-- Insert default store settings
INSERT INTO public.store_settings (setting_key, setting_value)
VALUES 
  ('business_info', 
   jsonb_build_object(
     'name', 'MoPres Fashion',
     'type', 'Fashion Footwear Retail',
     'address', '6680 Witrugeend Street, 578 Heuwelsig Estates, Cetisdal, Centurion',
     'phone', '+27 83 500 5311',
     'email', 'info@mopres.co.za',
     'banking', jsonb_build_object(
       'bank', 'First National Bank (FNB)',
       'account_number', '62792142095',
       'account_name', 'MoPres Fashion',
       'branch_code', '210648'
     )
   )
  ),
  ('appearance', 
   jsonb_build_object(
     'logo_url', '/images/logo.png',
     'primary_color', '#3B82F6',
     'secondary_color', '#FBBF24',
     'font_family', 'Inter, sans-serif'
   )
  ),
  ('seo', 
   jsonb_build_object(
     'title', 'MoPres Fashion - Premium Footwear in South Africa',
     'description', 'Discover premium footwear at MoPres Fashion. Shop the latest trends in shoes and accessories with nationwide delivery in South Africa.',
     'keywords', 'footwear, shoes, fashion, south africa, premium shoes'
   )
  ),
  ('social_media', 
   jsonb_build_object(
     'facebook', 'https://facebook.com/mopresfashion',
     'instagram', 'https://instagram.com/mopresfashion',
     'twitter', 'https://twitter.com/mopresfashion'
   )
  );

-- Insert default email templates
INSERT INTO public.email_templates (name, subject, content, variables, type, is_active)
VALUES 
  (
    'Order Confirmation', 
    'Your Order #{{order_number}} has been confirmed', 
    '<h1>Thank you for your order!</h1><p>Dear {{customer_name}},</p><p>We are pleased to confirm your order #{{order_number}}.</p><p>You ordered:</p>{{order_items}}<p>Total: R{{order_total}}</p><p>We will process your order as soon as possible.</p><p>Best regards,<br>MoPres Fashion Team</p>', 
    '["order_number", "customer_name", "order_items", "order_total"]'::jsonb, 
    'order', 
    true
  ),
  (
    'Shipping Notification', 
    'Your Order #{{order_number}} has been shipped', 
    '<h1>Your order has been shipped!</h1><p>Dear {{customer_name}},</p><p>We are pleased to inform you that your order #{{order_number}} has been shipped.</p><p>Tracking number: {{tracking_number}}</p><p>Estimated delivery date: {{estimated_delivery}}</p><p>Best regards,<br>MoPres Fashion Team</p>', 
    '["order_number", "customer_name", "tracking_number", "estimated_delivery"]'::jsonb, 
    'order', 
    true
  ),
  (
    'Password Reset', 
    'Reset your MoPres Fashion account password', 
    '<h1>Password Reset Request</h1><p>Dear {{customer_name}},</p><p>You requested to reset your password. Please click the link below to set a new password:</p><p><a href="{{reset_link}}">Reset Password</a></p><p>If you did not request this, please ignore this email.</p><p>Best regards,<br>MoPres Fashion Team</p>', 
    '["customer_name", "reset_link"]'::jsonb, 
    'account', 
    true
  ),
  (
    'Welcome Email', 
    'Welcome to MoPres Fashion!', 
    '<h1>Welcome to MoPres Fashion!</h1><p>Dear {{customer_name}},</p><p>Thank you for creating an account with us. We are excited to have you join our community of fashion enthusiasts.</p><p>With your new account, you can:</p><ul><li>Track your orders</li><li>Save your favorite items</li><li>Enjoy faster checkout</li></ul><p>Best regards,<br>MoPres Fashion Team</p>', 
    '["customer_name"]'::jsonb, 
    'account', 
    true
  );

-- Insert default payment method
INSERT INTO public.payment_settings (method, configuration, is_active)
VALUES 
  (
    'invoice_payment', 
    jsonb_build_object(
      'invoice_due_days', 14,
      'invoice_note', 'Thank you for your business. Please make payment within 14 days.',
      'invoice_terms', 'Payment is due within 14 days of invoice date. Late payments may incur additional fees. Please use your invoice number as reference when making payment.',
      'invoice_color', '#3B82F6',
      'enable_qr_code', true
    ), 
    true
  ),
  (
    'bank_transfer',
    jsonb_build_object(
      'bank_name', 'First National Bank (FNB)',
      'account_number', '62792142095',
      'account_name', 'MoPres Fashion',
      'branch_code', '210648',
      'reference_prefix', 'INV-',
      'payment_instructions', 'Please transfer the full amount to our bank account using your invoice number as the reference. Send proof of payment to payments@mopres.co.za',
      'enable_qr_code', true
    ),
    true
  );

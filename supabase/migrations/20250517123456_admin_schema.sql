-- File: supabase/migrations/20250517123456_admin_schema.sql
-- Purpose: Add admin-related tables and RLS policies

-- Admin logs table for action tracking
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES auth.users(id) NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Admin RLS policies
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all logs"
  ON admin_logs FOR SELECT
  USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

CREATE POLICY "Admins can insert logs"
  ON admin_logs FOR INSERT
  WITH CHECK (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

-- Products table admin policies
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

-- Collections table admin policies  
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view collections"
  ON collections FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage collections"
  ON collections FOR ALL
  USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

-- Orders table admin policies
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view their own orders"
  ON orders FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND 
    (customer_id = auth.uid() OR auth.jwt() -> 'user_metadata' ->> 'role' = 'admin')
  );

CREATE POLICY "Admins can manage orders"
  ON orders FOR ALL
  USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

-- Customers table admin policies
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view and update their own profile"
  ON customers FOR ALL
  USING (id = auth.uid());

CREATE POLICY "Admins can view all customers"
  ON customers FOR SELECT
  USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

CREATE POLICY "Admins can update customers"
  ON customers FOR UPDATE
  USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

-- Create a function to log admin actions
CREATE OR REPLACE FUNCTION log_admin_action()
RETURNS TRIGGER AS $$
BEGIN
  IF auth.jwt() -> 'user_metadata' ->> 'role' = 'admin' THEN
    INSERT INTO admin_logs (
      admin_id,
      action,
      entity_type,
      entity_id,
      details
    ) VALUES (
      auth.uid(),
      TG_OP,
      TG_TABLE_NAME,
      CASE 
        WHEN TG_OP = 'DELETE' THEN OLD.id::text
        ELSE NEW.id::text
      END,
      CASE
        WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD)
        WHEN TG_OP = 'UPDATE' THEN jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW))
        ELSE to_jsonb(NEW)
      END
    );
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add triggers for logging admin actions
CREATE TRIGGER log_products_changes
AFTER INSERT OR UPDATE OR DELETE ON products
FOR EACH ROW EXECUTE FUNCTION log_admin_action();

CREATE TRIGGER log_collections_changes
AFTER INSERT OR UPDATE OR DELETE ON collections
FOR EACH ROW EXECUTE FUNCTION log_admin_action();

CREATE TRIGGER log_orders_changes
AFTER INSERT OR UPDATE OR DELETE ON orders
FOR EACH ROW EXECUTE FUNCTION log_admin_action();

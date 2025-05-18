-- Create views and functions for analytics dashboard
-- This migration will create the necessary database objects for the analytics feature

-- NOTE: The timestamp in the filename should be replaced with the actual timestamp when applying the migration

-- View for sales data aggregated by time period (daily, monthly, yearly)
CREATE OR REPLACE VIEW sales_by_period AS
WITH daily_sales AS (
  SELECT
    DATE_TRUNC('day', created_at) AS period,
    COUNT(*) AS total_orders,
    SUM(total_amount) AS total_revenue,
    CASE WHEN COUNT(*) > 0 THEN SUM(total_amount) / COUNT(*) ELSE 0 END AS average_order_value
  FROM orders
  GROUP BY DATE_TRUNC('day', created_at)
),
monthly_sales AS (
  SELECT
    DATE_TRUNC('month', created_at) AS period,
    COUNT(*) AS total_orders,
    SUM(total_amount) AS total_revenue,
    CASE WHEN COUNT(*) > 0 THEN SUM(total_amount) / COUNT(*) ELSE 0 END AS average_order_value
  FROM orders
  GROUP BY DATE_TRUNC('month', created_at)
),
yearly_sales AS (
  SELECT
    DATE_TRUNC('year', created_at) AS period,
    COUNT(*) AS total_orders,
    SUM(total_amount) AS total_revenue,
    CASE WHEN COUNT(*) > 0 THEN SUM(total_amount) / COUNT(*) ELSE 0 END AS average_order_value
  FROM orders
  GROUP BY DATE_TRUNC('year', created_at)
)
SELECT * FROM daily_sales
UNION ALL
SELECT * FROM monthly_sales
UNION ALL
SELECT * FROM yearly_sales;

-- View for product performance (sales, inventory, etc.)
CREATE OR REPLACE VIEW product_performance AS
WITH product_sales AS (
  SELECT
    oi.product_id,
    SUM(oi.quantity) AS total_sold,
    SUM(oi.price * oi.quantity) AS revenue
  FROM order_items oi
  JOIN orders o ON oi.order_id = o.id
  WHERE o.status != 'cancelled'
  GROUP BY oi.product_id
)
SELECT
  p.id AS product_id,
  p.name AS product_name,
  p.sku,
  p.price,
  p.inventory_quantity AS current_stock,
  COALESCE(ps.total_sold, 0) AS total_sold,
  COALESCE(ps.revenue, 0) AS revenue,
  CASE
    WHEN p.inventory_quantity < 5 AND p.in_stock = true THEN true
    ELSE false
  END AS restock_recommended,
  CASE
    WHEN COALESCE(ps.total_sold, 0) > 0 THEN 
      COALESCE(ps.revenue, 0) / COALESCE(ps.total_sold, 1)
    ELSE p.price
  END AS average_selling_price
FROM products p
LEFT JOIN product_sales ps ON p.id = ps.product_id;

-- View for customer metrics
CREATE OR REPLACE VIEW customer_metrics AS
WITH customer_orders AS (
  SELECT
    customer_id,
    MIN(created_at) AS first_order_date,
    MAX(created_at) AS last_order_date,
    COUNT(*) AS total_orders,
    SUM(total_amount) AS total_spent
  FROM orders
  WHERE customer_id IS NOT NULL AND status != 'cancelled'
  GROUP BY customer_id
)
SELECT
  c.id AS customer_id,
  c.first_name,
  c.last_name,
  c.email,
  co.first_order_date,
  co.last_order_date,
  COALESCE(co.total_orders, 0) AS total_orders,
  COALESCE(co.total_spent, 0) AS total_spent,
  CASE 
    WHEN co.total_orders > 0 THEN COALESCE(co.total_spent / co.total_orders, 0)
    ELSE 0
  END AS average_order_value,
  CASE
    WHEN co.last_order_date IS NOT NULL THEN 
      EXTRACT(DAY FROM (CURRENT_TIMESTAMP - co.last_order_date))::INTEGER
    ELSE NULL
  END AS days_since_last_order,
  CASE
    WHEN co.total_orders > 1 THEN true
    ELSE false
  END AS is_repeat_customer
FROM customers c
LEFT JOIN customer_orders co ON c.id = co.customer_id;

-- View for inventory status
CREATE OR REPLACE VIEW inventory_status AS
SELECT
  p.id,
  p.name,
  p.sku,
  p.inventory_quantity AS current_stock,
  p.in_stock,
  CASE
    WHEN p.inventory_quantity = 0 THEN 'Out of Stock'
    WHEN p.inventory_quantity <= 5 THEN 'Low Stock'
    WHEN p.inventory_quantity <= 15 THEN 'Moderate Stock'
    ELSE 'Good Stock'
  END AS stock_status,
  CASE
    WHEN p.inventory_quantity < 5 AND p.in_stock = true THEN true
    ELSE false
  END AS needs_restock
FROM products p;

-- Create a function to calculate sales metrics for a date range
CREATE OR REPLACE FUNCTION get_sales_metrics(start_date TIMESTAMP, end_date TIMESTAMP)
RETURNS TABLE (
  total_orders BIGINT,
  total_revenue NUMERIC,
  average_order_value NUMERIC,
  total_customers BIGINT,
  new_customers BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH date_range_orders AS (
    SELECT
      o.id,
      o.customer_id,
      o.total_amount,
      o.created_at
    FROM orders o
    WHERE o.created_at BETWEEN start_date AND end_date
      AND o.status != 'cancelled'
  ),
  all_customers AS (
    SELECT DISTINCT customer_id
    FROM orders
    WHERE customer_id IS NOT NULL
  ),
  new_customers AS (
    SELECT DISTINCT dro.customer_id
    FROM date_range_orders dro
    WHERE dro.customer_id IS NOT NULL
      AND dro.customer_id NOT IN (
        SELECT customer_id
        FROM orders
        WHERE created_at < start_date
          AND customer_id IS NOT NULL
      )
  )
  SELECT
    COUNT(dro.id)::BIGINT AS total_orders,
    COALESCE(SUM(dro.total_amount), 0)::NUMERIC AS total_revenue,
    CASE 
      WHEN COUNT(dro.id) > 0 THEN 
        COALESCE(SUM(dro.total_amount) / COUNT(dro.id), 0)
      ELSE 0 
    END::NUMERIC AS average_order_value,
    COUNT(DISTINCT dro.customer_id)::BIGINT AS total_customers,
    (SELECT COUNT(*)::BIGINT FROM new_customers) AS new_customers
  FROM date_range_orders dro;
END;
$$ LANGUAGE plpgsql;

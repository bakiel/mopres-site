# MoPres Admin Backend Implementation

This directory contains the implementation of the MoPres admin backend interface. Below is a summary of what has been implemented and what remains to be done.

## Implemented Features

### Core Infrastructure
- Admin layout component with responsive sidebar navigation
- Authentication middleware to protect admin routes
- Role-based access control for admin users
- Dashboard with key metrics and recent orders
- SQL migrations for admin tables and RLS policies

### Product Management
- Product listing page with search, filtering, and bulk actions
- Product creation form with comprehensive fields
- Product editing functionality
- Size-based inventory management
- Status management (in-stock, featured)

### Order Management
- Orders listing page with search and status filtering
- Order detail view with customer information
- Order status and payment status updates
- Order items display

### Collection Management
- Collections listing page with search and bulk actions
- Collection creation form with banner image upload
- Collection editing functionality
- Product assignment to collections

### Customer Management
- Customer listing page with search, filtering, and sorting options
- Customer detail view with profile information
- Order history and metrics display
- Customer notes system for admin use
- Status management (active/inactive)

### Content Management
- Content dashboard with sections for different content types
- Banner management with scheduling functionality
- Static page editor with preview capabilities
- Size guide management with dynamic size tables

### Analytics & Reporting
- Main analytics dashboard with key performance metrics
- Sales analytics with revenue and order analysis
- Inventory analytics with stock levels and product performance
- Customer analytics with acquisition and retention metrics
- Interactive charts for data visualization
- Date range filtering for all analytics views

### Settings & Configuration
- Settings dashboard with navigation to different settings areas
- Store settings (business info, appearance, SEO)
- User management (admin users, roles, and permissions)
- Email template management with preview functionality
- Payment settings with scan-to-pay QR code support

## Setup Requirements

### 1. Database Migration
Apply the SQL migration to your Supabase instance:
```bash
node scripts/apply-admin-migration.js
```

### 2. Admin User Creation
Create an admin user to access the interface:
```bash
node scripts/setup-admin-user.js
```

### 3. Environment Variables
Ensure your `.env.local` includes:
```
NEXT_PUBLIC_SUPABASE_URL=https://gfbedvoexpulmmfitxje.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmYmVkdm9leHB1bG1tZml0eGplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyNDY1NTAsImV4cCI6MjA2MDgyMjU1MH0.pTL-Evqap_O9V7ZbTgjWyXrAPjqcktcd2tdqjxmstt4
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmYmVkdm9leHB1bG1tZml0eGplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTI0NjU1MCwiZXhwIjoyMDYwODIyNTUwfQ.I3wR6D-H9_BBJRjjY1CiD2pnX7aRgRbkgnOzCnmh70s
```

## Usage

Access the admin interface at `/admin/login` after running the local development server:

```bash
npm run dev
```

### Admin Login Credentials
After running the setup script, you can log in with:
- **Email**: admin@mopres.co.za
- **Password**: secureAdminPassword123

## Feature Roadmap

### Next Steps
1. **Settings & Configuration**
   - Admin user management
   - Store settings
   - Payment gateway configuration

## File Structure

The admin implementation is organized as follows:

```
src/
├── app/
│   └── admin/
│       ├── page.tsx                    # Dashboard
│       ├── products/
│       │   ├── page.tsx                # Products listing
│       │   ├── new/
│       │   │   └── page.tsx            # New product page
│       │   └── [id]/
│       │       └── page.tsx            # Edit product page
│       ├── orders/
│       │   ├── page.tsx                # Orders listing
│       │   └── [id]/
│       │       └── page.tsx            # Order detail page
│       ├── collections/
│       │   ├── page.tsx                # Collections listing
│       │   ├── new/
│       │   │   └── page.tsx            # New collection page
│       │   └── [id]/
│       │       └── page.tsx            # Edit collection page
│       ├── customers/
│       │   ├── page.tsx                # Customers listing
│       │   └── [id]/
│       │       └── page.tsx            # Customer detail page
│       ├── content/
│       │   ├── page.tsx                # Content dashboard
│       │   ├── banners/
│       │   │   ├── page.tsx            # Banners listing
│       │   │   ├── new/
│       │   │   │   └── page.tsx        # New banner page
│       │   │   └── [id]/
│       │   │       └── page.tsx        # Edit banner page
│       │   ├── pages/
│       │   │   ├── page.tsx            # Static pages listing
│       │   │   ├── new/
│       │   │   │   └── page.tsx        # New page
│       │   │   └── [id]/
│       │   │       └── page.tsx        # Edit page
│       │   └── size-guides/
│       │       ├── page.tsx            # Size guides listing
│       │       ├── new/
│       │       │   └── page.tsx        # New size guide
│       │       └── [id]/
│       │           └── page.tsx        # Edit size guide
│       └── analytics/
│           ├── page.tsx                # Analytics dashboard
│           ├── sales/
│           │   ├── page.tsx            # Sales analytics
│           │   ├── revenue/
│           │   │   └── page.tsx        # Revenue analysis
│           │   └── orders/
│           │       └── page.tsx        # Order analysis
│           ├── inventory/
│           │   ├── page.tsx            # Inventory analytics
│           │   ├── stock/
│           │   │   └── page.tsx        # Stock level analysis
│           │   └── performance/
│           │       └── page.tsx        # Product performance
│           └── customers/
│               ├── page.tsx            # Customer analytics
│               ├── acquisition/
│               │   └── page.tsx        # Acquisition analysis
│               └── retention/
│                   └── page.tsx        # Retention analysis
├── components/
│   └── admin/
│       ├── AdminLayout.tsx             # Admin layout with sidebar
│       ├── ProductForm.tsx             # Reusable product form
│       ├── CollectionForm.tsx          # Reusable collection form
│       ├── BannerForm.tsx              # Reusable banner form
│       ├── PageEditor.tsx              # Reusable page editor
│       ├── SizeGuideForm.tsx           # Reusable size guide form
│       ├── DateRangePicker.tsx         # Date range selector for analytics
│       └── charts/
│           ├── SalesChart.tsx          # Sales data visualization
│           ├── InventoryChart.tsx      # Inventory data visualization
│           └── CustomerChart.tsx       # Customer data visualization
└── middleware.ts                       # Auth middleware for admin routes
```

## Debugging

If you encounter issues:

1. Check browser console for errors
2. Verify Supabase connection in Network tab
3. Ensure the user has admin role in Supabase Auth
4. Check that RLS policies are correctly applied

## Continuing Development

When resuming development in a future chat:

1. First review these key files:
   - `/tasks/admin_implementation_plan.md` - Overall plan
   - `/tasks/admin_tasks.md` - Current task status
   - `/tasks/analytics_implementation_summary.md` - Analytics implementation details

2. Check the implementation status and continue with the next priority tasks.

3. Focus on settings page implementation next.

## Database Schema

The following tables are used by the admin interface:

- `products` - Product information
- `collections` - Product collections/categories
- `orders` - Order information
- `order_items` - Items within orders
- `admin_logs` - Audit log for admin actions
- `customers` - Customer information
- `content_banners` - Promotional banners
- `content_pages` - Static website pages
- `size_guides` - Product sizing information
- `sales_by_period` - Sales metrics aggregated by time periods (view)
- `product_performance` - Product sales and inventory metrics (view)
- `customer_metrics` - Customer analytics including lifetime value (view)
- `inventory_status` - Stock levels and restock recommendations (view)

The admin interface relies on Row Level Security (RLS) policies that check for the admin role in the user's JWT.
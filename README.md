# MoPres Luxury Footwear - Next.js E-Commerce Site

## Project Overview
MoPres is a contemporary luxury footwear brand specialising in high-quality, handcrafted shoes for the modern woman. This repository contains the Next.js implementation of the MoPres e-commerce website, featuring a modern tech stack and comprehensive e-commerce functionality.

## Project Goal
To provide a seamless shopping experience for luxury footwear customers with a focus on South African design and craftsmanship. The site includes product browsing, user accounts, wishlist functionality, cart management, checkout process, and order management.

## Tech Stack
- **Frontend**: Next.js 15.3.1 (App Router), React 19, TypeScript, Tailwind CSS v3.4.1
- **Backend**: Supabase (PostgreSQL Database, Auth, Storage)
- **State Management**: Zustand for client-side state
- **Forms & Email**: Formspree for form handling, Resend for transactional emails
- **PDF Generation**: jsPDF with html2canvas for invoice creation
- **UI Components**: React Icons, React Hot Toast for notifications, Swiper for carousels
- **Deployment**: Vercel (Recommended)

## Project Structure
```
mopres-nextjs/
├── public/                 # Static assets (images, fonts, etc.)
├── src/
│   ├── app/                # App Router pages and layouts
│   │   ├── api/            # API routes and serverless functions
│   │   ├── layout.tsx      # Root layout (includes Header/Footer)
│   │   ├── page.tsx        # Homepage
│   │   ├── about/          # About page
│   │   ├── shop/           # Shop related pages
│   │   ├── account/        # Account related pages
│   │   ├── checkout/       # Checkout related pages
│   │   ├── policies/       # Policy pages
│   │   └── globals.css     # Global styles
│   ├── components/         # Reusable React components
│   ├── lib/                # Utility functions, Supabase client setup
│   ├── store/              # Zustand state management
│   └── utils/              # Helper utilities
├── supabase/               # Supabase Edge Functions
│   └── functions/          # Serverless functions (send-invoice-email, upload-invoice)
├── next.config.js          # Next.js configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
```

## Getting Started

### Prerequisites
- Node.js (v18.x or later) and npm/yarn/pnpm
- Git
- Supabase project with correct schema setup
- Formspree account for form handling
- Resend API key for transactional emails

### Setup Instructions
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd mopres-nextjs
   ```

2. Install dependencies:
   ```bash
   npm install
   # or yarn install / pnpm install
   ```

3. Configure environment variables:
   - Create a `.env.local` file in the root directory
   - Add required environment variables:
     ```
     # Supabase Configuration
     NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
     NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
     SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
     
     # Resend Email API
     RESEND_API_KEY=YOUR_RESEND_API_KEY
     EMAIL_FROM=info@mopres.co.za
     
     # Formspree Form IDs
     NEXT_PUBLIC_FORMSPREE_CONTACT_ID=YOUR_FORMSPREE_FORM_ID
     ```

4. Start the development server:
   ```bash
   npm run dev
   # or yarn dev / pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the site.

## Key Features

### Storefront
- **Homepage**: Dynamic hero banner, featured products, collections showcase
- **Collection Pages**: Product grid with filtering and sorting
- **Product Detail Pages**: Image gallery, size selection, wishlist functionality
- **Search**: Predictive search with product thumbnails

### Shopping Experience
- **Cart**: Sliding cart sidebar with Zustand state management, quantity adjustment, shipping calculation
- **Checkout Process**: Multi-step checkout flow (cart → delivery → payment → confirmation)
- **PDF Invoice**: Client-side PDF generation with jsPDF and html2canvas, stored in Supabase Storage
- **Pre-order System**: Waitlist functionality for out-of-stock items

### User Account
- **Authentication**: Email signup/login with Supabase Auth
- **Account Dashboard**: Order history, saved addresses, wishlist
- **Profile Management**: Update personal information and preferences

## Communication & APIs
- **Forms**: Formspree integration for contact forms, newsletter signups, and out-of-stock notifications
- **Order Confirmation**: Supabase Edge Functions with Resend API for order confirmation emails
- **PDF Invoices**: Client-side generation with jsPDF and html2canvas, uploaded to Supabase Storage
- **Edge Functions**: Serverless endpoints for email delivery and file storage

## Database Structure & Schema
The application uses Supabase PostgreSQL database with the following key tables:

### Core Data Tables
- `products`: Product catalogue with name, price, images, inventory details
- `collections`: Product collection/category information with descriptions and banner images
- `order_items`: Line items within orders with product references, quantities, and pricing
- `orders`: Customer order information including shipping, payment status, and reference numbers

### User-Related Tables
- `customers`: Extended user profile information linked to Supabase Auth
- `wishlist_items`: User product wishlist data
- `email_subscribers`: Newsletter subscription information

### Supabase Storage Buckets
- `product-images`: Public bucket containing product photography
- `invoices`: Private bucket storing generated PDF invoices

Row-level security policies are implemented on all tables to control data access.

## Deployment
The recommended deployment process utilises Vercel for the Next.js frontend and Supabase for backend services:

1. **Frontend Deployment**:
   - Connect your GitHub repository to Vercel
   - Configure environment variables in the Vercel dashboard
   - Deploy using Vercel's automated CI/CD pipeline

2. **Supabase Edge Functions**:
   - Deploy edge functions using Supabase CLI:
     ```bash
     supabase functions deploy send-invoice-email-new
     supabase functions deploy upload-invoice
     ```
   - Set environment variables for edge functions in Supabase dashboard

3. **Post-Deployment Verification**:
   - Verify Supabase authentication flow
   - Test edge functions via API endpoints
   - Confirm email delivery with Resend

## Contact Information
- **General Inquiries**: info@mopres.co.za
- **Owner/Management**: pulane@mopres.co.za
- **Phone/WhatsApp**: +27 83 500 5311

## License
All rights reserved © MoPres 2025.

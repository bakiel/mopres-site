# MoPres Client Portal - Deployment Guide

## Client Portal Credentials
- **Username**: `admin`
- **Password**: `mopres2024`

## Quick Deploy to Vercel

### Option 1: Deploy with Vercel CLI
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Deploy to Vercel
vercel

# Follow the prompts and select your project settings
```

### Option 2: Deploy via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Import your Git repository
3. Configure environment variables (see below)
4. Deploy

## Required Environment Variables

Make sure these are set in your Vercel project settings:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Post-Deployment

🎉 **Successfully Deployed!**

1. **Live Site**: https://mopres-nextjs-igxkzl467-bakielisrael-gmailcoms-projects.vercel.app
2. **Client Portal**: https://mopres-nextjs-igxkzl467-bakielisrael-gmailcoms-projects.vercel.app/client-portal
3. **Login Page**: https://mopres-nextjs-igxkzl467-bakielisrael-gmailcoms-projects.vercel.app/client-portal/login

### How to Access:
- Click "Account" in the header → "Client Portal"
- Or go directly to the client portal URL above
- Login with the credentials above

## Client Portal Features

- **Dashboard**: View key metrics (products, orders, revenue)
- **Products**: Manage product inventory, pricing, and status
- **Orders**: Track and update order statuses
- **Messages**: View customer inquiries (coming soon)

## Database Connection

The client portal connects directly to your existing Supabase database. All changes made in the portal will be reflected in your live store immediately.

## Security Note

The current authentication is simplified for demo purposes. For production use, implement proper authentication with:
- Supabase Auth
- JWT tokens
- Role-based access control
- Secure password hashing
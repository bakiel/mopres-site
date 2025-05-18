# Deployment Guide for Admin Logout Fix

This document provides instructions for deploying the admin logout fixes to production.

## What Was Fixed

The following changes were made to fix the admin logout functionality:

1. Added a disable auto-login flag in localStorage that gets set when a user logs out
2. Modified the login pages to respect this flag and skip auto-login when explicitly logged out
3. Created a new LogoutButton component for easy integration
4. Added a standalone logout page at /admin/logout
5. Added logout button to the admin navigation

The changes fix an issue where users would be automatically logged back in after explicitly logging out, by adding proper state tracking for logout events.

## Files Modified

These files were modified/created:

- `/src/utils/admin-auth.ts` - Added logoutAdmin() function and auto-login disabling mechanism
- `/src/app/admin/login/page.tsx` - Updated to check for auto-login disable flag
- `/src/app/admin/basic-login/page.tsx` - Updated to check for auto-login disable flag
- `/src/app/admin/logout/` - New standalone logout page
- `/src/components/admin/LogoutButton.tsx` - New reusable logout button component
- `/src/components/admin/navigation/AdminNavigation.tsx` - Updated to include logout button

## Deployment Steps

### Option 1: Via GitHub PR

1. Go to GitHub and create a pull request from the `fix-admin-logout` branch to `main`:
   https://github.com/bakiel/mopres-site/pull/new/fix-admin-logout

2. Once the PR is approved and merged, Vercel will automatically deploy the changes.

### Option 2: Direct Vercel Deployment

1. Install Vercel CLI if not already installed:
   ```
   npm install -g vercel
   ```

2. Login to Vercel:
   ```
   vercel login
   ```

3. Deploy the current branch:
   ```
   cd /Users/mac/Downloads/Mopres/mopres-nextjs
   vercel deploy --prod
   ```

### Option 3: Manual File Update

If you can't use Git or Vercel CLI, you can manually update these files on your server:

1. Upload the following files to your server:
   - `/src/utils/admin-auth.ts`
   - `/src/app/admin/login/page.tsx`
   - `/src/app/admin/basic-login/page.tsx`
   - `/src/app/admin/logout/layout.tsx`
   - `/src/app/admin/logout/page.tsx`
   - `/src/components/admin/LogoutButton.tsx`
   - `/src/components/admin/navigation/AdminNavigation.tsx`

2. Rebuild your application:
   ```
   npm run build
   ```

3. Restart your server

## Admin Login Credentials

- Email: admin@mopres.co.za
- Password: secureAdminPassword123
- User ID: 73f8df24-fc99-41b2-9f5c-1a5c74c4564e

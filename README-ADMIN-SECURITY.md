# Mopres Admin System

## Admin Logout and Security Enhancements

The admin system for Mopres has been updated with improved security features:

### Features
- **Required Login**: Admin users must explicitly log in by default
- **Remember Login Option**: Checkbox available for users who prefer auto-login
- **Enhanced Logout**: Comprehensive session clearing to prevent unauthorized access
- **Visual Improvements**: Fixed logo display on the admin login page

### Technical Implementation

The changes modify these key files:
- `src/utils/admin-auth.ts` - Authentication utilities
- `src/app/admin/login/page.tsx` - Login page with remember login option
- `src/components/admin/LogoutButton.tsx` - Improved logout functionality
- `src/components/admin/navigation/AdminNavigation.tsx` - Updated navigation with logout button

## Deployment Options

### GitHub Deployment
1. Clone the repository
   ```bash
   git clone https://github.com/bakiel/mopres-site.git
   cd mopres-site
   ```

2. Switch to the admin-logout-fix branch
   ```bash
   git checkout admin-logout-fix
   ```

3. Use the deployment script
   ```bash
   ./deploy.sh
   ```

### Manual Deployment to Vercel
```bash
cd /Users/mac/Downloads/Mopres/mopres-nextjs
npx vercel login
npx vercel --prod
```

### Docker Deployment
1. Build the Docker image
   ```bash
   docker-compose build
   ```

2. Run the Docker container
   ```bash
   docker-compose up -d
   ```

3. Access the application at http://localhost:3000

## Verification Steps

After deployment, verify:
1. Admin users are redirected to login page instead of auto-login
2. Logo appears correctly on the admin login page
3. "Remember login" checkbox works to enable auto-login if desired
4. Logout functionality properly prevents auto re-login

## Configuration

Environment variables needed:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

## Rollback Procedure

If needed, restore from backup:
```bash
cd /Users/mac/Downloads/Mopres/mopres-nextjs
cp backup-20250518213243/admin-auth.ts.bak src/utils/admin-auth.ts
cp backup-20250518213243/page.tsx.bak src/app/admin/login/page.tsx
```

Then redeploy with:
```bash
git add src/utils/admin-auth.ts src/app/admin/login/page.tsx
git commit -m "Rollback admin logout changes"
git push
npx vercel --prod
```

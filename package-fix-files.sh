#!/bin/bash

# Create a directory for the fixed files
mkdir -p /Users/mac/Downloads/Mopres/admin-logout-fix/src/utils
mkdir -p /Users/mac/Downloads/Mopres/admin-logout-fix/src/app/admin/login
mkdir -p /Users/mac/Downloads/Mopres/admin-logout-fix/src/app/admin/basic-login
mkdir -p /Users/mac/Downloads/Mopres/admin-logout-fix/src/app/admin/logout
mkdir -p /Users/mac/Downloads/Mopres/admin-logout-fix/src/components/admin
mkdir -p /Users/mac/Downloads/Mopres/admin-logout-fix/src/components/admin/navigation

# Copy the fixed files
cp /Users/mac/Downloads/Mopres/mopres-nextjs/src/utils/admin-auth.ts /Users/mac/Downloads/Mopres/admin-logout-fix/src/utils/
cp /Users/mac/Downloads/Mopres/mopres-nextjs/src/app/admin/login/page.tsx /Users/mac/Downloads/Mopres/admin-logout-fix/src/app/admin/login/
cp /Users/mac/Downloads/Mopres/mopres-nextjs/src/app/admin/basic-login/page.tsx /Users/mac/Downloads/Mopres/admin-logout-fix/src/app/admin/basic-login/
cp /Users/mac/Downloads/Mopres/mopres-nextjs/src/app/admin/logout/layout.tsx /Users/mac/Downloads/Mopres/admin-logout-fix/src/app/admin/logout/
cp /Users/mac/Downloads/Mopres/mopres-nextjs/src/app/admin/logout/page.tsx /Users/mac/Downloads/Mopres/admin-logout-fix/src/app/admin/logout/
cp /Users/mac/Downloads/Mopres/mopres-nextjs/src/components/admin/LogoutButton.tsx /Users/mac/Downloads/Mopres/admin-logout-fix/src/components/admin/
cp /Users/mac/Downloads/Mopres/mopres-nextjs/src/components/admin/navigation/AdminNavigation.tsx /Users/mac/Downloads/Mopres/admin-logout-fix/src/components/admin/navigation/

# Copy the deployment guide
cp /Users/mac/Downloads/Mopres/mopres-nextjs/ADMIN-LOGOUT-FIX-DEPLOYMENT.md /Users/mac/Downloads/Mopres/admin-logout-fix/

# Create a ZIP file
cd /Users/mac/Downloads/Mopres/
zip -r admin-logout-fix.zip admin-logout-fix/

echo "Files have been packaged into /Users/mac/Downloads/Mopres/admin-logout-fix.zip"
echo "You can manually upload and deploy these files following the instructions in ADMIN-LOGOUT-FIX-DEPLOYMENT.md"

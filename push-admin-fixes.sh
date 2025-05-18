#!/bin/bash

# Script to commit admin logout fixes and push to GitHub

# Updated path for clarity
cd /Users/mac/Downloads/Mopres/mopres-nextjs

# Add all our modified files in one go
echo "Adding all modified admin files..."

# Add specific files we've modified
git add src/utils/admin-auth.ts
git add src/app/admin/login/page.tsx
git add src/app/admin/basic-login/page.tsx
git add -f src/app/admin/logout
git add src/components/admin/LogoutButton.tsx
git add src/components/admin/navigation/AdminNavigation.tsx

# Commit the changes
echo "Committing changes..."
git commit -m "Fix admin logout functionality to prevent auto-login after logout"

# Push to GitHub
echo "Pushing to GitHub..."
git push origin fix-admin-logout

echo "Changes pushed to GitHub successfully!"
echo "Branch: fix-admin-logout"
echo "Repository: https://github.com/bakiel/mopres-site"
echo "You can now create a pull request and deploy to Vercel from there."

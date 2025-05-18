#!/bin/bash

# Add the specific files we modified
git add -f src/utils/admin-auth.ts
git add -f src/app/admin/login/page.tsx
git add -f src/app/admin/basic-login/page.tsx
git add -f src/app/admin/logout/layout.tsx
git add -f src/app/admin/logout/page.tsx
git add -f src/components/admin/LogoutButton.tsx
git add -f src/components/admin/navigation/AdminNavigation.tsx

# Show status
git status

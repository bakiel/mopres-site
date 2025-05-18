#!/bin/bash

# Deploy to GitHub and Vercel script
# This script pushes changes to GitHub and triggers Vercel deployment

cd /Users/mac/Downloads/Mopres/mopres-nextjs

# Step 1: Add and commit Docker files if they haven't been committed yet
git add Dockerfile docker-compose.yml .dockerignore next.config.js
git commit -m "Add Docker deployment configuration" --no-edit || true

# Step 2: Push changes to GitHub
echo "Pushing changes to GitHub..."
git push -u origin admin-logout-fix

# Step 3: Build and run Docker container locally for testing
echo "Building Docker container for local testing..."
docker-compose build

echo "Starting Docker container..."
docker-compose up -d

echo "Container is now running at http://localhost:3000"
echo "You can stop the container with: docker-compose down"

# Step 4: Instructions for Vercel deployment
echo ""
echo "===== DEPLOYMENT INSTRUCTIONS ====="
echo "1. To deploy on Vercel, go to: https://vercel.com/bakiel/mopres-site"
echo "2. If automatic deployment is enabled, your changes will be deployed once merged to main branch"
echo "3. For manual deployment, use the following commands:"
echo "   cd /Users/mac/Downloads/Mopres/mopres-nextjs"
echo "   npx vercel --prod"
echo ""
echo "4. To create a pull request for your changes, visit:"
echo "   https://github.com/bakiel/mopres-site/compare/main...admin-logout-fix"
echo ""
echo "Note: The admin users will now default to being logged out, and the logo displays correctly on the login page."

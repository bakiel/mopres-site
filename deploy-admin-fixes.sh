#!/bin/bash
# Script to deploy admin logout fixes to Vercel

# Set environment variables
export VERCEL_TOKEN="YOUR_VERCEL_TOKEN_HERE"
export PROJECT_NAME="mopres-nextjs"

echo "Starting deployment of admin logout fixes to Vercel..."

# Create a build
echo "Building the project..."
cd /Users/mac/Downloads/Mopres/mopres-nextjs
npm run build

# Deploy to Vercel
echo "Deploying to Vercel..."
npx vercel deploy --prod

echo "Deployment completed successfully!"
echo "Admin logout fixes are now live on Vercel."

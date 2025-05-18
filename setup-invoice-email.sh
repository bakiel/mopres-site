#!/bin/bash

# Setup script for deploying the invoice email system to Supabase

echo "Setting up MoPres Invoice Email System..."

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
  echo "Supabase CLI not found. Installing..."
  npm install -g supabase
fi

# Login to Supabase (if not already logged in)
echo "Please login to Supabase if prompted..."
supabase login

# Link project
echo "Linking Supabase project..."
supabase link --project-ref gfbedvoexpulmmfitxje

# Set secrets for the functions
echo "Setting up secrets for edge functions..."
supabase secrets set RESEND_API_KEY=re_ErrSkKC1_JsQNApC189RYtU8Z5aEiB1T8

# Deploy edge functions
echo "Deploying edge functions..."
supabase functions deploy upload-invoice
supabase functions deploy send-invoice-email

echo "Setting up Supabase storage bucket..."
# Note: This requires manual creation in the Supabase dashboard if it doesn't exist

echo "Setup complete! You can now test the invoice email system."
echo "Run: node scripts/test-invoice-email.js"

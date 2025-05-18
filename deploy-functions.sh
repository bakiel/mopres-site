#!/bin/bash
# Automated script for deploying Supabase edge functions
# This script uses the provided token for non-interactive deployment

# Set the token
export SUPABASE_ACCESS_TOKEN=sbp_489c09a0ba1c1d5ea6e6b29972589981a73041ff

echo "🔐 Using provided Supabase access token"

# Link project 
echo "🔗 Linking Supabase project..."
supabase link --project-ref gfbedvoexpulmmfitxje

# Set secrets
echo "🔑 Setting Resend API key..."
supabase secrets set RESEND_API_KEY=re_ErrSkKC1_JsQNApC189RYtU8Z5aEiB1T8

# Deploy edge functions
echo "🚀 Deploying upload-invoice function..."
supabase functions deploy upload-invoice

echo "🚀 Deploying send-invoice-email function..."
supabase functions deploy send-invoice-email

echo "✅ Deployment complete!"

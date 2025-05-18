/**
 * Update email addresses to use the verified domain
 * 
 * Run this script after verifying mopres.co.za domain in Resend
 * Usage: node update-domain.js
 */

const fs = require('fs');
const path = require('path');

// Files to update
const filesToUpdate = [
  {
    path: path.join(__dirname, 'src', 'lib', 'email', 'resend.ts'),
    fromPattern: /from: 'MoPres Fashion <onboarding@resend\.dev>'/g,
    toReplacement: `from: 'MoPres Fashion <info@mopres.co.za>'`,
    replyToPattern: /reply_to: replyTo \|\| 'bakielisrael@gmail\.com'/g,
    replyToReplacement: `reply_to: replyTo || 'info@mopres.co.za'`
  },
  {
    path: path.join(__dirname, 'supabase', 'functions', 'send-invoice-email', 'index.ts'),
    fromPattern: /from: 'MoPres Fashion <onboarding@resend\.dev>'/g,
    toReplacement: `from: 'MoPres Fashion <info@mopres.co.za>'`,
    replyToPattern: /reply_to: 'bakielisrael@gmail\.com'/g,
    replyToReplacement: `reply_to: 'info@mopres.co.za'`
  }
];

// Main function
async function main() {
  console.log('🔄 Updating email addresses to use the verified domain...');
  
  for (const file of filesToUpdate) {
    try {
      console.log(`Processing ${file.path}...`);
      
      // Read the file
      let content = fs.readFileSync(file.path, 'utf8');
      
      // Update 'from' address
      if (content.match(file.fromPattern)) {
        content = content.replace(file.fromPattern, file.toReplacement);
        console.log('✅ Updated "from" address');
      } else {
        console.log('⚠️ Could not find "from" pattern');
      }
      
      // Update 'reply_to' address
      if (content.match(file.replyToPattern)) {
        content = content.replace(file.replyToPattern, file.replyToReplacement);
        console.log('✅ Updated "reply_to" address');
      } else {
        console.log('⚠️ Could not find "reply_to" pattern');
      }
      
      // Write the file
      fs.writeFileSync(file.path, content, 'utf8');
    } catch (error) {
      console.error(`❌ Error updating ${file.path}: ${error.message}`);
    }
  }
  
  console.log('\n🎉 Domain update complete!');
  console.log('\nNext steps:');
  console.log('1. Redeploy your Supabase edge functions:');
  console.log('   supabase functions deploy send-invoice-email');
  console.log('2. Redeploy your Next.js application');
}

main();

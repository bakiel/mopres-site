/**
 * Puppeteer Environment Testing Script
 * 
 * This script helps diagnose issues with PDF generation using Puppeteer
 */

require('dotenv').config({ path: '.env.local' });
const puppeteer = require('puppeteer');

async function testPuppeteer() {
  console.log('🧪 Testing Puppeteer environment for PDF generation');
  
  try {
    console.log('Checking system environment...');
    console.log('- Node.js version:', process.version);
    console.log('- Platform:', process.platform);
    console.log('- Architecture:', process.arch);
    
    // 1. Launch browser with all possible debugging info
    console.log('\n1. Launching browser with debug flags...');
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ],
      dumpio: true // Output browser process stdout and stderr to console
    });
    
    // 2. Create a new page
    console.log('\n2. Creating page...');
    const page = await browser.newPage();
    
    // 3. Enable helpful logging
    page.on('console', msg => console.log('Browser console log:', msg.text()));
    page.on('pageerror', err => console.error('Browser page error:', err.toString()));
    page.on('error', err => console.error('Browser error:', err.toString()));
    page.on('requestfailed', request => console.error('Request failed:', request.url()));
    
    // 4. Try a simple test with HTML
    console.log('\n3. Setting simple HTML content for test...');
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>PDF Test</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; }
            .test-container { border: 1px solid #ccc; padding: 20px; }
          </style>
        </head>
        <body>
          <h1>Puppeteer PDF Test</h1>
          <div class="test-container">
            <p>This is a test of the PDF generation capabilities.</p>
            <p>Test timestamp: ${new Date().toISOString()}</p>
          </div>
        </body>
      </html>
    `, { waitUntil: 'networkidle0' });
    
    // 5. Set viewport
    console.log('\n4. Setting viewport for A4 size...');
    await page.setViewport({
      width: 794, // A4 width at 96 DPI
      height: 1123, // A4 height at 96 DPI
      deviceScaleFactor: 2
    });
    
    // 6. Generate PDF
    console.log('\n5. Generating PDF...');
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0',
        right: '0',
        bottom: '0',
        left: '0'
      }
    });
    
    console.log(`✅ PDF generated successfully! Size: ${pdfBuffer.length / 1024} KB`);
    
    // 7. Save the test PDF
    const fs = require('fs');
    fs.writeFileSync('puppeteer-test.pdf', pdfBuffer);
    console.log('✅ PDF saved to puppeteer-test.pdf');
    
    // 8. Close the browser
    await browser.close();
    console.log('\n6. Browser closed, test complete!');
    
    return true;
  } catch (error) {
    console.error('\n❌ Puppeteer test failed:');
    console.error('- Error name:', error.name);
    console.error('- Error message:', error.message);
    console.error('- Error stack:', error.stack);
    
    return false;
  }
}

// Run the test
testPuppeteer().then(success => {
  if (success) {
    console.log('\n✨ All tests passed! Puppeteer environment is working correctly.');
  } else {
    console.log('\n❌ Test failed. See above for detailed error information.');
    console.log('\nPossible solutions:');
    console.log('- Make sure puppeteer is installed: npm install puppeteer');
    console.log('- If on Linux, you might need to install additional dependencies');
    console.log('- Try running with more memory: NODE_OPTIONS="--max-old-space-size=4096" node test-puppeteer.js');
  }
  
  process.exit(success ? 0 : 1);
});

'use client';

/**
 * Enhanced PDF generator with robust error handling and multiple fallback options
 */

// Pre-load required libraries
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Convert HTML element to PDF with reliable element selection
 * @param {HTMLElement} element - The HTML element to convert
 * @returns {Promise<Blob>} - PDF as blob
 */
export async function createPdf(element) {
  if (!element) {
    console.error('Cannot generate PDF: element is null or undefined');
    throw new Error('PDF generation failed: Missing HTML element');
  }

  try {
    console.log('Starting PDF generation...', element);
    
    // Log element dimensions for debugging
    console.log(`Element dimensions: ${element.offsetWidth}x${element.offsetHeight}`);
    
    // Wait for all images to load with timeout
    const images = element.querySelectorAll('img');
    console.log(`Waiting for ${images.length} images to load...`);
    
    const imagePromises = Array.from(images).map(img => {
      return new Promise(resolve => {
        if (img.complete) {
          console.log(`Image already loaded: ${img.src}`);
          return resolve();
        }
        
        console.log(`Waiting for image to load: ${img.src}`);
        
        img.onload = () => {
          console.log(`Image loaded: ${img.src}`);
          resolve();
        };
        
        img.onerror = () => {
          console.warn(`Failed to load image: ${img.src}`);
          resolve(); // Continue even if image fails to load
        };
        
        // Set a timeout to avoid hanging indefinitely
        setTimeout(() => {
          console.warn(`Image load timeout: ${img.src}`);
          resolve();
        }, 5000);
      });
    });
    
    await Promise.all(imagePromises);
    
    // Wait for fonts to render and layout to stabilize
    console.log('Waiting for fonts to render...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Force a repaint by accessing offsetHeight
    const _ = element.offsetHeight;
    console.log(`Element dimensions after repaint: ${element.offsetWidth}x${element.offsetHeight}`);
    
    // Create canvas with improved element selection
    console.log('Creating canvas...');
    const canvas = await html2canvas(element, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      logging: true, // Enable logging for troubleshooting
      backgroundColor: '#FFFFFF',
      allowTaint: true,
      imageTimeout: 15000,
      // Use a more robust element selection approach
      onclone: (document, clonedDoc) => {
        console.log('Cloning document for PDF generation...');
        try {
          // Skip attempting to find the invoice container and just use the element directly
          // This approach is more reliable as we already have the element reference
          // We'll just make sure it's visible and properly styled
          
          // Add a debug class to make it easier to identify
          element.classList.add('invoice-being-generated');
          
          // Get all elements with the debug class in the cloned document
          const invoiceContainer = clonedDoc.querySelector('.invoice-being-generated');
          
          if (invoiceContainer) {
            console.log('Found invoice container using debug class');
            // Make invoice visible and properly styled in the cloned document
            invoiceContainer.style.position = 'static';
            invoiceContainer.style.left = '0';
            invoiceContainer.style.top = '0';
            invoiceContainer.style.width = '210mm'; // A4 width
            invoiceContainer.style.height = 'auto';
            invoiceContainer.style.maxHeight = 'none';
            invoiceContainer.style.margin = '0';
            invoiceContainer.style.padding = '0';
            invoiceContainer.style.overflow = 'visible';
            invoiceContainer.style.fontSize = '12px';
            invoiceContainer.style.lineHeight = '1.4';
            invoiceContainer.style.backgroundColor = '#FFFFFF';
            
            // Remove the debug class after use
            invoiceContainer.classList.remove('invoice-being-generated');
            element.classList.remove('invoice-being-generated');
          } else {
            console.log('Using fallback approach with root element');
            // If we can't find the element, just use the first large div
            const bodyContent = clonedDoc.body;
            if (bodyContent) {
              bodyContent.style.width = '210mm';
              bodyContent.style.margin = '0';
              bodyContent.style.padding = '20px';
              bodyContent.style.backgroundColor = '#FFFFFF';
            }
          }
        } catch (error) {
          console.error('Error during document cloning:', error);
          // Don't throw here, let html2canvas handle it
        }
      }
    });
    
    // Create PDF with A4 dimensions
    console.log('Creating PDF from canvas...');
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });
    
    // Calculate dimensions to fit content properly
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    
    console.log(`Canvas dimensions: ${imgWidth}x${imgHeight}`);
    console.log(`PDF dimensions: ${pdfWidth}x${pdfHeight}`);
    
    // Use width as the constraint and calculate height proportionally
    const ratio = pdfWidth / imgWidth;
    const imgX = 0; // Left align
    const imgY = 0; // Top align
    
    console.log(`Using scaling ratio: ${ratio}`);
    
    // Add image to exactly fit A4 width
    pdf.addImage(
      imgData,
      'JPEG',
      imgX,
      imgY,
      pdfWidth,
      imgHeight * ratio,
      undefined,
      'FAST'
    );
    
    console.log('PDF generation completed successfully');
    return pdf.output('blob');
  } catch (error) {
    console.error('Error creating PDF:', error);
    // Try fallback method
    console.log('Attempting fallback PDF generation method...');
    return createSimplePdf(element);
  }
}

/**
 * Simplified PDF generation as fallback
 * @param {HTMLElement} element - The HTML element
 * @returns {Promise<Blob>} - PDF blob
 */
async function createSimplePdf(element) {
  try {
    console.log('Using simplified fallback PDF generation method...');
    
    // Create a simplified version with minimal options
    const canvas = await html2canvas(element, {
      scale: 1.5,
      useCORS: true,
      logging: true,
      backgroundColor: '#FFFFFF',
      // No complex operations to avoid issues
    });
    
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    
    // Add image with fixed scaling
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfWidth * canvas.height / canvas.width);
    
    console.log('Fallback PDF generation completed');
    return pdf.output('blob');
  } catch (error) {
    console.error('Fallback PDF generation also failed:', error);
    throw new Error('PDF generation failed: Unable to generate PDF with any method');
  }
}

/**
 * Convert blob to base64
 * @param {Blob} blob - Blob to convert
 * @returns {Promise<string>} - Base64 string
 */
export function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      } else {
        reject(new Error("Failed to read blob as base64 string."));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Download the generated PDF
 * @param {HTMLElement} element - The HTML element
 * @param {string} filename - The filename to use
 * @returns {Promise<void>}
 */
export async function downloadPdf(element, filename = 'invoice.pdf') {
  if (!element) {
    throw new Error('Cannot download PDF: element is null or undefined');
  }
  
  try {
    // First try the enhanced method
    const pdfBlob = await createPdfWithRetry(element, 3);
    
    // Create a temporary URL and trigger download
    const pdfURL = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = pdfURL;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(pdfURL);
    
    return true;
  } catch (error) {
    console.error('Error downloading PDF:', error);
    return false;
  }
}

/**
 * Download invoice as HTML (fallback option)
 * @param {HTMLElement} element - The HTML element
 * @param {string} filename - The filename to use
 * @returns {Promise<void>}
 */
export function downloadHtml(element, filename = 'invoice.html') {
  if (!element) {
    throw new Error('Cannot download HTML: element is null or undefined');
  }
  
  try {
    // Create an HTML blob with styling
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
          body { font-family: 'Poppins', sans-serif; margin: 0; padding: 0; }
          .invoice-wrapper { width: 210mm; margin: 0 auto; padding: 20px; }
        </style>
      </head>
      <body>
        <div class="invoice-wrapper">
          ${element.outerHTML}
        </div>
      </body>
      </html>
    `;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const htmlURL = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = htmlURL;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(htmlURL);
    
    return true;
  } catch (error) {
    console.error('Error downloading HTML:', error);
    return false;
  }
}

/**
 * Utility to retry PDF generation with multiple methods
 * @param {HTMLElement} element - The HTML element
 * @param {number} maxRetries - Max number of retries
 * @returns {Promise<Blob>} - PDF blob
 */
export async function createPdfWithRetry(element, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`PDF generation retry attempt ${attempt + 1}/${maxRetries}...`);
        // Progressively longer waits between retries
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
      }
      
      // If it's the last attempt, try the simple method directly
      if (attempt === maxRetries - 1) {
        return await createSimplePdf(element);
      }
      
      return await createPdf(element);
    } catch (error) {
      console.warn(`PDF generation attempt ${attempt + 1} failed:`, error.message);
      lastError = error;
    }
  }
  
  console.error('All PDF generation methods failed');
  throw new Error(`PDF generation failed after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`);
}

/**
 * Check if element is ready for PDF generation
 * @param {HTMLElement} element - Element to check
 * @returns {boolean} - True if ready
 */
export function isElementReadyForPdf(element) {
  if (!element) {
    console.error('Element is null or undefined');
    return false;
  }
  
  if (!document.body.contains(element)) {
    console.error('Element is not in the DOM');
    return false;
  }
  
  const { offsetWidth, offsetHeight } = element;
  if (offsetWidth <= 0 || offsetHeight <= 0) {
    console.error('Element has zero dimensions', { width: offsetWidth, height: offsetHeight });
    return false;
  }
  
  // Check if all images are loaded
  const images = element.querySelectorAll('img');
  const allImagesLoaded = Array.from(images).every(img => img.complete);
  if (!allImagesLoaded) {
    console.warn('Not all images are loaded yet');
    return false;
  }
  
  return true;
}

/**
 * Wait for element to be ready
 * @param {HTMLElement} element - Element to wait for
 * @param {number} timeoutMs - Timeout in milliseconds
 * @returns {Promise<boolean>} - True if ready
 */
export async function waitForElementReady(element, timeoutMs = 10000) {
  console.log('Waiting for element to be ready...');
  const startTime = Date.now();
  
  while (!isElementReadyForPdf(element)) {
    if (Date.now() - startTime > timeoutMs) {
      console.error(`Timed out waiting for element to be ready after ${timeoutMs}ms`);
      return false;
    }
    
    console.log('Element not ready, waiting...');
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  console.log('Element is ready for PDF generation');
  return true;
}
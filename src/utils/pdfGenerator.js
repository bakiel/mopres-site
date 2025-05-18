'use client';

/**
 * Enhanced PDF generation utility specifically designed for MoPres invoice templates
 * With improved error handling and robust retry mechanisms
 */

/**
 * Generate a PDF from an HTML element
 * @param {HTMLElement} element - The element to convert to PDF
 * @returns {Promise<Blob>} - PDF as blob
 */
export async function createPdf(element) {
  // Input validation
  if (!element) {
    console.error('[PDF Generator] Error: Element is null or undefined');
    throw new Error('PDF generation failed: Invalid HTML element');
  }

  // Check if element is attached to DOM
  if (!document.body.contains(element)) {
    console.error('[PDF Generator] Error: Element is not in the DOM');
    throw new Error('PDF generation failed: Element not in DOM');
  }

  // Check if element has dimensions
  const { offsetWidth, offsetHeight } = element;
  if (offsetWidth <= 0 || offsetHeight <= 0) {
    console.warn('[PDF Generator] Warning: Element has zero dimensions', { width: offsetWidth, height: offsetHeight });
  }

  try {
    console.log('[PDF Generator] Starting generation process...');
    // Dynamically import libraries to avoid build issues
    console.log('[PDF Generator] Importing html2canvas...');
    const html2canvas = await import('html2canvas').then(module => module.default);
    
    console.log('[PDF Generator] Importing jsPDF...');
    const { jsPDF } = await import('jspdf');
    
    // Helper function to wait for all images to load
    const waitForImages = async () => {
      console.log('[PDF Generator] Waiting for images to load...');
      const images = element.querySelectorAll('img');
      console.log(`[PDF Generator] Found ${images.length} images in the template`);
      
      return Promise.all(Array.from(images).map(img => {
        if (img.complete) {
          console.log(`[PDF Generator] Image already loaded: ${img.src}`);
          return Promise.resolve();
        }
        
        return new Promise(resolve => {
          img.onload = () => {
            console.log(`[PDF Generator] Image loaded: ${img.src}`);
            resolve();
          };
          img.onerror = () => {
            console.warn(`[PDF Generator] Failed to load image: ${img.src}`);
            resolve(); // Continue even if image fails to load
          };
          // Set a timeout to avoid hanging indefinitely
          setTimeout(() => {
            console.warn(`[PDF Generator] Image load timeout: ${img.src}`);
            resolve();
          }, 5000);
        });
      }));
    };
    
    // Wait for images to load
    await waitForImages();
    
    // Allow extra time for fonts and CSS to fully apply
    console.log('[PDF Generator] Additional delay for font rendering...');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Force a repaint by accessing offsetHeight property
    const _ = element.offsetHeight;
    
    // Create canvas with optimal settings for luxury invoice
    console.log('[PDF Generator] Creating canvas from invoice element...');
    const canvas = await html2canvas(element, {
      scale: 2.5, // Higher scale for better quality printouts
      useCORS: true, // Enable cross-origin image loading
      logging: false, // Disable logging to reduce console noise
      backgroundColor: '#FFFFFF',
      allowTaint: true, // Allow loading cross-origin images
      imageTimeout: 15000, // Longer timeout for slow images
      letterRendering: true, // Better text rendering
      removeContainer: false, // Don't remove the container after rendering
      foreignObjectRendering: false, // Better text rendering on most browsers
    });
    
    console.log(`[PDF Generator] Canvas created successfully: ${canvas.width}x${canvas.height}`);
    
    // Use higher quality JPEG for better image with reasonable file size
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    
    // Create PDF with A4 dimensions
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });
    
    // Calculate dimensions
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    
    // Calculate the best scaling ratio to fit on A4
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    
    // Center the image on the page
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 0; // Align to top
    
    // Add image to the PDF
    pdf.addImage(
      imgData, 
      'JPEG', 
      imgX, 
      imgY, 
      imgWidth * ratio, 
      imgHeight * ratio, 
      undefined, 
      'FAST'
    );
    
    console.log('[PDF Generator] PDF generated successfully');
    
    // Return as blob for maximum compatibility
    return pdf.output('blob');
  } catch (error) {
    console.error('[PDF Generator] Error during PDF creation:', error);
    throw new Error(`PDF generation failed: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Convert a blob to base64 string
 * @param {Blob} blob - The blob to convert
 * @returns {Promise<string>} - Base64 string without data URL prefix
 */
export function blobToBase64(blob) {
  if (!blob || !(blob instanceof Blob)) {
    return Promise.reject(new Error('Invalid blob provided to blobToBase64'));
  }
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        // Remove the data URL prefix
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      } else {
        reject(new Error("Failed to read blob as base64 string"));
      }
    };
    
    reader.onerror = error => {
      reject(new Error(`FileReader error: ${error}`));
    };
    
    reader.readAsDataURL(blob);
  });
}

/**
 * Utility to retry PDF generation with progressive delays
 * @param {HTMLElement} element - The HTML element to convert to PDF
 * @param {number} maxRetries - Maximum number of retry attempts
 * @returns {Promise<Blob>} - PDF as a blob
 */
export async function createPdfWithRetry(element, maxRetries = 5) {
  console.log(`[PDF Generator] Starting PDF generation with up to ${maxRetries} retries...`);
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Progressive waiting between attempts
      if (attempt > 0) {
        // Exponential backoff: 1s, 2s, 4s, 8s...
        const delayMs = 1000 * Math.pow(2, attempt - 1);
        console.log(`[PDF Generator] Retry attempt ${attempt + 1}/${maxRetries}, waiting ${delayMs/1000}s...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
      
      // Check if the element is still valid
      if (!element) {
        console.error('[PDF Generator] Element became null');
        throw new Error('Element reference is null');
      }
      
      if (!document.body.contains(element)) {
        console.warn('[PDF Generator] Element is not in the DOM, attempting to refresh reference');
        throw new Error('Element not found in DOM');
      }
      
      // Extra verification for content readiness on retry attempts
      if (attempt > 0) {
        // Force layout recalculation
        const _ = element.offsetHeight;
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // Create the PDF
      return await createPdf(element);
    } catch (error) {
      console.warn(`[PDF Generator] Attempt ${attempt + 1} failed:`, error.message);
      lastError = error;
      
      // Special handling for the last attempt
      if (attempt === maxRetries - 1) {
        console.log('[PDF Generator] Final attempt with extended delay...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
  }
  
  // If we get here, all attempts failed
  console.error(`[PDF Generator] All ${maxRetries} attempts failed.`);
  throw new Error(`PDF generation failed after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`);
}

/**
 * Check if an element is ready for PDF generation
 * @param {HTMLElement} element - The element to check
 * @returns {boolean} True if the element is ready
 */
export function isElementReadyForPdf(element) {
  if (!element) {
    console.error('[PDF Generator] Element is null');
    return false;
  }
  
  if (!document.body.contains(element)) {
    console.error('[PDF Generator] Element is not in DOM');
    return false;
  }
  
  const { offsetWidth, offsetHeight } = element;
  if (offsetWidth <= 0 || offsetHeight <= 0) {
    console.error('[PDF Generator] Element has zero dimensions', { width: offsetWidth, height: offsetHeight });
    return false;
  }
  
  // Check for images
  const images = element.querySelectorAll('img');
  const allImagesLoaded = Array.from(images).every(img => img.complete);
  if (!allImagesLoaded) {
    console.warn('[PDF Generator] Not all images are loaded yet');
    return false;
  }
  
  return true;
}

/**
 * Wait for an element to be ready for PDF generation
 * @param {HTMLElement} element - The element to wait for
 * @param {number} timeoutMs - Maximum time to wait in milliseconds
 * @returns {Promise<boolean>} - True if element becomes ready, false if timeout
 */
export async function waitForElementReady(element, timeoutMs = 10000) {
  const startTime = Date.now();
  
  while (!isElementReadyForPdf(element)) {
    if (Date.now() - startTime > timeoutMs) {
      console.error(`[PDF Generator] Timed out waiting for element to be ready after ${timeoutMs}ms`);
      return false;
    }
    
    // Wait a bit before checking again
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  return true;
}

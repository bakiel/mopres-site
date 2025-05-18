'use client';

/**
 * Reliable PDF generator with robust error handling and fallbacks
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
    
    // Wait for all images to load
    const images = element.querySelectorAll('img');
    console.log(`Waiting for ${images.length} images to load...`);
    
    await Promise.all(Array.from(images).map(img => {
      if (img.complete) {
        console.log(`Image already loaded: ${img.src}`);
        return Promise.resolve();
      }
      return new Promise(resolve => {
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
    }));
    
    // Wait for fonts to render
    console.log('Waiting for fonts to render...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Force a repaint by accessing offsetHeight
    if (element) {
      const _ = element.offsetHeight;
      console.log(`Element dimensions: ${element.offsetWidth}x${element.offsetHeight}`);
    }
    
    // Create canvas with improved element selection
    console.log('Creating canvas...');
    const canvas = await html2canvas(element, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      logging: true, // Enable logging for troubleshooting
      backgroundColor: '#FFFFFF',
      allowTaint: true,
      imageTimeout: 15000,
      // Fix: Use safer element selection approach
      onclone: (document, clonedDoc) => {
        console.log('Cloning document...');
        try {
          // Find invoice element in cloned document by class instead of ID
          const invoiceContainer = clonedDoc.querySelector('div[id="invoice-content"]');
          
          if (invoiceContainer) {
            console.log('Found invoice container in cloned document');
            // Make invoice visible in cloned document
            invoiceContainer.style.position = 'static';
            invoiceContainer.style.left = '0';
            invoiceContainer.style.top = '0';
            invoiceContainer.style.width = '210mm';
            invoiceContainer.style.height = 'auto';
            invoiceContainer.style.maxHeight = 'none';
            invoiceContainer.style.margin = '0';
            invoiceContainer.style.padding = '0';
            invoiceContainer.style.overflow = 'visible';
          } else {
            console.error('Invoice container not found in cloned document');
            
            // Attempt to find by class or any appropriate container
            const potentialInvoiceContainers = clonedDoc.querySelectorAll('.font-poppins');
            console.log(`Found ${potentialInvoiceContainers.length} potential containers`);
            
            if (potentialInvoiceContainers.length > 0) {
              // Use the largest container as a fallback
              let largestContainer = potentialInvoiceContainers[0];
              let maxArea = 0;
              
              for (const container of potentialInvoiceContainers) {
                const area = container.offsetWidth * container.offsetHeight;
                if (area > maxArea) {
                  maxArea = area;
                  largestContainer = container;
                }
              }
              
              console.log('Using largest container as fallback');
              largestContainer.style.position = 'static';
              largestContainer.style.left = '0';
              largestContainer.style.top = '0';
              largestContainer.style.width = '210mm';
              largestContainer.style.height = 'auto';
              largestContainer.style.margin = '0';
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
    
    console.log(`Using ratio: ${ratio}`);
    
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
    // Try simpler fallback method
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
    console.log('Attempting fallback PDF generation...');
    
    // Create a simplified version with minimal options
    const canvas = await html2canvas(element, {
      scale: 1.5,
      useCORS: true,
      logging: true,
      backgroundColor: '#FFFFFF',
      // No onclone to avoid issues
    });
    
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Add image with fixed scaling
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    
    console.log('Fallback PDF generation completed');
    return pdf.output('blob');
  } catch (error) {
    console.error('Even fallback PDF generation failed:', error);
    throw new Error('PDF generation failed with all methods');
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
 * Utility to retry PDF generation with multiple methods
 * @param {HTMLElement} element - The HTML element
 * @param {number} maxRetries - Max number of retries
 * @returns {Promise<Blob>} - PDF blob
 */
export async function createPdfWithRetry(element, maxRetries = 3) {
  let lastError;
  let methods = [
    { name: 'Standard', fn: createPdf },
    { name: 'Simplified', fn: createSimplePdf },
  ];
  
  // Try each method in sequence
  for (let method of methods) {
    console.log(`Trying PDF generation method: ${method.name}`);
    
    // Try the current method with multiple retries
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`${method.name} method: Retry attempt ${attempt + 1}/${maxRetries}`);
          // Progressively longer waits between retries
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
        }
        
        return await method.fn(element);
      } catch (error) {
        console.warn(`${method.name} method: Attempt ${attempt + 1} failed:`, error.message);
        lastError = error;
      }
    }
  }
  
  console.error('All PDF generation methods failed after multiple attempts');
  throw new Error(`PDF generation failed after all attempts: ${lastError?.message || 'Unknown error'}`);
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
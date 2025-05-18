'use client';

/**
 * Simplified PDF generator with no dynamic imports to avoid chunk load errors
 */

// Pre-load required libraries
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Convert HTML element to PDF
 * @param {HTMLElement} element - The HTML element to convert
 * @returns {Promise<Blob>} - PDF as blob
 */
export async function createPdf(element) {
  if (!element) {
    console.error('Cannot generate PDF: element is null or undefined');
    throw new Error('PDF generation failed: Missing HTML element');
  }

  try {
    console.log('Starting PDF generation...');
    
    // Wait for images to load
    const images = element.querySelectorAll('img');
    await Promise.all(Array.from(images).map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(resolve => {
        img.onload = resolve;
        img.onerror = () => {
          console.warn(`Failed to load image: ${img.src}`);
          resolve(); // Continue even if image fails to load
        };
        setTimeout(resolve, 5000); // Timeout after 5 seconds
      });
    }));
    
    // Wait for fonts to render
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Create canvas
    console.log('Creating canvas...');
    const canvas = await html2canvas(element, {
      scale: 1.5, // Lower scale for better handling
      useCORS: true,
      logging: false,
      backgroundColor: '#FFFFFF',
      allowTaint: true,
      imageTimeout: 15000,
      width: 794, // A4 width in pixels (at 96 DPI)
      height: element.offsetHeight
    });
    
    // Create PDF
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 0;
    
    pdf.addImage(imgData, 'JPEG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
    
    console.log('PDF generated successfully');
    return pdf.output('blob');
  } catch (error) {
    console.error('Error creating PDF:', error);
    throw error;
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
 * Utility to retry PDF generation
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
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
      
      return await createPdf(element);
    } catch (error) {
      console.warn(`PDF generation attempt ${attempt + 1} failed:`, error.message);
      lastError = error;
    }
  }
  
  throw new Error(`PDF generation failed after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`);
}

/**
 * Check if element is ready for PDF generation
 * @param {HTMLElement} element - Element to check
 * @returns {boolean} - True if ready
 */
export function isElementReadyForPdf(element) {
  if (!element) return false;
  if (!document.body.contains(element)) return false;
  
  const { offsetWidth, offsetHeight } = element;
  if (offsetWidth <= 0 || offsetHeight <= 0) return false;
  
  return true;
}

/**
 * Wait for element to be ready
 * @param {HTMLElement} element - Element to wait for
 * @param {number} timeoutMs - Timeout in milliseconds
 * @returns {Promise<boolean>} - True if ready
 */
export async function waitForElementReady(element, timeoutMs = 5000) {
  const startTime = Date.now();
  
  while (!isElementReadyForPdf(element)) {
    if (Date.now() - startTime > timeoutMs) {
      return false;
    }
    
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  return true;
}

'use client';

/**
 * Simple PDF utility functions for invoice generation
 */

/**
 * Converts a blob to base64 string
 * @param blob Input blob to convert
 * @returns Promise with base64 string (without data URL prefix)
 */
export function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
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
 * Creates a PDF from an HTML element with optimized settings
 * @param element HTML element to convert to PDF
 * @returns Promise with PDF blob
 */
export async function createInvoicePdf(element) {
  // Dynamically import dependencies
  const html2canvas = (await import('html2canvas')).default;
  const { jsPDF } = await import('jspdf');
  
  try {
    // Create a canvas with optimized settings
    const canvas = await html2canvas(element, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      backgroundColor: '#FFFFFF',
      logging: false,
      windowHeight: 1200, // Ensure enough height is captured
      onclone: (document, clone) => {
        // Force content to be visible in cloned document
        const el = clone.getElementById('invoice-content');
        if (el) {
          el.style.position = 'relative';
          el.style.left = '0';
          el.style.top = '0';
          el.style.height = 'auto'; // Allow height to adjust to content
          el.style.marginBottom = '40px'; // Add extra margin at bottom
        }
      }
    });
    
    // Use JPEG format with medium quality for better compression
    const imgData = canvas.toDataURL('image/jpeg', 0.75);
    
    // Create PDF with compression options
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true, // Enable built-in compression
    });
    
    // Calculate dimensions to fit the page
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    
    // Use height-based scaling to ensure nothing is cut off
    const ratio = pdfWidth / imgWidth;
    const scaledHeight = imgHeight * ratio;
    
    // Add the image with optimization options
    pdf.addImage(
      imgData,
      'JPEG',
      0, // Start at left edge
      0, // Start at top edge
      pdfWidth,
      scaledHeight <= pdfHeight ? scaledHeight : pdfHeight, // Ensure it fits on page
      undefined,
      'FAST'
    );
    
    // If content is taller than the page, add extra pages as needed
    if (scaledHeight > pdfHeight) {
      let remainingHeight = scaledHeight - pdfHeight;
      let currentPosition = pdfHeight;
      
      while (remainingHeight > 0) {
        pdf.addPage();
        
        const heightOnThisPage = Math.min(remainingHeight, pdfHeight);
        
        pdf.addImage(
          imgData,
          'JPEG',
          0,
          -currentPosition, // Negative offset to show next portion
          pdfWidth,
          scaledHeight,
          undefined,
          'FAST'
        );
        
        remainingHeight -= heightOnThisPage;
        currentPosition += heightOnThisPage;
      }
    };
    
    // Get the PDF as a blob
    const pdfBlob = pdf.output('blob');
    console.log(`PDF created, size: ${Math.round(pdfBlob.size/1024)}KB`);
    
    return pdfBlob;
  } catch (error) {
    console.error('Error creating PDF:', error);
    throw error;
  }
}
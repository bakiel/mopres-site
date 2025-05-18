// Basic PDF utility functions without any TypeScript types
'use client';

// Helper function to convert a blob to base64
function blobToBase64(blob) {
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

// Create a PDF from an HTML element
async function createPdf(element) {
  try {
    // Dynamic imports to avoid build-time issues
    const html2canvasModule = await import('html2canvas');
    const html2canvas = html2canvasModule.default;
    
    const jsPdfModule = await import('jspdf');
    const { jsPDF } = jsPdfModule;
    
    // Create canvas with lower quality for smaller size
    const canvas = await html2canvas(element, {
      scale: 1.5,
      useCORS: true,
      logging: false,
      backgroundColor: '#FFFFFF'
    });
    
    // Use JPEG format with compression
    const imgData = canvas.toDataURL('image/jpeg', 0.75);
    
    // Create PDF with compression
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
    
    // Add the image with FAST mode
    pdf.addImage(imgData, 'JPEG', imgX, imgY, imgWidth * ratio, imgHeight * ratio, undefined, 'FAST');
    
    return pdf.output('blob');
  } catch (error) {
    console.error('Error creating PDF:', error);
    throw error;
  }
}

// Make functions available for import
module.exports = {
  blobToBase64,
  createPdf
};
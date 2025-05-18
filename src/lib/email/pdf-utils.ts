/**
 * Utility functions for handling PDFs in email attachments
 */

// Convert a blob to base64
export const blobToBase64 = async (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Extract only the base64 part and not the data URL prefix
      const base64 = base64String.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Create a PDF from the invoice template and convert to base64
export const createPdfBase64 = async (htmlElement: HTMLElement): Promise<string> => {
  // Dynamically import the libraries only when needed
  const html2canvas = (await import('html2canvas')).default;
  const { jsPDF } = await import('jspdf');
  
  // Get the canvas with better compression
  const canvas = await html2canvas(htmlElement, {
    scale: 1.5, // Lower scale for better file size (was 2.0)
    useCORS: true,
    logging: false,
    imageTimeout: 15000,
    allowTaint: false,
    backgroundColor: '#ffffff',
  });
  
  // Calculate dimensions for A4 size
  const imgData = canvas.toDataURL('image/jpeg', 0.8); // Using JPEG instead of PNG for better compression
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const ratio = canvas.width / canvas.height;
  const imgWidth = pdfWidth;
  const imgHeight = pdfWidth / ratio;
  
  pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
  
  // Convert to blob and then to base64
  const pdfBlob = pdf.output('blob');
  const base64 = await blobToBase64(pdfBlob);
  
  return base64;
};

'use client';

import QRCode from 'qrcode';

interface BankingDetails {
  bankName: string;
  accountNumber: string;
  accountName: string;
  branchCode: string;
}

interface InvoiceQROptions {
  bankingDetails: BankingDetails;
  invoiceNumber: string;
  amount?: string;
}

/**
 * Generates a payment QR code for invoices
 * 
 * @param options Banking details and invoice information
 * @returns Promise with the QR code as a data URL
 */
export async function generateInvoiceQRCode(options: InvoiceQROptions): Promise<string> {
  const { bankingDetails, invoiceNumber, amount } = options;
  const { bankName, accountNumber, accountName, branchCode } = bankingDetails;
  
  // Format payment data for QR code
  // This creates a standardized format that most banking apps can read
  const qrData = `bank:${bankName};acc:${accountNumber};name:${accountName};branch:${branchCode}${amount ? `;amount:${amount}` : ''};ref:${invoiceNumber}`;
  
  try {
    // Generate QR code as data URL
    const dataUrl = await QRCode.toDataURL(qrData, {
      width: 200,
      margin: 2,
      errorCorrectionLevel: 'H'
    });
    
    return dataUrl;
  } catch (err) {
    console.error('Error generating QR code:', err);
    throw new Error('Failed to generate QR code');
  }
}

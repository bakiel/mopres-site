'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface BankQRCodeProps {
  bankName: string;
  accountNumber: string;
  accountName: string;
  branchCode: string;
  amount?: string;
  reference?: string;
}

const BankQRCode: React.FC<BankQRCodeProps> = ({
  bankName,
  accountNumber,
  accountName,
  branchCode,
  amount,
  reference
}) => {
  // Format payment data for QR code content
  // This creates a standardized format that most banking apps can read
  const qrData = `bank:${bankName};acc:${accountNumber};name:${accountName};branch:${branchCode}${amount ? `;amount:${amount}` : ''}${reference ? `;ref:${reference}` : ''}`;

  return (
    <div className="flex flex-col items-center">
      <QRCodeSVG 
        value={qrData}
        size={200}
        level="H" // High error correction level
        includeMargin={true}
        className="mb-2"
      />
      <div className="text-sm text-gray-600 text-center mt-2">
        <p>Scan with your banking app to pay</p>
        {reference && <p className="font-medium">Reference: {reference}</p>}
      </div>
    </div>
  );
};

export default BankQRCode;
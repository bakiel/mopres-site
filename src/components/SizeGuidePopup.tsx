'use client';

import React from 'react';

interface SizeGuidePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const SizeGuidePopup: React.FC<SizeGuidePopupProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  // Basic Size Chart Data (Replace with actual MoPres chart)
  const sizeChart = [
    { za_uk: '3', eu: '36', cm: '23.0' },
    { za_uk: '4', eu: '37', cm: '23.7' },
    { za_uk: '5', eu: '38', cm: '24.3' },
    { za_uk: '6', eu: '39', cm: '25.0' },
    { za_uk: '7', eu: '40', cm: '25.7' },
    { za_uk: '8', eu: '41', cm: '26.3' },
    { za_uk: '9', eu: '42', cm: '27.0' },
    // Add more sizes as needed
  ];

  return (
    // Modal Backdrop
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out"
      onClick={onClose} // Close on backdrop click
    >
      {/* Modal Content */}
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-lg relative max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close size guide"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>

        {/* Modal Header */}
        <div className="p-6 border-b border-border-light">
          <h2 className="text-xl font-semibold font-montserrat text-text-dark">Size Guide</h2>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-text-light font-poppins">
            Please note that sizing may vary slightly between styles. Use this chart as a general guide. If you are between sizes or need assistance, please contact us.
          </p>

          {/* Size Chart Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 font-poppins">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3">ZA / UK</th>
                  <th scope="col" className="px-4 py-3">EU</th>
                  <th scope="col" className="px-4 py-3">Foot Length (cm)</th>
                </tr>
              </thead>
              <tbody>
                {sizeChart.map((row) => (
                  <tr key={row.za_uk} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{row.za_uk}</td>
                    <td className="px-4 py-3">{row.eu}</td>
                    <td className="px-4 py-3">{row.cm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="font-semibold text-text-dark pt-4 font-montserrat">How to Measure</h3>
          <p className="text-sm text-text-light font-poppins">
            1. Place your foot flat on a piece of paper with your heel against a wall.
            <br />
            2. Mark the longest point of your foot (usually the big toe) on the paper.
            <br />
            3. Measure the distance in centimeters from the wall to the mark.
            <br />
            4. Use the chart above to find your corresponding size.
          </p>
        </div>

        {/* Modal Footer (Optional) */}
        <div className="p-4 bg-gray-50 border-t border-border-light text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-text-dark rounded hover:bg-gray-300 transition-colors text-sm font-poppins"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SizeGuidePopup;

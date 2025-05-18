'use client';

import React from 'react';

interface SizeGuidePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const SizeGuidePopup: React.FC<SizeGuidePopupProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  // South African (ZA) Women's Shoe Size Chart
  // This is a comprehensive conversion chart for ZA/UK sizes 1-12
  const sizeChart = [
    { za_uk: '1', eu: '34', us: '3', cm: '21.6' },
    { za_uk: '2', eu: '35', us: '4', cm: '22.2' },
    { za_uk: '3', eu: '36', us: '5', cm: '23.0' },
    { za_uk: '4', eu: '37', us: '6', cm: '23.7' },
    { za_uk: '5', eu: '38', us: '7', cm: '24.3' },
    { za_uk: '6', eu: '39', us: '8', cm: '25.0' },
    { za_uk: '7', eu: '40', us: '9', cm: '25.7' },
    { za_uk: '8', eu: '41', us: '10', cm: '26.3' },
    { za_uk: '9', eu: '42', us: '11', cm: '27.0' },
    { za_uk: '10', eu: '43', us: '12', cm: '27.7' },
    { za_uk: '11', eu: '44', us: '13', cm: '28.3' },
    { za_uk: '12', eu: '45', us: '14', cm: '29.0' },
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
          <h2 className="text-xl font-semibold font-montserrat text-text-dark">Women's Shoe Size Guide</h2>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <div className="bg-brand-ivory rounded-md p-4 border-l-4 border-brand-gold mb-4">
            <h3 className="font-medium text-text-dark mb-2 font-montserrat">MoPres Sizing Note</h3>
            <p className="text-sm text-text-light font-poppins">
              MoPres uses South African (ZA) sizing, which is equivalent to UK sizing. If you typically wear EU or US sizes, 
              please use this chart to find your correct size.
            </p>
          </div>

          <p className="text-sm text-text-light font-poppins">
            Please note that sizing may vary slightly between styles. Use this chart as a general guide. If you are between sizes or need assistance, please contact us.
          </p>

          {/* Size Chart Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 font-poppins">
              <thead className="text-xs text-white uppercase bg-brand-gold">
                <tr>
                  <th scope="col" className="px-4 py-3">ZA / UK</th>
                  <th scope="col" className="px-4 py-3">EU</th>
                  <th scope="col" className="px-4 py-3">US</th>
                  <th scope="col" className="px-4 py-3">Foot Length (cm)</th>
                </tr>
              </thead>
              <tbody>
                {sizeChart.map((row, index) => (
                  <tr key={row.za_uk} className={index % 2 === 0 ? "bg-white border-b" : "bg-gray-50 border-b"}>
                    <td className="px-4 py-3 font-medium text-brand-gold">{row.za_uk}</td>
                    <td className="px-4 py-3">{row.eu}</td>
                    <td className="px-4 py-3">{row.us}</td>
                    <td className="px-4 py-3">{row.cm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="font-semibold text-text-dark pt-4 font-montserrat">How to Measure Your Foot Size</h3>
          <ol className="text-sm text-text-light font-poppins list-decimal pl-5 space-y-2">
            <li>Place your foot flat on a piece of paper with your heel against a wall.</li>
            <li>Mark the longest point of your foot (usually the big toe) on the paper.</li>
            <li>Measure the distance in centimeters from the wall to the mark.</li>
            <li>Use the chart above to find your corresponding ZA/UK size.</li>
            <li>If you're between sizes, we recommend going up to the larger size.</li>
          </ol>

          <div className="bg-gray-100 p-4 rounded-md mt-4">
            <h3 className="font-semibold text-text-dark mb-2 font-montserrat text-sm">Additional Tips</h3>
            <ul className="text-sm text-text-light font-poppins list-disc pl-5 space-y-1">
              <li>Measure your feet in the afternoon or evening when they are at their largest.</li>
              <li>Wear the same type of socks you plan to wear with your shoes.</li>
              <li>Measure both feet and use the larger measurement, as most people's feet are slightly different sizes.</li>
              <li>If you have wide feet, you may need to go up a size for comfort.</li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-gray-50 border-t border-border-light text-center">
          <p className="text-xs text-text-light mb-3 font-poppins">
            If you need further assistance with sizing, please contact our customer support team at <a href="mailto:support@mopres.co.za" className="text-brand-gold">support@mopres.co.za</a>
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-brand-gold text-white rounded hover:bg-brand-gold-dark transition-colors text-sm font-poppins"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SizeGuidePopup;

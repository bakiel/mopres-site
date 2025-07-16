import Link from 'next/link';

export default function StoreSettingsPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <Link href="/admin" className="text-blue-600 hover:text-blue-900">
              Dashboard
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <Link href="/admin/settings" className="text-blue-600 hover:text-blue-900">
              Settings
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <h1 className="text-3xl font-bold text-gray-900">Store Settings</h1>
          </div>
        </div>
      </header>
      
      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Store Information
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Basic information about your store.
            </p>
          </div>
          
          <div className="px-4 py-5 sm:p-6">
            <form>
              <div className="space-y-6">
                {/* Store Name */}
                <div>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-3 sm:col-span-2">
                      <label htmlFor="store-name" className="block text-sm font-medium text-gray-700">
                        Store Name
                      </label>
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <input
                          type="text"
                          name="store-name"
                          id="store-name"
                          className="flex-1 focus:ring-blue-500 focus:border-blue-500 block w-full min-w-0 rounded-md sm:text-sm border-gray-300"
                          defaultValue="MoPres Fashion"
                        />
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        This is how your store will be identified to customers.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Store Email */}
                <div>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-3 sm:col-span-2">
                      <label htmlFor="store-email" className="block text-sm font-medium text-gray-700">
                        Store Email
                      </label>
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <input
                          type="email"
                          name="store-email"
                          id="store-email"
                          className="flex-1 focus:ring-blue-500 focus:border-blue-500 block w-full min-w-0 rounded-md sm:text-sm border-gray-300"
                          defaultValue="info@mopres.co.za"
                        />
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        Primary contact email displayed to customers and used for notifications.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Store Phone */}
                <div>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-3 sm:col-span-2">
                      <label htmlFor="store-phone" className="block text-sm font-medium text-gray-700">
                        Store Phone
                      </label>
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <input
                          type="tel"
                          name="store-phone"
                          id="store-phone"
                          className="flex-1 focus:ring-blue-500 focus:border-blue-500 block w-full min-w-0 rounded-md sm:text-sm border-gray-300"
                          defaultValue="+27 83 500 5311"
                        />
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        Contact phone number displayed to customers.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Store Address */}
                <div>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-3">
                      <label htmlFor="store-address" className="block text-sm font-medium text-gray-700">
                        Store Address
                      </label>
                      <div className="mt-1">
                        <textarea
                          id="store-address"
                          name="store-address"
                          rows={3}
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border-gray-300 rounded-md"
                          defaultValue="123 Main Street, Sandton, Johannesburg, 2196, South Africa"
                        />
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        Physical address for your store (used for shipping and invoices).
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Currency Settings */}
                <div className="pt-5 border-t border-gray-200">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Currency & Pricing</h3>
                  
                  <div className="mt-6 grid grid-cols-6 gap-6">
                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                        Currency
                      </label>
                      <select
                        id="currency"
                        name="currency"
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        defaultValue="ZAR"
                      >
                        <option value="ZAR">South African Rand (ZAR)</option>
                        <option value="USD">US Dollar (USD)</option>
                        <option value="EUR">Euro (EUR)</option>
                        <option value="GBP">British Pound (GBP)</option>
                      </select>
                    </div>
                    
                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="currency-symbol" className="block text-sm font-medium text-gray-700">
                        Currency Symbol
                      </label>
                      <select
                        id="currency-symbol"
                        name="currency-symbol"
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        defaultValue="R"
                      >
                        <option value="R">R (before price)</option>
                        <option value="ZAR">ZAR (after price)</option>
                      </select>
                    </div>
                    
                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="price-decimals" className="block text-sm font-medium text-gray-700">
                        Price Decimal Places
                      </label>
                      <select
                        id="price-decimals"
                        name="price-decimals"
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        defaultValue="2"
                      >
                        <option value="0">0 (R1500)</option>
                        <option value="2">2 (R1500.00)</option>
                      </select>
                    </div>
                    
                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="thousand-separator" className="block text-sm font-medium text-gray-700">
                        Thousand Separator
                      </label>
                      <select
                        id="thousand-separator"
                        name="thousand-separator"
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        defaultValue="comma"
                      >
                        <option value="comma">Comma (1,500.00)</option>
                        <option value="space">Space (1 500.00)</option>
                        <option value="none">None (1500.00)</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                {/* Business Information */}
                <div className="pt-5 border-t border-gray-200">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Business Information</h3>
                  
                  <div className="mt-6 grid grid-cols-6 gap-6">
                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="business-name" className="block text-sm font-medium text-gray-700">
                        Legal Business Name
                      </label>
                      <input
                        type="text"
                        name="business-name"
                        id="business-name"
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        defaultValue="MoPres (Pty) Ltd"
                      />
                    </div>
                    
                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="vat-number" className="block text-sm font-medium text-gray-700">
                        VAT Number
                      </label>
                      <input
                        type="text"
                        name="vat-number"
                        id="vat-number"
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        defaultValue="4123456789"
                      />
                    </div>
                    
                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="registration-number" className="block text-sm font-medium text-gray-700">
                        Company Registration Number
                      </label>
                      <input
                        type="text"
                        name="registration-number"
                        id="registration-number"
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        defaultValue="2021/123456/07"
                      />
                    </div>
                    
                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="tax-region" className="block text-sm font-medium text-gray-700">
                        Tax Region
                      </label>
                      <select
                        id="tax-region"
                        name="tax-region"
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        defaultValue="ZA"
                      >
                        <option value="ZA">South Africa</option>
                        <option value="NA">Namibia</option>
                        <option value="BW">Botswana</option>
                        <option value="ZW">Zimbabwe</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                {/* Store Hours */}
                <div className="pt-5 border-t border-gray-200">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Store Hours</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Set your business hours for customer support and order processing.
                  </p>
                  
                  <div className="mt-6 grid grid-cols-7 gap-6">
                    <div className="col-span-1">
                      <div className="block text-sm font-medium text-gray-700">Day</div>
                    </div>
                    <div className="col-span-2">
                      <div className="block text-sm font-medium text-gray-700">Opening Time</div>
                    </div>
                    <div className="col-span-2">
                      <div className="block text-sm font-medium text-gray-700">Closing Time</div>
                    </div>
                    <div className="col-span-2">
                      <div className="block text-sm font-medium text-gray-700">Status</div>
                    </div>
                    
                    {/* Monday */}
                    <div className="col-span-1">
                      <span className="text-sm text-gray-700">Monday</span>
                    </div>
                    <div className="col-span-2">
                      <input
                        type="time"
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        defaultValue="09:00"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="time"
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        defaultValue="17:00"
                      />
                    </div>
                    <div className="col-span-2">
                      <select
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        defaultValue="open"
                      >
                        <option value="open">Open</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                    
                    {/* Tuesday */}
                    <div className="col-span-1">
                      <span className="text-sm text-gray-700">Tuesday</span>
                    </div>
                    <div className="col-span-2">
                      <input
                        type="time"
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        defaultValue="09:00"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="time"
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        defaultValue="17:00"
                      />
                    </div>
                    <div className="col-span-2">
                      <select
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        defaultValue="open"
                      >
                        <option value="open">Open</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                    
                    {/* More days would be here */}
                  </div>
                </div>
                
                {/* Action buttons */}
                <div className="pt-5 border-t border-gray-200">
                  <div className="flex justify-end">
                    <Link
                      href="/admin"
                      className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
                    >
                      Dashboard
                    </Link>
                    <button
                      type="button"
                      className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

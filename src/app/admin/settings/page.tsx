import Link from 'next/link';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <Link href="/admin" className="text-blue-600 hover:text-blue-900">
              Dashboard
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          </div>
        </div>
      </header>
      
      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Store Settings */}
            <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
              <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Store Settings
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Configure your store information and appearance
                </p>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <ul className="mt-3 grid grid-cols-1 gap-5 sm:gap-6">
                  <li className="col-span-1">
                    <Link 
                      href="/admin/settings/store" 
                      className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-blue-600 hover:text-blue-900 hover:bg-gray-50"
                    >
                      <svg className="flex-shrink-0 -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm14 1H4v8a1 1 0 001 1h10a1 1 0 001-1V6zM4 4a1 1 0 011-1h10a1 1 0 011 1H4z" clipRule="evenodd" />
                      </svg>
                      Store Information
                    </Link>
                  </li>
                  <li className="col-span-1">
                    <Link 
                      href="/admin/settings/appearance" 
                      className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-blue-600 hover:text-blue-900 hover:bg-gray-50"
                    >
                      <svg className="flex-shrink-0 -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
                      </svg>
                      Appearance & Branding
                    </Link>
                  </li>
                  <li className="col-span-1">
                    <Link 
                      href="/admin/settings/seo" 
                      className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-blue-600 hover:text-blue-900 hover:bg-gray-50"
                    >
                      <svg className="flex-shrink-0 -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9 9a2 2 0 114 0 2 2 0 01-4 0z" />
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a4 4 0 00-3.446 6.032l-2.261 2.26a1 1 0 101.414 1.415l2.261-2.261A4 4 0 1011 5z" clipRule="evenodd" />
                      </svg>
                      SEO Settings
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Payment Settings */}
            <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
              <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Payment Settings
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Manage payment methods and checkout options
                </p>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <ul className="mt-3 grid grid-cols-1 gap-5 sm:gap-6">
                  <li className="col-span-1">
                    <Link 
                      href="/admin/settings/payment-methods" 
                      className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-blue-600 hover:text-blue-900 hover:bg-gray-50"
                    >
                      <svg className="flex-shrink-0 -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                        <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                      </svg>
                      Payment Methods
                    </Link>
                  </li>
                  <li className="col-span-1">
                    <Link 
                      href="/admin/settings/checkout" 
                      className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-blue-600 hover:text-blue-900 hover:bg-gray-50"
                    >
                      <svg className="flex-shrink-0 -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                      </svg>
                      Checkout Experience
                    </Link>
                  </li>
                  <li className="col-span-1">
                    <Link 
                      href="/admin/settings/invoices" 
                      className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-blue-600 hover:text-blue-900 hover:bg-gray-50"
                    >
                      <svg className="flex-shrink-0 -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                      Invoices & Receipts
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Shipping Settings */}
            <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
              <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Shipping & Delivery
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Configure shipping options and delivery methods
                </p>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <ul className="mt-3 grid grid-cols-1 gap-5 sm:gap-6">
                  <li className="col-span-1">
                    <Link 
                      href="/admin/settings/shipping-zones" 
                      className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-blue-600 hover:text-blue-900 hover:bg-gray-50"
                    >
                      <svg className="flex-shrink-0 -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      Shipping Zones
                    </Link>
                  </li>
                  <li className="col-span-1">
                    <Link 
                      href="/admin/settings/shipping-methods" 
                      className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-blue-600 hover:text-blue-900 hover:bg-gray-50"
                    >
                      <svg className="flex-shrink-0 -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                        <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                      </svg>
                      Shipping Methods
                    </Link>
                  </li>
                  <li className="col-span-1">
                    <Link 
                      href="/admin/settings/pickup-locations" 
                      className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-blue-600 hover:text-blue-900 hover:bg-gray-50"
                    >
                      <svg className="flex-shrink-0 -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                      </svg>
                      Pickup Locations
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Email & Notifications */}
            <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
              <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Email & Notifications
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Configure email settings and notification preferences
                </p>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <ul className="mt-3 grid grid-cols-1 gap-5 sm:gap-6">
                  <li className="col-span-1">
                    <Link 
                      href="/admin/settings/email-templates" 
                      className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-blue-600 hover:text-blue-900 hover:bg-gray-50"
                    >
                      <svg className="flex-shrink-0 -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      Email Templates
                    </Link>
                  </li>
                  <li className="col-span-1">
                    <Link 
                      href="/admin/settings/notification-preferences" 
                      className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-blue-600 hover:text-blue-900 hover:bg-gray-50"
                    >
                      <svg className="flex-shrink-0 -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                      </svg>
                      Notification Preferences
                    </Link>
                  </li>
                  <li className="col-span-1">
                    <Link 
                      href="/admin/settings/smtp-settings" 
                      className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-blue-600 hover:text-blue-900 hover:bg-gray-50"
                    >
                      <svg className="flex-shrink-0 -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                      </svg>
                      SMTP Settings
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* User Management */}
            <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
              <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  User Management
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Manage users, roles, and permissions
                </p>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <ul className="mt-3 grid grid-cols-1 gap-5 sm:gap-6">
                  <li className="col-span-1">
                    <Link 
                      href="/admin/settings/admin-users" 
                      className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-blue-600 hover:text-blue-900 hover:bg-gray-50"
                    >
                      <svg className="flex-shrink-0 -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 14.094A5.973 5.973 0 004 17v1H1v-1a3 3 0 013.75-2.906z" />
                      </svg>
                      Admin Users
                    </Link>
                  </li>
                  <li className="col-span-1">
                    <Link 
                      href="/admin/settings/roles" 
                      className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-blue-600 hover:text-blue-900 hover:bg-gray-50"
                    >
                      <svg className="flex-shrink-0 -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Roles & Permissions
                    </Link>
                  </li>
                  <li className="col-span-1">
                    <Link 
                      href="/admin/settings/activity-logs" 
                      className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-blue-600 hover:text-blue-900 hover:bg-gray-50"
                    >
                      <svg className="flex-shrink-0 -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      Activity Logs
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Integrations */}
            <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
              <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Integrations
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Connect with third-party services and APIs
                </p>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <ul className="mt-3 grid grid-cols-1 gap-5 sm:gap-6">
                  <li className="col-span-1">
                    <Link 
                      href="/admin/settings/analytics-integrations" 
                      className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-blue-600 hover:text-blue-900 hover:bg-gray-50"
                    >
                      <svg className="flex-shrink-0 -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                      </svg>
                      Analytics & Tracking
                    </Link>
                  </li>
                  <li className="col-span-1">
                    <Link 
                      href="/admin/settings/social-media" 
                      className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-blue-600 hover:text-blue-900 hover:bg-gray-50"
                    >
                      <svg className="flex-shrink-0 -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                      </svg>
                      Social Media
                    </Link>
                  </li>
                  <li className="col-span-1">
                    <Link 
                      href="/admin/settings/marketing-tools" 
                      className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-blue-600 hover:text-blue-900 hover:bg-gray-50"
                    >
                      <svg className="flex-shrink-0 -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                      </svg>
                      Marketing Tools
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

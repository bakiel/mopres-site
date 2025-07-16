import Link from 'next/link';
import React from 'react';

export default function UserDetailsPage() {
  // Sample user data to display without requiring API fetching
  const user = {
    id: 'user_1',
    name: 'Admin User',
    email: 'admin@mopres.co.za',
    role: 'Admin',
    lastLogin: '17 May 2025, 14:32',
    status: 'Active',
    createdAt: '10 Jan 2025',
    permissions: [
      'manage_products',
      'manage_orders',
      'manage_users',
      'manage_settings',
      'view_analytics',
      'manage_content'
    ]
  };

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
            <Link href="/admin/settings/users" className="text-blue-600 hover:text-blue-900">
              Users
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <h1 className="text-3xl font-bold text-gray-900">Edit User</h1>
          </div>
        </div>
      </header>
      
      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                User Information
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Update user details and permissions
              </p>
            </div>
            <div className="flex space-x-3">
              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {user.status}
              </span>
              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800`}>
                {user.role}
              </span>
            </div>
          </div>
          <div className="border-t border-gray-200">
            <form className="p-6 space-y-8">
              {/* User Details Section */}
              <div className="space-y-6">
                <h4 className="text-md font-medium text-gray-900">Basic Details</h4>
                
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="first-name" className="block text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      defaultValue={user.name}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email address
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      defaultValue={user.email}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                      Role
                    </label>
                    <select
                      id="role"
                      name="role"
                      defaultValue={user.role}
                      className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="Admin">Admin</option>
                      <option value="Editor">Editor</option>
                      <option value="Viewer">Viewer</option>
                    </select>
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      defaultValue={user.status}
                      className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Password Section */}
              <div className="pt-6 border-t border-gray-200 space-y-6">
                <h4 className="text-md font-medium text-gray-900">Change Password</h4>
                
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
                      New Password
                    </label>
                    <input
                      type="password"
                      name="new-password"
                      id="new-password"
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirm-password"
                      id="confirm-password"
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div className="col-span-6">
                    <p className="text-sm text-gray-500">
                      Leave blank to keep the current password. Password must be at least 8 characters long.
                    </p>
                  </div>
                </div>
              </div>

              {/* Permissions Section */}
              <div className="pt-6 border-t border-gray-200 space-y-6">
                <div className="flex justify-between items-center">
                  <h4 className="text-md font-medium text-gray-900">Permissions</h4>
                  <p className="text-sm text-gray-500">
                    Permissions are determined by role and can be individually adjusted
                  </p>
                </div>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="relative flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="perm-products"
                        name="perm-products"
                        type="checkbox"
                        defaultChecked={user.permissions.includes('manage_products')}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="perm-products" className="font-medium text-gray-700">Manage Products</label>
                      <p className="text-gray-500">Can view, create, edit, and delete products</p>
                    </div>
                  </div>
                  
                  <div className="relative flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="perm-orders"
                        name="perm-orders"
                        type="checkbox"
                        defaultChecked={user.permissions.includes('manage_orders')}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="perm-orders" className="font-medium text-gray-700">Manage Orders</label>
                      <p className="text-gray-500">Can view, update, and process orders</p>
                    </div>
                  </div>
                  
                  <div className="relative flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="perm-users"
                        name="perm-users"
                        type="checkbox"
                        defaultChecked={user.permissions.includes('manage_users')}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="perm-users" className="font-medium text-gray-700">Manage Users</label>
                      <p className="text-gray-500">Can view, create, edit, and delete user accounts</p>
                    </div>
                  </div>
                  
                  <div className="relative flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="perm-settings"
                        name="perm-settings"
                        type="checkbox"
                        defaultChecked={user.permissions.includes('manage_settings')}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="perm-settings" className="font-medium text-gray-700">Manage Settings</label>
                      <p className="text-gray-500">Can modify system and store settings</p>
                    </div>
                  </div>
                  
                  <div className="relative flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="perm-analytics"
                        name="perm-analytics"
                        type="checkbox"
                        defaultChecked={user.permissions.includes('view_analytics')}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="perm-analytics" className="font-medium text-gray-700">View Analytics</label>
                      <p className="text-gray-500">Can access analytics and reports</p>
                    </div>
                  </div>
                  
                  <div className="relative flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="perm-content"
                        name="perm-content"
                        type="checkbox"
                        defaultChecked={user.permissions.includes('manage_content')}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="perm-content" className="font-medium text-gray-700">Manage Content</label>
                      <p className="text-gray-500">Can manage banners, pages, and other content</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Information Section */}
              <div className="pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-md font-medium text-gray-900">Account Information</h4>
                    <p className="mt-1 text-sm text-gray-500">Additional information about the user account</p>
                  </div>
                </div>
                
                <div className="mt-6 bg-gray-50 p-4 rounded-md">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">
                        Account Created
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {user.createdAt}
                      </dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">
                        Last Login
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {user.lastLogin}
                      </dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">
                        User ID
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {user.id}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-gray-200 flex justify-end space-x-3">
                <Link
                  href="/admin"
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/settings/users"
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

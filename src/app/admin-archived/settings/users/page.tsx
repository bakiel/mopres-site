import Link from 'next/link';
import React from 'react';

// Sample users data to display without requiring API fetching
const sampleUsers = [
  {
    id: 'user_1',
    name: 'Admin User',
    email: 'admin@mopres.co.za',
    role: 'Admin',
    lastLogin: '17 May 2025, 14:32',
    status: 'Active'
  },
  {
    id: 'user_2',
    name: 'John Smith',
    email: 'john.smith@mopres.co.za',
    role: 'Editor',
    lastLogin: '16 May 2025, 10:15',
    status: 'Active'
  },
  {
    id: 'user_3',
    name: 'Sarah Johnson',
    email: 'sarah.j@mopres.co.za',
    role: 'Viewer',
    lastLogin: '15 May 2025, 09:45',
    status: 'Active'
  },
  {
    id: 'user_4',
    name: 'Michael Chen',
    email: 'michael.c@mopres.co.za',
    role: 'Editor',
    lastLogin: '10 May 2025, 11:30',
    status: 'Inactive'
  },
  {
    id: 'user_5',
    name: 'Priya Patel',
    email: 'priya.p@mopres.co.za',
    role: 'Viewer',
    lastLogin: 'Never',
    status: 'Pending'
  },
];

export default function UsersPage() {
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
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          </div>
        </div>
      </header>
      
      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-medium text-gray-900">All Users</h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage user accounts and their access permissions
            </p>
          </div>
          <div className="flex space-x-3">
            <Link href="/admin" className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Dashboard
            </Link>
            <button 
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Add New User
            </button>
          </div>
        </div>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6 bg-gray-50 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-64">
                <input 
                  type="text" 
                  placeholder="Search users..." 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <select
                className="block w-auto px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
              <select
                className="block w-auto px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div>
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Export Users
              </button>
            </div>
          </div>
          
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name / Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sampleUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-500">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'Admin' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'Editor' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastLogin}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.status === 'Active' ? 'bg-green-100 text-green-800' :
                        user.status === 'Inactive' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/admin/settings/users/${user.id}`} className="text-blue-600 hover:text-blue-900 mr-3">
                      Edit
                    </Link>
                    {user.role !== 'Admin' && (
                      <button className="text-red-600 hover:text-red-900 mr-3">
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">5</span> of <span className="font-medium">5</span> users
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm bg-white text-gray-700 opacity-50 cursor-not-allowed">
                Previous
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm bg-white text-gray-700 opacity-50 cursor-not-allowed">
                Next
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              User Roles & Permissions
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Overview of available roles and their access rights
            </p>
          </div>
          <div className="px-4 py-5 sm:px-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-3">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">
                  Admin
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  Full access to all admin functions, including user management, settings, and system configuration.
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">
                  Editor
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  Can manage products, orders, collections, and content. Cannot access system settings or user management.
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">
                  Viewer
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  Read-only access to view products, orders, and analytics. Cannot make changes to any data.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </main>
    </div>
  );
}

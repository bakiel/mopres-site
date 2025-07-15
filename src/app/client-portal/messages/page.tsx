'use client';

import React, { useState } from 'react';

interface Message {
  id: string;
  customer_name: string;
  customer_email: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  created_at: string;
}

export default function ClientMessagesPage() {
  const [messages] = useState<Message[]>([
    {
      id: '1',
      customer_name: 'Sarah Johnson',
      customer_email: 'sarah@example.com',
      subject: 'Question about shoe sizing',
      message: 'Hi, I want to order the Elegance Heels but I\'m not sure about the sizing. I usually wear a US size 7. What would that be in your sizing?',
      status: 'unread',
      created_at: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      customer_name: 'John Doe',
      customer_email: 'john@example.com',
      subject: 'Order status inquiry',
      message: 'I placed an order 3 days ago (Order #12345) and haven\'t received any shipping updates. Can you please check?',
      status: 'read',
      created_at: '2024-01-14T15:45:00Z'
    }
  ]);

  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyText, setReplyText] = useState('');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleReply = () => {
    if (!selectedMessage || !replyText.trim()) return;
    
    // In a real app, this would send the reply via email
    alert(`Reply sent to ${selectedMessage.customer_email}`);
    setReplyText('');
    setSelectedMessage(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'unread':
        return 'bg-red-100 text-red-800';
      case 'read':
        return 'bg-yellow-100 text-yellow-800';
      case 'replied':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Customer Messages</h1>
        <p className="text-sm text-gray-600 mt-1">Manage customer inquiries and communications</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b">
              <h3 className="font-semibold text-gray-900">Inbox</h3>
            </div>
            <div className="divide-y">
              {messages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => setSelectedMessage(message)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 ${
                    selectedMessage?.id === message.id ? 'bg-amber-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-sm font-medium text-gray-900">
                      {message.customer_name}
                    </h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(message.status)}`}>
                      {message.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{message.subject}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(message.created_at)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2">
          {selectedMessage ? (
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">{selectedMessage.subject}</h3>
                <div className="mt-2 flex items-center text-sm text-gray-600">
                  <span>{selectedMessage.customer_name}</span>
                  <span className="mx-2">•</span>
                  <span>{selectedMessage.customer_email}</span>
                  <span className="mx-2">•</span>
                  <span>{formatDate(selectedMessage.created_at)}</span>
                </div>
              </div>
              
              <div className="p-6">
                <div className="mb-6">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>

                {/* Quick Reply Templates */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Replies:</h4>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setReplyText('Thank you for your inquiry. I\'ll look into this and get back to you shortly.')}
                      className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full"
                    >
                      Will investigate
                    </button>
                    <button
                      onClick={() => setReplyText('Your order has been shipped and you should receive tracking information soon.')}
                      className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full"
                    >
                      Order shipped
                    </button>
                    <button
                      onClick={() => setReplyText('For sizing, please refer to our size guide on the product page. Generally, we recommend ordering your usual size.')}
                      className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full"
                    >
                      Sizing info
                    </button>
                  </div>
                </div>

                {/* Reply Form */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reply
                  </label>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Type your reply..."
                  />
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={handleReply}
                      className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
                    >
                      Send Reply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p className="mt-4 text-gray-500">Select a message to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Note about email integration */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Customer messages from contact forms and order inquiries will appear here. 
              Email integration is being set up to automatically sync messages.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
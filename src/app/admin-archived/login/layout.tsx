'use client';

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Clean, isolated layout for login pages - no headers, no navigation
  return (
    <div className="min-h-screen bg-gray-100">
      {children}
    </div>
  );
}

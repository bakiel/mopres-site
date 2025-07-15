'use client';

export default function BasicLoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Clean, isolated layout for basic login page - no headers, no navigation
  return (
    <div className="min-h-screen bg-gray-100">
      {children}
    </div>
  );
}
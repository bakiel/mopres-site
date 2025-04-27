import type { Metadata } from "next";
// Import Poppins and Montserrat fonts
import { Poppins, Montserrat } from "next/font/google";
import "./globals.css";
import Layout from "../components/Layout"; // Import the Layout component
import { Toaster } from 'react-hot-toast'; // Import Toaster


// Configure Poppins font
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"], // Include weights used in the project
  variable: "--font-poppins", // Define CSS variable
});

// Configure Montserrat font
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], // Include weights used in the project
  variable: "--font-montserrat", // Define CSS variable
});

// Update metadata for MoPres
export const metadata: Metadata = {
  title: "MoPres | Contemporary Luxury Footwear",
  description: "Experience timeless elegance and unparalleled craftsmanship with MoPres.",
  // Favicon is now handled automatically by Next.js via src/app/icon.png
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Removed comment to ensure clean return structure
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} ${montserrat.variable} font-poppins antialiased`}>
        <Layout>{children}</Layout>
        <Toaster position="top-center" /> {/* Add Toaster component */}
      </body>
    </html>
  );
}

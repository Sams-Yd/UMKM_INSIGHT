import { Outfit, Inter } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata = {
  title: "UMKM Insight - Visual Analytics & Financial Reports Platform",
  description: "A secure financial ledger intelligence tool for small business aggregations, sales diagnostics, cash flow analytics, and automated reporting.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${outfit.variable} ${inter.variable}`}>
      <head>
        {/* Injecting Midtrans Snap JS for sandbox execution */}
        <script 
          src="https://app.sandbox.midtrans.com/snap/snap.js" 
          data-client-key={process.env.MIDTRANS_CLIENT_KEY || 'SB-Mid-client-umkm-insight-mock-key'}
          async
        ></script>
      </head>
      <body className="antialiased min-h-screen">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

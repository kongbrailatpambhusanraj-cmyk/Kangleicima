import type { Metadata } from "next";
import { Inter } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import Navbar from "@/components/Navbar"; // <--- Import your navbar component (adjust path if it's named differently, e.g., Header)
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KangleiCima",
  description: "Manipuri Cinema & Shumang Leela Archive",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-black text-white min-h-screen`}>
        <NextTopLoader
          color="#dc2626"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
        />
        
        {/* Render the Navbar globally here so it shows on laptop and mobile */}
        <Navbar />

        {children}
      </body>
    </html>
  );
}
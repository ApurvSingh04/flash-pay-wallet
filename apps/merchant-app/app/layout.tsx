import "./globals.css";
import type { Metadata } from "next";
import { Inter, Fira_Code } from "next/font/google";
import { Providers } from "../provider";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const firaCode = Fira_Code({ subsets: ["latin"], variable: '--font-fira-code' });

export const metadata: Metadata = {
  title: "Merchant App",
  description: "Flash Pay Merchant Portal",
};

import { AppbarClient } from "../components/AppbarClient";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en">
      <Providers>
        <body className={`${inter.variable} ${firaCode.variable} font-sans bg-bg-dark text-text-light`}>
          <div className="min-w-screen min-h-screen">
            <AppbarClient />
            {children}
          </div>
          <Toaster 
            position="top-right" 
            toastOptions={{
              className: 'bg-bg-dark border border-border-dark text-text-light font-mono rounded-sm shadow-lg'
            }} 
          />
        </body>
      </Providers>
    </html>
  );
}

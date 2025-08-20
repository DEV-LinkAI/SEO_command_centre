import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthContext";
import { LayoutContent } from "./layout-content";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SEO Command Centre",
  description: "Multi-tenant SEO Command Centre met Supabase auth en vaste layout",
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" className="h-full">
      <body
        className={`${plusJakartaSans.variable} font-sans antialiased h-full min-h-screen`}
      >
        <AuthProvider>
          <LayoutContent>
        {children}
          </LayoutContent>
        </AuthProvider>
      </body>
    </html>
  );
}

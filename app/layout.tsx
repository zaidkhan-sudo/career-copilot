import type { Metadata } from "next";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { AuthProvider } from "@/lib/firebase/auth-context";

export const metadata: Metadata = {
  title: `${siteConfig.name} — Your AI Job-Hunting Teammate`,
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[var(--color-bg-primary)] antialiased noise-overlay">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

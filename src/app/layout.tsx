import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });

export const viewport: Viewport = {
  themeColor: "#7C5CFC",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata: Metadata = {
  title: "Wikilinks Video Hub",
  description: "Tu gestor personal de vídeos de YouTube",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Wikilinks",
  },
};

import ThemeProvider from "@/components/ThemeProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0..1,0&display=block"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            const stored = JSON.parse(localStorage.getItem('wikilinks-storage') || '{}');
            const theme = stored?.state?.theme || 'dark';
            const textSize = stored?.state?.textSize || 'normal';
            
            const classes = [];
            classes.push(theme === 'light' ? 'light' : 'dark');
            if (textSize !== 'normal') classes.push('text-' + textSize);
            
            document.documentElement.className = classes.join(' ');
          } catch(e) {
            document.documentElement.className = 'dark';
          }
        `}} />
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-background text-onSurface min-h-screen pb-24 md:pb-0`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

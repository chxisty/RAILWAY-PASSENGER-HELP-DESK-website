import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RailAssist AI – Railway Passenger Help Desk",
  description: "Official Grounded AI passenger assistance for train schedules, station facilities, Tatkal rules, cancellation refunds, and emergency helplines.",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html 
      lang="en" 
      suppressHydrationWarning 
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('rail_theme') || 'light';
                  if (saved === 'dark') {
                    document.documentElement.classList.add('dark', 'theme-dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('theme-light');
                  }
                  document.documentElement.setAttribute('data-theme', saved);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body 
        suppressHydrationWarning
        className="min-h-full flex flex-col font-sans transition-colors duration-500 selection:bg-[#E67E48] selection:text-white"
      >
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-1 flex flex-col">
              {children}
            </main>
            <Footer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

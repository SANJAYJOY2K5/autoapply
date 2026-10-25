import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AutoApply AI — Job Discovery & Application Automation for Freshers",
  description:
    "Production-grade job discovery and application workflow designed for Indian freshers targeting Chennai, nearby areas, and remote tech roles across India.",
  keywords: [
    "AutoApply AI",
    "Fresher Tech Jobs Chennai",
    "Remote Developer Jobs India",
    "AI Product Developer",
    "Frontend Developer",
    "Data Analyst",
    "Job Match Automation"
  ],
};

export const viewport: Viewport = {
  themeColor: "#090d16",
  width: "device-width",
  initialScale: 1,
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
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans bg-[#090d16] text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import AppHeader from "@/app/components/ui/AppHeader";
import SessionBootstrap from "@/app/components/SessionBootstrap";

/**
 * Root layout:
 * - global CSS
 * - SessionBootstrap for session init (if you use it elsewhere)
 * - AppHeader for navigation + PRO upsell + session state
 */
export const metadata: Metadata = {
  title: "Vidal Bar Genius — Smart Bar System",
  description: "Track your bar, match drinks instantly, and generate party menus + shopping lists.",
  metadataBase: process.env.APP_URL ? new URL(process.env.APP_URL) : undefined,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionBootstrap />
        <AppHeader />
        {children}
      </body>
    </html>
  );
}
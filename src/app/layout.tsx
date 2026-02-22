import type { Metadata } from "next";
import "./globals.css";
import AppHeader from "@/app/components/ui/AppHeader";
import SessionBootstrap from "@/app/components/SessionBootstrap";

/**
 * Root layout:
 * - global CSS
 * - AppHeader for navigation and PRO upsell
 */
export const metadata: Metadata = {
  title: "Vidal Bar Genius — Smart Bar System",
  description: "Turn your home bar into a smart cocktail engine."
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
import type { Metadata } from "next";
import "./globals.css";
import { BrandHeader } from "../components/BrandHeader";
import { SiteFooter } from "../components/SiteFooter";

export const metadata: Metadata = {
  title: "Fulcrum Intelligence",
  description: "See the pressure before the move."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <BrandHeader />
        <div className="app-shell">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}

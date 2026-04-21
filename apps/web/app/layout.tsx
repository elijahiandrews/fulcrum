import type { Metadata } from "next";
import "./globals.css";
import { BrandHeader } from "../components/BrandHeader";

export const metadata: Metadata = {
  title: "Fulcrum | Global Market Intelligence Platform",
  description: "See the pressure before the move."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <BrandHeader />
        <div className="app-shell">{children}</div>
      </body>
    </html>
  );
}

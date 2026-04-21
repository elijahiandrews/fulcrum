import type { Metadata } from "next";
import "./globals.css";
import { BrandHeader } from "../components/BrandHeader";

export const metadata: Metadata = {
  title: "Fulcrum | Squeeze-Intelligence Platform",
  description: "See the pressure before the move."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <BrandHeader />
        {children}
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { BrandHeader } from "../components/BrandHeader";
import { CortexBackdrop } from "../components/CortexBackdrop";
import { SiteFooter } from "../components/SiteFooter";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"]
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "600"]
});

export const metadata: Metadata = {
  title: "Fulcrum Intelligence",
  description: "See the pressure before the move."
};

/** Keeps production (Vercel) aligned with local: light institutional UI, not OS dark-mode chrome. */
export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#ffffff"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const deploymentSha = process.env.VERCEL_GIT_COMMIT_SHA ?? "";
  return (
    <html
      lang="en"
      className={`fulcrum-root ${dmSans.variable} ${jetbrainsMono.variable}`}
      data-deployment-sha={deploymentSha}
      style={{ colorScheme: "light" }}
    >
      {/* Inline backdrop + text defaults so the light HUD matches localhost even if CSS order/cache diverges on CDN */}
      <body className="fulcrum-root cortex-body hud-skin" style={{ backgroundColor: "#ffffff", color: "#0f172a" }}>
        <CortexBackdrop />
        <BrandHeader />
        <div className="app-shell cortex-shell">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}

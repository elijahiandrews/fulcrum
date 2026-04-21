"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/platform", label: "Platform" },
  { href: "/actions", label: "Actions" },
  { href: "/regional-monitor", label: "Regional Monitor" },
  { href: "/alerts-center", label: "Alerts Center" },
  { href: "/request-access", label: "Request Access" }
] as const;

function navActive(pathname: string, href: string): boolean {
  if (href === "/platform" && pathname.startsWith("/symbol")) return true;
  if (href === "/actions" && pathname.startsWith("/symbol")) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function BrandHeader() {
  const pathname = usePathname() || "/";

  return (
    <header className="site-header">
      <div className="container site-header-inner">
        <div className="site-header-brand">
          <Link href="/" className="brand-block brand-block-logo-only" aria-label="Fulcrum Intelligence home">
            <img src="/fulcrum-mark.svg" alt="" width={28} height={28} aria-hidden />
          </Link>
        </div>
        <nav className="main-nav main-nav-center" aria-label="Primary">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`nav-link${navActive(pathname, href) ? " nav-link-active" : ""}`}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="site-header-trail" aria-hidden="true" />
      </div>
    </header>
  );
}

import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="container footer-links">
      <Link href="/platform" prefetch={false}>
        Platform
      </Link>
      <Link href="/regional-monitor" prefetch={false}>
        Regional Monitor
      </Link>
      <Link href="/alerts-center" prefetch={false}>
        Alerts Center
      </Link>
      <Link href="/request-access">Request Access</Link>
    </footer>
  );
}

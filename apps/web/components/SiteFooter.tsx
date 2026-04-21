import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="container footer-links">
      <Link href="/platform">Platform</Link>
      <Link href="/regional-monitor">Regional Monitor</Link>
      <Link href="/alerts-center">Alerts Center</Link>
      <Link href="/request-access">Request Access</Link>
    </footer>
  );
}

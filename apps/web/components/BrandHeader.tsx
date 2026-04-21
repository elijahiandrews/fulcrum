import Link from "next/link";

export function BrandHeader() {
  return (
    <header className="top-nav">
      <div className="container top-nav-inner">
        <Link href="/" className="brand-mark">
          <img src="/fulcrum-mark.svg" alt="Fulcrum" width={26} height={26} />
          <div>
            <div className="brand-title">Fulcrum</div>
            <div className="brand-sub">GMI - Global Market Intelligence</div>
          </div>
        </Link>
        <nav className="nav-links">
          <Link className="nav-link" href="/platform">Platform</Link>
          <Link className="nav-link" href="/regional-monitor">Regional Monitor</Link>
          <Link className="nav-link" href="/alerts-center">Alerts Center</Link>
          <Link className="nav-link" href="/request-access">Request Access</Link>
        </nav>
      </div>
    </header>
  );
}

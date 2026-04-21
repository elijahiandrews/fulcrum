import Link from "next/link";

export function BrandHeader() {
  return (
    <header style={{ borderBottom: "1px solid #1e2a3f" }}>
      <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 0" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <img src="/fulcrum-mark.svg" alt="Fulcrum" width={26} height={26} />
          <div>
            <div style={{ fontWeight: 700, letterSpacing: "0.03em" }}>Fulcrum</div>
            <div style={{ fontSize: "0.72rem", color: "#89a0bf" }}>See the pressure before the move.</div>
          </div>
        </Link>
        <nav style={{ display: "flex", gap: "1rem", color: "#b5c6de", fontSize: "0.93rem" }}>
          <Link href="/platform">Platform</Link>
          <Link href="/region">Regional Monitor</Link>
          <Link href="/alerts">Alerts Center</Link>
          <Link href="/request-access">Request Access</Link>
        </nav>
      </div>
    </header>
  );
}

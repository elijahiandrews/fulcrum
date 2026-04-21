import Link from "next/link";
import { cookies } from "next/headers";

import { ACCESS_COOKIE, grantedCookieValue, isAccessConfigured } from "../../lib/api/access";

export default async function AccessGatePage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const params = await searchParams;
  const nextPath = params.next && params.next.startsWith("/") ? params.next : "/platform";
  const store = await cookies();
  const alreadyGranted = !isAccessConfigured() ? true : store.get(ACCESS_COOKIE)?.value === grantedCookieValue;

  if (!isAccessConfigured()) {
    return (
      <main className="container page">
        <h2 className="page-title" style={{ fontSize: "2rem" }}>Access Control Disabled</h2>
        <p className="page-subtitle">Set `FULCRUM_ACCESS_KEY` in production to enable gating for product intelligence routes.</p>
        <div style={{ marginTop: "1rem" }}>
          <Link href={nextPath} className="btn-primary">Continue to Platform</Link>
        </div>
      </main>
    );
  }

  if (alreadyGranted) {
    return (
      <main className="container page">
        <h2 className="page-title" style={{ fontSize: "2rem" }}>Access Granted</h2>
        <p className="page-subtitle">Your browser already has a valid session for Fulcrum product intelligence routes.</p>
        <div style={{ marginTop: "1rem", display: "flex", gap: "0.6rem" }}>
          <Link href={nextPath} className="btn-primary">Open Product Surface</Link>
          <form method="post" action="/api/access/logout">
            <button type="submit" className="btn-secondary">Clear Access Session</button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="container page">
      <section className="card" style={{ maxWidth: 620 }}>
        <div className="chip">Fulcrum Access Gate</div>
        <h2 className="page-title" style={{ fontSize: "1.9rem", marginTop: "0.7rem" }}>Protected Intelligence Console</h2>
        <p className="page-subtitle" style={{ fontSize: "0.98rem" }}>
          Fulcrum platform routes are gated for controlled external sharing. Enter your access key to continue.
        </p>
        <form method="post" action="/api/access" style={{ marginTop: "1rem", display: "grid", gap: "0.7rem" }}>
          <input type="hidden" name="next" value={nextPath} />
          <input
            name="accessKey"
            type="password"
            placeholder="Enter access key"
            required
            style={{
              border: "1px solid var(--panel-border)",
              background: "rgba(255,255,255,0.72)",
              borderRadius: 12,
              padding: "0.68rem 0.75rem",
              color: "var(--text)"
            }}
          />
          <button type="submit" className="btn-primary" style={{ width: "fit-content" }}>
            Unlock Product
          </button>
        </form>
      </section>
    </main>
  );
}

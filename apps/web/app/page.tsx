import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="container" style={{ padding: "3rem 0 4rem 0" }}>
      <section style={{ marginBottom: "2.5rem" }}>
        <div className="chip">Fulcrum Intelligence Platform</div>
        <h1 style={{ fontSize: "2.4rem", marginBottom: "0.8rem", maxWidth: 850 }}>
          Spot emerging short squeeze conditions before the market fully reprices them.
        </h1>
        <p style={{ color: "#9cb0cc", maxWidth: 880, lineHeight: 1.55 }}>
          Fulcrum monitors market structure, positioning pressure, catalyst activity, and cross-market anomalies to identify
          squeeze-risk setups in real time. Built for traders, funds, and intelligence-driven operators who want more than noisy scanners and delayed headlines.
        </p>
        <div style={{ display: "flex", gap: "0.8rem", marginTop: "1rem" }}>
          <Link href="/request-access" className="card" style={{ padding: "0.65rem 1rem", borderColor: "#7aa2ff" }}>Request Access</Link>
          <Link href="/platform" className="card" style={{ padding: "0.65rem 1rem" }}>See the Platform</Link>
        </div>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "1rem" }}>
        <article className="card">
          <h3>Why Fulcrum</h3>
          <p style={{ color: "#9cb0cc" }}>Most traders see the move after it starts. Fulcrum detects the conditions that make violent repricing possible before the crowd fully reacts.</p>
        </article>
        <article className="card">
          <h3>What It Tracks</h3>
          <p style={{ color: "#9cb0cc" }}>From abnormal volume and options acceleration to disclosed short pressure and catalyst emergence, Fulcrum turns fragmented signals into a unified view of squeeze risk.</p>
        </article>
        <article className="card">
          <h3>Why It Matters</h3>
          <p style={{ color: "#9cb0cc" }}>When positioning is crowded and supply is tight, price can move faster than most systems are built to understand. Fulcrum makes that pressure visible.</p>
        </article>
      </section>
    </main>
  );
}

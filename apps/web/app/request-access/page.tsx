export default function RequestAccessPage() {
  return (
    <main className="container" style={{ padding: "2rem 0 3rem 0" }}>
      <h2>Request Access</h2>
      <p style={{ color: "#89a0bf", maxWidth: 760 }}>
        Fulcrum is onboarding select design partners across discretionary trading desks, multi-manager teams, and intelligence-driven funds.
      </p>
      <form className="card" style={{ maxWidth: 640, display: "grid", gap: "0.7rem" }}>
        <input placeholder="Full name" style={{ background: "#070b12", color: "#d9e2f2", border: "1px solid #1e2a3f", borderRadius: 8, padding: "0.7rem" }} />
        <input placeholder="Work email" style={{ background: "#070b12", color: "#d9e2f2", border: "1px solid #1e2a3f", borderRadius: 8, padding: "0.7rem" }} />
        <input placeholder="Firm" style={{ background: "#070b12", color: "#d9e2f2", border: "1px solid #1e2a3f", borderRadius: 8, padding: "0.7rem" }} />
        <textarea placeholder="Primary use case (signal research, risk monitoring, execution support)" rows={4} style={{ background: "#070b12", color: "#d9e2f2", border: "1px solid #1e2a3f", borderRadius: 8, padding: "0.7rem" }} />
        <button type="button" className="card" style={{ cursor: "pointer", borderColor: "#7aa2ff", width: "fit-content", padding: "0.6rem 1rem" }}>
          Submit Request
        </button>
      </form>
    </main>
  );
}

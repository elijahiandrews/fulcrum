import { RequestAccessForm } from "../../components/RequestAccessForm";

export default function RequestAccessPage() {
  return (
    <main className="container" style={{ padding: "2rem 0 3rem 0" }}>
      <h2>Request Access</h2>
      <p style={{ color: "#89a0bf", maxWidth: 760 }}>
        Fulcrum is onboarding select design partners across discretionary trading desks, multi-manager teams, and intelligence-led risk teams.
      </p>
      <RequestAccessForm />
    </main>
  );
}

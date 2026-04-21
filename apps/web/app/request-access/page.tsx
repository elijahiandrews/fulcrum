import { RequestAccessForm } from "../../components/RequestAccessForm";

export default function RequestAccessPage() {
  return (
    <main className="container page">
      <h2 className="page-title" style={{ fontSize: "2rem" }}>Request Access</h2>
      <p className="page-subtitle" style={{ maxWidth: 760 }}>
        Fulcrum Intelligence is onboarding select design partners across discretionary trading desks, multi-manager teams, and intelligence-led risk teams.
      </p>
      <RequestAccessForm />
    </main>
  );
}

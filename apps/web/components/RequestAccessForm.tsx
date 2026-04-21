"use client";

import { FormEvent, useMemo, useState } from "react";

interface FormState {
  fullName: string;
  workEmail: string;
  company: string;
  role: string;
  useCase: string;
  notes: string;
}

const initialState: FormState = {
  fullName: "",
  workEmail: "",
  company: "",
  role: "",
  useCase: "",
  notes: ""
};

export function RequestAccessForm() {
  const [formState, setFormState] = useState<FormState>(initialState);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const canSubmit = useMemo(() => Object.keys(errors).length === 0, [errors]);

  const validate = (state: FormState) => {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};
    if (!state.fullName.trim()) nextErrors.fullName = "Full name is required.";
    if (!state.workEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.workEmail)) nextErrors.workEmail = "Enter a valid work email.";
    if (!state.company.trim()) nextErrors.company = "Firm or company is required.";
    if (!state.role.trim()) nextErrors.role = "Role is required.";
    if (!state.useCase.trim() || state.useCase.trim().length < 20) nextErrors.useCase = "Provide at least 20 characters describing your use case.";
    return nextErrors;
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate(formState);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setSubmitted(true);
    setFormState(initialState);
  };

  const fieldStyle = {
    background: "#070b12",
    color: "#d9e2f2",
    border: "1px solid #1e2a3f",
    borderRadius: 8,
    padding: "0.7rem"
  };

  if (submitted) {
    return (
      <div className="card" style={{ maxWidth: 680 }}>
        <h3 style={{ marginTop: 0 }}>Access Request Received</h3>
        <p style={{ color: "#b5c6de" }}>
          Fulcrum onboarding has logged your request. A product specialist will follow up via your work email after eligibility review.
        </p>
        <button type="button" className="card" style={{ cursor: "pointer", borderColor: "#7aa2ff", width: "fit-content", padding: "0.6rem 1rem" }} onClick={() => setSubmitted(false)}>
          Submit Another Request
        </button>
      </div>
    );
  }

  return (
    <form className="card" style={{ maxWidth: 680, display: "grid", gap: "0.7rem" }} onSubmit={submit} noValidate>
      <input
        placeholder="Full name"
        style={fieldStyle}
        value={formState.fullName}
        onChange={(e) => setFormState((prev) => ({ ...prev, fullName: e.target.value }))}
      />
      {errors.fullName ? <span style={{ color: "#f29c74", fontSize: "0.8rem" }}>{errors.fullName}</span> : null}
      <input
        placeholder="Work email"
        style={fieldStyle}
        value={formState.workEmail}
        onChange={(e) => setFormState((prev) => ({ ...prev, workEmail: e.target.value }))}
      />
      {errors.workEmail ? <span style={{ color: "#f29c74", fontSize: "0.8rem" }}>{errors.workEmail}</span> : null}
      <input
        placeholder="Firm / company"
        style={fieldStyle}
        value={formState.company}
        onChange={(e) => setFormState((prev) => ({ ...prev, company: e.target.value }))}
      />
      {errors.company ? <span style={{ color: "#f29c74", fontSize: "0.8rem" }}>{errors.company}</span> : null}
      <input
        placeholder="Role"
        style={fieldStyle}
        value={formState.role}
        onChange={(e) => setFormState((prev) => ({ ...prev, role: e.target.value }))}
      />
      {errors.role ? <span style={{ color: "#f29c74", fontSize: "0.8rem" }}>{errors.role}</span> : null}
      <textarea
        placeholder="Use case (signal research, risk monitoring, execution support)"
        rows={4}
        style={fieldStyle}
        value={formState.useCase}
        onChange={(e) => setFormState((prev) => ({ ...prev, useCase: e.target.value }))}
      />
      {errors.useCase ? <span style={{ color: "#f29c74", fontSize: "0.8rem" }}>{errors.useCase}</span> : null}
      <textarea
        placeholder="Optional notes"
        rows={3}
        style={fieldStyle}
        value={formState.notes}
        onChange={(e) => setFormState((prev) => ({ ...prev, notes: e.target.value }))}
      />
      <button
        type="submit"
        className="card"
        style={{ cursor: "pointer", borderColor: "#7aa2ff", width: "fit-content", padding: "0.6rem 1rem", opacity: canSubmit ? 1 : 0.95 }}
      >
        Submit Request
      </button>
    </form>
  );
}

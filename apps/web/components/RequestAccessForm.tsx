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

  const errStyle = { color: "var(--pressure-high)", fontSize: "0.8rem" } as const;

  if (submitted) {
    return (
      <div className="card" style={{ maxWidth: 680 }}>
        <h3 style={{ marginTop: 0 }}>Access request received</h3>
        <p style={{ color: "var(--muted)" }}>
          Fulcrum Intelligence onboarding has logged your request. A product specialist will follow up via your work email after eligibility review.
        </p>
        <button type="button" className="btn-secondary" style={{ cursor: "pointer", width: "fit-content" }} onClick={() => setSubmitted(false)}>
          Submit another request
        </button>
      </div>
    );
  }

  return (
    <form className="card" style={{ maxWidth: 680, display: "grid", gap: "0.85rem" }} onSubmit={submit} noValidate>
      <div>
        <label className="form-label" htmlFor="fullName">
          Full name
        </label>
        <input
          id="fullName"
          name="fullName"
          className="input-dark"
          autoComplete="name"
          placeholder="Jordan Mercer"
          value={formState.fullName}
          onChange={(e) => setFormState((prev) => ({ ...prev, fullName: e.target.value }))}
        />
        {errors.fullName ? <span style={errStyle}>{errors.fullName}</span> : null}
      </div>
      <div>
        <label className="form-label" htmlFor="workEmail">
          Work email
        </label>
        <input
          id="workEmail"
          name="workEmail"
          type="email"
          className="input-dark"
          autoComplete="email"
          placeholder="you@firm.com"
          value={formState.workEmail}
          onChange={(e) => setFormState((prev) => ({ ...prev, workEmail: e.target.value }))}
        />
        {errors.workEmail ? <span style={errStyle}>{errors.workEmail}</span> : null}
      </div>
      <div>
        <label className="form-label" htmlFor="company">
          Firm / company
        </label>
        <input
          id="company"
          name="company"
          className="input-dark"
          autoComplete="organization"
          placeholder="Institution or fund"
          value={formState.company}
          onChange={(e) => setFormState((prev) => ({ ...prev, company: e.target.value }))}
        />
        {errors.company ? <span style={errStyle}>{errors.company}</span> : null}
      </div>
      <div>
        <label className="form-label" htmlFor="role">
          Role
        </label>
        <input
          id="role"
          name="role"
          className="input-dark"
          autoComplete="organization-title"
          placeholder="PM, trader, risk, research…"
          value={formState.role}
          onChange={(e) => setFormState((prev) => ({ ...prev, role: e.target.value }))}
        />
        {errors.role ? <span style={errStyle}>{errors.role}</span> : null}
      </div>
      <div>
        <label className="form-label" htmlFor="useCase">
          Primary use case
        </label>
        <textarea
          id="useCase"
          name="useCase"
          className="input-dark"
          rows={4}
          placeholder="How you intend to use Fulcrum Intelligence (desk workflow, coverage, compliance constraints)."
          value={formState.useCase}
          onChange={(e) => setFormState((prev) => ({ ...prev, useCase: e.target.value }))}
        />
        {errors.useCase ? <span style={errStyle}>{errors.useCase}</span> : null}
      </div>
      <div>
        <label className="form-label" htmlFor="notes">
          Optional notes
        </label>
        <textarea
          id="notes"
          name="notes"
          className="input-dark"
          rows={3}
          placeholder="Data residency, integration targets, or onboarding timeline."
          value={formState.notes}
          onChange={(e) => setFormState((prev) => ({ ...prev, notes: e.target.value }))}
        />
      </div>
      <button type="submit" className="btn-primary" style={{ cursor: "pointer", width: "fit-content", opacity: canSubmit ? 1 : 0.95 }}>
        Submit request
      </button>
    </form>
  );
}

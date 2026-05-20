"use client";

import { useState, useTransition } from "react";
import { reset } from "@/actions/reset";
import { ResetSchema } from "@/schemas";
import Link from "next/link";

export const ResetForm = () => {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const result = ResetSchema.safeParse({ email: value });
    if (!result.success) {
      const err = result.error.flatten().fieldErrors;
      setFieldErrors((prev) => ({ ...prev, email: err.email?.[0] ?? "" }));
    } else {
      setFieldErrors((prev) => ({ ...prev, email: "" }));
    }
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    const result = ResetSchema.safeParse({ email });
    if (!result.success) {
      const err = result.error.flatten().fieldErrors;
      if (err.email) setFieldErrors({ email: err.email[0] });
      return;
    }

    startTransition(() => {
      reset(result.data)
        .then((data) => {
          setError(data?.error);
          setSuccess(data?.success);
        })
        .catch(() => setError("Something went wrong"));
    });
  };

  if (success) {
    return (
      <div className="auth-card" style={{ textAlign: "center", padding: "3rem 2rem" }}>
        <div className="auth-header">
          <h1 className="auth-title">Check your email</h1>
          <p className="auth-subtitle" style={{ marginTop: "1rem" }}>
            We sent a password reset link to your email
          </p>
        </div>
        <div style={{ margin: "2rem 0" }}>
          <div className="form-success" style={{ justifyContent: "center" }}>
            {success}
          </div>
        </div>
        <div className="auth-footer">
          <Link href="/auth?mode=login" className="auth-link">Back to login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-card">
      <div className={`form-error-banner ${!error ? "banner-hidden" : ""}`}>{error || "\u00A0"}</div>

      <div className="auth-header">
        <h1 className="auth-title">Reset password</h1>
        <p className="auth-subtitle">We will send you a reset link</p>
      </div>

      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="email">Email</label>
          <input className="form-input" disabled={isPending} id="email" name="email" type="email" required onBlur={onBlur} placeholder=" " />
          {fieldErrors.email && <div className="form-error">{fieldErrors.email}</div>}
        </div>

        <button disabled={isPending} type="submit" className="btn-primary">
          Send reset email
        </button>
      </form>

      <div className="auth-footer">
        <Link href="/auth?mode=login" className="auth-link">Back to login</Link>
      </div>
    </div>
  );
};

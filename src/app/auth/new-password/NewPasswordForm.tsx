"use client";

import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { newPassword } from "@/actions/new-password";
import { NewPasswordSchema } from "@/schemas";
import { usePasswordStrength } from "@/lib/usePasswordStrength";
import Link from "next/link";

export const NewPasswordForm = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();
  const [showPwd, setShowPwd] = useState(false);
  const { password, setPassword, focused, setFocused, strengthClass, requirement } = usePasswordStrength();

  const onBlur = () => {
    const result = NewPasswordSchema.safeParse({ password });
    if (!result.success) {
      const err = result.error.flatten().fieldErrors;
      setFieldErrors((prev) => ({ ...prev, password: err.password?.[0] ?? "" }));
    } else {
      setFieldErrors((prev) => ({ ...prev, password: "" }));
    }
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setFieldErrors({});

    const result = NewPasswordSchema.safeParse({ password });
    if (!result.success) {
      const err = result.error.flatten().fieldErrors;
      if (err.password) setFieldErrors({ password: err.password[0] });
      return;
    }

    startTransition(() => {
      newPassword(result.data, token)
        .then((data) => {
          if (data.status === "error") setError(data.message);
          else setSuccess(data.message);
        })
        .catch(() => setError("Something went wrong"));
    });
  };

  if (success) {
    return (
      <div className="auth-card" style={{ textAlign: "center", padding: "3rem 2rem" }}>
        <div className="auth-header">
          <h1 className="auth-title">Password reset</h1>
          <p className="auth-subtitle" style={{ marginTop: "1rem" }}>
            Your password has been reset successfully
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
        <h1 className="auth-title">Enter a new password</h1>
      </div>

      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="password">Password</label>
          <div className="pwd-input-wrap">
            <input
              className="form-input"
              disabled={isPending}
              id="password"
              name="password"
              type={showPwd ? "text" : "password"}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setFieldErrors((prev) => ({ ...prev, password: "" })); }}
              onFocus={() => setFocused(true)}
              onBlur={() => { setFocused(false); onBlur(); }}
              required
              placeholder=" "
            />
            {password.length > 0 && (
              <button type="button" className="pwd-toggle" onClick={() => setShowPwd((p) => !p)} tabIndex={-1} aria-label={showPwd ? "Hide password" : "Show password"}>
                {showPwd ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            )}
          </div>
          {focused && requirement && <div className="pwd-requirement">{requirement}</div>}
          {!focused && fieldErrors.password && <div className="form-error">{fieldErrors.password}</div>}
          {password.length > 0 && (
            <div className="pwd-strength-bar">
              <div className={`pwd-strength-fill ${strengthClass}`}></div>
            </div>
          )}
        </div>

        <button disabled={isPending} type="submit" className="btn-primary">
          Reset password
        </button>
      </form>

      <div className="auth-footer">
        <Link href="/auth?mode=login" className="auth-link">Back to login</Link>
      </div>
    </div>
  );
};

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/actions/login";
import { LoginSchema } from "@/schemas";
import Link from "next/link";

export const LoginForm = () => {
  const router = useRouter();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();
  const [showPwd, setShowPwd] = useState(false);
  const [pwdLen, setPwdLen] = useState(0);

  const validateField = (field: string, value: string) => {
    const result = LoginSchema.safeParse({
      email: field === "email" ? value : (document.getElementById("email") as HTMLInputElement)?.value || "",
      password: field === "password" ? value : (document.getElementById("password") as HTMLInputElement)?.value || "",
    });
    if (!result.success) {
      const err = result.error.flatten().fieldErrors;
      if (field === "email" && err.email) return err.email[0];
      if (field === "password" && err.password) return err.password[0];
    }
    return "";
  };

  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const msg = validateField(name, value);
    setFieldErrors((prev) => ({ ...prev, [name]: msg }));
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = LoginSchema.safeParse({ email, password });
    if (!result.success) {
      const err = result.error.flatten().fieldErrors;
      setFieldErrors({
        ...(err.email && { email: err.email[0] }),
        ...(err.password && { password: err.password[0] }),
      });
      return;
    }

    startTransition(() => {
      login(result.data)
        .then((data) => {
          if (!data) return;
          if ("field" in data && data.field) {
            setError(data.error!);
            return;
          }
          if ("success" in data) {
            if (data.success === true) {
              router.push("/dashboard");
            } else {
              setSuccess(data.success as string);
            }
            return;
          }
          if ("error" in data && data.error) {
            setError(data.error);
          }
        });
    });
  };

  return (
    <div className="auth-card">
      <div className={`form-error-banner ${!error ? "banner-hidden" : ""}`}>{error || "\u00A0"}</div>
      {success && <div className="form-success" style={{ justifyContent: "center", marginBottom: "1rem" }}>{success}</div>}

      <div className="auth-header">
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Login to your SecureGate account</p>
      </div>

      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="email">Email</label>
          <input className="form-input" disabled={isPending} id="email" name="email" type="email" required onBlur={onBlur} placeholder=" " />
          {fieldErrors.email && <div className="form-error">{fieldErrors.email}</div>}
        </div>

        <div className="form-group">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label className="form-label" htmlFor="password">Password</label>
            <Link href="/auth?mode=reset" className="auth-link" style={{ fontSize: "0.8rem" }}>Forgot password?</Link>
          </div>
          <div className="pwd-input-wrap">
            <input className="form-input" disabled={isPending} id="password" name="password" type={showPwd ? "text" : "password"} required onBlur={onBlur} onChange={(e) => { setPwdLen(e.target.value.length); setError(""); }} placeholder=" " />
            {pwdLen > 0 && (
              <button type="button" className="pwd-toggle" onClick={() => setShowPwd((p) => !p)} tabIndex={-1} aria-label={showPwd ? "Hide password" : "Show password"}>
                {showPwd ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            )}
          </div>
          {fieldErrors.password && <div className="form-error">{fieldErrors.password}</div>}
        </div>

        <button disabled={isPending} type="submit" className="btn-primary">
          Login
        </button>
      </form>

      <div className="auth-footer">
          Don&apos;t have an account? <Link href="/auth?mode=register" className="auth-link">Sign up here</Link>
      </div>
    </div>
  );
};

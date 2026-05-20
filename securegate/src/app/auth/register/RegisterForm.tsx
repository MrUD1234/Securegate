"use client";

import { useState, useTransition } from "react";
import { register } from "@/actions/register";
import { RegisterSchema } from "@/schemas";
import Link from "next/link";

export const RegisterForm = () => {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  const [password, setPassword] = useState("");
  const [strength, setStrength] = useState("");
  const [focused, setFocused] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const checks = {
    min: password.length >= 10,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>_]/.test(password),
  };

  const requirement = !checks.min ? "At least 10 characters" : !checks.upper ? "One uppercase letter" : !checks.lower ? "One lowercase letter" : !checks.number ? "One number" : !checks.special ? "One special character" : null;

  const calculateStrength = (val: string) => {
    setPassword(val);
    const all = val.length >= 10 && /[A-Z]/.test(val) && /[a-z]/.test(val) && /[0-9]/.test(val) && /[!@#$%^&*(),.?":{}|<>_]/.test(val);
    if (val.length === 0) {
      setStrength("");
    } else if (all) {
      setStrength("pwd-strong");
    } else {
      setStrength("pwd-weak");
    }
  };

  const validateField = (field: string, value: string) => {
    const email = (document.getElementById("email") as HTMLInputElement)?.value || "";
    const name = (document.getElementById("name") as HTMLInputElement)?.value || "";
    const pwd = field === "password" ? value : password;
    const result = RegisterSchema.safeParse({
      name: field === "name" ? value : name,
      email: field === "email" ? value : email,
      password: pwd,
    });
    if (!result.success) {
      const err = result.error.flatten().fieldErrors;
      if (field === "name" && err.name) return err.name[0];
      if (field === "email" && err.email) return err.email[0];
      if (field === "password" && err.password) return err.password[0];
    }
    return "";
  };

  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    const value = name === "password" ? password : e.target.value;
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
    const name = formData.get("name") as string;

    const result = RegisterSchema.safeParse({ email, password, name });
    if (!result.success) {
      const err = result.error.flatten().fieldErrors;
      setFieldErrors({
        ...(err.name && { name: err.name[0] }),
        ...(err.email && { email: err.email[0] }),
        ...(err.password && { password: err.password[0] }),
      });
      return;
    }

    startTransition(() => {
      register(result.data)
        .then((data) => {
          setError(data.error);
          setSuccess(data.success);
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
            We sent a confirmation link to your email
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
        <h1 className="auth-title">Create an Account</h1>
        <p className="auth-subtitle">Welcome to SecureGate</p>
      </div>

      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="name">Name</label>
          <input className="form-input" disabled={isPending} id="name" name="name" type="text" required autoFocus onBlur={onBlur} onChange={() => setFieldErrors((prev) => ({ ...prev, name: "" }))} placeholder=" " />
          {fieldErrors.name && <div className="form-error">{fieldErrors.name}</div>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="email">Email</label>
          <input className="form-input" disabled={isPending} id="email" name="email" type="email" required onBlur={onBlur} onChange={(e) => {
            if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value)) {
              setFieldErrors((prev) => ({ ...prev, email: "" }));
            }
          }} placeholder=" " />
          {fieldErrors.email && <div className="form-error">{fieldErrors.email}</div>}
        </div>

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
              onChange={(e) => { calculateStrength(e.target.value); setFieldErrors((prev) => ({ ...prev, password: "" })); }}
              onFocus={() => setFocused(true)}
              onBlur={(e) => { setFocused(false); onBlur(e); }}
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
            <>
              <div className="pwd-strength-bar">
                <div className={`pwd-strength-fill ${strength}`}></div>
              </div>
            </>
          )}
        </div>

        <button disabled={isPending} type="submit" className="btn-primary">
          Sign Up
        </button>
      </form>

      <div className="auth-footer">
        Already have an account? <Link href="/auth?mode=login" className="auth-link">Login here</Link>
      </div>
    </div>
  );
};

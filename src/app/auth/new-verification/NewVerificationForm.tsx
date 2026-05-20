"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { newVerification } from "@/actions/new-verification";
import Link from "next/link";

export const NewVerificationForm = ({ token: propToken }: { token?: string | null }) => {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const searchParams = useSearchParams();
  const token = propToken || searchParams.get("token");
  const email = searchParams.get("email");

  const onSubmit = useCallback(() => {
    if (success || error) return;
    if (!token) {
      setError("Missing token!");
      return;
    }

    newVerification(token, email ?? undefined)
      .then((data) => {
        if (data.status === "success") setSuccess(data.message);
        else setError(data.message);
      })
      .catch(() => {
        setError("Something went wrong!");
      })
  }, [token, success, error]);

  useEffect(() => {
    onSubmit();
  }, [onSubmit]);

  return (
    <div className="auth-card" style={{ textAlign: "center" }}>
      <div className="auth-header">
        <h1 className="auth-title">Confirming verification</h1>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
        {!success && !error && <p className="auth-subtitle">Loading...</p>}
        {success && <div className="form-success" style={{ width: '100%', justifyContent: 'center' }}>{success}</div>}
        {!success && error && <div className="form-error-banner" style={{ width: '100%', justifyContent: 'center' }}>{error}</div>}
      </div>
      <div className="auth-footer">
        <Link href="/auth?mode=login" className="auth-link">Back to login</Link>
      </div>
    </div>
  );
};

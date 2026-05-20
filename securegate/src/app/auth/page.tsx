import { Suspense } from "react";
import { AuthForm } from "./AuthForm";

export default function AuthPage() {
  return (
    <main className="auth-wrapper">
      <Suspense fallback={<div className="auth-card"><div className="auth-header"><h1 className="auth-title">Loading...</h1></div></div>}>
        <AuthForm />
      </Suspense>
    </main>
  );
}

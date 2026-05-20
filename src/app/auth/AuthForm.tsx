"use client";

import { useSearchParams } from "next/navigation";
import { LoginForm } from "./login/LoginForm";
import { RegisterForm } from "./register/RegisterForm";
import { ResetForm } from "./reset/ResetForm";
import { NewPasswordForm } from "./new-password/NewPasswordForm";
import { NewVerificationForm } from "./new-verification/NewVerificationForm";

const ALLOWED_MODES = ["login", "register", "reset", "new-password", "verify"] as const;

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const AuthForm = () => {
  const searchParams = useSearchParams();
  const rawMode = searchParams.get("mode") || "login";
  const mode = ALLOWED_MODES.includes(rawMode as typeof ALLOWED_MODES[number])
    ? (rawMode as typeof ALLOWED_MODES[number])
    : "login";
  const token = searchParams.get("token");
  const validToken = token && UUID_REGEX.test(token) ? token : null;

  if (validToken) {
    if (mode === "new-password") {
      return <NewPasswordForm token={validToken} />;
    }
    return <NewVerificationForm token={validToken} />;
  }

  switch (mode) {
    case "register":
      return <RegisterForm />;
    case "reset":
      return <ResetForm />;
    default:
      return <LoginForm />;
  }
};

"use client";

import { useSearchParams } from "next/navigation";
import { LoginForm } from "./login/LoginForm";
import { RegisterForm } from "./register/RegisterForm";
import { ResetForm } from "./reset/ResetForm";
import { NewPasswordForm } from "./new-password/NewPasswordForm";
import { NewVerificationForm } from "./new-verification/NewVerificationForm";

export const AuthForm = () => {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") || "login";
  const token = searchParams.get("token");

  if (token) {
    if (mode === "new-password") {
      return <NewPasswordForm />;
    }
    return <NewVerificationForm />;
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

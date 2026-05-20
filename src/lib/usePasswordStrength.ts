"use client";

import { useState } from "react";

const PASSWORD_RULES = [
  { key: "min", test: (v: string) => v.length >= 10, label: "At least 10 characters" },
  { key: "upper", test: (v: string) => /[A-Z]/.test(v), label: "One uppercase letter" },
  { key: "lower", test: (v: string) => /[a-z]/.test(v), label: "One lowercase letter" },
  { key: "number", test: (v: string) => /[0-9]/.test(v), label: "One number" },
  { key: "special", test: (v: string) => /[!@#$%^&*(),.?":{}|<>_]/.test(v), label: "One special character" },
] as const;

export function usePasswordStrength() {
  const [password, setPassword] = useState("");
  const [focused, setFocused] = useState(false);

  const checks = Object.fromEntries(
    PASSWORD_RULES.map((r) => [r.key, r.test(password)])
  ) as Record<string, boolean>;

  const allMet = PASSWORD_RULES.every((r) => checks[r.key]);

  const requirement = PASSWORD_RULES.find((r) => !checks[r.key])?.label ?? null;

  const strengthClass =
    password.length === 0 ? ""
    : allMet ? "pwd-strong"
    : "pwd-weak";

  return {
    password,
    setPassword,
    focused,
    setFocused,
    strengthClass,
    requirement,
  };
}

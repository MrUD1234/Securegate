const REQUIRED = [
  "DATABASE_URL",
  "NEXTAUTH_URL",
  "AUTH_SECRET",
] as const;

const OPTIONAL = [
  "RESEND_API_KEY",
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_SECURE",
  "SMTP_USER",
  "SMTP_PASS",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
  "FROM_EMAIL",
] as const;

export function validateEnv() {
  const missing: string[] = [];
  for (const key of REQUIRED) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}\n` +
      `Copy .env.example to .env and fill in the values.`
    );
  }
}

export function env(key: string, fallback?: string): string {
  return process.env[key] ?? fallback ?? "";
}

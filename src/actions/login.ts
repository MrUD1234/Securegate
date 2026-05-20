"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { signIn } from "@/auth";
import { LoginSchema } from "@/schemas";
import { db } from "@/lib/db";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";
import { rateLimit } from "@/lib/rate-limit";

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

type ActionResult =
  | { status: "success"; message: string; redirect?: string }
  | { status: "error"; message: string };

export const login = async (values: z.infer<typeof LoginSchema>): Promise<ActionResult> => {
  const ip = headers().get("x-forwarded-for") ?? "unknown";
  const { allowed: ipAllowed } = await rateLimit(`login:${ip}`, 10, 60);
  if (!ipAllowed) {
    return { status: "error", message: "Too many requests. Please try again later." };
  }
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { status: "error", message: "Invalid fields!" };
  }

  const { email, password } = validatedFields.data;

  const { allowed: emailAllowed } = await rateLimit(`login:email:${email}`, 5, 60);
  if (!emailAllowed) {
    return { status: "error", message: "Invalid credentials" };
  }

  const existingUser = await db.user.findUnique({
    where: { email }
  });

  if (!existingUser || !existingUser.email || !existingUser.password) {
    await bcrypt.compare("dummy", "$2b$12$00000000000000000000000000000000000");
    return { status: "error", message: "Invalid credentials" };
  }

  if (existingUser.lockoutUntil && new Date(existingUser.lockoutUntil) > new Date()) {
    const remaining = Math.ceil((new Date(existingUser.lockoutUntil).getTime() - Date.now()) / 60000);
    return { status: "error", message: "Invalid credentials" };
  }

  if (existingUser.lockoutUntil && new Date(existingUser.lockoutUntil) <= new Date()) {
    await db.user.update({
      where: { id: existingUser.id },
      data: { failedAttempts: 0, lockoutUntil: null },
    });
    existingUser.failedAttempts = 0;
    existingUser.lockoutUntil = null;
  }

  const passwordMatch = await bcrypt.compare(password, existingUser.password);

  if (!passwordMatch) {
    const attempts = existingUser.failedAttempts + 1;
    if (attempts >= MAX_ATTEMPTS) {
      await db.user.update({
        where: { id: existingUser.id },
        data: {
          failedAttempts: attempts,
          lockoutUntil: new Date(Date.now() + LOCKOUT_DURATION_MS),
        },
      });
      return { status: "error", message: "Invalid credentials" };
    }
    await db.user.update({
      where: { id: existingUser.id },
      data: { failedAttempts: attempts },
    });
    return { status: "error", message: "Invalid credentials" };
  }

  const freshUser = await db.user.update({
    where: { id: existingUser.id },
    data: { failedAttempts: 0, lockoutUntil: null },
  });

  if (!freshUser.emailVerified && freshUser.email) {
    const verificationToken = await generateVerificationToken(freshUser.email);
    await sendVerificationEmail(verificationToken.email, verificationToken.token);
    return { status: "success", message: "Confirmation email sent!" };
  }

  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      return { status: "error", message: "Something went wrong" };
    }
  } catch {
    return { status: "error", message: "Something went wrong" };
  }

  return { status: "success", message: "", redirect: "/dashboard" };
};

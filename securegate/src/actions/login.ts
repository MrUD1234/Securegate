"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";
import { signIn } from "@/auth";
import { LoginSchema } from "@/schemas";
import { db } from "@/lib/db";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

export const login = async (values: z.infer<typeof LoginSchema>) => {
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, password } = validatedFields.data;

  const existingUser = await db.user.findUnique({
    where: { email }
  });

  if (!existingUser || !existingUser.email || !existingUser.password) {
    return { error: "Incorrect credentials" };
  }

  if (existingUser.lockoutUntil && new Date(existingUser.lockoutUntil) > new Date()) {
    const remaining = Math.ceil((new Date(existingUser.lockoutUntil).getTime() - Date.now()) / 60000);
    return { error: `Account locked. Try again in ${remaining} minute${remaining === 1 ? "" : "s"}.` };
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
      return { error: "Account locked. Try again in 15 minutes." };
    }
    await db.user.update({
      where: { id: existingUser.id },
      data: { failedAttempts: attempts },
    });
    return { error: `Incorrect credentials (${MAX_ATTEMPTS - attempts} attempt${MAX_ATTEMPTS - attempts === 1 ? "" : "s"} remaining)` };
  }

  await db.user.update({
    where: { id: existingUser.id },
    data: { failedAttempts: 0, lockoutUntil: null },
  });

  if (!existingUser.emailVerified) {
    const existingToken = await db.verificationToken.findFirst({
      where: { email: existingUser.email }
    });

    if (existingToken && new Date(existingToken.expires) > new Date()) {
      await sendVerificationEmail(existingToken.email, existingToken.token);
    } else {
      const verificationToken = await generateVerificationToken(existingUser.email);
      await sendVerificationEmail(verificationToken.email, verificationToken.token);
    }
    
    return { success: "Confirmation email sent!" };
  }

  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      return { error: "Something went wrong" };
    }
  } catch {
    return { error: "Something went wrong" };
  }

  return { success: true };
};

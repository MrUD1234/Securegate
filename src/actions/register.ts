"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { RegisterSchema } from "@/schemas";
import { db } from "@/lib/db";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";
import { rateLimit } from "@/lib/rate-limit";

type ActionResult =
  | { status: "success"; message: string }
  | { status: "error"; message: string };

export const register = async (values: z.infer<typeof RegisterSchema>): Promise<ActionResult> => {
  const ip = headers().get("x-forwarded-for") ?? "unknown";
  const { allowed } = await rateLimit(`register:${ip}`, 10, 300);
  if (!allowed) {
    return { status: "error", message: "Too many requests. Please try again later." };
  }

  try {
    const validatedFields = RegisterSchema.safeParse(values);

    if (!validatedFields.success) {
      return { status: "error", message: "Invalid fields!" };
    }

    const { email, password, name } = validatedFields.data;

    const existingUser = await db.user.findUnique({ where: { email } });

    if (existingUser) {
      return { status: "error", message: "Email already in use!" };
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await db.user.create({
      data: { name, email, password: hashedPassword },
    });

    const verificationToken = await generateVerificationToken(email);

    try {
      await sendVerificationEmail(verificationToken.email, verificationToken.token);
    } catch (e) {
      console.error("Failed to send email:", e);
      return { status: "error", message: "Account created but failed to send verification email. Check your email service config." };
    }

    return { status: "success", message: "Confirmation email sent! Check your inbox." };
  } catch (err) {
    console.error("Register error:", err);
    return { status: "error", message: "Something went wrong. Please try again." };
  }
};

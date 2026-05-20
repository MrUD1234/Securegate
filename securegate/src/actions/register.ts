"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";
import { RegisterSchema } from "@/schemas";
import { db } from "@/lib/db";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  try {
    const validatedFields = RegisterSchema.safeParse(values);

    if (!validatedFields.success) {
      return { error: "Invalid fields!" };
    }

    const { email, password, name } = validatedFields.data;

    const existingUser = await db.user.findUnique({ where: { email } });

    if (existingUser) {
      return { error: "Email already in use!" };
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
      return { error: "Account created but failed to send verification email. Check your Resend config." };
    }

    return { success: "Confirmation email sent! Check your inbox." };
  } catch (err) {
    console.error("Register error:", err);
    return { error: "Something went wrong. Please try again." };
  }
};

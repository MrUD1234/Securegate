"use server";

import * as z from "zod";
import { headers } from "next/headers";
import { ResetSchema } from "@/schemas";
import { db } from "@/lib/db";
import { generatePasswordResetToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/mail";
import { rateLimit } from "@/lib/rate-limit";

type ActionResult =
  | { status: "success"; message: string }
  | { status: "error"; message: string };

export const reset = async (values: z.infer<typeof ResetSchema>): Promise<ActionResult> => {
  const ip = headers().get("x-forwarded-for") ?? "unknown";
  const { allowed } = await rateLimit(`reset:${ip}`, 3, 300);
  if (!allowed) {
    return { status: "success", message: "If that email exists, a reset link has been sent." };
  }
  const validatedFields = ResetSchema.safeParse(values);

  if (!validatedFields.success) {
    return { status: "error", message: "Invalid email!" };
  }

  const { email } = validatedFields.data;

  const existingUser = await db.user.findUnique({
    where: { email }
  });

  if (!existingUser) {
    return { status: "success", message: "If that email exists, a reset link has been sent." };
  }

  const passwordResetToken = await generatePasswordResetToken(email);
  await sendPasswordResetEmail(
    passwordResetToken.email,
    passwordResetToken.token,
  );

  return { status: "success", message: "If that email exists, a reset link has been sent." };
};

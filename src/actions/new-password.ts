"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";
import { NewPasswordSchema } from "@/schemas";
import { db } from "@/lib/db";

const HISTORY_LIMIT = 5;

type ActionResult =
  | { status: "success"; message: string }
  | { status: "error"; message: string };

export const newPassword = async (
  values: z.infer<typeof NewPasswordSchema>,
  token?: string | null,
): Promise<ActionResult> => {
  if (!token) {
    return { status: "error", message: "Missing token!" };
  }

  const validatedFields = NewPasswordSchema.safeParse(values);

  if (!validatedFields.success) {
    return { status: "error", message: "Invalid fields!" };
  }

  const { password } = validatedFields.data;

  const existingToken = await db.passwordResetToken.findUnique({
    where: { token }
  });

  if (!existingToken) {
    return { status: "error", message: "Invalid token!" };
  }

  if (new Date(existingToken.expires) < new Date()) {
    return { status: "error", message: "Token has expired!" };
  }

  const existingUser = await db.user.findUnique({
    where: { email: existingToken.email },
    include: { passwordHistory: { orderBy: { createdAt: "desc" } } },
  });

  if (!existingUser) {
    return { status: "error", message: "Email does not exist!" };
  }

  if (existingUser.password && await bcrypt.compare(password, existingUser.password)) {
    return { status: "error", message: "Cannot reuse your current password." };
  }

  for (const entry of existingUser.passwordHistory) {
    if (await bcrypt.compare(password, entry.hash)) {
      return { status: "error", message: "Cannot reuse a recent password." };
    }
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const historyEntries = existingUser.passwordHistory;
  const idsToDelete = historyEntries.slice(HISTORY_LIMIT - 1).map(h => h.id);

  await db.$transaction([
    ...(existingUser.password
      ? [db.passwordHistory.create({
          data: { userId: existingUser.id, hash: existingUser.password },
        })]
      : []),
    ...(idsToDelete.length > 0
      ? [db.passwordHistory.deleteMany({
          where: { id: { in: idsToDelete } },
        })]
      : []),
    db.user.update({
      where: { id: existingUser.id },
      data: { password: hashedPassword, failedAttempts: 0, lockoutUntil: null, sessionVersion: { increment: 1 } },
    }),
    db.passwordResetToken.delete({
      where: { id: existingToken.id }
    }),
  ]);

  return { status: "success", message: "Password updated!" };
};

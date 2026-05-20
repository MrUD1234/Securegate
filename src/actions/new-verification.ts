"use server";

import { db } from "@/lib/db";

type ActionResult =
  | { status: "success"; message: string }
  | { status: "error"; message: string };

export const newVerification = async (token: string, email?: string): Promise<ActionResult> => {
  const existingToken = await db.verificationToken.findFirst({
    where: { token }
  });

  if (!existingToken) {
    if (email) {
      const user = await db.user.findUnique({ where: { email } });
      if (user?.emailVerified) {
        return { status: "success", message: "Email verified!" };
      }
    }
    return { status: "error", message: "Token does not exist!" };
  }

  if (new Date(existingToken.expires) < new Date()) {
    return { status: "error", message: "Token has expired!" };
  }

  const existingUser = await db.user.findUnique({
    where: { email: existingToken.email }
  });

  if (!existingUser) {
    return { status: "error", message: "Email does not exist!" };
  }

  if (existingUser.emailVerified) {
    await db.verificationToken.delete({ where: { id: existingToken.id } }).catch(() => {});
    return { status: "success", message: "Email verified!" };
  }

  await db.$transaction([
    db.user.update({
      where: { id: existingUser.id },
      data: {
        emailVerified: new Date(),
        email: existingToken.email,
      }
    }),
    db.verificationToken.deleteMany({
      where: { id: existingToken.id }
    }),
  ]);

  return { status: "success", message: "Email verified!" };
};

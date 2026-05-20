"use server";

import { db } from "@/lib/db";

export const newVerification = async (token: string, email?: string) => {
  const existingToken = await db.verificationToken.findFirst({
    where: { token }
  });

  if (!existingToken) {
    if (email) {
      const user = await db.user.findUnique({ where: { email } });
      if (user?.emailVerified) {
        return { success: "Email verified!" };
      }
    }
    return { error: "Token does not exist!" };
  }

  const hasExpired = new Date(existingToken.expires) < new Date();

  if (hasExpired) {
    return { error: "Token has expired!" };
  }

  const existingUser = await db.user.findUnique({
    where: { email: existingToken.email }
  });

  if (!existingUser) {
    return { error: "Email does not exist!" };
  }

  if (existingUser.emailVerified) {
    await db.verificationToken.delete({ where: { id: existingToken.id } });
    return { success: "Email verified!" };
  }

  await db.user.update({
    where: { id: existingUser.id },
    data: { 
      emailVerified: new Date(),
      email: existingToken.email,
    }
  });

  await db.verificationToken.delete({
    where: { id: existingToken.id }
  });

  return { success: "Email verified!" };
};

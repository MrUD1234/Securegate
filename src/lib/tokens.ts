import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/db";

export const generateVerificationToken = async (email: string) => {
  const token = uuidv4();
  const expires = new Date(Date.now() + 3600 * 1000);

  const existingToken = await db.verificationToken.findFirst({
    where: { email }
  });

  if (existingToken) {
    return db.verificationToken.update({
      where: { id: existingToken.id },
      data: { token, expires },
    });
  }

  return db.verificationToken.create({
    data: { email, token, expires },
  });
};

export const generatePasswordResetToken = async (email: string) => {
  const token = uuidv4();
  const expires = new Date(Date.now() + 3600 * 1000);

  const existingToken = await db.passwordResetToken.findFirst({
    where: { email }
  });

  if (existingToken) {
    return db.passwordResetToken.update({
      where: { id: existingToken.id },
      data: { token, expires },
    });
  }

  return db.passwordResetToken.create({
    data: { email, token, expires },
  });
};

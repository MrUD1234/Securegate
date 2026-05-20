import nodemailer from "nodemailer";

const domain = process.env.NEXTAUTH_URL;
const fromEmail = process.env.FROM_EMAIL || "noreply@securegate.com";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendVerificationEmail = async (
  email: string,
  token: string
) => {
  const confirmLink = `${domain}/auth?mode=verify&token=${token}&email=${encodeURIComponent(email)}`;

  await transporter.sendMail({
    from: fromEmail,
    to: email,
    subject: "Confirm your email",
    html: `<p>Click <a href="${confirmLink}">here</a> to confirm email.</p>`
  });
};

export const sendPasswordResetEmail = async (
  email: string,
  token: string,
) => {
  const resetLink = `${domain}/auth?mode=new-password&token=${token}&email=${encodeURIComponent(email)}`;

  await transporter.sendMail({
    from: fromEmail,
    to: email,
    subject: "Reset your password",
    html: `<p>Click <a href="${resetLink}">here</a> to reset password.</p>`
  });
};

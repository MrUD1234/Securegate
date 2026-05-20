import * as z from "zod";

const passwordSchema = z.string()
  .min(10, { message: "Minimum 10 characters required" })
  .regex(/[A-Z]/, { message: "Must contain an uppercase letter" })
  .regex(/[a-z]/, { message: "Must contain a lowercase letter" })
  .regex(/[0-9]/, { message: "Must contain a number" })
  .regex(/[!@#$%^&*(),.?":{}|<>_]/, { message: "Must contain a special character" });

export const LoginSchema = z.object({
  email: z.string().email({
    message: "Email is required",
  }),
  password: z.string().min(1, {
    message: "Password is required",
  }),
});

export const RegisterSchema = z.object({
  email: z.string().email({
    message: "Email is required",
  }),
  password: passwordSchema,
  name: z.string().min(1, {
    message: "Name is required",
  }),
});

export const ResetSchema = z.object({
  email: z.string().email({
    message: "Email is required",
  }),
});

export const NewPasswordSchema = z.object({
  password: passwordSchema,
});

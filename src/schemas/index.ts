import * as z from "zod";

const passwordSchema = z.string()
  .min(8, { message: "Minimum 8 characters required" })
  .regex(/[A-Z]/, { message: "Must contain an uppercase letter" })
  .regex(/[a-z]/, { message: "Must contain a lowercase letter" })
  .regex(/[0-9]/, { message: "Must contain a number" })
  .regex(/[!@#$%^&*(),.?":{}|<>_]/, { message: "Must contain a special character" });

const emailField = () => z.string().email({ message: "Email is required" }).toLowerCase();

export const LoginSchema = z.object({
  email: emailField(),
  password: z.string().min(1, {
    message: "Password is required",
  }),
});

export const RegisterSchema = z.object({
  email: emailField(),
  password: passwordSchema,
  name: z.string().min(1, {
    message: "Name is required",
  }),
});

export const ResetSchema = z.object({
  email: emailField(),
});

export const NewPasswordSchema = z.object({
  password: passwordSchema,
});

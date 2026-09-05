import { z } from "zod";

const passwordSchema = z
  .string()
  .min(12, "Passwords must be at least 12 characters long.")
  .max(128)
  .regex(/[a-z]/, "Passwords must include a lowercase letter.")
  .regex(/[A-Z]/, "Passwords must include an uppercase letter.")
  .regex(/[0-9]/, "Passwords must include a number.");

const phoneSchema = z
  .string()
  .trim()
  .min(7, "Please enter a valid phone number.")
  .max(30)
  .regex(/^[0-9+().\-\s]+$/, "Please enter a valid phone number.");

export const loginSchema = z
  .object({
    email: z.string().trim().email().max(254),
    password: z.string().min(1).max(128),
  })
  .strict();

export const signupSchema = z
  .object({
    fullName: z.string().trim().min(2).max(120),
    email: z.string().trim().email().max(254),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .strict()
  .superRefine((value, context) => {
    if (value.password !== value.confirmPassword) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Passwords do not match.",
      });
    }
  });

export const forgotPasswordSchema = z
  .object({
    email: z.string().trim().email().max(254),
  })
  .strict();

export const profileUpdateSchema = z
  .object({
    fullName: z.string().trim().min(2).max(120).nullable().optional(),
    displayName: z.string().trim().min(2).max(80).nullable().optional(),
    phone: phoneSchema.nullable().optional(),
    avatarUrl: z.string().url().max(2_048).nullable().optional(),
  })
  .strict();

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

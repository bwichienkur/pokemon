import { z } from "zod";

const preferredContactMethods = ["EMAIL", "PHONE", "EITHER"] as const;

export const inquiryFormSchema = z
  .object({
    cardId: z.string().uuid(),
    name: z.string().trim().min(2).max(120),
    email: z.string().trim().email().max(254),
    phone: z
      .string()
      .trim()
      .min(7, "Please enter a valid phone number.")
      .max(30)
      .regex(/^[0-9+().\-\s]+$/, "Please enter a valid phone number.")
      .optional()
      .or(z.literal("")),
    offerAmount: z
      .string()
      .trim()
      .regex(/^\d+(\.\d{1,2})?$/, "Enter a valid amount.")
      .optional()
      .or(z.literal("")),
    preferredContactMethod: z.enum(preferredContactMethods),
    country: z.string().trim().min(2).max(80),
    postalCode: z.string().trim().max(20).optional().or(z.literal("")),
    message: z.string().trim().min(20).max(2_000),
    privacyAgreement: z.literal(true, {
      errorMap: () => ({
        message: "You must agree to the privacy policy before submitting an inquiry.",
      }),
    }),
    botToken: z.string().trim().max(4_096).optional(),
    website: z.string().max(0).optional(),
  })
  .superRefine((value, context) => {
    if (value.preferredContactMethod === "PHONE" && !value.phone) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["phone"],
        message: "A phone number is required when phone is your preferred contact method.",
      });
    }
  });

export type InquiryFormInput = z.infer<typeof inquiryFormSchema>;

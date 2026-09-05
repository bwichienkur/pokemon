import { z } from "zod";

const preferredContactMethods = ["EMAIL", "PHONE", "EITHER"] as const;

export const inquiryFormSchema = z
  .object({
    cardId: z.string().uuid(),
    buyerName: z.string().trim().min(2).max(120),
    buyerEmail: z.string().trim().email().max(254),
    buyerPhone: z
      .string()
      .trim()
      .min(7, "Please enter a valid phone number.")
      .max(30)
      .regex(/^[0-9+().\-\s]+$/, "Please enter a valid phone number.")
      .optional()
      .or(z.literal("")),
    preferredContactMethod: z.enum(preferredContactMethods),
    message: z.string().trim().min(20).max(2_000),
    privacyAgreement: z.literal(true, {
      errorMap: () => ({
        message: "You must agree to the privacy terms before submitting an inquiry.",
      }),
    }),
    botToken: z.string().trim().max(4_096).optional(),
    website: z.string().max(0).optional(),
  })
  .strict()
  .superRefine((value, context) => {
    if (value.preferredContactMethod === "PHONE" && !value.buyerPhone) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["buyerPhone"],
        message: "A phone number is required when phone is your preferred contact method.",
      });
    }
  });

export type InquiryFormInput = z.infer<typeof inquiryFormSchema>;

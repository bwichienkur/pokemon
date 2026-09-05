"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { submitInquiry } from "@/app/actions/inquiries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { inquiryFormSchema, type InquiryFormInput } from "@/lib/validations/inquiry";

export interface InquiryFormProps {
  cardId: string;
  title?: string;
  user?: { name?: string | null; displayName?: string | null; email?: string | null } | null;
  botToken?: string;
  className?: string;
}

export function InquiryForm({ cardId, user, botToken, className }: InquiryFormProps) {
  const [referenceNumber, setReferenceNumber] = React.useState<string | null>(null);
  const [submitError, setSubmitError] = React.useState("");
  const form = useForm<InquiryFormInput>({
    resolver: zodResolver(inquiryFormSchema),
    defaultValues: {
      cardId,
      name: user?.displayName ?? user?.name ?? "",
      email: user?.email ?? "",
      phone: "",
      offerAmount: "",
      preferredContactMethod: "EMAIL",
      country: "",
      postalCode: "",
      message: "",
      privacyAgreement: false as unknown as true,
      botToken: botToken ?? "",
      website: "",
    },
  });

  const onSubmit = async (values: InquiryFormInput) => {
    setSubmitError("");
    try {
      const result = await submitInquiry(values);
      setReferenceNumber(result.referenceNumber);
      form.reset({ ...form.getValues(), message: "", offerAmount: "", website: "" });
    } catch (cause) {
      setSubmitError(cause instanceof Error ? cause.message : "We could not send your inquiry. Please try again.");
    }
  };

  if (referenceNumber) {
    return (
      <div className={className} role="status" aria-live="polite">
        <p className="font-display text-3xl text-gold">Inquiry received</p>
        <p className="mt-2 text-sm text-muted-foreground">Your reference number is <span className="font-semibold text-foreground">{referenceNumber}</span>. We&apos;ll reply using your preferred contact method.</p>
      </div>
    );
  }

  const error = (name: keyof InquiryFormInput) => form.formState.errors[name]?.message;

  return (
    <form className={className} onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <input type="hidden" {...form.register("cardId")} />
      <input type="hidden" {...form.register("botToken")} />
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="inquiry-website">Website</label>
        <input id="inquiry-website" tabIndex={-1} autoComplete="off" {...form.register("website")} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" error={error("name")}><Input autoComplete="name" {...form.register("name")} /></Field>
        <Field label="Email" error={error("email")}><Input type="email" autoComplete="email" {...form.register("email")} /></Field>
        <Field label="Phone (optional)" error={error("phone")}><Input type="tel" autoComplete="tel" {...form.register("phone")} /></Field>
        <Field label="Offer amount (optional)" error={error("offerAmount")}><Input inputMode="decimal" placeholder="0.00" {...form.register("offerAmount")} /></Field>
        <Field label="Country" error={error("country")}><Input autoComplete="country-name" {...form.register("country")} /></Field>
        <Field label="Postal code (optional)" error={error("postalCode")}><Input autoComplete="postal-code" {...form.register("postalCode")} /></Field>
      </div>
      <Field label="Preferred contact method" error={error("preferredContactMethod")} className="mt-5">
        <select className="h-10 w-full rounded-md border border-input bg-background/60 px-3 text-sm" {...form.register("preferredContactMethod")}>
          <option value="EMAIL">Email</option>
          <option value="PHONE">Phone</option>
          <option value="EITHER">Either</option>
        </select>
      </Field>
      <Field label="Message" error={error("message")} className="mt-5">
        <Textarea rows={6} placeholder="Tell us what you would like to know about this card." {...form.register("message")} />
      </Field>
      <label className="mt-5 flex items-start gap-3 text-sm text-muted-foreground">
        <input type="checkbox" className="mt-0.5 size-4 accent-[var(--gold)]" {...form.register("privacyAgreement")} />
        <span>I agree to the privacy policy and understand that Atelier Graded will use my details to respond to this inquiry.</span>
      </label>
      {error("privacyAgreement") && <p className="mt-2 text-xs font-medium text-destructive" role="alert">{error("privacyAgreement")}</p>}
      <div className="mt-6">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Sending inquiry…" : "Send inquiry"}
        </Button>
      </div>
      {submitError && <p className="mt-3 text-sm text-destructive" role="alert" aria-live="assertive">{submitError}</p>}
    </form>
  );
}

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const id = React.useId();
  const child = React.isValidElement<{ id?: string; "aria-invalid"?: boolean; "aria-describedby"?: string }>(children)
    ? React.cloneElement(children, { id, "aria-invalid": Boolean(error), "aria-describedby": error ? `${id}-error` : undefined })
    : children;

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-sm font-medium">{label}</label>
      {child}
      {error && <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-destructive" role="alert">{error}</p>}
    </div>
  );
}

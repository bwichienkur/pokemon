"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { forgotPassword, login, signup } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  forgotPasswordSchema,
  loginSchema,
  signupSchema,
  type ForgotPasswordInput,
  type LoginInput,
  type SignupInput,
} from "@/lib/validations/auth";

interface AuthFormProps {
  redirectTo?: string;
  className?: string;
}

export function LoginForm({ redirectTo = "/account", className }: AuthFormProps) {
  const router = useRouter();
  const form = useForm<LoginInput>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });
  const [error, setError] = React.useState("");

  const submit = async (values: LoginInput) => {
    setError("");
    try {
      await login(values);
      router.refresh();
      router.push(redirectTo);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to sign in.");
    }
  };

  return (
    <form className={className} onSubmit={form.handleSubmit(submit)} noValidate>
      <AuthField label="Email" error={form.formState.errors.email?.message}><Input type="email" autoComplete="email" {...form.register("email")} /></AuthField>
      <AuthField label="Password" error={form.formState.errors.password?.message} className="mt-4"><Input type="password" autoComplete="current-password" {...form.register("password")} /></AuthField>
      <Button className="mt-6 w-full" type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Signing in…" : "Sign in"}</Button>
      <FormNotice error={error} />
    </form>
  );
}

export function SignupForm({ redirectTo = "/account", className }: AuthFormProps) {
  const router = useRouter();
  const form = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "" },
  });
  const [error, setError] = React.useState("");
  const [message, setMessage] = React.useState("");

  const submit = async (values: SignupInput) => {
    setError("");
    try {
      const result = await signup(values);
      if (result.needsEmailConfirmation) {
        setMessage("Check your email to confirm your account before signing in.");
      } else {
        router.refresh();
        router.push(redirectTo);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to create your account.");
    }
  };

  return (
    <form className={className} onSubmit={form.handleSubmit(submit)} noValidate>
      <AuthField label="Full name" error={form.formState.errors.fullName?.message}><Input autoComplete="name" {...form.register("fullName")} /></AuthField>
      <AuthField label="Email" error={form.formState.errors.email?.message} className="mt-4"><Input type="email" autoComplete="email" {...form.register("email")} /></AuthField>
      <AuthField label="Password" error={form.formState.errors.password?.message} className="mt-4"><Input type="password" autoComplete="new-password" {...form.register("password")} /></AuthField>
      <AuthField label="Confirm password" error={form.formState.errors.confirmPassword?.message} className="mt-4"><Input type="password" autoComplete="new-password" {...form.register("confirmPassword")} /></AuthField>
      <Button className="mt-6 w-full" type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Creating account…" : "Create account"}</Button>
      <FormNotice error={error} message={message} />
    </form>
  );
}

export function ForgotPasswordForm({ className }: Omit<AuthFormProps, "redirectTo">) {
  const form = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema), defaultValues: { email: "" } });
  const [error, setError] = React.useState("");
  const [message, setMessage] = React.useState("");

  const submit = async (values: ForgotPasswordInput) => {
    setError("");
    try {
      await forgotPassword(values);
      setMessage("If an account exists for that email, a reset link has been sent.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to request a reset link.");
    }
  };

  return (
    <form className={className} onSubmit={form.handleSubmit(submit)} noValidate>
      <AuthField label="Email" error={form.formState.errors.email?.message}><Input type="email" autoComplete="email" {...form.register("email")} /></AuthField>
      <Button className="mt-6 w-full" type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Sending…" : "Email reset link"}</Button>
      <FormNotice error={error} message={message} />
    </form>
  );
}

function AuthField({
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
  return <div className={className}><label htmlFor={id} className="mb-2 block text-sm font-medium">{label}</label>{child}{error && <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-destructive" role="alert">{error}</p>}</div>;
}

function FormNotice({ error, message }: { error?: string; message?: string }) {
  if (!error && !message) return null;
  return <p className={error ? "mt-3 text-sm text-destructive" : "mt-3 text-sm text-muted-foreground"} role={error ? "alert" : "status"} aria-live="polite">{error || message}</p>;
}

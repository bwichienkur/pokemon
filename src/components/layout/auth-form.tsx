"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { forgotPassword, login, signup } from "@/app/actions/auth";

export function AuthForm({ mode }: { mode: "login" | "signup" | "forgot" }) {
  const router = useRouter(); const [pending, setPending] = useState(false);
  const title = mode === "login" ? "Welcome back" : mode === "signup" ? "Create your account" : "Reset your password";
  async function action(data: FormData) { setPending(true); try { const email = String(data.get("email") ?? ""); if (mode === "login") await login({ email, password: data.get("password") }); else if (mode === "signup") await signup({ fullName: data.get("fullName"), email, password: data.get("password") }); else await forgotPassword({ email }); toast.success(mode === "forgot" ? "If an account exists, reset instructions are on their way." : mode === "signup" ? "Account created." : "Signed in."); if (mode !== "forgot") router.push("/account"); } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to continue."); } finally { setPending(false); } }
  return <div className="mx-auto w-full max-w-md border border-border bg-card p-7 sm:p-9"><p className="text-xs font-bold uppercase tracking-[.2em] text-gold">Atelier Graded</p><h1 className="mt-4 font-display text-5xl leading-none">{title}</h1><form action={action} className="mt-8 space-y-4">{mode === "signup" && <input required name="fullName" placeholder="Full name" className="h-12 w-full border border-border bg-background px-4 text-sm focus:border-gold focus:outline-none" />}<input required type="email" name="email" placeholder="Email address" className="h-12 w-full border border-border bg-background px-4 text-sm focus:border-gold focus:outline-none" />{mode !== "forgot" && <input required minLength={8} type="password" name="password" placeholder="Password" className="h-12 w-full border border-border bg-background px-4 text-sm focus:border-gold focus:outline-none" />}<button disabled={pending} className="h-12 w-full bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-50">{pending ? "Please wait…" : mode === "login" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}</button></form><div className="mt-6 flex justify-between text-xs text-muted-foreground">{mode === "login" ? <><Link href="/forgot-password" className="hover:text-gold">Forgot password?</Link><Link href="/signup" className="hover:text-gold">Create account</Link></> : <Link href="/login" className="hover:text-gold">Back to sign in</Link>}</div></div>;
}

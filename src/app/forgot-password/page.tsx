import type { Metadata } from "next";
import { AuthForm } from "@/components/layout/auth-form";
export const metadata: Metadata = { title: "Reset Password", robots: { index: false, follow: false } };
export default function ForgotPasswordPage() { return <div className="bg-[radial-gradient(circle_at_50%_0,rgba(198,167,94,.13),transparent_35%)] py-16 sm:py-24"><AuthForm mode="forgot" /></div>; }

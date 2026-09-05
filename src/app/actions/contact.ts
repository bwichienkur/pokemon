"use server";

import { getEmailProvider } from "@/lib/email";
import { env } from "@/lib/env";
import { ValidationError } from "@/lib/auth/errors";

export async function submitContact(input: unknown) {
  const values = input as Record<string, unknown>;
  const name = typeof values.name === "string" ? values.name.trim() : "";
  const email = typeof values.email === "string" ? values.email.trim() : "";
  const message = typeof values.message === "string" ? values.message.trim() : "";
  if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || message.length < 10) throw new ValidationError("Please enter your name, a valid email address, and a message.");
  if (env.ADMIN_EMAIL) await getEmailProvider().send({ to: env.ADMIN_EMAIL, replyTo: email, subject: `Showroom contact from ${name}`, text: `${name} <${email}>\n\n${message}`, html: `<p>${name} &lt;${email}&gt;</p><p>${message.replace(/\n/g, "<br>")}</p>` });
  return { ok: true };
}

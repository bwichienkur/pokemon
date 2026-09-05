import "server-only";

import { env } from "@/lib/env";
import { BRAND_NAME, SITE_TAGLINE, absoluteUrl } from "@/lib/utils";
import type { Card, Inquiry } from "@/types/database";

export interface EmailMessage {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}

export interface SentEmail {
  id: string;
}

export interface EmailProvider {
  send(message: EmailMessage): Promise<SentEmail>;
}

export class ResendEmailProvider implements EmailProvider {
  constructor(
    private readonly apiKey: string,
    private readonly from: string,
  ) {}

  async send(message: EmailMessage): Promise<SentEmail> {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: this.from,
        to: message.to,
        subject: message.subject,
        html: message.html,
        text: message.text,
        reply_to: message.replyTo,
      }),
    });

    const payload = (await response.json().catch(() => null)) as
      | { id?: string; message?: string }
      | null;

    if (!response.ok || !payload?.id) {
      throw new Error(
        `Resend delivery failed (${response.status}): ${payload?.message ?? "Unknown error"}`,
      );
    }

    return { id: payload.id };
  }
}

export class ConsoleEmailProvider implements EmailProvider {
  async send(message: EmailMessage): Promise<SentEmail> {
    const id = `console_${crypto.randomUUID()}`;
    console.info("[Atelier Graded email]", {
      id,
      to: message.to,
      subject: message.subject,
      text: message.text,
    });
    return { id };
  }
}

export function getEmailProvider(): EmailProvider {
  if (env.RESEND_API_KEY && env.EMAIL_FROM) {
    return new ResendEmailProvider(env.RESEND_API_KEY, env.EMAIL_FROM);
  }

  return new ConsoleEmailProvider();
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

function inquiryDetails(inquiry: Inquiry, card: Card): string {
  return [
    `Card: ${card.title} (${card.grader} ${card.grade})`,
    `Buyer: ${inquiry.buyerName} <${inquiry.buyerEmail}>`,
    `Preferred contact: ${inquiry.preferredContactMethod}`,
    inquiry.buyerPhone ? `Phone: ${inquiry.buyerPhone}` : undefined,
    "",
    inquiry.message,
  ]
    .filter((line): line is string => Boolean(line))
    .join("\n");
}

export async function sendInquiryAdminNotification(
  inquiry: Inquiry,
  card: Card,
  provider: EmailProvider = getEmailProvider(),
): Promise<SentEmail | null> {
  if (!env.ADMIN_EMAIL) {
    console.warn("[Atelier Graded email] No ADMIN_EMAIL configured; inquiry notification skipped.");
    return null;
  }

  const details = inquiryDetails(inquiry, card);
  const inquiryUrl = absoluteUrl(`/admin/inquiries/${inquiry.id}`);

  return provider.send({
    to: env.ADMIN_EMAIL,
    replyTo: inquiry.buyerEmail,
    subject: `New inquiry: ${card.title}`,
    text: `${details}\n\nReview inquiry: ${inquiryUrl}`,
    html: `<h1>New inquiry</h1><p><strong>${escapeHtml(card.title)}</strong> (${escapeHtml(
      card.grader,
    )} ${escapeHtml(card.grade)})</p><p><strong>Buyer:</strong> ${escapeHtml(
      inquiry.buyerName,
    )} &lt;${escapeHtml(inquiry.buyerEmail)}&gt;</p><p><strong>Preferred contact:</strong> ${escapeHtml(
      inquiry.preferredContactMethod,
    )}</p><p><strong>Message:</strong><br>${escapeHtml(inquiry.message).replace(/\n/g, "<br>")}</p><p><a href="${inquiryUrl}">Review inquiry</a></p>`,
  });
}

export async function sendInquiryBuyerConfirmation(
  inquiry: Inquiry,
  card: Card,
  provider: EmailProvider = getEmailProvider(),
): Promise<SentEmail> {
  const cardUrl = absoluteUrl(`/cards/${card.slug}`);
  const subject = `We received your inquiry about ${card.title}`;

  return provider.send({
    to: inquiry.buyerEmail,
    subject,
    text: `Thank you for contacting ${BRAND_NAME}.\n\nWe received your inquiry about ${card.title} (${card.grader} ${card.grade}). A member of our team will be in touch soon.\n\nView the card: ${cardUrl}\n\n${SITE_TAGLINE}`,
    html: `<h1>Thank you for your inquiry</h1><p>We received your inquiry about <strong>${escapeHtml(
      card.title,
    )}</strong> (${escapeHtml(card.grader)} ${escapeHtml(
      card.grade,
    )}). A member of our team will be in touch soon.</p><p><a href="${cardUrl}">View the card</a></p><p>${escapeHtml(
      BRAND_NAME,
    )}<br>${escapeHtml(SITE_TAGLINE)}</p>`,
  });
}

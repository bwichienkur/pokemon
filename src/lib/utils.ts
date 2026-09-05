import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { publicEnv } from "@/lib/env";
import { formatMoney } from "@/lib/money";

export const BRAND_NAME = "Atelier Graded";
export const SITE_TAGLINE = "A private showroom for graded collectibles.";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatPrice(minor: number, currency = "USD", locale = "en-US"): string {
  return formatMoney(minor, currency, locale);
}

export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Resolves a site-relative path against the canonical public site URL.
 * Absolute URLs are returned unchanged.
 */
export function absoluteUrl(path = "/", siteUrl = publicEnv.NEXT_PUBLIC_SITE_URL): string {
  return new URL(path, siteUrl.endsWith("/") ? siteUrl : `${siteUrl}/`).toString();
}

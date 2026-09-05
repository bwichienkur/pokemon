import type { Grader } from "@/types/database";

export const graderDisplayNames: Readonly<Record<Grader, string>> = {
  PSA: "Professional Sports Authenticator",
  BGS: "Beckett Grading Services",
  CGC: "Certified Guaranty Company",
  TAG: "TAG Grading",
};

const verificationBases: Readonly<Record<Grader, string>> = {
  PSA: "https://www.psacard.com/cert/",
  BGS: "https://www.beckett.com/grading/card-lookup",
  CGC: "https://www.cgccards.com/certlookup/",
  TAG: "https://my.taggrading.com/card/",
};

function normalizedCertificateNumber(certNumber: string): string {
  const normalized = certNumber.trim();
  if (!normalized) {
    throw new TypeError("A certificate number is required.");
  }
  return encodeURIComponent(normalized);
}

export function psaVerificationUrl(certNumber: string): string {
  return `${verificationBases.PSA}${normalizedCertificateNumber(certNumber)}`;
}

export function bgsVerificationUrl(certNumber: string): string {
  const url = new URL(verificationBases.BGS);
  url.searchParams.set("item_id", certNumber.trim());
  url.searchParams.set("item_type", "BGS");
  return url.toString();
}

export function cgcVerificationUrl(certNumber: string): string {
  return `${verificationBases.CGC}${normalizedCertificateNumber(certNumber)}/`;
}

export function tagVerificationUrl(certNumber: string): string {
  return `${verificationBases.TAG}${normalizedCertificateNumber(certNumber)}`;
}

export function verificationUrl(grader: Grader, certNumber: string): string {
  switch (grader) {
    case "PSA":
      return psaVerificationUrl(certNumber);
    case "BGS":
      return bgsVerificationUrl(certNumber);
    case "CGC":
      return cgcVerificationUrl(certNumber);
    case "TAG":
      return tagVerificationUrl(certNumber);
  }
}

export function gradeLabel(grader: Grader, grade: string): string {
  const normalizedGrade = grade.trim();
  if (!normalizedGrade) {
    return grader;
  }

  return `${grader} ${normalizedGrade}`;
}

export function certificateLabel(grader: Grader, certNumber: string): string {
  return `${grader} Cert #${certNumber.trim()}`;
}

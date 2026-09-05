import type { Metadata } from "next";
import { ContactForm } from "@/components/layout/contact-form";
import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/layout/section-heading";

export const metadata: Metadata = { title: "Contact", description: "Contact the Atelier Graded showroom.", openGraph: { title: "Contact Atelier Graded" } };
export default function ContactPage() { return <Container className="py-16 sm:py-24"><div className="grid gap-12 lg:grid-cols-[.85fr_1.15fr]"><div><SectionHeading eyebrow="Private correspondence" title="Contact the showroom" description="For acquisition questions, collection conversations, or general notes, write to us privately." /><div className="mt-10 border-t border-border pt-6 text-sm leading-7 text-muted-foreground"><p>Responses are personal and may take a little time.</p><p className="mt-3">For a particular object, please use the inquiry form on its listing so we can keep the record together.</p></div></div><div className="border border-border bg-card p-6 sm:p-8"><ContactForm /></div></div></Container>; }

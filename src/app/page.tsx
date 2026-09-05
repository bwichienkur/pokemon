import dynamic from "next/dynamic";
import Link from "next/link";

import { CatalogGrid } from "@/components/cards/catalog-grid";
import { Container } from "@/components/layout/container";
import { MotionSection } from "@/components/layout/motion-section";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import { SectionHeading } from "@/components/layout/section-heading";
import { getFeaturedCards, getNewArrivals, getSoldCards } from "@/lib/data/repository";

const HeroSlab = dynamic(() =>
  import("@/components/3d/hero-slab").then((module) => module.HeroSlab),
);

export default async function Home() {
  const [featured, arrivals, sold] = await Promise.all([
    getFeaturedCards(3),
    getNewArrivals(3),
    getSoldCards(3),
  ]);
  const hero = featured[0];

  return (
    <div className="overflow-hidden">
      <section className="relative min-h-[calc(100vh-4.5rem)] border-b border-border">
        {/* Full-bleed WebGL stage — dominant visual plane */}
        <div className="absolute inset-0">
          <HeroSlab
            card={hero}
            fullBleed
            hideCaption
            className="h-full min-h-[calc(100vh-4.5rem)]"
          />
        </div>

        {/* Readability veil — keeps copy legible without boxing the slab */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-transparent lg:via-black/35" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/70 to-transparent" />

        <Container className="pointer-events-none relative flex min-h-[calc(100vh-4.5rem)] items-end pb-16 pt-28 sm:items-center sm:pb-20 sm:pt-24">
          <div className="relative z-10 max-w-xl">
            <p className="mb-4 font-display text-3xl tracking-tight text-gold sm:text-4xl">
              Atelier Graded
            </p>
            <h1 className="font-display text-5xl leading-[0.92] font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Collect with conviction.
            </h1>
            <p className="mt-6 max-w-md text-base leading-7 text-white/70 sm:text-lg">
              Move the light across a living slab — inspect depth, glare, and grade before you inquire.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/cards"
                className="pointer-events-auto bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[0_0_40px_rgba(198,167,94,0.3)] transition hover:shadow-[0_0_55px_rgba(198,167,94,0.45)]"
              >
                Explore the collection
              </Link>
              <Link
                href={hero ? `/cards/${hero.slug}` : "#featured"}
                className="pointer-events-auto border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm hover:border-gold/50"
              >
                Inspect featured slab
              </Link>
            </div>
            <p className="mt-6 text-[0.65rem] tracking-[0.22em] text-white/40 uppercase">
              Pointer · scroll · feel the case
            </p>
          </div>
        </Container>
      </section>

      <MotionSection id="featured" className="py-24 sm:py-32">
        <Container>
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading
              eyebrow="The selection"
              title="Featured acquisitions"
              description="Exceptional examples chosen for collectors who value the details."
            />
            <Link href="/featured" className="text-sm font-semibold text-gold hover:text-gold-bright">
              View all featured →
            </Link>
          </div>
          <div className="mt-12">
            <CatalogGrid cards={featured} />
          </div>
        </Container>
      </MotionSection>

      <MotionSection className="border-y border-border bg-card/30 py-24 sm:py-32">
        <Container>
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading
              eyebrow="New to the salon"
              title="New arrivals"
              description="Freshly catalogued, photographed, and ready for private inquiry."
            />
            <Link href="/new-arrivals" className="text-sm font-semibold text-gold">
              See new arrivals →
            </Link>
          </div>
          <div className="mt-12">
            <CatalogGrid cards={arrivals} />
          </div>
        </Container>
      </MotionSection>

      <MotionSection className="py-24 sm:py-32">
        <Container>
          <SectionHeading
            eyebrow="A considered standard"
            title="The confidence to inquire"
            align="center"
            description="We present grader attribution and item-level details clearly so your own research can begin from a better place."
          />
          <div className="mt-14 grid gap-px border border-border bg-border md:grid-cols-4">
            {["PSA", "BGS", "CGC", "TAG"].map((grader) => (
              <div key={grader} className="bg-background p-7 text-center">
                <p className="font-display text-3xl text-gold">{grader}</p>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  Grader named in every listing
                </p>
              </div>
            ))}
          </div>
        </Container>
      </MotionSection>

      <MotionSection className="border-y border-border bg-navy py-24 sm:py-32">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2">
            <SectionHeading
              eyebrow="Private inquiry"
              title="A more personal way to acquire"
              description="Our showroom does not use a checkout counter. Each acquisition begins with a conversation."
            />
            <ol className="grid gap-6">
              {[
                ["01", "Discover an item"],
                ["02", "Send a confidential inquiry"],
                ["03", "Confirm terms and shipping"],
                ["04", "Acquire with care"],
              ].map(([number, label]) => (
                <li className="flex items-center gap-5 border-b border-border pb-5" key={number}>
                  <span className="font-display text-3xl text-gold">{number}</span>
                  <span className="text-sm font-semibold">{label}</span>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </MotionSection>

      <MotionSection className="py-24 sm:py-32">
        <Container>
          <SectionHeading eyebrow="Collector's advantage" title="The details stay in focus" />
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              [
                "Clear attribution",
                "Grader, certificate, condition notes, and images in one considered record.",
              ],
              [
                "Private attention",
                "A human response to every serious inquiry, without a rushed cart experience.",
              ],
              [
                "Careful presentation",
                "Photography and cataloguing built for collectors who scrutinize the particulars.",
              ],
            ].map(([title, description]) => (
              <div className="border-t border-gold/50 pt-5" key={title}>
                <h3 className="font-display text-3xl">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </Container>
      </MotionSection>

      <MotionSection className="border-y border-border bg-card/30 py-24 sm:py-32">
        <Container>
          <div className="flex items-end justify-between gap-6">
            <SectionHeading eyebrow="Placed with collectors" title="Recently sold" />
            <Link href="/sold" className="text-sm font-semibold text-gold">
              View sold archive →
            </Link>
          </div>
          <div className="mt-12">
            <CatalogGrid cards={sold} />
          </div>
        </Container>
      </MotionSection>

      <MotionSection className="py-24 sm:py-32">
        <Container>
          <div className="border border-gold/25 bg-[linear-gradient(120deg,rgba(198,167,94,.12),transparent_50%)] px-7 py-14 sm:px-14">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-gold">The private list</p>
            <h2 className="mt-4 max-w-xl font-display text-5xl leading-[0.9]">
              First notice, thoughtfully delivered.
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-muted-foreground">
              Join for new acquisitions and showroom notes. No frequency promise; only worthwhile
              correspondence.
            </p>
            <div className="mt-8">
              <NewsletterForm />
            </div>
          </div>
        </Container>
      </MotionSection>
    </div>
  );
}

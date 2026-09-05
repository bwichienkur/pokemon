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
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_30%,rgba(198,167,94,0.2),transparent_34%),radial-gradient(circle_at_15%_80%,rgba(88,120,255,0.14),transparent_28%),linear-gradient(135deg,#05070c_0%,#0b1220_48%,#07080d_100%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />

        <Container className="relative grid min-h-[calc(100vh-4.5rem)] items-center gap-10 py-16 lg:grid-cols-[0.95fr_1.05fr] lg:gap-8 xl:gap-12">
          <div className="relative z-10 max-w-2xl">
            <p className="mb-5 text-[0.7rem] font-bold uppercase tracking-[0.32em] text-gold">
              Atelier Graded · Immersive showroom
            </p>
            <h1 className="font-display text-6xl leading-[0.86] font-semibold tracking-tight sm:text-7xl lg:text-8xl">
              Collect with
              <br />
              <span className="bg-gradient-to-r from-gold via-[#f0d78a] to-gold bg-clip-text text-transparent">
                conviction.
              </span>
            </h1>
            <p className="mt-7 max-w-lg text-base leading-8 text-muted-foreground sm:text-lg">
              A cinematic private salon for graded collectibles — inspect every slab in light,
              depth, and motion before you inquire.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/cards"
                className="bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[0_0_40px_rgba(198,167,94,0.25)] transition hover:shadow-[0_0_55px_rgba(198,167,94,0.4)]"
              >
                Explore the collection
              </Link>
              <Link
                href={hero ? `/cards/${hero.slug}` : "#featured"}
                className="border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold backdrop-blur-sm hover:border-gold/50"
              >
                Inspect featured slab
              </Link>
            </div>
            <p className="mt-6 text-xs tracking-[0.18em] text-white/45 uppercase">
              Drag · tilt · scroll to feel the case
            </p>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute -inset-8 rounded-[2rem] bg-[radial-gradient(circle,rgba(198,167,94,0.18),transparent_60%)] blur-2xl" />
            <HeroSlab card={hero} className="relative z-10" />
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

import type { Metadata } from "next";
import Image from "next/image";
import Reveal, { Stagger, StaggerItem } from "@/components/motion/Reveal";
import EnquiryForm from "@/components/business/EnquiryForm";

export const metadata: Metadata = {
  title: "Wholesale & Business",
  description:
    "Partner with Ethereal Artisan — bulk and private-label organic bath & body care for hotels, boutiques and gifting.",
};

const CREDENTIALS = [
  {
    stat: "60+",
    label: "hotel & boutique partners",
    body: "From heritage havelis in Udaipur to wellness resorts in Kerala.",
  },
  {
    stat: "25k",
    label: "units / month capacity",
    body: "Small-batch craft, scaled carefully — quality never diluted.",
  },
  {
    stat: "100%",
    label: "certified organic inputs",
    body: "Every raw material traceable to source, batch-tested in-house.",
  },
];

export default function BusinessPage() {
  return (
    <div>
      {/* Intro */}
      <section className="relative isolate overflow-hidden text-almond-light">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/banners/banner-botanicals.jpg"
            alt="Dried botanicals arranged on a pale linen surface"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-earth-deep/90 via-earth/75 to-earth/50" />
        </div>
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
          <Reveal className="max-w-2xl">
            <p className="eyebrow text-sand-light">For Business</p>
            <h1 className="mt-4 text-hero-sm text-almond-light md:text-hero">
              Botanicals, at your scale.
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-almond-light/85">
              We supply hotels, boutiques, spas and corporate gifting programmes
              with the same small-batch bath &amp; body care our customers love —
              in bulk, in your packaging if you wish, always to our standard.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Credibility */}
      <section className="bg-almond py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <Stagger className="grid gap-6 md:grid-cols-3">
            {CREDENTIALS.map((c) => (
              <StaggerItem key={c.stat}>
                <div className="card h-full p-8">
                  <p className="font-serif text-5xl text-moss-dark">{c.stat}</p>
                  <p className="eyebrow mt-3 text-earth">{c.label}</p>
                  <p className="mt-3 text-sm leading-relaxed text-earth">{c.body}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>

          <Reveal className="mx-auto mt-16 max-w-3xl text-center">
            <h2 className="text-display">How we work with partners</h2>
            <p className="mt-4 text-earth">
              No price lists here — every partnership is scoped to your volumes,
              formats and timelines. Tell us what you have in mind and our
              founder&apos;s team will come back within two working days with a
              tailored proposal and samples.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Enquiry form */}
      <section className="bg-sand/40 py-16 lg:py-24">
        <div className="mx-auto max-w-2xl px-5 lg:px-8">
          <Reveal>
            <p className="eyebrow text-center text-moss-dark">Start the Conversation</p>
            <h2 className="mt-3 text-center text-display">Enquire to know more</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <EnquiryForm />
          </Reveal>
        </div>
      </section>
    </div>
  );
}

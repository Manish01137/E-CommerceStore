import Reveal, { Stagger, StaggerItem } from "@/components/motion/Reveal";

const TESTIMONIALS = [
  {
    name: "Priya Nair",
    place: "Kochi",
    quote:
      "The ubtan face wash smells like my grandmother's kitchen in the best possible way. My skin has never been calmer.",
    rating: 5,
    initials: "PN",
    tint: "#c3b5cc",
  },
  {
    name: "Arjun Mehta",
    place: "Mumbai",
    quote:
      "Bought the charcoal soap on a whim. Three months later my whole bathroom shelf is Ethereal Artisan. Send help (and more soap).",
    rating: 5,
    initials: "AM",
    tint: "#cfae8a",
  },
  {
    name: "Sarah D'Souza",
    place: "Goa",
    quote:
      "The lavender bath salts got me through wedding season. Beautiful packaging too — I've gifted four sets already.",
    rating: 4,
    initials: "SD",
    tint: "#d9b3ab",
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="15" height="15" viewBox="0 0 24 24" aria-hidden
          fill={i < count ? "#95714f" : "none"}
          stroke="#95714f" strokeWidth="1.5">
          <path d="M12 2.5 L14.9 8.6 L21.5 9.5 L16.7 14.1 L17.9 20.7 L12 17.5 L6.1 20.7 L7.3 14.1 L2.5 9.5 L9.1 8.6 Z" />
        </svg>
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="bg-earth py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow text-sand-light">Kind Words</p>
          <h2 className="mt-4 text-display text-almond-light">
            From bathrooms across the country
          </h2>
        </Reveal>

        <Stagger className="mt-12 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <StaggerItem key={t.name}>
              <figure className="flex h-full flex-col rounded-2xl bg-almond-light p-7 shadow-card">
                <Stars count={t.rating} />
                <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-earth-deep">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <span
                    className="flex h-11 w-11 items-center justify-center rounded-full font-serif text-sm font-semibold text-earth-deep"
                    style={{ backgroundColor: t.tint }}
                    aria-hidden
                  >
                    {t.initials}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-earth-deep">{t.name}</p>
                    <p className="text-xs text-earth">{t.place}</p>
                  </div>
                </figcaption>
              </figure>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

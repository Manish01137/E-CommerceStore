import Link from "next/link";
import Stars from "@/components/ui/Stars";
import Reveal, { Stagger, StaggerItem } from "@/components/motion/Reveal";
import Testimonials from "@/components/shop/Testimonials";
import { getHomeReviews } from "@/lib/reviews";

/**
 * Customer reviews on the home page, straight from the database. Falls back
 * to the static testimonials until any reviews exist (or in demo mode).
 */
export default async function HomeReviews() {
  const reviews = await getHomeReviews(3);

  if (reviews.length === 0) return <Testimonials />;

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
          {reviews.map((r) => (
            <StaggerItem key={r.id}>
              <figure className="flex h-full flex-col rounded-2xl bg-almond-light p-7 shadow-card">
                <Stars value={r.rating} />
                {r.title && <p className="mt-3 font-serif text-lg">{r.title}</p>}
                <blockquote className="mt-2 flex-1 text-[15px] leading-relaxed text-earth-deep">
                  “{r.comment}”
                </blockquote>
                <figcaption className="mt-6">
                  <p className="text-sm font-bold text-earth-deep">{r.authorName}</p>
                  <Link
                    href={`/products/${r.productSlug}`}
                    className="text-xs font-semibold text-moss-deep underline-offset-2 hover:underline"
                  >
                    on {r.productName}
                  </Link>
                </figcaption>
              </figure>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

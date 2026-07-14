import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug, getRelated } from "@/lib/products";
import ProductDetail from "@/components/product/ProductDetail";
import ProductCard from "@/components/product/ProductCard";
import Reveal, { Stagger, StaggerItem } from "@/components/motion/Reveal";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.description.slice(0, 155),
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;

  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelated(product, 4);

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-16">
      <ProductDetail product={product} />

      {related.length > 0 && (
        <section className="mt-20 lg:mt-28">
          <Reveal>
            <p className="eyebrow text-moss-dark">You may also love</p>
            <h2 className="mt-3 text-display">Pairs beautifully with</h2>
          </Reveal>
          <Stagger className="mt-8 grid grid-cols-2 gap-5 lg:grid-cols-4">
            {related.map((p) => (
              <StaggerItem key={p._id}>
                <ProductCard product={p} />
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      )}
    </div>
  );
}

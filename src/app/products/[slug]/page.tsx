import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { dbConnect } from "@/lib/db";
import Product from "@/models/Product";
import { toJSON, type ProductDTO } from "@/lib/types";
import ProductDetail from "@/components/product/ProductDetail";
import ProductCard from "@/components/product/ProductCard";
import Reveal, { Stagger, StaggerItem } from "@/components/motion/Reveal";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  await dbConnect();
  const product = await Product.findOne({ slug, active: true }).lean();
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.description.slice(0, 155),
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  await dbConnect();

  const productDoc = await Product.findOne({ slug, active: true }).lean();
  if (!productDoc) notFound();
  const product = toJSON<ProductDTO>(productDoc);

  const relatedFilter: Record<string, unknown> = {
    active: true,
    _id: { $ne: productDoc._id },
    $or: [{ category: product.category }, { scents: { $in: product.scents } }],
  };
  const relatedDocs = await Product.find(relatedFilter)
    .sort({ sold: -1 })
    .limit(4)
    .lean();
  const related = toJSON<ProductDTO[]>(relatedDocs);

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

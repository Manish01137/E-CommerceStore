import { NextResponse, type NextRequest } from "next/server";
import { getStore } from "@netlify/blobs";

type Params = { params: Promise<{ key: string }> };

/**
 * Netlify Blobs has no public CDN URL like Vercel Blob does — every uploaded
 * product image is served back out through this route instead. Content-type
 * is read from the metadata stashed at upload time in /api/upload.
 */
export async function GET(_req: NextRequest, { params }: Params) {
  const { key } = await params;

  const store = getStore("products");
  let entry;
  try {
    entry = await store.getWithMetadata(key, { type: "arrayBuffer" });
  } catch (err) {
    console.error("blob: getWithMetadata failed", err);
    return NextResponse.json({ error: "Could not read image" }, { status: 500 });
  }
  if (!entry) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const contentType =
    (entry.metadata?.contentType as string | undefined) ?? "application/octet-stream";

  return new NextResponse(entry.data, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

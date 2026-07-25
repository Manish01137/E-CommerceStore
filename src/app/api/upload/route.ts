import { NextResponse, type NextRequest } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { getStore } from "@netlify/blobs";
import { getSession } from "@/lib/auth";
import { DB_ENABLED, DEMO_MESSAGE } from "@/lib/demo";

const ALLOWED = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/svg+xml", ".svg"],
]);
const MAX_BYTES = 4 * 1024 * 1024; // 4 MB

/**
 * Netlify's runtime filesystem is not writable, so image uploads must go
 * through Netlify Blobs instead of public/uploads. getStore() auto-configures
 * itself from the Netlify Functions runtime (siteID + token are injected)
 * with no env vars for us to set up — but that only works when actually
 * deployed on Netlify, and doing a network round-trip to find that out on
 * every local `npm run dev` upload would be wasteful. SITE_ID is a Netlify
 * runtime-only env var (unlike build-only vars such as COMMIT_REF), so its
 * presence is a fast, reliable "am I on Netlify" check; the try/catch below
 * is the real safety net in case that ever changes.
 *
 * Blobs served this way have no public CDN URL of their own — GET
 * /api/blob/[key] (see that route) streams the bytes back out.
 *
 * Every branch below returns a real JSON error instead of letting anything
 * throw past this handler — an uncaught exception here used to come back as
 * a bodyless 500 that the admin panel could only report as "network error".
 */
const netlifyBlobsAvailable = Boolean(process.env.SITE_ID || process.env.NETLIFY);

export async function POST(req: NextRequest) {
  if (!DB_ENABLED) {
    return NextResponse.json({ error: DEMO_MESSAGE }, { status: 503 });
  }

  let session;
  try {
    session = await getSession();
  } catch (err) {
    console.error("upload: getSession failed", err);
    return NextResponse.json({ error: "Session check failed" }, { status: 500 });
  }
  if (session?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let form: FormData | null;
  try {
    form = await req.formData();
  } catch (err) {
    console.error("upload: formData parse failed", err);
    return NextResponse.json({ error: "Could not read the upload" }, { status: 400 });
  }

  const file = form.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  const ext = ALLOWED.get(file.type);
  if (!ext) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, WebP or SVG images are allowed" },
      { status: 415 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image must be under 4 MB" }, { status: 413 });
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "That file is empty" }, { status: 400 });
  }

  const name = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}${ext}`;

  if (netlifyBlobsAvailable) {
    try {
      const store = getStore("products");
      await store.set(name, file, { metadata: { contentType: file.type } });
      return NextResponse.json({ url: `/api/blob/${name}` }, { status: 201 });
    } catch (err) {
      console.error("upload: Netlify Blobs set() failed", err);
      const message = err instanceof Error ? err.message : String(err);
      return NextResponse.json(
        { error: `Upload to storage failed: ${message}` },
        { status: 502 }
      );
    }
  }

  // Not running on Netlify (e.g. local dev) — write straight to disk instead.
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const dir = path.join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, name), buffer);
    return NextResponse.json({ url: `/uploads/${name}` }, { status: 201 });
  } catch (err) {
    console.error("upload: local filesystem write failed", err);
    return NextResponse.json(
      {
        error:
          "Image storage isn't available in this environment. " +
          "Uploads work on Netlify deploys automatically (Netlify Blobs) " +
          "and locally via public/uploads — check the server logs for details.",
      },
      { status: 503 }
    );
  }
}

import { NextResponse, type NextRequest } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { put } from "@vercel/blob";
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
 * On Vercel the deployed filesystem is read-only, so image uploads must go
 * through Vercel Blob (BLOB_READ_WRITE_TOKEN). Without that token, uploads
 * fall back to writing into public/uploads — which only works locally.
 *
 * That fallback used to attempt the filesystem write unconditionally, so on
 * Vercel it threw an uncaught EROFS and the whole function crashed with a
 * bare, bodyless 500 — the admin panel just showed a "network error" toast
 * with nothing else to go on. Every branch below now returns a real JSON
 * error instead of letting anything throw past this handler.
 */
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

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const blob = await put(`products/${name}`, file, {
        access: "public",
        contentType: file.type,
      });
      return NextResponse.json({ url: blob.url }, { status: 201 });
    } catch (err) {
      console.error("upload: Vercel Blob put() failed", err);
      const message = err instanceof Error ? err.message : String(err);
      return NextResponse.json(
        { error: `Upload to storage failed: ${message}` },
        { status: 502 }
      );
    }
  }

  // No Blob token configured. On Vercel this directory is not writable and
  // every attempt below will fail — that's expected until Blob is set up;
  // report it clearly rather than crash.
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
          "Image storage isn't configured for this deployment yet. " +
          "An admin needs to add a Vercel Blob store (Storage → Create → Blob) " +
          "and redeploy — see BLOB_READ_WRITE_TOKEN in .env.example.",
      },
      { status: 503 }
    );
  }
}

/**
 * Environment values pasted into dashboards arrive corrupted surprisingly
 * often — wrapped lines add a newline mid-hostname, editors add surrounding
 * quotes, terminals add trailing spaces. A Postgres URL legitimately contains
 * no whitespace at all, so stripping every whitespace character (and wrapping
 * quotes) either reconstructs the intended URL or changes nothing.
 *
 * This exists because a line-broken DATABASE_URL in Vercel once truncated the
 * hostname to "base" (from pooler.supa⏎base.com) and 500'd every DB route.
 */
export function cleanUrl(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const cleaned = raw.replace(/\s+/g, "").replace(/^["']+|["']+$/g, "");
  return cleaned.length > 0 ? cleaned : undefined;
}

export function databaseUrl(): string | undefined {
  return cleanUrl(process.env.DATABASE_URL);
}

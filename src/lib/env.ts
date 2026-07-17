/**
 * Environment values pasted into dashboards arrive corrupted surprisingly
 * often: wrapped lines add a newline mid-hostname, editors add quotes, and
 * copying a two-line `NAME⏎value` block puts the variable name inside the
 * value ("DATABASE_URL⏎postgresql://…"). All of these have taken this app's
 * production deployment down at least once.
 *
 * A Postgres URL contains no whitespace and always starts with its scheme, so
 * recovery is mechanical: collapse whitespace, drop wrapping quotes, then keep
 * everything from the first `postgres://` or `postgresql://` onward. A clean
 * value passes through unchanged.
 */
export function cleanUrl(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const collapsed = raw.replace(/\s+/g, "").replace(/^["']+|["']+$/g, "");
  const match = collapsed.match(/postgres(?:ql)?:\/\/.+/);
  const cleaned = match ? match[0] : collapsed;
  return cleaned.length > 0 ? cleaned : undefined;
}

export function databaseUrl(): string | undefined {
  return cleanUrl(process.env.DATABASE_URL);
}

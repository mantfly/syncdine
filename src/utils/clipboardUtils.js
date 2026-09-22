/**
 * Model-layer utility for clipboard operations.
 * Wraps navigator.clipboard.writeText so callers never need try/catch.
 * Returns { ok: true } on success or { ok: false, error } on failure.
 */
export async function writeToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return { ok: true };
  } catch (err) {
    console.error('Failed to write to clipboard:', err);
    return { ok: false, error: err };
  }
}

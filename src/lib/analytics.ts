/**
 * Client-side analytics helper.
 * Fire-and-forget (never blocks UX).
 *
 * Use:
 *   track("upgrade_clicked", { source: "pricing" })
 */
export async function track(event: string, meta?: Record<string, any>) {
  try {
    // Keep requests small and non-blocking
    void fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, meta })
    });
  } catch {
    // Never break UX for analytics
  }
}
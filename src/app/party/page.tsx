import { getAccess } from "@/lib/access.server";
import PartyClient from "./PartyClient";

/**
 * Party Mode:
 * - PRO gated server-side
 */
export const dynamic = "force-dynamic";

export default async function PartyPage() {
  const { isPro } = await getAccess();

  return (
    <main className="container">
      <PartyClient isPro={isPro} />
    </main>
  );
}
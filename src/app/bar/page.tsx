import { getAccess } from "@/lib/access.server";
import BarClient from "./BarClient";

/**
 * My Bar page wrapper.
 */
export const dynamic = "force-dynamic";

export default async function BarPage() {
  const { isPro } = await getAccess();

  return (
    <main className="container">
      <BarClient isPro={isPro} />
    </main>
  );
}
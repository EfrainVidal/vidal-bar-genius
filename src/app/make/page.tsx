import { getAccess } from "@/lib/access.server";
import MakeClient from "./MakeClient";

/**
 * Make Drinks page (server component wrapper):
 * - Access is computed server-side (cookie + DB)
 */
export const dynamic = "force-dynamic";

export default async function MakePage() {
  const { isPro } = await getAccess();
  return (
    <main className="container">
      <MakeClient isPro={isPro} />
    </main>
  );
}
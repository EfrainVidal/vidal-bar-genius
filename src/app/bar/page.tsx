// src/app/bar/page.tsx

import { getAccess } from "@/lib/access.server";
import BarClient from "./BarClient";

/**
 * My Bar page wrapper.
 * This runs on the server and passes auth state to the client.
 */
export const dynamic = "force-dynamic";

export default async function BarPage() {
  // ✅ Get both isPro and userId from your auth system
  const { isPro, userId } = await getAccess();

  return (
    <main className="container">
      {/* ✅ Pass BOTH props to client (fixes your TS error) */}
      <BarClient isPro={isPro} userId={userId} />
    </main>
  );
}
import { getAccess } from "@/lib/access.server";
import MyRecipesClient from "./MyRecipesClient";

/**
 * Saved recipes page wrapper.
 */
export const dynamic = "force-dynamic";

export default async function MyRecipesPage() {
  const { isPro } = await getAccess();

  return (
    <main className="container">
      <MyRecipesClient isPro={isPro} />
    </main>
  );
}
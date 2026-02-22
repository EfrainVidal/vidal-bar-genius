/**
 * Row: tiny layout primitive to avoid repeated inline flex styles.
 */
export default function Row({
  children,
  space = false
}: {
  children: React.ReactNode;
  space?: boolean;
}) {
  return <div className={`row ${space ? "rowSpace" : ""}`}>{children}</div>;
}
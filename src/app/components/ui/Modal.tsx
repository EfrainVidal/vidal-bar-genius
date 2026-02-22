"use client";

/**
 * Minimal modal component (custom CSS only).
 */
export default function Modal({
  open,
  title,
  children,
  onClose
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 18,
        zIndex: 50
      }}
      onMouseDown={onClose}
    >
      <div
        className="panel"
        style={{ width: "min(720px, 100%)" }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="row rowSpace">
          <div>
            <h2 className="pageTitle" style={{ marginBottom: 4 }}>{title}</h2>
            <p className="subtle">This is the moment people upgrade.</p>
          </div>
          <button className="v-btn v-btnSmall" onClick={onClose}>Close</button>
        </div>

        <div className="hr" />

        {children}
      </div>
    </div>
  );
}
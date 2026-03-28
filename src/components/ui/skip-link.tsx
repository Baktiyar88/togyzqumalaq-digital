"use client";

export function SkipLink() {
  return (
    <a
      href="#main-content"
      style={{
        position: "absolute",
        left: -9999,
        top: "auto",
        width: 1,
        height: 1,
        overflow: "hidden",
      }}
      onFocus={(e) => {
        Object.assign(e.currentTarget.style, {
          position: "fixed", left: "16px", top: "16px",
          width: "auto", height: "auto", zIndex: "9999",
          padding: "8px 16px", background: "var(--mantine-color-indigo-6)",
          color: "white", borderRadius: "8px", textDecoration: "none", overflow: "visible",
        });
      }}
      onBlur={(e) => {
        Object.assign(e.currentTarget.style, {
          position: "absolute", left: "-9999px", width: "1px", height: "1px", overflow: "hidden",
        });
      }}
    >
      Skip to content
    </a>
  );
}

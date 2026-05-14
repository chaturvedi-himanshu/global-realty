"use client";

import { FiCheckCircle } from "react-icons/fi";
import { useLayoutEffect, useRef } from "react";
import { createRoot } from "react-dom/client";

/**
 * Renders CMS HTML for property description / overview. Unordered list items
 * get a leading FiCheckCircle in theme primary (see globals.css).
 */
export default function PropertyDetailRichText({
  html = "",
  className = "",
  style,
}) {
  const clean = String(html || "").trim();
  const ref = useRef(null);
  const rootsRef = useRef([]);

  useLayoutEffect(() => {
    const el = ref.current;
    rootsRef.current.forEach((r) => {
      try {
        r.unmount();
      } catch {
        /* noop */
      }
    });
    rootsRef.current = [];

    if (!el || !clean) return () => {};

    el.querySelectorAll(".property-detail-li-check-host").forEach((h) => {
      h.remove();
    });

    el.querySelectorAll("ul > li").forEach((li) => {
      const host = document.createElement("span");
      host.className = "property-detail-li-check-host";
      host.setAttribute("aria-hidden", "true");
      li.insertBefore(host, li.firstChild);
      const root = createRoot(host);
      root.render(<FiCheckCircle size={18} aria-hidden />);
      rootsRef.current.push(root);
    });

    return () => {
      rootsRef.current.forEach((r) => {
        try {
          r.unmount();
        } catch {
          /* noop */
        }
      });
      rootsRef.current = [];
    };
  }, [clean]);

  if (!clean) return null;

  const mergedClass = [
    "property-detail-rich-text",
    "property-detail-rich-text--ul-checks",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={ref}
      className={mergedClass}
      style={style}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}

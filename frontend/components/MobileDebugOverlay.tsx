"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * TEMPORARY debug overlay for diagnosing the mobile hidden-content bug.
 * Renders via inline styles at z-index 99999 so it survives any stacking
 * context issue. Reports viewport size, scroll, and computed state of key
 * page elements. REMOVE ONCE BUG IS FIXED.
 */
export default function MobileDebugOverlay() {
  const pathname = usePathname();
  const [tick, setTick] = useState(0);
  const [info, setInfo] = useState<string[]>([]);

  // Re-measure every 500ms so transitions are captured
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const lines: string[] = [];
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const dvh = window.visualViewport?.height ?? vh;
    const sy = window.scrollY;
    const bodyH = document.body.scrollHeight;
    const htmlH = document.documentElement.scrollHeight;

    lines.push(`path: ${pathname}`);
    lines.push(`vp: ${vw}x${vh} dvh:${Math.round(dvh)} sy:${sy}`);
    lines.push(`body.sH:${bodyH} html.sH:${htmlH}`);

    // Find key candidates
    const navbar = document.querySelector("nav");
    const main = document.querySelector("main");
    const firstPageDiv = document.body.querySelector<HTMLElement>(":scope > *:not(script):not(style)");
    const starry = document.querySelector<HTMLElement>('[class*="mambo-dark"]');

    const describe = (label: string, el: HTMLElement | null) => {
      if (!el) {
        lines.push(`${label}: MISSING`);
        return;
      }
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      lines.push(
        `${label}: ${Math.round(r.width)}x${Math.round(r.height)} @${Math.round(r.left)},${Math.round(r.top)}`
      );
      lines.push(
        `  disp:${cs.display} vis:${cs.visibility} op:${cs.opacity} z:${cs.zIndex} pos:${cs.position}`
      );
    };

    describe("nav", navbar as HTMLElement | null);
    describe("main", main as HTMLElement | null);
    describe("body>1st", firstPageDiv);
    describe("starry", starry);

    // Body + html computed
    const bcs = getComputedStyle(document.body);
    const hcs = getComputedStyle(document.documentElement);
    lines.push(`body: bg:${bcs.backgroundColor} iso:${bcs.isolation} of:${bcs.overflow}`);
    lines.push(`html: bg:${hcs.backgroundColor}`);

    setInfo(lines);
  }, [pathname, tick]);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
        background: "rgba(255, 0, 0, 0.92)",
        color: "white",
        fontFamily: "monospace",
        fontSize: "10px",
        lineHeight: "1.25",
        padding: "4px 6px",
        pointerEvents: "none",
        whiteSpace: "pre-wrap",
        maxHeight: "50vh",
        overflow: "hidden",
      }}
    >
      {info.join("\n")}
    </div>
  );
}

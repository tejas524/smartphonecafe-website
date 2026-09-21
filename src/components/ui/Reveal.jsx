import { useEffect, useRef, useState } from "react";

/**
 * Scroll-reveal wrapper.
 *
 * Progressive enhancement: content is visible by default and only hidden once
 * JS confirms IntersectionObserver support. If the observer never fires the
 * element still becomes visible, so content is never trapped at opacity 0.
 * Movement is opacity + translateY only; CSS honours prefers-reduced-motion.
 */
export default function Reveal({
  children,
  as: Tag = "div",
  delay = 0,
  className = "",
  y = 18,
  once = true,
  ...rest
}) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setShown(true);
      return;
    }

    setArmed(true);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShown(true);
            if (once) io.unobserve(e.target);
          } else if (!once) {
            setShown(false);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.06 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once]);

  return (
    <Tag
      ref={ref}
      className={`${armed ? "reveal" : ""} ${shown ? "is-in" : ""} ${className}`}
      style={armed && !shown ? { transform: `translateY(${y}px)` } : undefined}
      {...rest}
    >
      {children}
    </Tag>
  );
}
import { useEffect, useRef, useState } from "react";

/**
 * Count-up hook driven by IntersectionObserver.
 *
 * Returns `{ ref, value }`. Attach `ref` to the element that should trigger the
 * animation when it scrolls into view. The value animates from 0 to `target`
 * exactly once per page visit (it never restarts when the element re-enters).
 *
 * prefers-reduced-motion is honoured: the value is set to `target` immediately
 * and no animation runs. The target is passed in by the caller, so the final
 * number always comes from the data — it is never hard-coded here.
 */
export default function useCountUp(target, { duration = 1200 } = {}) {
  const ref = useRef(null);
  const [value, setValue] = useState(0);
  const doneRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || doneRef.current) return;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce || typeof IntersectionObserver === "undefined") {
      setValue(target);
      doneRef.current = true;
      return;
    }

    let raf = 0;
    const run = () => {
      const start = performance.now();
      const easeOut = (t) => 1 - Math.pow(1 - t, 3);
      const tick = (now) => {
        const p = Math.min(1, (now - start) / duration);
        setValue(Math.round(easeOut(p) * target));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !doneRef.current) {
            doneRef.current = true;
            io.disconnect();
            run();
          }
        }
      },
      { threshold: 0.35 }
    );
    io.observe(el);

    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [target, duration]);

  return { ref, value };
}

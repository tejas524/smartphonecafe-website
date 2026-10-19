import { lazy, Suspense, useCallback, useRef } from "react";
import { usePrivacy } from "../context/Privacy.jsx";

const Analytics = lazy(() => import("@vercel/analytics/react").then(module => ({ default: module.Analytics })));
export default function ConsentAnalytics() {
  const { analyticsAllowed } = usePrivacy();
  const allowed = useRef(analyticsAllowed);
  allowed.current = analyticsAllowed;
  const beforeSend = useCallback(event => {
    if (!allowed.current) return null;
    const url = new URL(event.url);
    const publicPaths = ["/", "/smartphones", "/accessories", "/gallery", "/about", "/contact", "/privacy-policy", "/terms-and-conditions"];
    if (!publicPaths.includes(url.pathname) && !/^\/smartphones\/[a-z0-9-]+$/i.test(url.pathname)) return null;
    return { ...event, url: `${url.origin}${url.pathname}` };
  }, []);
  if (!analyticsAllowed || !import.meta.env.PROD) return null;
  return <Suspense fallback={null}><Analytics beforeSend={beforeSend} /></Suspense>;
}

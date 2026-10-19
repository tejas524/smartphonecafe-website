import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { analyticsConfigured, usePrivacy } from "../context/Privacy.jsx";
import Button from "./ui/Button.jsx";

function Choices({ preferences, savePreferences, browserOptOut }) {
  const [details, setDetails] = useState(false);
  const [maps, setMaps] = useState(!!preferences?.maps);
  const [analytics, setAnalytics] = useState(!!preferences?.analytics);
  return <section aria-label="Privacy choices" className="fixed inset-x-3 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-[51] max-h-[60dvh] overflow-y-auto overscroll-contain rounded-2xl border border-line-strong bg-white p-4 text-ink-800 shadow-[var(--shadow-deep)] sm:left-auto sm:right-5 sm:w-[28rem] sm:p-5 lg:bottom-5">
    <h2 className="text-base font-bold">Your privacy choices</h2>
    <p className="mt-2 text-[0.8125rem] leading-relaxed sm:text-sm">Optional maps{analyticsConfigured ? " and visitor analytics" : ""} stay off until you allow them. Your choice is saved on this device. <Link className="font-semibold text-accent-700 underline" to="/privacy-policy">Privacy Policy</Link></p>
    <button className="mt-2 min-h-11 text-sm font-semibold text-accent-700 underline" aria-expanded={details} aria-controls="privacy-options" onClick={() => setDetails(!details)}>Choose settings</button>
    {details && <div id="privacy-options" className="mb-3 space-y-3 border-y border-line py-3">
      <label className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" checked={maps} onChange={e => setMaps(e.target.checked)} className="h-5 w-5 accent-accent-600" />Embedded Google Maps</label>
      {analyticsConfigured && <label className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" disabled={browserOptOut} checked={!browserOptOut && analytics} onChange={e => setAnalytics(e.target.checked)} className="h-5 w-5 accent-accent-600" />Anonymous visitor analytics</label>}
      {browserOptOut && <p className="text-xs text-ink-600">Your browser's tracking opt-out is respected.</p>}
    </div>}
    <div className="mt-1 grid grid-cols-2 gap-2">
      <Button size="sm" variant="outline" onClick={() => savePreferences({ maps: false, analytics: false })}>Essential only</Button>
      <Button size="sm" variant="outline" onClick={() => savePreferences({ maps: true, analytics: analyticsConfigured })}>Allow optional</Button>
      {details && <Button size="sm" className="col-span-2" onClick={() => savePreferences({ maps, analytics })}>Save choices</Button>}
    </div>
  </section>;
}
export default function PrivacyChoices() {
  const privacy = usePrivacy();
  const { pathname } = useLocation();
  if (pathname.startsWith("/admin") || (privacy.preferences && !privacy.managing)) return null;
  return <Choices key={privacy.managing ? "manage" : "initial"} {...privacy} />;
}

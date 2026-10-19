import { createContext, useContext, useState } from "react";

export const analyticsConfigured = import.meta.env.VITE_ENABLE_ANALYTICS === "true";
const KEY = "sc_privacy_v1";
const PrivacyContext = createContext(null);
function readPreferences() {
  try {
    const value = JSON.parse(localStorage.getItem(KEY));
    return value?.version === 1 && typeof value.maps === "boolean" && typeof value.analytics === "boolean" ? value : null;
  } catch { return null; }
}

export function PrivacyProvider({ children }) {
  const [preferences, setPreferences] = useState(readPreferences);
  const [managing, setManaging] = useState(false);
  const browserOptOut = navigator.doNotTrack === "1" || navigator.globalPrivacyControl === true;
  function savePreferences(next) {
    const value = { version: 1, maps: !!next.maps, analytics: !browserOptOut && !!next.analytics };
    setPreferences(value); setManaging(false);
    try { localStorage.setItem(KEY, JSON.stringify(value)); } catch { /* Choice still applies for this session. */ }
  }
  return <PrivacyContext.Provider value={{ preferences, mapsAllowed: !!preferences?.maps,
    analyticsAllowed: analyticsConfigured && !browserOptOut && !!preferences?.analytics,
    browserOptOut, managing, openPreferences: () => setManaging(true), savePreferences,
  }}>{children}</PrivacyContext.Provider>;
}
export const usePrivacy = () => useContext(PrivacyContext);

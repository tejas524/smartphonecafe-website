import { useCallback, useEffect, useMemo, useState } from "react";
import PageHeader from "../components/PageHeader.jsx";
import { LoadingState, ErrorState } from "../ui/states.jsx";
import { useToast } from "../ui/Toast.jsx";
import { useAdminAuth } from "../AdminAuth.jsx";
import {
  fetchBusinessInfoRows,
  indexByKey,
  saveBusinessInfoValues,
} from "../lib/businessInfo.js";

/**
 * Simplified Business Info screen.
 *
 * The owner only edits the handful of facts that realistically change — name,
 * phone, WhatsApp, address, hours and the Google Maps link. Every field maps to
 * a single `business_info` row by its stable `info_key`, so the existing
 * Admin → API → MySQL → public bootstrap pipeline is reused unchanged; nothing
 * is duplicated and no public field is deleted. Technical/derived rows
 * (coordinates, place id, plus code, e164, listing copy, etc.) stay in the
 * database and keep powering the public site, they are simply not surfaced here.
 *
 * The public review count and overall rating are also `business_info` rows but
 * are edited under Reviews → Review Summary, not here.
 */
const SECTIONS = [
  {
    title: "Business",
    fields: [
      { key: "business_name", label: "Business Name", type: "text" },
      { key: "phone_display", label: "Phone Number", type: "text", help: "As shown to customers, e.g. +91 99225 99577." },
      {
        key: "whatsapp_number",
        label: "WhatsApp Number",
        type: "text",
        help: "Digits with country code, no spaces — e.g. 919922599577.",
      },
    ],
  },
  {
    title: "Address",
    blurb: "These lines are exactly what appears in the store address on the site.",
    fields: [
      { key: "address_line1", label: "Address line 1", type: "text" },
      { key: "address_line2", label: "Address line 2", type: "text" },
      { key: "address_line3", label: "Address line 3", type: "text" },
      { key: "address_city", label: "City", type: "text" },
      { key: "address_region", label: "State / region", type: "text" },
      { key: "address_postal_code", label: "PIN code", type: "text" },
    ],
  },
  {
    title: "Hours & map",
    fields: [
      {
        key: "hours_label",
        label: "Opening Hours",
        type: "text",
        help: "Shown on the site, e.g. 10:00 AM – 9:30 PM.",
      },
      {
        key: "google_short_url",
        label: "Google Maps URL",
        type: "url",
        help: "The shareable Google Maps link for the shop.",
      },
    ],
  },
];

// The keys this form is responsible for (used to seed local state).
const MANAGED_KEYS = SECTIONS.flatMap((s) => s.fields.map((f) => f.key));

const inputClass =
  "h-11 w-full rounded-[var(--radius-md)] border border-line bg-white px-3.5 text-[0.9375rem] text-ink-900 outline-none transition-colors placeholder:text-ink-400 focus:border-accent-400 focus:ring-2 focus:ring-accent-100";

/** Recompose the full one-line address from its parts so the directions link
 *  (which reads address_full) stays consistent with the visible address. */
function composeAddressFull(v) {
  const regionPin = [v.address_region, v.address_postal_code].filter(Boolean).join(" ").trim();
  return [v.address_line1, v.address_line2, v.address_line3, regionPin]
    .map((s) => (s || "").trim())
    .filter(Boolean)
    .join(", ");
}

export default function BusinessInfo() {
  const toast = useToast();
  const { expire } = useAdminAuth();
  const [byKey, setByKey] = useState({});
  const [values, setValues] = useState({});
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const rows = await fetchBusinessInfoRows();
      const map = indexByKey(rows);
      setByKey(map);
      const next = {};
      for (const key of MANAGED_KEYS) next[key] = map[key]?.info_value ?? "";
      setValues(next);
      setStatus("ready");
    } catch (err) {
      if (err?.status === 401) {
        expire();
        return;
      }
      setStatus("error");
    }
  }, [expire]);

  useEffect(() => {
    load();
  }, [load]);

  const dirty = useMemo(
    () => MANAGED_KEYS.some((k) => String(byKey[k]?.info_value ?? "") !== String(values[k] ?? "")),
    [byKey, values]
  );

  const onChange = (key, val) => setValues((v) => ({ ...v, [key]: val }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updates = MANAGED_KEYS.map((info_key) => ({ info_key, value: values[info_key] }));
      // Keep the derived full address in sync when any address part changed.
      if (byKey.address_full) {
        updates.push({ info_key: "address_full", value: composeAddressFull(values) });
      }
      const written = await saveBusinessInfoValues(byKey, updates);
      if (written === 0) {
        toast.info("No changes to save.");
      } else {
        toast.success("Business info saved.");
      }
      await load();
    } catch (err) {
      if (err?.status === 401) {
        toast.error("Your session expired. Please sign in again.");
        expire();
        return;
      }
      toast.error(err?.message || "Could not save business info.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Business Info"
        blurb="The store details shown across the public site. Changes appear after the site reloads."
      />

      {status === "loading" ? (
        <LoadingState label="Loading business info…" />
      ) : status === "error" ? (
        <ErrorState body="Could not load business info." onRetry={load} />
      ) : (
        <form onSubmit={onSubmit} className="max-w-2xl">
          {SECTIONS.map((section) => (
            <section
              key={section.title}
              className="mb-5 rounded-[var(--radius-lg)] border border-line bg-white p-5 shadow-[var(--shadow-card)] sm:p-6"
            >
              <h2 className="font-display text-[1.0625rem] font-bold tracking-[-0.015em] text-ink-950">
                {section.title}
              </h2>
              {section.blurb ? (
                <p className="mt-1 text-[0.8125rem] text-ink-500">{section.blurb}</p>
              ) : null}
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {section.fields.map((f) => {
                  const missing = !byKey[f.key];
                  return (
                    <div key={f.key} className={f.full ? "sm:col-span-2" : ""}>
                      <label
                        htmlFor={`bi-${f.key}`}
                        className="mb-1.5 block text-[0.8125rem] font-semibold text-ink-700"
                      >
                        {f.label}
                      </label>
                      <input
                        id={`bi-${f.key}`}
                        type={f.type === "url" ? "url" : "text"}
                        inputMode={f.type === "url" ? "url" : undefined}
                        value={values[f.key] ?? ""}
                        onChange={(e) => onChange(f.key, e.target.value)}
                        disabled={missing}
                        className={inputClass}
                      />
                      {missing ? (
                        <p className="mt-1 text-[0.75rem] text-ink-400">
                          Not set up in the database.
                        </p>
                      ) : f.help ? (
                        <p className="mt-1 text-[0.75rem] text-ink-400">{f.help}</p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving || !dirty}
              className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] bg-accent-600 px-5 py-2.5 text-[0.9375rem] font-semibold text-white transition-colors hover:bg-accent-700 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
            {dirty && !saving ? (
              <span className="text-[0.8125rem] text-ink-500">You have unsaved changes.</span>
            ) : null}
          </div>
        </form>
      )}
    </div>
  );
}

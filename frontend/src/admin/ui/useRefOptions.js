import { useEffect, useState } from "react";
import { adminApi } from "../../lib/api.js";

/**
 * Loads records of a referenced resource (e.g. brands, accessory categories)
 * for a <select>. Reads through the same admin API — no duplicate data source.
 */
export function useRefOptions(resource, labelKey) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    adminApi
      .list(resource, { limit: 100, sort: "display_order", direction: "asc" })
      .then((payload) => {
        if (!alive) return;
        const rows = payload?.data || [];
        setOptions(rows.map((r) => ({ value: r.id, label: r[labelKey] ?? `#${r.id}` })));
        setError(null);
      })
      .catch((err) => {
        if (alive) setError(err);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [resource, labelKey]);

  return { options, loading, error };
}

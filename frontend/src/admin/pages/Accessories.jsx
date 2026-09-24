import { useState } from "react";
import Icon from "../../components/Icon.jsx";
import ResourcePage from "./ResourcePage.jsx";

const TABS = [
  { id: "products", resource: "accessories", label: "Products", icon: "headphones" },
  { id: "categories", resource: "accessory-categories", label: "Categories", icon: "chip" },
];

/**
 * Accessories management — products and their categories under one screen. Each
 * tab reuses the generic ResourcePage against its own resource, so there is no
 * duplicate CRUD logic or data source.
 */
export default function AccessoriesAdmin() {
  const [tab, setTab] = useState("products");
  const active = TABS.find((t) => t.id === tab);

  return (
    <div>
      <div className="mb-6 inline-flex rounded-[var(--radius-md)] border border-line bg-white p-1 shadow-[var(--shadow-card)]">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-1.5 rounded-[10px] px-4 py-2 text-[0.875rem] font-semibold transition-colors ${
              tab === t.id ? "bg-accent-600 text-white" : "text-ink-600 hover:text-ink-900"
            }`}
          >
            <Icon name={t.icon} size={16} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Remount on tab change so each tab loads its own data cleanly. */}
      <ResourcePage key={active.resource} resource={active.resource} />
    </div>
  );
}

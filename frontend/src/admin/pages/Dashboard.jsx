import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../../components/Icon.jsx";
import { adminApi } from "../../lib/api.js";
import { useAdminAuth } from "../AdminAuth.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { ErrorState, Spinner } from "../ui/states.jsx";

const CARDS = [
  { resource: "offers", label: "Offers", icon: "tag", to: "/admin/offers" },
  { resource: "smartphones", label: "Smartphones", icon: "smartphone", to: "/admin/smartphones", showActive: true },
  { resource: "brands", label: "Brands", icon: "sparkle", to: "/admin/brands" },
  { resource: "repair-services", label: "Repairs", icon: "wrench", to: "/admin/repairs" },
  { resource: "accessories", label: "Accessories", icon: "headphones", to: "/admin/accessories" },
  { resource: "gallery", label: "Gallery", icon: "image", to: "/admin/gallery" },
];

const QUICK = [
  { label: "Add offer", icon: "tag", to: "/admin/offers?new=1" },
  { label: "Add smartphone", icon: "smartphone", to: "/admin/smartphones?new=1" },
  { label: "Add brand", icon: "sparkle", to: "/admin/brands?new=1" },
  { label: "Add repair", icon: "wrench", to: "/admin/repairs?new=1" },
  { label: "Add accessory", icon: "headphones", to: "/admin/accessories?new=1" },
  { label: "Upload image", icon: "image", to: "/admin/gallery?new=1" },
];

export default function Dashboard() {
  const { user, expire } = useAdminAuth();
  const [stats, setStats] = useState(null);
  const [status, setStatus] = useState("loading");

  const load = () => {
    setStatus("loading");
    Promise.all(
      CARDS.map((c) =>
        adminApi
          .stats(c.resource)
          .then((s) => [c.resource, s])
          .catch((err) => {
            if (err?.status === 401) throw err;
            return [c.resource, null];
          })
      )
    )
      .then((entries) => {
        setStats(Object.fromEntries(entries));
        setStatus("ready");
      })
      .catch((err) => {
        if (err?.status === 401) {
          expire();
          return;
        }
        setStatus("error");
      });
  };

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <PageHeader
        title={`Welcome${user?.name ? `, ${user.name.split(" ")[0]}` : ""}`}
        blurb="Live counts from the store database. Manage each section from the sidebar."
      />

      {status === "error" ? (
        <ErrorState body="Could not load the dashboard counts." onRetry={load} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3">
            {CARDS.map((c) => {
              const s = stats?.[c.resource];
              return (
                <Link
                  key={c.resource}
                  to={c.to}
                  className="group rounded-[var(--radius-lg)] border border-line bg-white p-4 shadow-[var(--shadow-card)] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)] sm:p-5"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-accent-50 text-accent-600">
                      <Icon name={c.icon} size={18} />
                    </span>
                    <Icon
                      name="arrowRight"
                      size={16}
                      className="text-ink-300 transition-transform group-hover:translate-x-0.5"
                    />
                  </div>
                  <p className="mt-3 text-[0.8125rem] font-semibold uppercase tracking-[0.05em] text-ink-500">
                    {c.label}
                  </p>
                  <p className="mt-0.5 font-display text-[1.75rem] font-extrabold tracking-[-0.02em] text-ink-950">
                    {status === "loading" ? (
                      <Spinner size={18} className="text-ink-300" />
                    ) : s ? (
                      s.total
                    ) : (
                      "—"
                    )}
                  </p>
                  {c.showActive && s ? (
                    <p className="mt-0.5 text-[0.8125rem] text-ink-500">
                      <span className="font-semibold text-wa-700">{s.active ?? 0}</span> active
                    </p>
                  ) : null}
                </Link>
              );
            })}
          </div>

          <h2 className="mb-3 mt-8 font-display text-[1.0625rem] font-bold tracking-[-0.015em] text-ink-950">
            Quick actions
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {QUICK.map((a) => (
              <Link
                key={a.label}
                to={a.to}
                className="flex items-center gap-3 rounded-[var(--radius-md)] border border-line bg-white px-4 py-3 text-[0.9375rem] font-semibold text-ink-800 shadow-[var(--shadow-card)] transition-colors hover:border-accent-400 hover:text-accent-700"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-paper-mute text-accent-600">
                  <Icon name={a.icon} size={16} />
                </span>
                {a.label}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

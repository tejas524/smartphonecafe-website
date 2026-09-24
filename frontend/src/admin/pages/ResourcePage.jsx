import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Icon from "../../components/Icon.jsx";
import { adminApi } from "../../lib/api.js";
import { schemaFor, sectionFor } from "../schema.js";
import { useAdminAuth } from "../AdminAuth.jsx";
import DataTable from "../ui/DataTable.jsx";
import RecordForm from "../ui/RecordForm.jsx";
import { Modal, ConfirmDialog } from "../ui/Modal.jsx";
import { LoadingState, EmptyState, ErrorState } from "../ui/states.jsx";
import { useToast } from "../ui/Toast.jsx";
import PageHeader from "../components/PageHeader.jsx";

const LIMIT = 100;

// Resources whose natural title column is sortable in the backend registry.
const AZ_COLUMN = {
  smartphones: "model_name",
  offers: "title",
  brands: "name",
  "repair-services": "title",
  accessories: "name",
  "accessory-categories": "title",
  "homepage-content": "section_key",
};

/** Loads id→label maps for any referenced resources used in the list columns. */
function useRefMaps(refSpecs) {
  const key = refSpecs.map((r) => r.resource).join(",");
  const [maps, setMaps] = useState({});
  useEffect(() => {
    let alive = true;
    if (!refSpecs.length) {
      setMaps({});
      return undefined;
    }
    Promise.all(
      refSpecs.map((spec) =>
        adminApi
          .list(spec.resource, { limit: 300 })
          .then((p) => [spec.resource, p?.data || [], spec.labelKey])
          .catch(() => [spec.resource, [], spec.labelKey])
      )
    ).then((results) => {
      if (!alive) return;
      const next = {};
      for (const [res, rows, labelKey] of results) {
        next[res] = new Map(rows.map((r) => [r.id, r[labelKey] ?? `#${r.id}`]));
      }
      setMaps(next);
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return maps;
}

function BoolCell({ on }) {
  return on ? (
    <span className="inline-flex items-center gap-1 text-wa-700">
      <Icon name="check" size={15} /> Yes
    </span>
  ) : (
    <span className="text-ink-300">—</span>
  );
}

export default function ResourcePage({ resource, title, blurb }) {
  const schema = schemaFor(resource);
  const section = sectionFor(resource);
  const toast = useToast();
  const { expire } = useAdminAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [sortKey, setSortKey] = useState("order"); // order | newest | az
  const [vis, setVis] = useState("all"); // all | on | off
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState(null);

  const [modal, setModal] = useState(null); // { mode:'create'|'edit', record }
  const [confirm, setConfirm] = useState(null); // row to delete
  const [deleting, setDeleting] = useState(false);

  const refSpecs = useMemo(
    () =>
      (schema?.list || [])
        .filter((c) => c.type === "ref")
        .map((c) => ({ resource: c.resource, labelKey: c.labelKey || "name" })),
    [schema]
  );
  const refMaps = useRefMaps(refSpecs);

  // Debounce the search box.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);

  const load = useCallback(async () => {
    if (!schema) return;
    setStatus("loading");
    const params = { limit: LIMIT, offset: (page - 1) * LIMIT };
    if (debouncedQ) params.q = debouncedQ;
    if (sortKey === "newest") {
      params.sort = "created_at";
      params.direction = "desc";
    } else if (sortKey === "az" && AZ_COLUMN[resource]) {
      params.sort = AZ_COLUMN[resource];
      params.direction = "asc";
    } else {
      params.sort = "display_order";
      params.direction = "asc";
    }
    if (schema.toggle && vis !== "all") params[schema.toggle] = vis === "on" ? 1 : 0;

    try {
      const payload = await adminApi.list(resource, params);
      setRows(payload?.data || []);
      setMeta(payload?.meta || null);
      setStatus("ready");
    } catch (err) {
      if (err?.status === 401) {
        expire();
        return;
      }
      setStatus("error");
    }
  }, [schema, resource, page, debouncedQ, sortKey, vis, expire]);

  useEffect(() => {
    load();
  }, [load]);

  // Deep-link: /admin/<x>?new=1 opens the create form.
  useEffect(() => {
    if (searchParams.get("new") === "1" && schema) {
      setModal({ mode: "create", record: null });
      searchParams.delete("new");
      setSearchParams(searchParams, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, schema]);

  const withAuth = async (fn, onDone) => {
    try {
      await fn();
      onDone?.();
    } catch (err) {
      if (err?.status === 401) {
        toast.error("Your session expired. Please sign in again.");
        expire();
        return;
      }
      toast.error(err?.message || "Something went wrong.");
    }
  };

  const onToggle = (row) => {
    setBusyId(row.id);
    const next = row[schema.toggle] ? 0 : 1;
    withAuth(
      () => adminApi.update(resource, row.id, { [schema.toggle]: next }),
      () => {
        setRows((list) => list.map((r) => (r.id === row.id ? { ...r, [schema.toggle]: next } : r)));
      }
    ).finally(() => setBusyId(null));
  };

  const onMove = (row, dir) => {
    const idx = rows.findIndex((r) => r.id === row.id);
    const swap = idx + dir;
    if (idx < 0 || swap < 0 || swap >= rows.length) return;
    const next = [...rows];
    [next[idx], next[swap]] = [next[swap], next[idx]];
    setBusyId(row.id);
    const order = next.map((r, i) => ({ id: r.id, display_order: i }));
    withAuth(
      () => adminApi.reorder(resource, order),
      () => setRows(next.map((r, i) => ({ ...r, display_order: i })))
    ).finally(() => setBusyId(null));
  };

  const doDelete = () => {
    if (!confirm) return;
    setDeleting(true);
    withAuth(
      () => adminApi.remove(resource, confirm.id),
      () => {
        toast.success("Deleted.");
        setConfirm(null);
        load();
      }
    ).finally(() => setDeleting(false));
  };

  const columns = useMemo(() => {
    if (!schema) return [];
    return schema.list.map((col) => ({
      key: col.key,
      label: col.label,
      render: (row) => {
        const v = row[col.key];
        if (col.type === "bool") return <BoolCell on={Boolean(v)} />;
        if (col.type === "ref") return refMaps[col.resource]?.get(v) ?? (v == null ? "—" : `#${v}`);
        if (col.type === "select") {
          const opt = (col.options || []).find((o) => String(o.value) === String(v));
          return opt ? opt.label : v ?? "—";
        }
        if (v == null || v === "") return <span className="text-ink-300">—</span>;
        return String(v);
      },
    }));
  }, [schema, refMaps]);

  if (!schema) {
    return <ErrorState title="Unknown section" body={`No schema is defined for "${resource}".`} />;
  }

  const reorderEnabled =
    schema.reorderable && sortKey === "order" && !debouncedQ && vis === "all" && (meta ? !meta.hasMore : true);

  const pageTitle = title || section?.label || schema.label;

  return (
    <div>
      <PageHeader
        title={pageTitle}
        blurb={blurb || section?.blurb}
        action={
          <button
            type="button"
            onClick={() => setModal({ mode: "create", record: null })}
            className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] bg-accent-600 px-4 py-2 text-[0.875rem] font-semibold text-white transition-colors hover:bg-accent-700"
          >
            <Icon name="plus" size={16} />
            Add {schema.label.replace(/s$/, "").toLowerCase()}
          </button>
        }
      />

      {/* Toolbar */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400">
            <Icon name="search" size={17} />
          </span>
          <input
            type="search"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder={`Search ${schema.label.toLowerCase()}…`}
            aria-label={`Search ${schema.label}`}
            className="h-11 w-full rounded-[var(--radius-md)] border border-line bg-white pl-10 pr-3.5 text-[0.9375rem] text-ink-900 outline-none transition-colors placeholder:text-ink-400 focus:border-accent-400 focus:ring-2 focus:ring-accent-100"
          />
        </div>
        <div className="flex items-center gap-2.5">
          {schema.toggle ? (
            <select
              value={vis}
              onChange={(e) => {
                setVis(e.target.value);
                setPage(1);
              }}
              aria-label="Visibility filter"
              className="h-11 rounded-[var(--radius-md)] border border-line bg-white px-3 text-[0.875rem] text-ink-800 outline-none focus:border-accent-400"
            >
              <option value="all">All</option>
              <option value="on">Active only</option>
              <option value="off">Hidden only</option>
            </select>
          ) : null}
          <select
            value={sortKey}
            onChange={(e) => {
              setSortKey(e.target.value);
              setPage(1);
            }}
            aria-label="Sort"
            className="h-11 rounded-[var(--radius-md)] border border-line bg-white px-3 text-[0.875rem] text-ink-800 outline-none focus:border-accent-400"
          >
            <option value="order">Display order</option>
            <option value="newest">Newest</option>
            {AZ_COLUMN[resource] ? <option value="az">A–Z</option> : null}
          </select>
        </div>
      </div>

      {/* Body */}
      {status === "loading" ? (
        <LoadingState label={`Loading ${schema.label.toLowerCase()}…`} />
      ) : status === "error" ? (
        <ErrorState body={`Could not load ${schema.label.toLowerCase()}.`} onRetry={load} />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={section?.icon || "info"}
          title={debouncedQ || vis !== "all" ? "No matching records" : `No ${schema.label.toLowerCase()} yet`}
          body={
            debouncedQ || vis !== "all"
              ? "Try clearing the search or filter."
              : `Add your first ${schema.label.replace(/s$/, "").toLowerCase()} to get started.`
          }
          action={
            <button
              type="button"
              onClick={() => setModal({ mode: "create", record: null })}
              className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] bg-accent-600 px-4 py-2 text-[0.875rem] font-semibold text-white transition-colors hover:bg-accent-700"
            >
              <Icon name="plus" size={16} />
              Add {schema.label.replace(/s$/, "").toLowerCase()}
            </button>
          }
        />
      ) : (
        <>
          <DataTable
            schema={schema}
            rows={rows}
            columns={columns}
            imageOf={schema.image ? (row) => row[schema.image] : undefined}
            titleOf={(row) => row[schema.titleKey] || `#${row.id}`}
            onEdit={(row) => setModal({ mode: "edit", record: row })}
            onDelete={(row) => setConfirm(row)}
            onToggle={onToggle}
            reorder={{ enabled: reorderEnabled, onMove }}
            busyId={busyId}
          />
          <div className="mt-4 flex items-center justify-between text-[0.8125rem] text-ink-500">
            <span>
              {meta?.total ?? rows.length} {schema.label.toLowerCase()}
              {reorderEnabled ? " · use the arrows to reorder" : ""}
            </span>
            {meta && meta.pages > 1 ? (
              <span className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-md border border-line px-2.5 py-1 disabled:opacity-40"
                >
                  Prev
                </button>
                <span>
                  {page} / {meta.pages}
                </span>
                <button
                  type="button"
                  disabled={!meta.hasMore}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-md border border-line px-2.5 py-1 disabled:opacity-40"
                >
                  Next
                </button>
              </span>
            ) : null}
          </div>
        </>
      )}

      {/* Create / edit */}
      <Modal
        open={Boolean(modal)}
        onClose={() => setModal(null)}
        wide
        title={
          modal?.mode === "edit"
            ? `Edit ${schema.label.replace(/s$/, "").toLowerCase()}`
            : `New ${schema.label.replace(/s$/, "").toLowerCase()}`
        }
      >
        {modal ? (
          <RecordForm
            resource={resource}
            schema={schema}
            record={modal.record}
            onCancel={() => setModal(null)}
            onDone={() => {
              setModal(null);
              load();
            }}
          />
        ) : null}
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={doDelete}
        busy={deleting}
        title={`Delete ${schema.label.replace(/s$/, "").toLowerCase()}?`}
        itemName={confirm ? confirm[schema.titleKey] || `#${confirm.id}` : ""}
        message="This permanently removes the record"
      />
    </div>
  );
}

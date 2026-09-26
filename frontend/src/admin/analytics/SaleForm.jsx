import { useState } from "react";
import Icon from "../../components/Icon.jsx";
import { analyticsApi } from "../../lib/api.js";
import { useAdminAuth } from "../AdminAuth.jsx";
import FormField from "../ui/FormField.jsx";
import { Spinner } from "../ui/states.jsx";
import { useToast } from "../ui/Toast.jsx";
import { SALE_TYPES, PAYMENT_METHODS, inr } from "./format.js";

const FIELDS = [
  { key: "transaction_date", label: "Date", type: "date", required: true },
  { key: "type", label: "Type", type: "select", required: true, options: SALE_TYPES },
  { key: "product_service_name", label: "Product / service name", type: "text", required: true, full: true },
  { key: "quantity", label: "Quantity", type: "number", required: true },
  { key: "payment_method", label: "Payment method", type: "select", options: PAYMENT_METHODS },
  { key: "selling_price", label: "Selling price (per unit ₹)", type: "decimal", required: true, help: "Actual amount charged — not the catalog price." },
  { key: "cost_price", label: "Cost price (per unit ₹)", type: "decimal", help: "Your purchase cost / parts cost per unit." },
  { key: "notes", label: "Notes", type: "textarea", full: true },
];

function todayIso() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function buildInitial(record) {
  if (record) {
    return {
      transaction_date: record.transaction_date ? String(record.transaction_date).slice(0, 10) : todayIso(),
      type: record.type ?? "other",
      product_service_name: record.product_service_name ?? "",
      quantity: record.quantity ?? 1,
      payment_method: record.payment_method ?? "",
      selling_price: record.selling_price != null ? Number(record.selling_price) : null,
      cost_price: record.cost_price != null ? Number(record.cost_price) : null,
      notes: record.notes ?? "",
    };
  }
  return {
    transaction_date: todayIso(),
    type: "other",
    product_service_name: "",
    quantity: 1,
    payment_method: "",
    selling_price: null,
    cost_price: null,
    notes: "",
  };
}

/**
 * Create / edit a sale. Reuses the shared FormField controls and writes through
 * the generic admin CRUD (`sales` resource). Shows the live profit as the owner
 * types; the backend re-validates every field regardless.
 */
export default function SaleForm({ record, onDone, onCancel }) {
  const toast = useToast();
  const { expire } = useAdminAuth();
  const editing = Boolean(record?.id);

  const [values, setValues] = useState(() => buildInitial(record));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (key, val) => {
    setValues((s) => ({ ...s, [key]: val }));
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  };

  const qty = Number(values.quantity) || 0;
  const sell = Number(values.selling_price) || 0;
  const cost = Number(values.cost_price) || 0;
  const revenue = sell * qty;
  const profit = revenue - cost * qty;

  const validate = () => {
    const next = {};
    if (!values.transaction_date) next.transaction_date = "Date is required.";
    if (!values.type) next.type = "Type is required.";
    if (!String(values.product_service_name || "").trim()) {
      next.product_service_name = "Name is required.";
    }
    if (values.quantity == null || values.quantity === "") {
      next.quantity = "Quantity is required.";
    } else if (!Number.isInteger(Number(values.quantity)) || Number(values.quantity) < 1) {
      next.quantity = "Quantity must be a whole number of at least 1.";
    }
    if (values.selling_price == null || values.selling_price === "") {
      next.selling_price = "Selling price is required.";
    } else if (Number(values.selling_price) < 0 || !Number.isFinite(Number(values.selling_price))) {
      next.selling_price = "Selling price must be a valid amount (≥ 0).";
    }
    if (values.cost_price != null && values.cost_price !== "") {
      if (Number(values.cost_price) < 0 || !Number.isFinite(Number(values.cost_price))) {
        next.cost_price = "Cost price must be a valid amount (≥ 0).";
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (saving) return;
    if (!validate()) {
      toast.error("Please fix the highlighted fields.");
      return;
    }
    const payload = {
      transaction_date: values.transaction_date,
      type: values.type,
      product_service_name: String(values.product_service_name).trim(),
      quantity: Number(values.quantity),
      selling_price: Number(values.selling_price),
      cost_price: values.cost_price === "" || values.cost_price == null ? 0 : Number(values.cost_price),
      payment_method: values.payment_method || null,
      notes: String(values.notes || "").trim() || null,
    };

    setSaving(true);
    try {
      const saved = editing
        ? await analyticsApi.updateSale(record.id, payload)
        : await analyticsApi.createSale(payload);
      toast.success(editing ? "Sale updated." : "Sale recorded.");
      onDone?.(saved);
    } catch (err) {
      if (err?.status === 401) {
        toast.error("Your session expired. Please sign in again.");
        expire();
        return;
      }
      toast.error(err?.message || "Could not save the sale.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {FIELDS.map((field) => (
          <FormField
            key={field.key}
            field={field}
            value={values[field.key]}
            onChange={(v) => set(field.key, v)}
            error={errors[field.key]}
            disabled={saving}
          />
        ))}
      </div>

      {/* Live profit preview */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-md)] border border-line bg-paper-soft px-4 py-3">
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-[0.8125rem] text-ink-600">
          <span>Revenue <span className="font-semibold text-ink-900">{inr(revenue)}</span></span>
          <span>Cost <span className="font-semibold text-ink-900">{inr(cost * qty)}</span></span>
        </div>
        <div className="text-[0.9375rem] font-semibold">
          <span className="text-ink-500">Profit </span>
          <span className={profit < 0 ? "text-red-600" : "text-wa-700"}>{inr(profit)}</span>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-line pt-5">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="rounded-[var(--radius-md)] border border-line-strong bg-white px-4 py-2 text-[0.875rem] font-semibold text-ink-700 transition-colors hover:bg-paper-mute disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-accent-600 px-5 py-2 text-[0.875rem] font-semibold text-white transition-colors hover:bg-accent-700 disabled:opacity-60"
        >
          {saving ? <Spinner size={16} /> : <Icon name="save" size={16} />}
          {editing ? "Save changes" : "Record sale"}
        </button>
      </div>
    </form>
  );
}

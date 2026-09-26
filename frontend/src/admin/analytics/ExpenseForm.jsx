import { useState } from "react";
import Icon from "../../components/Icon.jsx";
import { analyticsApi } from "../../lib/api.js";
import { useAdminAuth } from "../AdminAuth.jsx";
import FormField from "../ui/FormField.jsx";
import { Spinner } from "../ui/states.jsx";
import { useToast } from "../ui/Toast.jsx";

const FIELDS = [
  { key: "expense_date", label: "Date", type: "date", required: true },
  { key: "category", label: "Category", type: "text", required: true, help: "e.g. Rent, Salaries, Electricity, Stock purchase." },
  { key: "amount", label: "Amount (₹)", type: "decimal", required: true },
  { key: "description", label: "Description", type: "text", full: true },
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
      expense_date: record.expense_date ? String(record.expense_date).slice(0, 10) : todayIso(),
      category: record.category ?? "",
      amount: record.amount != null ? Number(record.amount) : null,
      description: record.description ?? "",
      notes: record.notes ?? "",
    };
  }
  return { expense_date: todayIso(), category: "", amount: null, description: "", notes: "" };
}

/**
 * Create / edit a business expense. Writes through the generic admin CRUD
 * (`expenses` resource). Amount must be greater than zero (also enforced on the
 * server via the column's min).
 */
export default function ExpenseForm({ record, onDone, onCancel }) {
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

  const validate = () => {
    const next = {};
    if (!values.expense_date) next.expense_date = "Date is required.";
    if (!String(values.category || "").trim()) next.category = "Category is required.";
    if (values.amount == null || values.amount === "") {
      next.amount = "Amount is required.";
    } else if (!Number.isFinite(Number(values.amount)) || Number(values.amount) <= 0) {
      next.amount = "Amount must be greater than 0.";
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
      expense_date: values.expense_date,
      category: String(values.category).trim(),
      amount: Number(values.amount),
      description: String(values.description || "").trim() || null,
      notes: String(values.notes || "").trim() || null,
    };

    setSaving(true);
    try {
      const saved = editing
        ? await analyticsApi.updateExpense(record.id, payload)
        : await analyticsApi.createExpense(payload);
      toast.success(editing ? "Expense updated." : "Expense recorded.");
      onDone?.(saved);
    } catch (err) {
      if (err?.status === 401) {
        toast.error("Your session expired. Please sign in again.");
        expire();
        return;
      }
      toast.error(err?.message || "Could not save the expense.");
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
          {editing ? "Save changes" : "Record expense"}
        </button>
      </div>
    </form>
  );
}

import { useMemo, useState } from "react";
import Icon from "../../components/Icon.jsx";
import { adminApi } from "../../lib/api.js";
import { useAdminAuth } from "../AdminAuth.jsx";
import FormField from "./FormField.jsx";
import ImageUploader from "./ImageUploader.jsx";
import { Spinner } from "./states.jsx";
import { useToast } from "./Toast.jsx";

const TRUE_DEFAULT = new Set(["is_active", "is_visible", "is_public"]);

function buildInitial(schema, record) {
  const state = {};
  for (const field of schema.fields) {
    if (field.type === "image") continue;
    if (record) {
      state[field.key] = record[field.key] ?? (field.type === "bool" ? 0 : "");
    } else if (field.type === "bool") {
      state[field.key] = TRUE_DEFAULT.has(field.key) ? 1 : 0;
    } else {
      state[field.key] = field.type === "number" || field.type === "decimal" || field.type === "ref" ? null : "";
    }
  }
  return state;
}

function isEmpty(v) {
  return v === null || v === undefined || (typeof v === "string" && v.trim() === "");
}

/**
 * Schema-driven create/edit form. Validation flags required fields client-side;
 * the backend remains the authority and its field errors are surfaced too.
 * Images use the dedicated upload pipeline (immediate in edit, multipart on
 * create). Submitting is locked while a save is in flight.
 */
export default function RecordForm({ resource, schema, record, onDone, onCancel }) {
  const toast = useToast();
  const { expire } = useAdminAuth();
  const editing = Boolean(record?.id);

  const [values, setValues] = useState(() => buildInitial(schema, record));
  const [imagePath, setImagePath] = useState(record?.[schema.image] ?? null);
  const [pendingFile, setPendingFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const imageField = useMemo(
    () => schema.fields.find((f) => f.type === "image") || null,
    [schema]
  );

  const set = (key, val) => {
    setValues((s) => ({ ...s, [key]: val }));
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  };

  const validate = () => {
    const next = {};
    for (const field of schema.fields) {
      if (field.type === "image") continue;
      if (field.required && isEmpty(values[field.key])) {
        next[field.key] = `${field.label} is required.`;
      }
    }
    if (schema.imageRequired && !editing && !pendingFile && !imagePath) {
      next.__image = "An image is required.";
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

    // Build the JSON payload from editable, non-image fields.
    const payload = {};
    for (const field of schema.fields) {
      if (field.type === "image") continue;
      payload[field.key] = values[field.key];
    }

    setSaving(true);
    try {
      let saved;
      if (editing) {
        saved = await adminApi.update(resource, record.id, payload);
      } else if (imageField && pendingFile) {
        const res = await adminApi.createMultipart(resource, payload, pendingFile);
        saved = res?.record ?? res;
      } else {
        saved = await adminApi.create(resource, payload);
      }
      toast.success(editing ? "Changes saved." : "Created successfully.");
      onDone?.(saved);
    } catch (err) {
      if (err?.status === 401) {
        toast.error("Your session expired. Please sign in again.");
        expire();
        return;
      }
      // Surface backend field errors if present.
      const fieldErrs = err?.errors || err?.details?.errors;
      if (Array.isArray(fieldErrs) && fieldErrs.length) {
        const mapped = {};
        for (const fe of fieldErrs) if (fe.field) mapped[fe.field] = fe.message;
        setErrors(mapped);
      }
      toast.error(err?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {imageField ? (
          <div className="sm:col-span-2">
            <ImageUploader
              resource={resource}
              id={editing ? record.id : null}
              value={imagePath}
              label={imageField.label}
              required={Boolean(schema.imageRequired)}
              onFileSelect={(file) => {
                setPendingFile(file);
                setErrors((e) => ({ ...e, __image: undefined }));
              }}
              onChange={(path) => setImagePath(path)}
            />
            {errors.__image ? (
              <p className="mt-1 text-[0.75rem] font-medium text-red-600">{errors.__image}</p>
            ) : null}
            {!editing && imageField && !schema.imageRequired ? (
              <p className="-mt-1 text-[0.75rem] text-ink-400">
                Optional. You can also add or change the image after saving.
              </p>
            ) : null}
          </div>
        ) : null}

        {schema.fields
          .filter((f) => f.type !== "image")
          .map((field) => (
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
          {editing ? "Save changes" : "Create"}
        </button>
      </div>
    </form>
  );
}

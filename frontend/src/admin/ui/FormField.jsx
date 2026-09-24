import Icon from "../../components/Icon.jsx";
import { useRefOptions } from "./useRefOptions.js";

const baseInput =
  "w-full rounded-[var(--radius-md)] border border-line bg-white px-3.5 py-2.5 text-[0.9375rem] text-ink-900 outline-none transition-colors placeholder:text-ink-400 focus:border-accent-400 focus:ring-2 focus:ring-accent-100 disabled:bg-paper-mute disabled:text-ink-400";

function Label({ field, htmlFor }) {
  return (
    <label htmlFor={htmlFor} className="flex items-center gap-1.5 text-[0.8125rem] font-semibold text-ink-700">
      {field.label}
      {field.required ? <span className="text-red-500">*</span> : null}
    </label>
  );
}

function RefField({ field, value, onChange, id, disabled }) {
  const { options, loading } = useRefOptions(field.resource, field.labelKey || "name");
  return (
    <select
      id={id}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
      disabled={disabled || loading}
      className={baseInput}
    >
      <option value="">{loading ? "Loading…" : "— none —"}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

/**
 * Renders a single schema-driven form field. Controlled: value + onChange come
 * from the parent RecordForm. `image` fields are handled by ImageUploader and
 * are not rendered here.
 */
export default function FormField({ field, value, onChange, error, disabled }) {
  const id = `f_${field.key}`;
  const invalid = Boolean(error);
  const inputCls = invalid ? `${baseInput} border-red-400 focus:border-red-400 focus:ring-red-100` : baseInput;

  let control;
  switch (field.type) {
    case "bool":
      return (
        <div className={field.full ? "sm:col-span-2" : ""}>
          <label className="flex cursor-pointer items-center gap-3">
            <button
              type="button"
              role="switch"
              aria-checked={Boolean(value)}
              onClick={() => !disabled && onChange(value ? 0 : 1)}
              disabled={disabled}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                value ? "bg-accent-600" : "bg-ink-200"
              } disabled:opacity-50`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                  value ? "translate-x-[1.375rem]" : "translate-x-0.5"
                }`}
              />
            </button>
            <span className="text-[0.875rem] font-semibold text-ink-800">{field.label}</span>
          </label>
          {field.help ? <p className="mt-1 text-[0.75rem] text-ink-500">{field.help}</p> : null}
        </div>
      );

    case "textarea":
      control = (
        <textarea
          id={id}
          rows={4}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`${inputCls} resize-y`}
        />
      );
      break;

    case "select":
      control = (
        <select
          id={id}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value === "" ? null : e.target.value)}
          disabled={disabled}
          className={inputCls}
        >
          <option value="">— none —</option>
          {(field.options || []).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
      break;

    case "ref":
      control = <RefField field={field} value={value} onChange={onChange} id={id} disabled={disabled} />;
      break;

    case "number":
    case "decimal":
      control = (
        <input
          id={id}
          type="number"
          inputMode={field.type === "decimal" ? "decimal" : "numeric"}
          step={field.type === "decimal" ? "0.01" : "1"}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
          disabled={disabled}
          className={inputCls}
        />
      );
      break;

    case "date":
      control = (
        <input
          id={id}
          type="date"
          value={value ? String(value).slice(0, 10) : ""}
          onChange={(e) => onChange(e.target.value === "" ? null : e.target.value)}
          disabled={disabled}
          className={inputCls}
        />
      );
      break;

    default: // text
      control = (
        <input
          id={id}
          type="text"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={inputCls}
        />
      );
  }

  return (
    <div className={field.full ? "sm:col-span-2" : ""}>
      <Label field={field} htmlFor={id} />
      <div className="mt-1.5">{control}</div>
      {field.help && !invalid ? <p className="mt-1 text-[0.75rem] text-ink-500">{field.help}</p> : null}
      {invalid ? (
        <p className="mt-1 flex items-center gap-1 text-[0.75rem] font-medium text-red-600">
          <Icon name="alert" size={13} />
          {error}
        </p>
      ) : null}
    </div>
  );
}

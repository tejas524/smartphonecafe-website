import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../ui/Button.jsx";
import Icon from "../Icon.jsx";
import { business } from "../../data/site.js";
import { brands } from "../../data/brands.js";
import { repairProblems } from "../../data/repairs.js";
import { repairEnquiryMessage, waLink } from "../../utils/whatsapp.js";

/**
 * Repair enquiry form.
 *
 * Public enquiries are handed to WhatsApp instead of being submitted to the
 * private CMS API. The form collects the details, validates
 * them, and hands the customer straight to WhatsApp with a fully composed
 * message. Nothing is transmitted anywhere by this page.
 *
 * The image upload is intentionally omitted rather than faked — a file input
 * that silently discards its file would be a fake submission system. The form
 * instead tells the customer to attach photos in the WhatsApp chat, which
 * genuinely works.
 */

const PHONE_RE = /^(?:\+?91[\s-]?)?[6-9]\d{9}$/;

function Field({ label, htmlFor, children, hint, error, required }) {
  const Label = htmlFor === "rf-problem" ? "div" : "label";
  return (
    <div>
      <Label
        id={`${htmlFor}-label`}
        htmlFor={Label === "label" ? htmlFor : undefined}
        className="flex items-baseline justify-between gap-2 font-display text-[0.8125rem] font-semibold text-ink-800"
      >
        <span>
          {label}
          {required && (
            <span className="ml-1 text-accent-600" aria-hidden="true">
              *
            </span>
          )}
          {required && <span className="sr-only"> (required)</span>}
        </span>
        {hint && <span className="text-[0.75rem] font-normal text-ink-500">{hint}</span>}
      </Label>
      <div className="mt-2">{children}</div>
      {error && (
        <p
          id={`${htmlFor}-error`}
          role="alert"
          className="mt-1.5 flex items-center gap-1.5 text-[0.8125rem] font-medium text-red-600"
        >
          <Icon name="alert" size={14} />
          {error}
        </p>
      )}
    </div>
  );
}

const inputCls = (invalid) =>
  `w-full rounded-[12px] border bg-white px-3.5 text-[0.9375rem] text-ink-900 placeholder:text-ink-300 transition-colors duration-200 focus:outline-none focus:ring-4 ${
    invalid
      ? "border-red-400 focus:border-red-500 focus:ring-red-500/12"
      : "border-line-strong hover:border-ink-300 focus:border-accent-600 focus:ring-accent-600/12"
  }`;

export default function RepairEnquiryForm({ compact = false }) {
  const [values, setValues] = useState({
    name: "",
    phone: "",
    brand: "",
    model: "",
    problem: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(null);
  const formRef = useRef(null);
  const lastPrepared = useRef(0);
  const [website, setWebsite] = useState("");

  const set = (key) => (e) => {
    const v = e.target.value;
    setValues((s) => ({ ...s, [key]: v }));
    setErrors((s) => (s[key] ? { ...s, [key]: undefined } : s));
  };

  function validate(v) {
    const e = {};
    if (!v.name.trim()) e.name = "Please enter your name.";
    else if (v.name.trim().length > 100) e.name = "Keep your name under 100 characters.";
    if (!v.phone.trim()) e.phone = "Please enter your phone number.";
    else if (!PHONE_RE.test(v.phone.replace(/\s|-/g, "")))
      e.phone = "Enter a valid 10-digit Indian mobile number.";
    if (!repairProblems.includes(v.problem)) e.problem = "Choose the issue you are facing.";
    if (v.model.length > 120) e.model = "Keep the model under 120 characters.";
    if (v.message.length > 2000) e.message = "Keep your message under 2,000 characters.";
    return e;
  }

  function onSubmit(e) {
    e.preventDefault();
    if (website) return;
    const found = validate(values);
    setErrors(found);

    if (Object.keys(found).length) {
      // Move focus to the first field with an error for keyboard/screen-reader users.
      const first = Object.keys(found)[0];
      formRef.current?.querySelector(`[name="${first}"]`)?.focus();
      return;
    }

    if (Date.now() - lastPrepared.current < 30_000) {
      setErrors({ submit: "Please wait 30 seconds before preparing another enquiry." });
      return;
    }
    lastPrepared.current = Date.now();
    const url = waLink(repairEnquiryMessage(values));
    setSent({ url, name: values.name.trim() });
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function reset() {
    setValues({ name: "", phone: "", brand: "", model: "", problem: "", message: "" });
    setErrors({});
    setSent(null);
  }

  /* ---------------------------------------------------------------- success */
  if (sent) {
    return (
      <div
        className="rounded-[var(--radius-lg)] border border-wa-600/25 bg-wa-500/[0.06] p-6 sm:p-7"
        role="status"
        aria-live="polite"
      >
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-[12px] bg-wa-600 text-white">
          <Icon name="check" size={22} />
        </span>

        <h3 className="mt-4 font-display text-[1.25rem] font-bold text-ink-950">
          Your enquiry is ready{sent.name ? `, ${sent.name.split(" ")[0]}` : ""}.
        </h3>

        <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-600">
          WhatsApp should have opened with your details already filled in. Press
          send there and we will get back to you.
        </p>

        <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-600">
          If it did not open, use the button below. Photos of the fault really
          help — attach them in the chat.
        </p>

        <div className="mt-6 flex flex-wrap gap-2.5">
          <Button
            href={sent.url}
            external
            variant="wa"
            size="lg"
            icon="whatsapp"
          >
            Open WhatsApp
          </Button>
          <Button href={business.phoneTel} variant="outline" size="lg" icon="phone">
            Call instead
          </Button>
          <Button variant="ghost" size="lg" icon="refresh" onClick={reset}>
            Start again
          </Button>
        </div>

        <p className="mt-5 border-t border-wa-600/15 pt-4 text-[0.75rem] leading-relaxed text-ink-500">
          This form does not send or store anything on this website. Your details
          only travel once you send the message yourself in WhatsApp.
        </p>
      </div>
    );
  }

  /* ------------------------------------------------------------------- form */
  const ids = {
    name: "rf-name",
    phone: "rf-phone",
    brand: "rf-brand",
    model: "rf-model",
    problem: "rf-problem",
    message: "rf-message",
  };

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      noValidate
      className={`rounded-[var(--radius-lg)] border border-line bg-white shadow-[var(--shadow-card)] ${
        compact ? "p-5 sm:p-6" : "p-6 sm:p-8"
      }`}
    >
      <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
        <label>Website<input name="website" tabIndex={-1} autoComplete="off" value={website} onChange={e => setWebsite(e.target.value)} /></label>
      </div>
      {errors.submit && <p role="alert" className="mb-4 text-sm font-semibold text-red-700">{errors.submit}</p>}
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] bg-ink-950 text-white">
          <Icon name="wrench" size={18} />
        </span>
        <div>
          <h2 className="font-display text-[1.25rem] font-bold text-ink-950">
            Repair enquiry
          </h2>
          <p className="mt-0.5 text-[0.875rem] text-ink-500">
            Takes about 30 seconds. Opens in WhatsApp.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <Field label="Your name" htmlFor={ids.name} required error={errors.name}>
          <input
            id={ids.name}
            name="name"
            maxLength={100}
            type="text"
            autoComplete="name"
            value={values.name}
            onChange={set("name")}
            placeholder="e.g. Rahul"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? `${ids.name}-error` : undefined}
            className={`${inputCls(!!errors.name)} h-12`}
          />
        </Field>

        <Field
          label="Phone number"
          htmlFor={ids.phone}
          required
          error={errors.phone}
        >
          <input
            id={ids.phone}
            name="phone"
            maxLength={20}
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            value={values.phone}
            onChange={set("phone")}
            placeholder="10-digit mobile number"
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? `${ids.phone}-error` : undefined}
            className={`${inputCls(!!errors.phone)} h-12 tabular-nums`}
          />
        </Field>

        <Field label="Phone brand" htmlFor={ids.brand} hint="optional">
          <select
            id={ids.brand}
            name="brand"
            value={values.brand}
            onChange={set("brand")}
            className={`${inputCls(false)} h-12 appearance-none bg-[length:16px] bg-[right_0.9rem_center] bg-no-repeat pr-10`}
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%237b8698' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
            }}
          >
            <option value="">Select a brand</option>
            {brands.map((b) => (
              <option key={b.name} value={b.name}>
                {b.name}
              </option>
            ))}
            <option value="Other">Other</option>
          </select>
        </Field>

        <Field label="Phone model" htmlFor={ids.model} hint="optional" error={errors.model}>
          <input
            id={ids.model}
            name="model"
            maxLength={120}
            aria-invalid={!!errors.model}
            aria-describedby={errors.model ? `${ids.model}-error` : undefined}
            type="text"
            value={values.model}
            onChange={set("model")}
            placeholder="e.g. Redmi Note 12"
            className={`${inputCls(false)} h-12`}
          />
        </Field>

        <div className="sm:col-span-2">
          <Field
            label="What is the problem?"
            htmlFor={ids.problem}
            required
            error={errors.problem}
          >
            <div
              role="radiogroup"
              aria-labelledby={`${ids.problem}-label`}
              aria-invalid={!!errors.problem}
              aria-describedby={errors.problem ? `${ids.problem}-error` : undefined}
              className="grid grid-cols-2 gap-2 sm:grid-cols-3"
            >
              {repairProblems.map((p) => {
                const active = values.problem === p;
                return (
                  <label
                    key={p}
                    className={`flex cursor-pointer items-center gap-2.5 rounded-[11px] border px-3 py-2.5 text-[0.8125rem] font-medium transition-colors duration-200 ${
                      active
                        ? "border-accent-600 bg-accent-50 text-accent-700"
                        : "border-line-strong bg-white text-ink-700 hover:border-ink-300 hover:bg-paper-soft"
                    }`}
                  >
                    <input
                      type="radio"
                      name="problem"
                      value={p}
                      checked={active}
                      onChange={set("problem")}
                      className="sr-only"
                    />
                    <span
                      aria-hidden="true"
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors ${
                        active ? "border-accent-600 bg-accent-600" : "border-ink-300"
                      }`}
                    >
                      {active && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </span>
                    <span className="leading-tight">{p}</span>
                  </label>
                );
              })}
            </div>
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field
            label="Anything else?"
            htmlFor={ids.message}
            hint="optional"
            error={errors.message}
          >
            <textarea
              id={ids.message}
              name="message"
              maxLength={2000}
              aria-invalid={!!errors.message}
              aria-describedby={errors.message ? `${ids.message}-error` : undefined}
              rows={3}
              value={values.message}
              onChange={set("message")}
              placeholder="When did it start? Did the phone get wet or dropped? Anything you have already tried."
              className={`${inputCls(false)} resize-y py-3 leading-relaxed`}
            />
          </Field>
        </div>
      </div>

      {/* Honest stand-in for the file upload */}
      <div className="mt-5 flex items-start gap-3 rounded-[12px] border border-dashed border-line-strong bg-paper-soft p-3.5">
        <Icon name="image" size={16} className="mt-0.5 shrink-0 text-ink-400" />
        <p className="text-[0.8125rem] leading-relaxed text-ink-600">
          <span className="font-semibold text-ink-800">Got photos of the damage?</span>{" "}
          Attach them in the WhatsApp chat after this step — that is the fastest
          way to get an accurate answer.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          type="submit"
          variant="wa"
          size="lg"
          icon="whatsapp"
          className="sm:min-w-[15rem]"
        >
          Send on WhatsApp
        </Button>
        <Button href={business.phoneTel} variant="outline" size="lg" icon="phone">
          Or call the shop
        </Button>
      </div>

      <p className="mt-4 text-[0.75rem] leading-relaxed text-ink-500">
        Sending this does not confirm a repair or a quote. Prices and timelines
        can only be given after the phone has been seen at the store. We use your
        number only to reply to this enquiry. See our{" "}
        <Link
          to="/privacy-policy"
          className="font-medium text-accent-600 underline decoration-line-strong underline-offset-2 hover:text-accent-700"
        >
          Privacy Policy
        </Link>
        .
      </p>
    </form>
  );
}

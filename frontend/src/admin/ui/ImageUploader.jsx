import { useRef, useState } from "react";
import Icon from "../../components/Icon.jsx";
import { adminApi } from "../../lib/api.js";
import { Spinner } from "./states.jsx";
import { useToast } from "./Toast.jsx";

const ACCEPT = "image/png,image/jpeg,image/webp,image/gif,image/avif";
const MAX_BYTES = 5 * 1024 * 1024;

function validateFile(file) {
  if (!file) return "No file selected.";
  if (!/^image\//.test(file.type)) return "Only image files are allowed.";
  if (file.size > MAX_BYTES) return "That image is larger than 5 MB.";
  return null;
}

/**
 * Image field. In edit mode (an `id` is present) it uploads/replaces/removes
 * through the existing secure backend pipeline immediately. In create mode it
 * only holds the chosen file and hands it up via `onFileSelect`, so the parent
 * can create the record and its image in one multipart request.
 */
export default function ImageUploader({
  resource,
  id = null,
  value,
  onChange,
  onFileSelect,
  required = false,
  label = "Image",
}) {
  const toast = useToast();
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [localPreview, setLocalPreview] = useState(null);
  const [localName, setLocalName] = useState(null);

  const preview = localPreview || value || null;

  const pick = () => inputRef.current?.click();

  const handleFile = async (file) => {
    const problem = validateFile(file);
    if (problem) {
      toast.error(problem);
      return;
    }

    if (!id) {
      // Create mode: defer to the parent form.
      setLocalPreview(URL.createObjectURL(file));
      setLocalName(file.name);
      onFileSelect?.(file);
      return;
    }

    // Edit mode: upload immediately.
    setBusy(true);
    try {
      const res = await adminApi.uploadImage(resource, id, file);
      const path = res?.record?.image_path ?? res?.record?.logo_path ?? res?.image?.path ?? null;
      onChange?.(path, res?.record);
      setLocalPreview(null);
      setLocalName(null);
      toast.success("Image updated.");
    } catch (err) {
      toast.error(err?.message || "Upload failed.");
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async () => {
    if (!id) {
      setLocalPreview(null);
      setLocalName(null);
      onFileSelect?.(null);
      onChange?.(null);
      return;
    }
    setBusy(true);
    try {
      await adminApi.removeImage(resource, id);
      onChange?.(null);
      setLocalPreview(null);
      toast.success("Image removed.");
    } catch (err) {
      toast.error(err?.message || "Could not remove the image.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="sm:col-span-2">
      <span className="flex items-center gap-1.5 text-[0.8125rem] font-semibold text-ink-700">
        {label}
        {required ? <span className="text-red-500">*</span> : null}
      </span>

      <div className="mt-1.5 flex items-center gap-4">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-md)] border border-line bg-paper-mute">
          {preview ? (
            <img src={preview} alt="" className="h-full w-full object-contain" />
          ) : (
            <Icon name="image" size={26} className="text-ink-300" />
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = ""; // allow re-picking the same file
            }}
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={pick}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border border-line-strong bg-white px-3 py-1.5 text-[0.8125rem] font-semibold text-ink-800 transition-colors hover:bg-paper-mute disabled:opacity-50"
            >
              {busy ? <Spinner size={14} /> : <Icon name="upload" size={15} />}
              {preview ? "Replace" : "Upload"}
            </button>
            {preview ? (
              <button
                type="button"
                onClick={handleRemove}
                disabled={busy}
                className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border border-line px-3 py-1.5 text-[0.8125rem] font-semibold text-ink-500 transition-colors hover:border-red-300 hover:text-red-600 disabled:opacity-50"
              >
                <Icon name="trash" size={15} />
                Remove
              </button>
            ) : null}
          </div>
          <p className="text-[0.75rem] text-ink-500">
            {localName ? `Selected: ${localName}` : "PNG, JPG, WEBP or GIF, up to 5 MB."}
          </p>
        </div>
      </div>
    </div>
  );
}

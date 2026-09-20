import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { getErrorMessage } from "@/lib/apiError";
import { useUploadSrtCrossRef } from "@/features/admin/hooks/useSrtCrossRef";

const RESULT_ROWS = [
  ["processed", "Rows processed"],
  ["updated", "Updated"],
  ["skipped_unchanged", "Skipped (unchanged)"],
];

const TEMPLATE_HEADERS = ["Old SRT Code", "New SRT Code", "Reason"];
const ACCEPTED_EXTENSIONS = [".xlsx", ".xls"];

// `xlsx` is a large library — load it only when someone actually clicks
// "Download template" instead of paying for it in the main bundle.
async function downloadTemplate() {
  const XLSX = await import("xlsx");
  const worksheet = XLSX.utils.aoa_to_sheet([TEMPLATE_HEADERS]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "SRT Cross Ref");
  XLSX.writeFile(workbook, "srt-cross-ref-template.xlsx");
}

function isAcceptedFile(file) {
  const name = file.name.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext));
}

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function DownloadIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 3v12" />
      <path d="M7 10l5 5 5-5" />
      <path d="M4 19.5h16" />
    </svg>
  );
}

function UploadCloudIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M7 18a4.5 4.5 0 0 1-.5-8.97A5.5 5.5 0 0 1 17.2 7.06 4 4 0 0 1 17 15" />
      <path d="M12 12v7" />
      <path d="M9.5 14.5 12 12l2.5 2.5" />
    </svg>
  );
}

function FileIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      <path d="M14 3v5h5" />
    </svg>
  );
}

function XIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      {...props}
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function CheckCircleIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.5 2.5 2.5 4.5-5" />
    </svg>
  );
}

/**
 * Uploads an Excel mapping file (Old SRT Code, New SRT Code, optional
 * Reason) to `POST /admin/srt-cross-ref`. Shows the processing summary on
 * success instead of closing immediately — the counts are the point.
 */
export function UploadSrtCrossRefModal({ open, onClose }) {
  const [file, setFile] = useState(null);
  const [formError, setFormError] = useState(null);
  const [result, setResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const upload = useUploadSrtCrossRef();

  const close = () => {
    setFile(null);
    setFormError(null);
    setResult(null);
    setDragActive(false);
    onClose();
  };

  const chooseFile = (candidate) => {
    if (!candidate) return;
    if (!isAcceptedFile(candidate)) {
      setFormError("That file isn't a .xlsx or .xls spreadsheet.");
      return;
    }
    setFormError(null);
    setFile(candidate);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    chooseFile(e.dataTransfer.files?.[0] ?? null);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setFormError(null);
    try {
      const data = await upload.mutateAsync(file);
      setResult(data);
    } catch (err) {
      setFormError(
        err?.status === 422
          ? getErrorMessage(err, "The file is missing a required column.")
          : getErrorMessage(err, "Could not upload the file."),
      );
    }
  };

  return (
    <Modal open={open} onClose={close} title="Upload SRT cross-reference">
      {result ? (
        <div>
          <div className="flex flex-col items-center gap-2 pb-4 text-center">
            <CheckCircleIcon className="h-10 w-10 text-green" />
            <p className="font-display text-[14px] font-bold text-navy">
              Upload complete
            </p>
          </div>
          <dl className="grid grid-cols-3 gap-2.5">
            {RESULT_ROWS.map(([key, label]) => (
              <div
                key={key}
                className="rounded-md border border-line bg-surface-2 px-3 py-2.5"
              >
                <dd className="font-display text-[18px] font-bold text-navy tabular-nums">
                  {result[key] ?? "—"}
                </dd>
                <dt className="mt-0.5 text-[11.5px] text-ink-3">{label}</dt>
              </div>
            ))}
          </dl>
          <div className="mt-5 flex justify-end">
            <Button onClick={close}>Done</Button>
          </div>
        </div>
      ) : (
        <form onSubmit={submit}>
          <div className="mb-4 flex items-center justify-between gap-3 rounded-md border border-line bg-surface-2 px-3.5 py-2.5">
            <p className="text-[12.5px] text-ink-2">
              Needs columns <b className="font-bold">Old SRT Code</b>,{" "}
              <b className="font-bold">New SRT Code</b>, and optional{" "}
              <b className="font-bold">Reason</b>.
            </p>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={downloadTemplate}
              className="shrink-0"
            >
              <DownloadIcon className="h-3.5 w-3.5" />
              Template
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => chooseFile(e.target.files?.[0] ?? null)}
            className="hidden"
          />

          {file ? (
            <div className="flex items-center gap-3 rounded-md border border-line-2 bg-surface px-3.5 py-3">
              <FileIcon className="h-6 w-6 shrink-0 text-blue" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-bold text-navy">
                  {file.name}
                </p>
                <p className="text-[11.5px] text-ink-3">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFile(null)}
                aria-label="Remove file"
                className="shrink-0 rounded-sm p-1.5 text-ink-3 hover:bg-red-soft hover:text-red"
              >
                <XIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={onDrop}
              className={`flex cursor-pointer flex-col items-center gap-2 rounded-md border-2 border-dashed px-4 py-8 text-center transition-colors ${
                dragActive
                  ? "border-blue bg-blue-soft"
                  : "border-line-2 bg-surface hover:border-ink-3"
              }`}
            >
              <UploadCloudIcon className="h-8 w-8 text-ink-3" />
              <p className="text-[13px] font-bold text-navy">
                Click to browse or drop a file here
              </p>
              <p className="text-[11.5px] text-ink-3">.xlsx or .xls</p>
            </div>
          )}

          {formError ? (
            <p className="mt-3 text-[13px] font-bold text-red">{formError}</p>
          ) : null}

          <div className="mt-5 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="ghost"
              onClick={close}
              disabled={upload.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!file || upload.isPending}>
              {upload.isPending ? "Uploading…" : "Upload"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

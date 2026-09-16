import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { getErrorMessage } from '@/lib/apiError';
import { useUploadSrtCrossRef } from '@/features/admin/hooks/useSrtCrossRef';

const RESULT_ROWS = [
  ['processed', 'Rows processed'],
  ['updated', 'Updated'],
  ['skipped_unchanged', 'Skipped (unchanged)'],
  ['created_old_code_stubs', 'New old-code stubs'],
  ['created_new_code_stubs', 'New new-code stubs'],
];

/**
 * Uploads an Excel mapping file (Old SRT Code, New SRT Code, optional
 * Reason) to `POST /admin/srt-cross-ref`. Shows the processing summary on
 * success instead of closing immediately — the counts are the point.
 */
export function UploadSrtCrossRefModal({ open, onClose }) {
  const [file, setFile] = useState(null);
  const [formError, setFormError] = useState(null);
  const [result, setResult] = useState(null);
  const upload = useUploadSrtCrossRef();

  const close = () => {
    setFile(null);
    setFormError(null);
    setResult(null);
    onClose();
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
          ? getErrorMessage(err, 'The file is missing a required column.')
          : getErrorMessage(err, 'Could not upload the file.'),
      );
    }
  };

  return (
    <Modal open={open} onClose={close} title="Upload SRT cross-reference">
      {result ? (
        <div>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-[13px]">
            {RESULT_ROWS.map(([key, label]) => (
              <div key={key} className="contents">
                <dt className="text-ink-3">{label}</dt>
                <dd className="text-right font-bold text-navy tabular-nums">
                  {result[key] ?? '—'}
                </dd>
              </div>
            ))}
          </dl>
          <div className="mt-5 flex justify-end">
            <Button onClick={close}>Done</Button>
          </div>
        </div>
      ) : (
        <form onSubmit={submit}>
          <p className="mb-3 text-[13px] text-ink-2">
            Excel file with columns <b className="font-bold">Old SRT Code</b>,{' '}
            <b className="font-bold">New SRT Code</b>, and optional{' '}
            <b className="font-bold">Reason</b>.
          </p>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full rounded-sm border border-line-2 bg-surface px-2.75 py-2.25 text-[13.5px] text-ink file:mr-3 file:rounded-sm file:border-0 file:bg-surface-2 file:px-2.75 file:py-1.5 file:font-display file:text-xs file:font-bold file:text-navy"
          />

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
              {upload.isPending ? 'Uploading…' : 'Upload'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

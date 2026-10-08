import { useId, useRef, useState } from 'react';
import { ImagePlus, FileUp, Plus, Trash2, X } from 'lucide-react';
import api, { assetUrl, errorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Spinner } from '../ui';

export function Field({ label, error, hint, children, htmlFor }) {
  return (
    <div>
      {label && <label htmlFor={htmlFor} className="label">{label}</label>}
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
      {error && <p className="mt-1.5 text-sm text-danger" role="alert">{error}</p>}
    </div>
  );
}

/** Controlled text/number/select/textarea with built-in error wiring. */
export function Input({ id, error, as: Tag = 'input', className = '', ...props }) {
  const auto = useId();
  const fid = id || auto;
  return <Tag id={fid} aria-invalid={error ? 'true' : undefined} className={`input ${className}`} {...props} />;
}

export function Toggle({ checked, onChange, label, disabled }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} disabled={disabled} onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors disabled:opacity-60 ${checked ? 'border-accent bg-accent' : 'border-line bg-raised'}`}>
      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

/** Uploads to POST /api/uploads and returns the stored path (e.g. /uploads/abc.jpg). */
export function useUpload() {
  const toast = useToast();
  const [progress, setProgress] = useState(null);
  const upload = async (file, kind = 'image') => {
    const data = new FormData();
    data.append('file', file);
    setProgress(0);
    try {
      const res = await api.post(`/uploads?kind=${kind}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
        onUploadProgress: (e) => e.total && setProgress(Math.round((e.loaded / e.total) * 100)),
      });
      return res.data.url;
    } catch (err) {
      toast.error(errorMessage(err, 'Upload failed.'));
      return null;
    } finally {
      setProgress(null);
    }
  };
  return { upload, progress, uploading: progress !== null };
}

export function ImageUpload({ value, onChange, label, aspect = 'aspect-[16/10]', hint = 'JPG, PNG, WebP or GIF · up to 5 MB' }) {
  const input = useRef(null);
  const { upload, progress, uploading } = useUpload();
  const pick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const url = await upload(file, 'image');
    if (url) onChange(url);
  };
  return (
    <div>
      {label && <span className="label">{label}</span>}
      <div className={`relative overflow-hidden rounded-md border border-dashed border-line bg-base ${aspect}`}>
        {value ? <img src={assetUrl(value)} alt="" className="h-full w-full object-cover" /> : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-muted"><ImagePlus className="h-7 w-7" aria-hidden /><span className="text-xs">No image selected</span></div>
        )}
        {uploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-base/80 backdrop-blur-sm" role="status">
            <Spinner /> <span className="text-sm">Uploading… {progress}%</span>
            <div className="h-1 w-32 overflow-hidden rounded-full bg-raised"><div className="h-full bg-accent transition-all" style={{ width: `${progress}%` }} /></div>
          </div>
        )}
      </div>
      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" onChange={pick} aria-label={label ? `Choose ${label}` : 'Choose image'} />
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => input.current?.click()} disabled={uploading}><FileUp className="h-3.5 w-3.5" aria-hidden /> {value ? 'Replace' : 'Upload'}</button>
        {value && <button type="button" className="btn btn-ghost btn-sm" onClick={() => onChange('')} disabled={uploading}><X className="h-3.5 w-3.5" aria-hidden /> Remove</button>}
        <span className="text-xs text-muted">{hint}</span>
      </div>
    </div>
  );
}

/** Editable list of one-line strings. */
export function StringList({ value, onChange, placeholder, addLabel = 'Add item', max = 30 }) {
  const items = value || [];
  const update = (i, v) => onChange(items.map((x, idx) => (idx === i ? v : x)));
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <input className="input" value={item} placeholder={placeholder} aria-label={`${addLabel} ${i + 1}`} onChange={(e) => update(i, e.target.value)} />
          <button type="button" className="btn btn-ghost btn-sm shrink-0 !px-2.5" onClick={() => onChange(items.filter((_, idx) => idx !== i))} aria-label={`Remove item ${i + 1}`}><Trash2 className="h-4 w-4" /></button>
        </div>
      ))}
      {items.length < max && <button type="button" className="btn btn-secondary btn-sm" onClick={() => onChange([...items, ''])}><Plus className="h-3.5 w-3.5" aria-hidden /> {addLabel}</button>}
    </div>
  );
}

/** Chips input: press Enter or comma to add. */
export function TagInput({ value, onChange, placeholder = 'Type and press Enter' }) {
  const [text, setText] = useState('');
  const tags = value || [];
  const add = () => {
    const t = text.trim().replace(/,$/, '');
    if (t && !tags.some((x) => x.toLowerCase() === t.toLowerCase())) onChange([...tags, t]);
    setText('');
  };
  return (
    <div className="rounded-md border border-line bg-surface p-2 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/30">
      <div className="flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <span key={t} className="inline-flex items-center gap-1 rounded-full border border-line bg-raised py-1 pl-2.5 pr-1 text-xs">
            {t}
            <button type="button" className="flex h-5 w-5 items-center justify-center rounded-full text-muted hover:bg-line hover:text-ink" onClick={() => onChange(tags.filter((x) => x !== t))} aria-label={`Remove ${t}`}><X className="h-3 w-3" /></button>
          </span>
        ))}
        <input
          className="min-w-[8rem] flex-1 bg-transparent px-1.5 py-1 text-sm outline-none placeholder:text-muted/70"
          value={text} placeholder={placeholder} aria-label="Add technology"
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); } if (e.key === 'Backspace' && !text && tags.length) onChange(tags.slice(0, -1)); }}
          onBlur={add}
        />
      </div>
    </div>
  );
}

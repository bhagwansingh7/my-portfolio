import { useEffect, useRef, useState } from 'react';
import { Download, FileText, FileUp, Trash2 } from 'lucide-react';
import api, { assetUrl, errorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/admin/PageHeader';
import { ErrorState, PageSpinner, Spinner } from '../../components/ui';
import { useUpload } from '../../components/admin/forms';

export default function ResumeAdmin() {
  const toast = useToast();
  const input = useRef(null);
  const { upload, progress, uploading } = useUpload();
  const [resume, setResume] = useState(undefined);
  const [loadError, setLoadError] = useState('');

  const load = () => { setLoadError(''); api.get('/portfolio').then((r) => setResume(r.data.resume_url || null)).catch((e) => setLoadError(errorMessage(e))); };
  useEffect(load, []);

  const store = async (url, okText) => {
    try { await api.put('/portfolio', { resume_url: url }); setResume(url || null); toast.success(okText); }
    catch (err) { toast.error(errorMessage(err)); }
  };

  const pick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const url = await upload(file, 'document');
    if (url) store(url, 'Resume updated. Visitors now download the new file.');
  };

  if (loadError) return <ErrorState message={loadError} onRetry={load} />;
  if (resume === undefined) return <PageSpinner />;

  return (
    <>
      <PageHeader title="Resume" description="Upload a PDF. The Resume buttons on the public site download this file." />
      <div className="card p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-raised"><FileText className="h-6 w-6 text-accent" aria-hidden /></div>
          <div className="min-w-0 flex-1">
            <p className="font-medium">{resume ? 'Current resume' : 'No resume uploaded'}</p>
            <p className="truncate text-sm text-muted">{resume ? resume.replace('/uploads/', '') : 'The Resume buttons are hidden until you upload one.'}</p>
          </div>
          {resume && <a href={assetUrl(resume)} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm"><Download className="h-3.5 w-3.5" aria-hidden /> Preview</a>}
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <input ref={input} type="file" accept="application/pdf" className="sr-only" onChange={pick} aria-label="Choose resume PDF" />
          <button type="button" className="btn btn-primary" onClick={() => input.current?.click()} disabled={uploading}>
            {uploading ? <><Spinner className="h-4 w-4" /> Uploading… {progress}%</> : <><FileUp className="h-4 w-4" aria-hidden /> {resume ? 'Replace PDF' : 'Upload PDF'}</>}
          </button>
          {resume && <button type="button" className="btn btn-ghost hover:!text-danger" onClick={() => store('', 'Resume removed.')} disabled={uploading}><Trash2 className="h-4 w-4" aria-hidden /> Remove</button>}
          <span className="text-xs text-muted">PDF · up to 10 MB</span>
        </div>
      </div>
    </>
  );
}

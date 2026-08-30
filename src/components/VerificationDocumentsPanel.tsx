import { Download, FileText, LoaderCircle, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { getApiError } from "../api/axios";
import { Button, EmptyState, ErrorState, StatusBadge } from "./ui";
import { VERIFICATION_DOCUMENT_TYPES, validateVerificationDocument, verificationDocumentService, type VerificationDocument, type VerificationDocumentType } from "../services/verificationDocumentService";

const validateFile = validateVerificationDocument;

const ACCEPTED_FILES = "application/pdf,image/jpeg,image/png,.pdf,.jpg,.jpeg,.png";

export default function VerificationDocumentsPanel() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState<VerificationDocument[]>([]);
  const [documentType, setDocumentType] = useState<VerificationDocumentType>("GUIDE_LICENSE");
  const [documentNumber, setDocumentNumber] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { const response = await verificationDocumentService.listMine(); setDocuments(response.data.data ?? []); }
    catch (requestError) { setError(getApiError(requestError).message); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const fileError = validateVerificationDocument(file);
    if (fileError) return setError(fileError);
    setSaving(true); setError(""); setNotice("");
    try {
      await verificationDocumentService.uploadMine(documentType, documentNumber, file as File);
      setDocumentNumber(""); setFile(null); if (fileRef.current) fileRef.current.value = "";
      setNotice("Verification document uploaded."); await load();
    } catch (requestError) { setError(getApiError(requestError).message); }
    finally { setSaving(false); }
  };

  const download = async (document: VerificationDocument) => {
    setActionId(document.id);
    try {
      const response = await verificationDocumentService.downloadMine(document.id);
      const url = URL.createObjectURL(response.data); const link = window.document.createElement("a");
      link.href = url; link.download = document.fileName || `verification-document-${document.id}`; link.click(); URL.revokeObjectURL(url);
    } catch (requestError) { setError(getApiError(requestError).message); }
    finally { setActionId(null); }
  };

  const replace = async (document: VerificationDocument) => {
    const input = window.document.createElement("input"); input.type = "file"; input.accept = ACCEPTED_FILES;
    input.onchange = async () => {
      const replacement = input.files?.[0] ?? null; const fileError = validateVerificationDocument(replacement);
      if (fileError) return setError(fileError);
      const number = window.prompt("Document number", document.documentNumber)?.trim(); if (!number) return;
      setActionId(document.id); setError("");
      try { await verificationDocumentService.replaceMine(document.id, number, replacement as File); setNotice("Verification document replaced and returned to review."); await load(); }
      catch (requestError) { setError(getApiError(requestError).message); }
      finally { setActionId(null); }
    }; input.click();
  };

  const remove = async (document: VerificationDocument) => {
    if (!window.confirm(`Delete ${document.fileName}?`)) return;
    setActionId(document.id); setError("");
    try { await verificationDocumentService.deleteMine(document.id); setNotice("Verification document deleted."); await load(); }
    catch (requestError) { setError(getApiError(requestError).message); }
    finally { setActionId(null); }
  };

  return <section className="rounded-2xl border border-[#eae3dc] bg-white p-6 shadow-sm"><p className="text-xs font-bold uppercase tracking-widest text-[#a62922]">Identity and credentials</p><h2 className="mt-2 font-display text-2xl font-bold">Verification documents</h2><p className="mt-2 text-sm text-gray-500">PDF, JPG, JPEG, or PNG up to 10 MB. Rejected documents can be replaced and pending documents can be deleted.</p><form onSubmit={submit} className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.4fr_auto]"><select value={documentType} onChange={(event) => setDocumentType(event.target.value as VerificationDocumentType)} className="rounded-lg border px-3 py-2.5 text-sm">{VERIFICATION_DOCUMENT_TYPES.map((type) => <option key={type}>{type}</option>)}</select><input value={documentNumber} onChange={(event) => setDocumentNumber(event.target.value)} required maxLength={100} placeholder="Document number" className="rounded-lg border px-3 py-2.5 text-sm" /><input ref={fileRef} type="file" required accept={ACCEPTED_FILES} onChange={(event) => { const selected = event.target.files?.[0] ?? null; const fileError = validateFile(selected); setError(fileError); setFile(fileError ? null : selected); }} className="rounded-lg border px-3 py-2 text-sm" /><Button type="submit" loading={saving}><Plus className="h-4 w-4" /> Upload</Button></form>{notice && <p role="status" className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">{notice}</p>}{error && <div className="mt-5"><ErrorState message={error} onRetry={() => void load()} /></div>}{loading ? <div className="grid min-h-32 place-items-center"><LoaderCircle className="h-7 w-7 animate-spin text-[#a62922]" /></div> : !error && documents.length === 0 ? <div className="mt-5"><EmptyState title="No verification documents" description="Upload a credential to begin verification." /></div> : !error && <div className="mt-5 divide-y rounded-xl border">{documents.map((document) => <div key={document.id} className="flex flex-wrap items-center justify-between gap-4 p-4"><div className="flex min-w-0 items-center gap-3"><FileText className="h-5 w-5 shrink-0 text-[#a62922]" /><div className="min-w-0"><p className="break-all text-sm font-semibold">{document.fileName}</p><p className="mt-1 text-xs text-gray-500">{document.documentType} · {document.documentNumber} · {Math.ceil(document.fileSize / 1024)} KB</p><StatusBadge status={document.status} /></div></div><div className="flex items-center gap-2"><Button type="button" variant="ghost" disabled={actionId === document.id} onClick={() => void download(document)} title="Download document" aria-label={`Download ${document.fileName}`}><Download className="h-4 w-4" /></Button><Button type="button" variant="secondary" disabled={actionId === document.id} onClick={() => void replace(document)} title="Replace document"><RefreshCw className="h-4 w-4" /> Replace</Button><Button type="button" variant="danger" disabled={actionId === document.id} onClick={() => void remove(document)} title="Delete document" aria-label={`Delete ${document.fileName}`}><Trash2 className="h-4 w-4" /></Button></div></div>)}</div>}</section>;
}

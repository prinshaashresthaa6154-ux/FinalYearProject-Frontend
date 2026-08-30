import api from "../api/axios";
import type { ApiResponse } from "../types/api";

export const VERIFICATION_DOCUMENT_TYPES = ["PAN_VAT", "OWNER_IDENTITY", "GUIDE_CERTIFICATION", "GUIDE_LICENSE", "OTHER"] as const;
export type VerificationDocumentType = typeof VERIFICATION_DOCUMENT_TYPES[number];
export type DocumentStatus = "PENDING" | "APPROVED" | "REJECTED" | "RESUBMISSION_REQUIRED";
export type VerificationDocument = { id: number; userId: number; documentType: VerificationDocumentType; documentNumber: string; fileName: string; contentType: string; fileSize: number; status: DocumentStatus; rejectionReason?: string | null; uploadedAt: string; reviewedAt?: string | null; reviewedBy?: number | null };
export const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024;

export const validateVerificationDocument = (file: File | null) => {
  if (!file) return "Select a document file.";
  const validMime = ["application/pdf", "image/jpeg", "image/png"].includes(file.type);
  const validExtension = /\.(pdf|jpe?g|png)$/i.test(file.name);
  if (!validMime && !validExtension) return "Document must be a PDF, JPG, JPEG, or PNG file.";
  if (file.size > MAX_DOCUMENT_SIZE) return "Document must be 10 MB or smaller.";
  return "";
};

const metadataForm = (metadata: object, file: File) => { const form = new FormData(); form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" })); form.append("file", file); return form; };

export const verificationDocumentService = {
  uploadRaw(file: File) {
    const error = validateVerificationDocument(file);
    if (error) throw new Error(error);
    const form = new FormData(); form.append("file", file);
    return api.post<ApiResponse<number>>("/api/verification-documents", form);
  },
  downloadRaw(id: number) { return api.get<Blob>(`/api/verification-documents/${id}`, { responseType: "blob" }); },
  listMine() { return api.get<ApiResponse<VerificationDocument[]>>("/api/users/me/documents"); },
  uploadMine(documentType: VerificationDocumentType, documentNumber: string, file: File) {
    const error = validateVerificationDocument(file);
    if (error) throw new Error(error);
    return api.post<ApiResponse<VerificationDocument>>("/api/users/me/documents", metadataForm({ documentType, documentNumber: documentNumber.trim() }, file));
  },
  downloadMine(id: number) { return api.get<Blob>(`/api/users/me/documents/${id}`, { responseType: "blob" }); },
  replaceMine(id: number, documentNumber: string, file: File) {
    const error = validateVerificationDocument(file);
    if (error) throw new Error(error);
    return api.put<ApiResponse<VerificationDocument>>(`/api/users/me/documents/${id}`, metadataForm({ documentNumber: documentNumber.trim() }, file));
  },
  deleteMine(id: number) { return api.delete<ApiResponse<null>>(`/api/users/me/documents/${id}`); },
};

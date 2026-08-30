import api from "../api/axios";
import { authService } from "./authService";
import { validateVerificationDocument } from "./verificationDocumentService";

export type AdminVerificationStatus = {
  status: "PENDING" | "APPROVED" | "REJECTED";
  reason?: string;
  resubmissionAllowed?: boolean;
};

type AdminRegistrationResponse = {
  success?: boolean;
  message?: string;
  data?: Partial<AdminVerificationStatus> | null;
};

export const adminRegistrationService = {
  register(document: File) {
    const fileError = validateVerificationDocument(document);
    if (fileError) throw new Error(fileError);
    const payload = new FormData();
    payload.append("file", document);

    return api.post<AdminRegistrationResponse>("/api/verification-documents", payload);
  },

  getVerificationStatus() {
    return authService.getCurrentUser();
  },
};

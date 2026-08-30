export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T | null;
  errors?: Record<string, string> | unknown;
  timestamp?: string;
};

export type PageResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  first: boolean;
  last: boolean;
};

export type ValidationErrors = Record<string, string>;

export type ApiErrorDetails = {
  status?: number;
  message: string;
  validationErrors: ValidationErrors;
  kind:
    | "unauthorized"
    | "forbidden"
    | "not-found"
    | "validation"
    | "bad-request"
    | "conflict"
    | "gone"
    | "payload-too-large"
    | "server"
    | "unknown";
};

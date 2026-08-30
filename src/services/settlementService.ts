import api from "../api/axios";
import type { ApiResponse, PageResponse } from "../types/api";

export type SettlementType = "PARTIAL" | "FULL";
export type SettlementStatus = "UNSETTLED" | "PARTIALLY_SETTLED" | "SETTLED";
export type CollectionStatus = "POSTED" | "VOIDED";
export type CollectionPaymentMethod =
  | "CASH"
  | "BANK_TRANSFER"
  | "CHEQUE"
  | "MOBILE_WALLET"
  | "OTHER";
export type LedgerEntryType =
  | "COMMISSION_ACCRUAL"
  | "COLLECTION"
  | "REFUND_REVERSAL"
  | "COLLECTION_VOID"
  | "MANUAL_ADJUSTMENT";
export type LedgerDirection = "DEBIT" | "CREDIT";
export type CommissionPaymentStatus = "PAID" | "REFUNDED";
export type CommissionState = "ACCRUED";

export type AdminSettlementBalance = {
  currency: string;
  totalPaidTransactionAmount: string;
  totalCommissionAccrued: string;
  totalCollected: string;
  totalAdjustments: string;
  creditBalance: string;
  remainingAmountToBePaid: string;
  status: SettlementStatus;
  lastActivityAt: string;
};

export type AdminCommissionSummary = {
  adminId: number;
  currentCommissionPercentage: string;
  balances: AdminSettlementBalance[];
};

export type CommissionTransaction = {
  paymentId: number;
  transactionId: string;
  bookingId: number;
  bookingReference: string;
  tripId: number;
  tripTitle: string;
  grossAmount: string;
  commissionPercentage: string;
  commissionAmount: string;
  adminNetAmount: string;
  currency: string;
  paymentStatus: CommissionPaymentStatus;
  completedAt: string;
  commissionState: CommissionState;
};

export type CommissionTransactionDetail = CommissionTransaction & {
  ledgerEntryId: number;
  accruedAt: string;
  reversedAt: string | null;
};

export type SettlementLedgerEntry = {
  ledgerEntryId: number;
  entryType: LedgerEntryType;
  direction: LedgerDirection;
  amount: string;
  currency: string;
  balanceBefore: string;
  balanceAfter: string;
  paymentId: number | null;
  collectionId: number | null;
  collectionReference: string | null;
  description: string;
  createdAt: string;
};

export type CollectionRecorder = {
  userId: number;
  fullName: string;
};

export type CollectionReceipt = {
  collectionId: number;
  collectionReference: string;
  adminId: number;
  adminName: string;
  settlementType: SettlementType;
  amount: string;
  currency: string;
  paymentMethod: CollectionPaymentMethod;
  externalReference: string | null;
  note: string | null;
  balanceBefore: string;
  balanceAfter: string;
  status: CollectionStatus;
  collectedAt: string;
  recordedBy: CollectionRecorder;
  createdAt: string;
  voidReason: string | null;
  voidedAt: string | null;
};

export type SettlementDashboardBalance = {
  currency: string;
  adminCount: number;
  unsettledAdminCount: number;
  totalCommissionAccrued: string;
  totalCollected: string;
  totalAdjustments: string;
  totalCreditBalance: string;
  totalOutstanding: string;
};

export type RecentCollection = {
  collectionId: number;
  collectionReference: string;
  adminId: number;
  adminName: string;
  amount: string;
  currency: string;
  settlementType: SettlementType;
  status: CollectionStatus;
  collectedAt: string;
};

export type SettlementDashboard = {
  balances: SettlementDashboardBalance[];
  recentCollections: RecentCollection[];
};

export type GuideCommissionBalance = {
  currency: string;
  bookingCount: number;
  paidBookingCount: number;
  quotedGrossAmount: string;
  paidGrossAmount: string;
  quotedCommissionAmount: string;
  accruedCommissionAmount: string;
  quotedGuideNetAmount: string;
  paidGuideNetAmount: string;
};

export type GuideCommissionSummary = {
  currentCommissionPercentage: string;
  balances: GuideCommissionBalance[];
};

export type GuideCommissionTransaction = {
  bookingId: number;
  guideName: string;
  guideEmail: string;
  travelerName: string;
  destinationName: string | null;
  startDate: string;
  endDate: string;
  billableDays: number;
  dailyRate: string;
  grossAmount: string;
  commissionPercentage: string;
  commissionAmount: string;
  guideNetAmount: string;
  currency: string;
  bookingStatus: string;
  paymentStatus: string;
  acceptedAt: string;
  updatedAt: string;
};

export type GuideCommissionQuery = {
  currency?: string;
  status?: "UNPAID" | "INITIATED" | "PAID" | "FAILED" | "REFUNDED";
  from?: string;
  to?: string;
  page?: number;
  size?: number;
  sort?: string;
};

export type SettlementAdmin = {
  adminId: number;
  fullName: string;
  businessName: string;
  email: string;
};

export type SettlementAccount = {
  settlementAccountId: number;
  admin: SettlementAdmin;
  currency: string;
  totalCommissionAccrued: string;
  totalCollected: string;
  totalAdjustments: string;
  creditBalance: string;
  outstandingAmount: string;
  status: SettlementStatus;
  lastActivityAt: string;
};

export type SettlementAccountDetail = SettlementAccount & {
  admin: SettlementAdmin & { phone: string };
  totalPaidTransactionAmount: string;
  paidTransactionCount: number;
  collectionCount: number;
  version: number;
};

export type CollectionListItem = {
  collectionId: number;
  collectionReference: string;
  adminId: number;
  adminName: string;
  settlementType: SettlementType;
  amount: string;
  currency: string;
  paymentMethod: CollectionPaymentMethod;
  externalReference: string | null;
  status: CollectionStatus;
  balanceBefore: string;
  balanceAfter: string;
  collectedAt: string;
  createdAt: string;
};

export type CreatedCollection = Omit<CollectionReceipt, "voidReason" | "voidedAt"> & {
  accountStatus: SettlementStatus;
};

export type VoidedCollection = {
  collectionId: number;
  collectionReference: string;
  status: "VOIDED";
  voidReason: string;
  voidedAt: string;
  voidedBy: number;
  restoredAmount: string;
  currency: string;
  balanceBefore: string;
  balanceAfter: string;
  accountStatus: SettlementStatus;
};

export type AdminCommissionSummaryQuery = { currency?: string };

export type CommissionTransactionsQuery = {
  status?: CommissionPaymentStatus;
  currency?: string;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
  sort?: string;
};

export type SettlementLedgerQuery = {
  currency?: string;
  type?: LedgerEntryType;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
};

export type SettlementAccountsQuery = {
  search?: string;
  status?: SettlementStatus;
  currency?: string;
  minOutstanding?: string;
  page?: number;
  size?: number;
  sort?: string;
};

export type AccountCommissionTransactionsQuery =
  Omit<CommissionTransactionsQuery, "currency" | "sort"> & { currency: string };

export type AccountSettlementLedgerQuery = Omit<SettlementLedgerQuery, "currency"> & {
  currency: string;
};

export type CollectionsQuery = {
  adminId?: number;
  currency?: string;
  type?: SettlementType;
  status?: CollectionStatus;
  paymentMethod?: CollectionPaymentMethod;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
  sort?: string;
};

export type CollectionRequestBase = {
  adminId: number;
  currency: string;
  paymentMethod: CollectionPaymentMethod;
  externalReference?: string;
  note?: string;
  collectedAt: string;
};

export type PartialCollectionRequest = CollectionRequestBase & {
  type: "PARTIAL";
  amount: string;
};

export type FullCollectionRequest = CollectionRequestBase & {
  type: "FULL";
  amount?: never;
};

export type CollectionRequest = PartialCollectionRequest | FullCollectionRequest;
export type VoidCollectionRequest = { reason: string };

type QueryParams = Record<string, string | number | undefined>;

const cleanParams = <T extends QueryParams>(query: T) =>
  Object.fromEntries(
    Object.entries(query).filter(([, value]) => value !== undefined && value !== ""),
  );

const idempotencyHeaders = (idempotencyKey: string) => ({
  headers: { "Idempotency-Key": idempotencyKey },
});

export const settlementService = {
  adminSummary(query: AdminCommissionSummaryQuery = {}) {
    return api.get<ApiResponse<AdminCommissionSummary>>("/api/admin/commission/summary", {
      params: cleanParams(query),
    });
  },

  adminTransactions(query: CommissionTransactionsQuery = {}) {
    return api.get<ApiResponse<PageResponse<CommissionTransaction>>>(
      "/api/admin/commission/transactions",
      { params: cleanParams(query) },
    );
  },

  adminTransaction(paymentId: number) {
    return api.get<ApiResponse<CommissionTransactionDetail>>(
      `/api/admin/commission/transactions/${paymentId}`,
    );
  },

  adminSettlementHistory(query: SettlementLedgerQuery = {}) {
    return api.get<ApiResponse<PageResponse<SettlementLedgerEntry>>>("/api/admin/settlements", {
      params: cleanParams(query),
    });
  },

  adminCollection(collectionId: number) {
    return api.get<ApiResponse<CollectionReceipt>>(
      `/api/admin/settlements/collections/${collectionId}`,
    );
  },

  superadminSummary(query: AdminCommissionSummaryQuery = {}) {
    return api.get<ApiResponse<SettlementDashboard>>("/api/superadmin/settlements/summary", {
      params: cleanParams(query),
    });
  },

  guideCommissionSummary(query: AdminCommissionSummaryQuery = {}) {
    return api.get<ApiResponse<GuideCommissionSummary>>(
      "/api/superadmin/settlements/guide-commissions/summary",
      { params: cleanParams(query) },
    );
  },

  guideCommissionTransactions(query: GuideCommissionQuery = {}) {
    return api.get<ApiResponse<PageResponse<GuideCommissionTransaction>>>(
      "/api/superadmin/settlements/guide-commissions/transactions",
      { params: cleanParams(query) },
    );
  },

  settlementAccounts(query: SettlementAccountsQuery = {}) {
    return api.get<ApiResponse<PageResponse<SettlementAccount>>>(
      "/api/superadmin/settlements/accounts",
      { params: cleanParams(query) },
    );
  },

  settlementAccount(adminId: number, currency: string) {
    return api.get<ApiResponse<SettlementAccountDetail>>(
      `/api/superadmin/settlements/accounts/${adminId}`,
      { params: cleanParams({ currency }) },
    );
  },

  accountTransactions(adminId: number, query: AccountCommissionTransactionsQuery) {
    return api.get<ApiResponse<PageResponse<CommissionTransaction>>>(
      `/api/superadmin/settlements/accounts/${adminId}/transactions`,
      { params: cleanParams(query) },
    );
  },

  accountLedger(adminId: number, query: AccountSettlementLedgerQuery) {
    return api.get<ApiResponse<PageResponse<SettlementLedgerEntry>>>(
      `/api/superadmin/settlements/accounts/${adminId}/ledger`,
      { params: cleanParams(query) },
    );
  },

  recordPartialCollection(request: PartialCollectionRequest, idempotencyKey: string) {
    return api.post<ApiResponse<CreatedCollection>>(
      "/api/superadmin/settlements/collections",
      request,
      idempotencyHeaders(idempotencyKey),
    );
  },

  recordFullCollection(request: FullCollectionRequest, idempotencyKey: string) {
    return api.post<ApiResponse<CreatedCollection>>(
      "/api/superadmin/settlements/collections",
      request,
      idempotencyHeaders(idempotencyKey),
    );
  },

  collections(query: CollectionsQuery = {}) {
    return api.get<ApiResponse<PageResponse<CollectionListItem>>>(
      "/api/superadmin/settlements/collections",
      { params: cleanParams(query) },
    );
  },

  collection(collectionId: number) {
    return api.get<ApiResponse<CollectionReceipt>>(
      `/api/superadmin/settlements/collections/${collectionId}`,
    );
  },

  voidCollection(
    collectionId: number,
    request: VoidCollectionRequest,
    idempotencyKey: string,
  ) {
    return api.post<ApiResponse<VoidedCollection>>(
      `/api/superadmin/settlements/collections/${collectionId}/void`,
      request,
      idempotencyHeaders(idempotencyKey),
    );
  },
};

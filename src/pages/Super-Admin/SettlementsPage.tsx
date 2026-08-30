import {
  Ban,
  Eye,
  LoaderCircle,
  Plus,
  ReceiptText,
  RefreshCw,
  Search,
  WalletCards,
} from "lucide-react";
import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react";
import { getApiError } from "../../api/axios";
import Pagination from "../../components/Pagination";
import { Button, EmptyState, ErrorState, Input, Modal, Select, StatusBadge } from "../../components/ui";
import {
  settlementService,
  type CollectionListItem,
  type CollectionPaymentMethod,
  type CollectionReceipt,
  type CollectionsQuery,
  type CommissionPaymentStatus,
  type CommissionTransaction,
  type GuideCommissionSummary,
  type GuideCommissionTransaction,
  type LedgerEntryType,
  type SettlementAccount,
  type SettlementAccountDetail,
  type SettlementAccountsQuery,
  type SettlementDashboard,
  type SettlementLedgerEntry,
  type SettlementStatus,
  type SettlementType,
} from "../../services/settlementService";
import type { ValidationErrors } from "../../types/api";

const PAGE_SIZE = 15;
const paymentMethods: CollectionPaymentMethod[] = [
  "CASH",
  "BANK_TRANSFER",
  "CHEQUE",
  "MOBILE_WALLET",
  "OTHER",
];
const ledgerTypes: LedgerEntryType[] = [
  "COMMISSION_ACCRUAL",
  "COLLECTION",
  "REFUND_REVERSAL",
  "COLLECTION_VOID",
  "MANUAL_ADJUSTMENT",
];

type AccountFilters = {
  search: string;
  status: "" | SettlementStatus;
  currency: string;
  minOutstanding: string;
};
type CollectionFilters = {
  adminId: string;
  currency: string;
  type: "" | SettlementType;
  status: "" | "POSTED" | "VOIDED";
  paymentMethod: "" | CollectionPaymentMethod;
  from: string;
  to: string;
};
type CollectionForm = {
  type: SettlementType;
  adminId: string;
  currency: string;
  amount: string;
  paymentMethod: CollectionPaymentMethod;
  externalReference: string;
  note: string;
  collectedAt: string;
};

const emptyAccountFilters: AccountFilters = {
  search: "",
  status: "",
  currency: "",
  minOutstanding: "",
};
const emptyCollectionFilters: CollectionFilters = {
  adminId: "",
  currency: "",
  type: "",
  status: "",
  paymentMethod: "",
  from: "",
  to: "",
};
const newCollectionForm = (): CollectionForm => ({
  type: "PARTIAL",
  adminId: "",
  currency: "",
  amount: "",
  paymentMethod: "CASH",
  externalReference: "",
  note: "",
  collectedAt: toLocalInput(new Date()),
});

export default function SettlementsPage() {
  const [dashboard, setDashboard] = useState<SettlementDashboard | null>(null);
  const [summaryCurrency, setSummaryCurrency] = useState("");
  const [appliedSummaryCurrency, setAppliedSummaryCurrency] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState("");
  const [settlementApiUnavailable, setSettlementApiUnavailable] = useState(false);
  const [activeTab, setActiveTab] = useState<"accounts" | "collections" | "guides">("accounts");
  const [guideSummary, setGuideSummary] = useState<GuideCommissionSummary | null>(null);
  const [guideTransactions, setGuideTransactions] = useState<GuideCommissionTransaction[]>([]);
  const [guidePage, setGuidePage] = useState(0);
  const [guidePages, setGuidePages] = useState(0);
  const [guideCurrency, setGuideCurrency] = useState("");
  const [guidePaymentStatus, setGuidePaymentStatus] = useState<"" | "UNPAID" | "INITIATED" | "PAID" | "FAILED" | "REFUNDED">("");
  const [guidesLoading, setGuidesLoading] = useState(true);
  const [guidesError, setGuidesError] = useState("");

  const [accounts, setAccounts] = useState<SettlementAccount[]>([]);
  const [accountPage, setAccountPage] = useState(0);
  const [accountPages, setAccountPages] = useState(0);
  const [accountFilters, setAccountFilters] = useState<AccountFilters>(emptyAccountFilters);
  const [appliedAccountFilters, setAppliedAccountFilters] =
    useState<AccountFilters>(emptyAccountFilters);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [accountsError, setAccountsError] = useState("");

  const [collections, setCollections] = useState<CollectionListItem[]>([]);
  const [collectionPage, setCollectionPage] = useState(0);
  const [collectionPages, setCollectionPages] = useState(0);
  const [collectionFilters, setCollectionFilters] =
    useState<CollectionFilters>(emptyCollectionFilters);
  const [appliedCollectionFilters, setAppliedCollectionFilters] =
    useState<CollectionFilters>(emptyCollectionFilters);
  const [collectionsLoading, setCollectionsLoading] = useState(true);
  const [collectionsError, setCollectionsError] = useState("");

  const [selectedAccount, setSelectedAccount] = useState<SettlementAccount | null>(null);
  const [accountDetail, setAccountDetail] = useState<SettlementAccountDetail | null>(null);
  const [accountDetailLoading, setAccountDetailLoading] = useState(false);
  const [accountDetailError, setAccountDetailError] = useState("");
  const [accountView, setAccountView] = useState<"transactions" | "ledger">("transactions");
  const [transactions, setTransactions] = useState<CommissionTransaction[]>([]);
  const [transactionPage, setTransactionPage] = useState(0);
  const [transactionPages, setTransactionPages] = useState(0);
  const [transactionStatus, setTransactionStatus] = useState<"" | CommissionPaymentStatus>("");
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactionsError, setTransactionsError] = useState("");
  const [ledger, setLedger] = useState<SettlementLedgerEntry[]>([]);
  const [ledgerPage, setLedgerPage] = useState(0);
  const [ledgerPages, setLedgerPages] = useState(0);
  const [ledgerType, setLedgerType] = useState<"" | LedgerEntryType>("");
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [ledgerError, setLedgerError] = useState("");

  const [selectedCollectionId, setSelectedCollectionId] = useState<number | null>(null);
  const [collectionDetail, setCollectionDetail] = useState<CollectionReceipt | null>(null);
  const [collectionDetailLoading, setCollectionDetailLoading] = useState(false);
  const [collectionDetailError, setCollectionDetailError] = useState("");

  const [collectionFormOpen, setCollectionFormOpen] = useState(false);
  const [collectionForm, setCollectionForm] = useState<CollectionForm>(newCollectionForm);
  const [collectionFormErrors, setCollectionFormErrors] = useState<ValidationErrors>({});
  const [collectionSubmitError, setCollectionSubmitError] = useState("");
  const [collectionSubmitting, setCollectionSubmitting] = useState(false);
  const [collectionAttemptKey, setCollectionAttemptKey] = useState<string | null>(null);
  const [voidOpen, setVoidOpen] = useState(false);
  const [voidReason, setVoidReason] = useState("");
  const [voidError, setVoidError] = useState("");
  const [voidSubmitting, setVoidSubmitting] = useState(false);
  const [voidAttemptKey, setVoidAttemptKey] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const loadSummary = useCallback(async () => {
    setSummaryLoading(true);
    setSummaryError("");
    try {
      const response = await settlementService.superadminSummary({
        currency: appliedSummaryCurrency.trim() || undefined,
      });
      setDashboard(response.data.data ?? null);
    } catch (error) {
      const details = getApiError(error);
      setSummaryError(details.message);
      if (details.status === 404) setSettlementApiUnavailable(true);
    } finally {
      setSummaryLoading(false);
    }
  }, [appliedSummaryCurrency]);

  const loadAccounts = useCallback(async () => {
    setAccountsLoading(true);
    setAccountsError("");
    const query: SettlementAccountsQuery = {
      search: appliedAccountFilters.search.trim() || undefined,
      status: appliedAccountFilters.status || undefined,
      currency: appliedAccountFilters.currency.trim() || undefined,
      minOutstanding: appliedAccountFilters.minOutstanding.trim() || undefined,
      page: accountPage,
      size: PAGE_SIZE,
      sort: "outstandingAmount,desc",
    };
    try {
      const response = await settlementService.settlementAccounts(query);
      setAccounts(response.data.data?.content ?? []);
      setAccountPages(response.data.data?.totalPages ?? 0);
    } catch (error) {
      const details = getApiError(error);
      setAccountsError(details.message);
      if (details.status === 404) setSettlementApiUnavailable(true);
    } finally {
      setAccountsLoading(false);
    }
  }, [accountPage, appliedAccountFilters]);

  const loadCollections = useCallback(async () => {
    setCollectionsLoading(true);
    setCollectionsError("");
    const adminId = positiveInteger(appliedCollectionFilters.adminId)
      ? Number(appliedCollectionFilters.adminId)
      : undefined;
    const query: CollectionsQuery = {
      adminId,
      currency: appliedCollectionFilters.currency.trim() || undefined,
      type: appliedCollectionFilters.type || undefined,
      status: appliedCollectionFilters.status || undefined,
      paymentMethod: appliedCollectionFilters.paymentMethod || undefined,
      from: dateFilter(appliedCollectionFilters.from),
      to: dateFilter(appliedCollectionFilters.to),
      page: collectionPage,
      size: PAGE_SIZE,
      sort: "collectedAt,desc",
    };
    try {
      const response = await settlementService.collections(query);
      setCollections(response.data.data?.content ?? []);
      setCollectionPages(response.data.data?.totalPages ?? 0);
    } catch (error) {
      const details = getApiError(error);
      setCollectionsError(details.message);
      if (details.status === 404) setSettlementApiUnavailable(true);
    } finally {
      setCollectionsLoading(false);
    }
  }, [appliedCollectionFilters, collectionPage]);

  const loadGuideCommissions = useCallback(async () => {
    setGuidesLoading(true);
    setGuidesError("");
    try {
      const [summaryResponse, transactionsResponse] = await Promise.all([
        settlementService.guideCommissionSummary({ currency: guideCurrency.trim() || undefined }),
        settlementService.guideCommissionTransactions({
          currency: guideCurrency.trim() || undefined,
          status: guidePaymentStatus || undefined,
          page: guidePage,
          size: PAGE_SIZE,
          sort: "updatedAt,desc",
        }),
      ]);
      setGuideSummary(summaryResponse.data.data ?? null);
      setGuideTransactions(transactionsResponse.data.data?.content ?? []);
      setGuidePages(transactionsResponse.data.data?.totalPages ?? 0);
    } catch (error) {
      setGuidesError(getApiError(error).message);
    } finally {
      setGuidesLoading(false);
    }
  }, [guideCurrency, guidePage, guidePaymentStatus]);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  useEffect(() => { void loadGuideCommissions(); }, [loadGuideCommissions]);
  useEffect(() => {
    void loadAccounts();
  }, [loadAccounts]);
  useEffect(() => {
    void loadCollections();
  }, [loadCollections]);

  const loadAccountDetail = async (account: SettlementAccount) => {
    setAccountDetailLoading(true);
    setAccountDetailError("");
    try {
      const response = await settlementService.settlementAccount(
        account.admin.adminId,
        account.currency,
      );
      setAccountDetail(response.data.data ?? null);
    } catch (error) {
      setAccountDetailError(getApiError(error).message);
    } finally {
      setAccountDetailLoading(false);
    }
  };

  const loadTransactions = async (
    account: SettlementAccount,
    nextPage: number,
    status: "" | CommissionPaymentStatus = transactionStatus,
  ) => {
    setTransactionsLoading(true);
    setTransactionsError("");
    try {
      const response = await settlementService.accountTransactions(account.admin.adminId, {
        currency: account.currency,
        status: status || undefined,
        page: nextPage,
        size: 10,
      });
      setTransactions(response.data.data?.content ?? []);
      setTransactionPages(response.data.data?.totalPages ?? 0);
      setTransactionPage(nextPage);
    } catch (error) {
      setTransactionsError(getApiError(error).message);
    } finally {
      setTransactionsLoading(false);
    }
  };

  const loadLedger = async (
    account: SettlementAccount,
    nextPage: number,
    type: "" | LedgerEntryType = ledgerType,
  ) => {
    setLedgerLoading(true);
    setLedgerError("");
    try {
      const response = await settlementService.accountLedger(account.admin.adminId, {
        currency: account.currency,
        type: type || undefined,
        page: nextPage,
        size: 10,
      });
      setLedger(response.data.data?.content ?? []);
      setLedgerPages(response.data.data?.totalPages ?? 0);
      setLedgerPage(nextPage);
    } catch (error) {
      setLedgerError(getApiError(error).message);
    } finally {
      setLedgerLoading(false);
    }
  };

  const openAccount = (account: SettlementAccount) => {
    setSelectedAccount(account);
    setAccountDetail(null);
    setAccountView("transactions");
    setTransactionStatus("");
    setLedgerType("");
    setTransactions([]);
    setLedger([]);
    void loadAccountDetail(account);
    void loadTransactions(account, 0, "");
  };

  const openCollectionDetail = async (collectionId: number) => {
    setSelectedCollectionId(collectionId);
    setCollectionDetail(null);
    setCollectionDetailLoading(true);
    setCollectionDetailError("");
    try {
      const response = await settlementService.collection(collectionId);
      setCollectionDetail(response.data.data ?? null);
    } catch (error) {
      setCollectionDetailError(getApiError(error).message);
    } finally {
      setCollectionDetailLoading(false);
    }
  };

  const openCollectionForm = (account?: SettlementAccount) => {
    setCollectionForm({
      ...newCollectionForm(),
      adminId: account ? String(account.admin.adminId) : "",
      currency: account?.currency ?? "",
    });
    setCollectionFormErrors({});
    setCollectionSubmitError("");
    setCollectionAttemptKey(null);
    setCollectionFormOpen(true);
  };

  const changeCollectionField = (field: keyof CollectionForm, value: string) => {
    setCollectionForm((current) => ({ ...current, [field]: value }));
    setCollectionFormErrors((current) => ({ ...current, [field]: "" }));
    setCollectionSubmitError("");
    setCollectionAttemptKey(null);
  };

  const submitCollection = async (event: FormEvent) => {
    event.preventDefault();
    const localErrors = validateCollection(collectionForm);
    setCollectionFormErrors(localErrors);
    setCollectionSubmitError("");
    if (Object.keys(localErrors).length > 0) return;

    const attemptKey = collectionAttemptKey ?? crypto.randomUUID();
    if (!collectionAttemptKey) setCollectionAttemptKey(attemptKey);
    setCollectionSubmitting(true);
    const base = {
      adminId: Number(collectionForm.adminId),
      currency: collectionForm.currency.trim(),
      paymentMethod: collectionForm.paymentMethod,
      externalReference: collectionForm.externalReference.trim() || undefined,
      note: collectionForm.note.trim() || undefined,
      collectedAt: new Date(collectionForm.collectedAt).toISOString(),
    };
    try {
      if (collectionForm.type === "PARTIAL") {
        await settlementService.recordPartialCollection(
          { ...base, type: "PARTIAL", amount: collectionForm.amount.trim() },
          attemptKey,
        );
      } else {
        await settlementService.recordFullCollection({ ...base, type: "FULL" }, attemptKey);
      }
      setNotice(`${collectionForm.type === "FULL" ? "Full" : "Partial"} collection posted.`);
      setCollectionFormOpen(false);
      setCollectionAttemptKey(null);
      await Promise.all([loadSummary(), loadAccounts(), loadCollections()]);
      if (selectedAccount) void loadAccountDetail(selectedAccount);
    } catch (error) {
      const details = getApiError(error);
      setCollectionFormErrors(details.validationErrors);
      setCollectionSubmitError(details.message);
    } finally {
      setCollectionSubmitting(false);
    }
  };

  const openVoid = () => {
    setVoidReason("");
    setVoidError("");
    setVoidAttemptKey(null);
    setVoidOpen(true);
  };

  const submitVoid = async (event: FormEvent) => {
    event.preventDefault();
    if (!collectionDetail || collectionDetail.status !== "POSTED") return;
    if (!voidReason.trim()) {
      setVoidError("A reason is required.");
      return;
    }
    const attemptKey = voidAttemptKey ?? crypto.randomUUID();
    if (!voidAttemptKey) setVoidAttemptKey(attemptKey);
    setVoidSubmitting(true);
    setVoidError("");
    try {
      await settlementService.voidCollection(
        collectionDetail.collectionId,
        { reason: voidReason.trim() },
        attemptKey,
      );
      setNotice(`Collection ${collectionDetail.collectionReference} was voided.`);
      setVoidOpen(false);
      setVoidAttemptKey(null);
      await Promise.all([loadSummary(), loadAccounts(), loadCollections()]);
      await openCollectionDetail(collectionDetail.collectionId);
      if (selectedAccount) void loadAccountDetail(selectedAccount);
    } catch (error) {
      const details = getApiError(error);
      setVoidError(details.validationErrors.reason || details.message);
    } finally {
      setVoidSubmitting(false);
    }
  };

  const refreshAll = () => {
    setNotice("");
    setSettlementApiUnavailable(false);
    void Promise.all([loadSummary(), loadAccounts(), loadCollections(), loadGuideCommissions()]);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#b31919]">
            Financial operations
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold text-[#241f1a]">Settlements</h1>
          <p className="mt-2 text-sm text-gray-500">
            Reconcile commission balances, record collections, and inspect the settlement ledger.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={refreshAll}>
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
          <Button type="button" disabled={settlementApiUnavailable} onClick={() => openCollectionForm()}>
            <Plus className="h-4 w-4" /> Record collection
          </Button>
        </div>
      </header>

      {notice && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          {notice}
        </div>
      )}

      {settlementApiUnavailable ? (
        <ErrorState
          message="The settlement API is not available on the running backend. The frontend requested /api/superadmin/settlements, but the server returned 404. Start a backend build that implements the settlement controllers described in COMMISSION_SETTLEMENT_API.md."
          onRetry={refreshAll}
        />
      ) : (
        <>

      <section className="rounded-2xl border border-[#e5ddd6] bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Dashboard</p>
            <h2 className="font-display text-xl font-bold">Settlement position</h2>
          </div>
          <form
            className="flex w-full gap-2 sm:w-auto"
            onSubmit={(event) => {
              event.preventDefault();
              setAppliedSummaryCurrency(summaryCurrency);
            }}
          >
            <input
              value={summaryCurrency}
              onChange={(event) => setSummaryCurrency(event.target.value.toUpperCase())}
              placeholder="Currency (e.g. LKR)"
              className="min-w-0 flex-1 rounded-lg border border-[#dfe4e8] px-3 py-2 text-sm uppercase sm:w-48"
            />
            <Button type="submit" variant="secondary">Apply</Button>
          </form>
        </div>
        {summaryLoading ? (
          <LoadingBlock />
        ) : summaryError ? (
          <InlineError message={summaryError} onRetry={() => void loadSummary()} />
        ) : !dashboard || dashboard.balances.length === 0 ? (
          <div className="mt-5 rounded-xl bg-[#faf7f4] p-5 text-sm text-gray-500">
            No settlement balances match this currency.
          </div>
        ) : (
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {dashboard.balances.map((balance) => (
              <article
                key={balance.currency}
                className="rounded-xl border border-[#eee7df] bg-gradient-to-br from-white to-[#faf7f4] p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#b31919]/10 text-[#b31919]">
                    <WalletCards className="h-5 w-5" />
                  </span>
                  <span className="font-display text-lg font-bold">{balance.currency}</span>
                </div>
                <p className="mt-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                  Outstanding
                </p>
                <p className="mt-1 break-all font-display text-2xl font-bold">
                  {money(balance.totalOutstanding, balance.currency)}
                </p>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <Metric label="Accrued" value={balance.totalCommissionAccrued} />
                  <Metric label="Collected" value={balance.totalCollected} />
                  <Metric label="Adjustments" value={balance.totalAdjustments} />
                  <Metric label="Credit balance" value={balance.totalCreditBalance} />
                </dl>
                <p className="mt-4 text-xs text-gray-500">
                  {balance.unsettledAdminCount} unsettled of {balance.adminCount} admins
                </p>
              </article>
            ))}
          </div>
        )}

        <div className="mt-6 border-t border-[#eee7df] pt-5">
          <div className="flex items-center gap-2">
            <ReceiptText className="h-4 w-4 text-[#b31919]" />
            <h3 className="font-display text-lg font-bold">Recent collections</h3>
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="py-2 pr-4">Reference</th>
                  <th className="px-4 py-2">Admin</th>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2">Amount</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="pl-4 py-2">Collected</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eee7df]">
                {(dashboard?.recentCollections ?? []).map((item) => (
                  <tr key={item.collectionId}>
                    <td className="py-3 pr-4">
                      <button
                        type="button"
                        onClick={() => void openCollectionDetail(item.collectionId)}
                        className="font-semibold text-[#9f1c1c] hover:underline"
                      >
                        {item.collectionReference}
                      </button>
                    </td>
                    <td className="px-4 py-3">{item.adminName}</td>
                    <td className="px-4 py-3">{item.settlementType}</td>
                    <td className="px-4 py-3 font-semibold">{money(item.amount, item.currency)}</td>
                    <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                    <td className="pl-4 py-3 whitespace-nowrap">{formatDate(item.collectedAt)}</td>
                  </tr>
                ))}
                {!summaryLoading && (dashboard?.recentCollections.length ?? 0) === 0 && (
                  <tr><td colSpan={6} className="py-6 text-center text-gray-500">No recent collections.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <div className="flex gap-1 rounded-xl bg-[#eee8e3] p-1 sm:w-fit">
        <TabButton active={activeTab === "accounts"} onClick={() => setActiveTab("accounts")}>
          Settlement accounts
        </TabButton>
        <TabButton active={activeTab === "collections"} onClick={() => setActiveTab("collections")}>
          Collections
        </TabButton>
        <TabButton active={activeTab === "guides"} onClick={() => setActiveTab("guides")}>
          Freelance guide commission
        </TabButton>
      </div>

      {activeTab === "accounts" ? (
        <AccountsPanel
          rows={accounts}
          filters={accountFilters}
          page={accountPage}
          pages={accountPages}
          loading={accountsLoading}
          error={accountsError}
          onFiltersChange={setAccountFilters}
          onApply={() => {
            setAccountPage(0);
            setAppliedAccountFilters(accountFilters);
          }}
          onClear={() => {
            setAccountFilters(emptyAccountFilters);
            setAppliedAccountFilters(emptyAccountFilters);
            setAccountPage(0);
          }}
          onPageChange={setAccountPage}
          onOpen={openAccount}
          onCollect={openCollectionForm}
          onRetry={() => void loadAccounts()}
        />
      ) : activeTab === "collections" ? (
        <CollectionsPanel
          rows={collections}
          filters={collectionFilters}
          page={collectionPage}
          pages={collectionPages}
          loading={collectionsLoading}
          error={collectionsError}
          onFiltersChange={setCollectionFilters}
          onApply={() => {
            setCollectionPage(0);
            setAppliedCollectionFilters(collectionFilters);
          }}
          onClear={() => {
            setCollectionFilters(emptyCollectionFilters);
            setAppliedCollectionFilters(emptyCollectionFilters);
            setCollectionPage(0);
          }}
          onPageChange={setCollectionPage}
          onOpen={(id) => void openCollectionDetail(id)}
          onRetry={() => void loadCollections()}
        />
      ) : (
        <GuideCommissionPanel
          summary={guideSummary}
          rows={guideTransactions}
          loading={guidesLoading}
          error={guidesError}
          currency={guideCurrency}
          status={guidePaymentStatus}
          page={guidePage}
          pages={guidePages}
          onCurrencyChange={(value) => { setGuideCurrency(value.toUpperCase()); setGuidePage(0); }}
          onStatusChange={(value) => { setGuidePaymentStatus(value); setGuidePage(0); }}
          onPageChange={setGuidePage}
          onRetry={() => void loadGuideCommissions()}
        />
      )}

        </>
      )}

      <Modal
        open={selectedAccount !== null}
        onClose={() => setSelectedAccount(null)}
        title="Settlement account"
        size="lg"
      >
        <div className="max-h-[75vh] space-y-5 overflow-y-auto pr-1">
          {accountDetailLoading && !accountDetail ? (
            <LoadingBlock />
          ) : accountDetailError ? (
            <InlineError
              message={accountDetailError}
              onRetry={() => selectedAccount && void loadAccountDetail(selectedAccount)}
            />
          ) : accountDetail ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-xl font-bold">{accountDetail.admin.fullName}</h3>
                  <p className="text-sm text-gray-500">{accountDetail.admin.businessName}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {accountDetail.admin.email} · {accountDetail.admin.phone || "No phone"}
                  </p>
                </div>
                <div className="text-right">
                  <StatusBadge status={accountDetail.status} />
                  <p className="mt-2 text-sm font-bold">{accountDetail.currency}</p>
                </div>
              </div>
              <dl className="grid gap-3 rounded-xl bg-[#faf7f4] p-4 sm:grid-cols-2 lg:grid-cols-3">
                <Detail label="Outstanding" value={money(accountDetail.outstandingAmount, accountDetail.currency)} />
                <Detail label="Commission accrued" value={money(accountDetail.totalCommissionAccrued, accountDetail.currency)} />
                <Detail label="Collected" value={money(accountDetail.totalCollected, accountDetail.currency)} />
                <Detail label="Adjustments" value={money(accountDetail.totalAdjustments, accountDetail.currency)} />
                <Detail label="Paid transaction value" value={money(accountDetail.totalPaidTransactionAmount, accountDetail.currency)} />
                <Detail label="Activity" value={formatDate(accountDetail.lastActivityAt)} />
                <Detail label="Paid transactions" value={String(accountDetail.paidTransactionCount)} />
                <Detail label="Collections" value={String(accountDetail.collectionCount)} />
                <Detail label="Account version" value={String(accountDetail.version)} />
              </dl>
            </>
          ) : null}

          {selectedAccount && (
            <section className="border-t border-[#eee7df] pt-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex gap-1 rounded-lg bg-[#eee8e3] p-1">
                  <TabButton active={accountView === "transactions"} onClick={() => setAccountView("transactions")}>
                    Transactions
                  </TabButton>
                  <TabButton
                    active={accountView === "ledger"}
                    onClick={() => {
                      setAccountView("ledger");
                      if (ledger.length === 0) void loadLedger(selectedAccount, 0, ledgerType);
                    }}
                  >
                    Ledger
                  </TabButton>
                </div>
                <Button type="button" onClick={() => openCollectionForm(selectedAccount)}>
                  <Plus className="h-4 w-4" /> Collect
                </Button>
              </div>

              {accountView === "transactions" ? (
                <div className="mt-4">
                  <Select
                    aria-label="Transaction status"
                    value={transactionStatus}
                    onChange={(event) => {
                      const status = event.target.value as "" | CommissionPaymentStatus;
                      setTransactionStatus(status);
                      void loadTransactions(selectedAccount, 0, status);
                    }}
                    className="mb-3 sm:max-w-52"
                  >
                    <option value="">All payment statuses</option>
                    <option value="PAID">PAID</option>
                    <option value="REFUNDED">REFUNDED</option>
                  </Select>
                  {transactionsLoading ? <LoadingBlock /> : transactionsError ? (
                    <InlineError message={transactionsError} onRetry={() => void loadTransactions(selectedAccount, transactionPage)} />
                  ) : (
                    <>
                      <div className="overflow-x-auto rounded-xl border">
                        <table className="w-full min-w-[760px] text-left text-xs">
                          <thead className="bg-[#faf7f4] uppercase text-gray-500"><tr><th className="p-3">Booking</th><th className="p-3">Trip</th><th className="p-3">Gross</th><th className="p-3">Commission</th><th className="p-3">Admin net</th><th className="p-3">Status</th><th className="p-3">Completed</th></tr></thead>
                          <tbody className="divide-y">{transactions.map((row) => <tr key={row.paymentId}><td className="p-3"><p className="font-semibold">{row.bookingReference}</p><p className="text-gray-500">{row.transactionId}</p></td><td className="p-3">{row.tripTitle}</td><td className="p-3">{money(row.grossAmount, row.currency)}</td><td className="p-3"><p>{money(row.commissionAmount, row.currency)}</p><p className="text-gray-500">{row.commissionPercentage}%</p></td><td className="p-3">{money(row.adminNetAmount, row.currency)}</td><td className="p-3"><StatusBadge status={row.paymentStatus} /></td><td className="p-3 whitespace-nowrap">{formatDate(row.completedAt)}</td></tr>)}</tbody>
                        </table>
                      </div>
                      {transactions.length === 0 && <EmptyLine text="No commission transactions found." />}
                      <Pagination page={transactionPage + 1} totalPages={transactionPages} onPageChange={(next) => void loadTransactions(selectedAccount, next - 1)} />
                    </>
                  )}
                </div>
              ) : (
                <div className="mt-4">
                  <Select
                    aria-label="Ledger entry type"
                    value={ledgerType}
                    onChange={(event) => {
                      const type = event.target.value as "" | LedgerEntryType;
                      setLedgerType(type);
                      void loadLedger(selectedAccount, 0, type);
                    }}
                    className="mb-3 sm:max-w-64"
                  >
                    <option value="">All ledger entry types</option>
                    {ledgerTypes.map((type) => <option key={type}>{type}</option>)}
                  </Select>
                  {ledgerLoading ? <LoadingBlock /> : ledgerError ? (
                    <InlineError message={ledgerError} onRetry={() => void loadLedger(selectedAccount, ledgerPage)} />
                  ) : (
                    <>
                      <div className="overflow-x-auto rounded-xl border">
                        <table className="w-full min-w-[760px] text-left text-xs">
                          <thead className="bg-[#faf7f4] uppercase text-gray-500"><tr><th className="p-3">Entry</th><th className="p-3">Direction</th><th className="p-3">Amount</th><th className="p-3">Balance</th><th className="p-3">Reference</th><th className="p-3">Created</th></tr></thead>
                          <tbody className="divide-y">{ledger.map((row) => <tr key={row.ledgerEntryId}><td className="p-3"><p className="font-semibold">{row.entryType}</p><p className="max-w-52 text-gray-500">{row.description}</p></td><td className="p-3">{row.direction}</td><td className="p-3 font-semibold">{money(row.amount, row.currency)}</td><td className="p-3"><p>{row.balanceBefore}</p><p className="text-gray-500">to {row.balanceAfter}</p></td><td className="p-3">{row.collectionReference || (row.paymentId ? `Payment ${row.paymentId}` : "-")}</td><td className="p-3 whitespace-nowrap">{formatDate(row.createdAt)}</td></tr>)}</tbody>
                        </table>
                      </div>
                      {ledger.length === 0 && <EmptyLine text="No ledger entries found." />}
                      <Pagination page={ledgerPage + 1} totalPages={ledgerPages} onPageChange={(next) => void loadLedger(selectedAccount, next - 1)} />
                    </>
                  )}
                </div>
              )}
            </section>
          )}
        </div>
      </Modal>

      <Modal
        open={collectionFormOpen}
        onClose={() => !collectionSubmitting && setCollectionFormOpen(false)}
        title="Record collection"
        size="lg"
      >
        <form onSubmit={submitCollection} className="max-h-[75vh] space-y-4 overflow-y-auto pr-1">
          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Settlement type" value={collectionForm.type} onChange={(event) => changeCollectionField("type", event.target.value)} error={collectionFormErrors.type}>
              <option value="PARTIAL">PARTIAL</option><option value="FULL">FULL</option>
            </Select>
            <Input label="Admin ID" inputMode="numeric" value={collectionForm.adminId} onChange={(event) => changeCollectionField("adminId", event.target.value)} error={collectionFormErrors.adminId} required />
            <Input label="Currency" value={collectionForm.currency} onChange={(event) => changeCollectionField("currency", event.target.value.toUpperCase())} error={collectionFormErrors.currency} placeholder="LKR" maxLength={10} required />
            {collectionForm.type === "PARTIAL" && <Input label="Amount" inputMode="decimal" value={collectionForm.amount} onChange={(event) => changeCollectionField("amount", event.target.value)} error={collectionFormErrors.amount} placeholder="0.00" required />}
            <Select label="Payment method" value={collectionForm.paymentMethod} onChange={(event) => changeCollectionField("paymentMethod", event.target.value)} error={collectionFormErrors.paymentMethod}>
              {paymentMethods.map((method) => <option key={method}>{method}</option>)}
            </Select>
            <Input label="Collected at" type="datetime-local" value={collectionForm.collectedAt} onChange={(event) => changeCollectionField("collectedAt", event.target.value)} error={collectionFormErrors.collectedAt} max={toLocalInput(new Date())} required />
            <Input label="External reference" value={collectionForm.externalReference} onChange={(event) => changeCollectionField("externalReference", event.target.value)} error={collectionFormErrors.externalReference} placeholder="Bank or receipt reference" />
          </div>
          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-[#27323b]">Note</span>
            <textarea value={collectionForm.note} onChange={(event) => changeCollectionField("note", event.target.value)} rows={3} className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[#AF1D1D] focus:ring-2 focus:ring-[#AF1D1D]/15 ${collectionFormErrors.note ? "border-red-500" : "border-[#dfe4e8]"}`} />
            {collectionFormErrors.note && <span className="text-xs text-red-700">{collectionFormErrors.note}</span>}
          </label>
          {collectionForm.type === "FULL" && <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">The API will collect the full outstanding balance; no amount is sent.</p>}
          {collectionSubmitError && <InlineError message={collectionSubmitError} />}
          <div className="flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="secondary" disabled={collectionSubmitting} onClick={() => setCollectionFormOpen(false)}>Cancel</Button>
            <Button type="submit" loading={collectionSubmitting}>Post collection</Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={selectedCollectionId !== null}
        onClose={() => setSelectedCollectionId(null)}
        title="Collection receipt"
        size="lg"
      >
        {collectionDetailLoading ? <LoadingBlock /> : collectionDetailError ? (
          <InlineError message={collectionDetailError} onRetry={() => selectedCollectionId && void openCollectionDetail(selectedCollectionId)} />
        ) : collectionDetail ? (
          <div className="max-h-[75vh] space-y-5 overflow-y-auto pr-1">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><p className="text-xs uppercase text-gray-500">Reference</p><p className="font-display text-xl font-bold">{collectionDetail.collectionReference}</p></div>
              <StatusBadge status={collectionDetail.status} />
            </div>
            <div className="rounded-xl bg-[#faf7f4] p-4">
              <p className="text-xs font-bold uppercase text-gray-500">Amount collected</p>
              <p className="mt-1 break-all font-display text-2xl font-bold">{money(collectionDetail.amount, collectionDetail.currency)}</p>
              <p className="mt-2 text-sm text-gray-600">Balance {collectionDetail.balanceBefore} to {collectionDetail.balanceAfter}</p>
            </div>
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <Detail label="Admin" value={`${collectionDetail.adminName} (#${collectionDetail.adminId})`} />
              <Detail label="Settlement type" value={collectionDetail.settlementType} />
              <Detail label="Payment method" value={collectionDetail.paymentMethod} />
              <Detail label="External reference" value={collectionDetail.externalReference || "-"} />
              <Detail label="Collected at" value={formatDate(collectionDetail.collectedAt)} />
              <Detail label="Created at" value={formatDate(collectionDetail.createdAt)} />
              <Detail label="Recorded by" value={`${collectionDetail.recordedBy.fullName} (#${collectionDetail.recordedBy.userId})`} />
              <Detail label="Note" value={collectionDetail.note || "-"} />
              {collectionDetail.voidedAt && <Detail label="Voided at" value={formatDate(collectionDetail.voidedAt)} />}
              {collectionDetail.voidReason && <Detail label="Void reason" value={collectionDetail.voidReason} />}
            </dl>
            {collectionDetail.status === "POSTED" && (
              <div className="flex justify-end border-t pt-4">
                <Button type="button" variant="danger" onClick={openVoid}><Ban className="h-4 w-4" /> Void collection</Button>
              </div>
            )}
          </div>
        ) : null}
      </Modal>

      <Modal open={voidOpen} onClose={() => !voidSubmitting && setVoidOpen(false)} title="Void collection?">
        <form onSubmit={submitVoid} className="space-y-4">
          <p className="text-sm text-gray-600">This posts a reversing ledger entry. Confirm the reason before continuing.</p>
          <label className="block space-y-1.5"><span className="text-sm font-semibold">Reason</span><textarea value={voidReason} onChange={(event) => { setVoidReason(event.target.value); setVoidError(""); setVoidAttemptKey(null); }} rows={4} required className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-red-700 ${voidError ? "border-red-500" : "border-[#dfe4e8]"}`} />{voidError && <span className="text-xs text-red-700">{voidError}</span>}</label>
          <div className="flex justify-end gap-2"><Button type="button" variant="secondary" disabled={voidSubmitting} onClick={() => setVoidOpen(false)}>Cancel</Button><Button type="submit" variant="danger" loading={voidSubmitting}>Confirm void</Button></div>
        </form>
      </Modal>
    </div>
  );
}

function AccountsPanel({ rows, filters, page, pages, loading, error, onFiltersChange, onApply, onClear, onPageChange, onOpen, onCollect, onRetry }: {
  rows: SettlementAccount[]; filters: AccountFilters; page: number; pages: number; loading: boolean; error: string;
  onFiltersChange: (filters: AccountFilters) => void; onApply: () => void; onClear: () => void; onPageChange: (page: number) => void;
  onOpen: (account: SettlementAccount) => void; onCollect: (account: SettlementAccount) => void; onRetry: () => void;
}) {
  return <section className="space-y-4"><form onSubmit={(event) => { event.preventDefault(); onApply(); }} className="rounded-2xl border border-[#e5ddd6] bg-white p-4 shadow-sm"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5"><Input aria-label="Search accounts" value={filters.search} onChange={(event) => onFiltersChange({ ...filters, search: event.target.value })} placeholder="Admin, business, email" /><Select aria-label="Settlement status" value={filters.status} onChange={(event) => onFiltersChange({ ...filters, status: event.target.value as AccountFilters["status"] })}><option value="">All statuses</option><option value="UNSETTLED">UNSETTLED</option><option value="PARTIALLY_SETTLED">PARTIALLY_SETTLED</option><option value="SETTLED">SETTLED</option></Select><Input aria-label="Currency" value={filters.currency} onChange={(event) => onFiltersChange({ ...filters, currency: event.target.value.toUpperCase() })} placeholder="Currency" /><Input aria-label="Minimum outstanding" inputMode="decimal" value={filters.minOutstanding} onChange={(event) => onFiltersChange({ ...filters, minOutstanding: event.target.value })} placeholder="Minimum outstanding" /><Button type="submit"><Search className="h-4 w-4" /> Filter</Button></div><button type="button" onClick={onClear} className="mt-3 text-xs font-semibold text-gray-500 hover:text-[#b31919]">Clear account filters</button></form>{loading ? <LoadingBlock /> : error ? <InlineError message={error} onRetry={onRetry} /> : rows.length === 0 ? <EmptyState title="No settlement accounts" description="No accounts match the current filters." /> : <><div className="overflow-x-auto rounded-2xl border border-[#e5ddd6] bg-white shadow-sm"><table className="w-full min-w-[1000px] text-left text-sm"><thead className="bg-[#faf7f4] text-xs uppercase tracking-wide text-gray-500"><tr><th className="p-4">Admin</th><th className="p-4">Currency</th><th className="p-4">Accrued</th><th className="p-4">Collected</th><th className="p-4">Outstanding</th><th className="p-4">Status</th><th className="p-4">Last activity</th><th className="p-4">Actions</th></tr></thead><tbody className="divide-y divide-[#eee7df]">{rows.map((row) => <tr key={row.settlementAccountId} className="hover:bg-[#fffaf7]"><td className="p-4"><button type="button" onClick={() => onOpen(row)} className="text-left"><p className="font-semibold hover:text-[#b31919]">{row.admin.fullName}</p><p className="text-xs text-gray-500">{row.admin.businessName} · #{row.admin.adminId}</p></button></td><td className="p-4 font-semibold">{row.currency}</td><td className="p-4">{row.totalCommissionAccrued}</td><td className="p-4">{row.totalCollected}</td><td className="p-4 font-bold">{row.outstandingAmount}</td><td className="p-4"><StatusBadge status={row.status} /></td><td className="p-4 whitespace-nowrap">{formatDate(row.lastActivityAt)}</td><td className="p-4"><div className="flex gap-2"><button type="button" onClick={() => onOpen(row)} className="rounded-lg border p-2 text-gray-600 hover:text-[#b31919]" aria-label="View settlement account"><Eye className="h-4 w-4" /></button><button type="button" onClick={() => onCollect(row)} className="rounded-lg border p-2 text-gray-600 hover:text-[#b31919]" aria-label="Record collection"><Plus className="h-4 w-4" /></button></div></td></tr>)}</tbody></table></div><Pagination page={page + 1} totalPages={pages} onPageChange={(next) => onPageChange(next - 1)} /></>}</section>;
}

function CollectionsPanel({ rows, filters, page, pages, loading, error, onFiltersChange, onApply, onClear, onPageChange, onOpen, onRetry }: {
  rows: CollectionListItem[]; filters: CollectionFilters; page: number; pages: number; loading: boolean; error: string;
  onFiltersChange: (filters: CollectionFilters) => void; onApply: () => void; onClear: () => void; onPageChange: (page: number) => void; onOpen: (id: number) => void; onRetry: () => void;
}) {
  return <section className="space-y-4"><form onSubmit={(event) => { event.preventDefault(); onApply(); }} className="rounded-2xl border border-[#e5ddd6] bg-white p-4 shadow-sm"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Input aria-label="Admin ID" inputMode="numeric" value={filters.adminId} onChange={(event) => onFiltersChange({ ...filters, adminId: event.target.value })} placeholder="Admin ID" /><Input aria-label="Currency" value={filters.currency} onChange={(event) => onFiltersChange({ ...filters, currency: event.target.value.toUpperCase() })} placeholder="Currency" /><Select aria-label="Settlement type" value={filters.type} onChange={(event) => onFiltersChange({ ...filters, type: event.target.value as CollectionFilters["type"] })}><option value="">All types</option><option value="PARTIAL">PARTIAL</option><option value="FULL">FULL</option></Select><Select aria-label="Collection status" value={filters.status} onChange={(event) => onFiltersChange({ ...filters, status: event.target.value as CollectionFilters["status"] })}><option value="">All statuses</option><option value="POSTED">POSTED</option><option value="VOIDED">VOIDED</option></Select><Select aria-label="Payment method" value={filters.paymentMethod} onChange={(event) => onFiltersChange({ ...filters, paymentMethod: event.target.value as CollectionFilters["paymentMethod"] })}><option value="">All payment methods</option>{paymentMethods.map((method) => <option key={method}>{method}</option>)}</Select><Input aria-label="Collected from" type="datetime-local" value={filters.from} onChange={(event) => onFiltersChange({ ...filters, from: event.target.value })} /><Input aria-label="Collected to" type="datetime-local" value={filters.to} onChange={(event) => onFiltersChange({ ...filters, to: event.target.value })} /><Button type="submit"><Search className="h-4 w-4" /> Filter</Button></div><button type="button" onClick={onClear} className="mt-3 text-xs font-semibold text-gray-500 hover:text-[#b31919]">Clear collection filters</button></form>{loading ? <LoadingBlock /> : error ? <InlineError message={error} onRetry={onRetry} /> : rows.length === 0 ? <EmptyState title="No collections" description="No collection records match the current filters." /> : <><div className="overflow-x-auto rounded-2xl border border-[#e5ddd6] bg-white shadow-sm"><table className="w-full min-w-[1050px] text-left text-sm"><thead className="bg-[#faf7f4] text-xs uppercase tracking-wide text-gray-500"><tr><th className="p-4">Reference</th><th className="p-4">Admin</th><th className="p-4">Type</th><th className="p-4">Amount</th><th className="p-4">Method</th><th className="p-4">Balance after</th><th className="p-4">Status</th><th className="p-4">Collected</th></tr></thead><tbody className="divide-y divide-[#eee7df]">{rows.map((row) => <tr key={row.collectionId} className="cursor-pointer hover:bg-[#fffaf7]" onClick={() => onOpen(row.collectionId)}><td className="p-4 font-semibold text-[#9f1c1c]">{row.collectionReference}</td><td className="p-4"><p className="font-medium">{row.adminName}</p><p className="text-xs text-gray-500">#{row.adminId}</p></td><td className="p-4">{row.settlementType}</td><td className="p-4 font-semibold">{money(row.amount, row.currency)}</td><td className="p-4">{row.paymentMethod}</td><td className="p-4">{row.balanceAfter}</td><td className="p-4"><StatusBadge status={row.status} /></td><td className="p-4 whitespace-nowrap">{formatDate(row.collectedAt)}</td></tr>)}</tbody></table></div><Pagination page={page + 1} totalPages={pages} onPageChange={(next) => onPageChange(next - 1)} /></>}</section>;
}

function GuideCommissionPanel({ summary, rows, loading, error, currency, status, page, pages, onCurrencyChange, onStatusChange, onPageChange, onRetry }: {
  summary: GuideCommissionSummary | null; rows: GuideCommissionTransaction[]; loading: boolean; error: string;
  currency: string; status: "" | "UNPAID" | "INITIATED" | "PAID" | "FAILED" | "REFUNDED";
  page: number; pages: number; onCurrencyChange: (value: string) => void;
  onStatusChange: (value: "" | "UNPAID" | "INITIATED" | "PAID" | "FAILED" | "REFUNDED") => void;
  onPageChange: (page: number) => void; onRetry: () => void;
}) {
  return <section className="space-y-4">
    <div className="rounded-2xl border border-[#e5ddd6] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wide text-[#b31919]">Direct guide services</p><h2 className="font-display text-xl font-bold">Freelance guide commission</h2><p className="mt-1 text-sm text-gray-500">Quoted values come from accepted requests. Accrued commission includes paid bookings only.</p></div><p className="rounded-full bg-[#b31919]/10 px-4 py-2 text-sm font-bold text-[#b31919]">Current rate {summary?.currentCommissionPercentage ?? "0.00"}%</p></div>
      {loading ? <LoadingBlock /> : error ? <InlineError message={error} onRetry={onRetry} /> : !summary || summary.balances.length === 0 ? <div className="mt-5"><EmptyState title="No guide commission records" description="Accepted freelance-guide requests will appear here with quoted and paid financial splits." /></div> : <div className="mt-5 grid gap-4 lg:grid-cols-2">{summary.balances.map((balance) => <article key={balance.currency} className="rounded-xl border border-[#eee7df] bg-[#faf7f4] p-4"><div className="flex items-center justify-between"><b className="font-display text-xl">{balance.currency}</b><span className="text-xs font-semibold text-gray-500">{balance.paidBookingCount} paid / {balance.bookingCount} accepted</span></div><dl className="mt-4 grid gap-3 sm:grid-cols-2"><Detail label="Quoted gross" value={money(balance.quotedGrossAmount,balance.currency)} /><Detail label="Paid gross" value={money(balance.paidGrossAmount,balance.currency)} /><Detail label="Quoted commission" value={money(balance.quotedCommissionAmount,balance.currency)} /><Detail label="Accrued platform commission" value={money(balance.accruedCommissionAmount,balance.currency)} /><Detail label="Quoted guide net" value={money(balance.quotedGuideNetAmount,balance.currency)} /><Detail label="Paid guide revenue" value={money(balance.paidGuideNetAmount,balance.currency)} /></dl></article>)}</div>}
    </div>
    <div className="rounded-2xl border border-[#e5ddd6] bg-white shadow-sm">
      <div className="flex flex-wrap gap-3 border-b p-4"><Input aria-label="Guide commission currency" value={currency} onChange={(event) => onCurrencyChange(event.target.value)} placeholder="Currency" className="sm:max-w-48" /><Select aria-label="Guide payment status" value={status} onChange={(event) => onStatusChange(event.target.value as typeof status)} className="sm:max-w-56"><option value="">All payment statuses</option><option value="UNPAID">UNPAID</option><option value="INITIATED">INITIATED</option><option value="PAID">PAID</option><option value="FAILED">FAILED</option><option value="REFUNDED">REFUNDED</option></Select></div>
      {loading ? <LoadingBlock /> : error ? <InlineError message={error} onRetry={onRetry} /> : rows.length === 0 ? <EmptyState title="No matching transactions" description="No freelance-guide commission records match these filters." /> : <><div className="overflow-x-auto"><table className="w-full min-w-[1250px] text-left text-sm"><thead className="bg-[#faf7f4] text-xs uppercase tracking-wide text-gray-500"><tr><th className="p-4">Booking</th><th className="p-4">Guide / traveler</th><th className="p-4">Destination & dates</th><th className="p-4">Rate</th><th className="p-4">Gross</th><th className="p-4">Commission</th><th className="p-4">Guide net</th><th className="p-4">Payment</th><th className="p-4">Booking</th></tr></thead><tbody className="divide-y">{rows.map((row) => <tr key={row.bookingId}><td className="p-4 font-semibold">#{row.bookingId}</td><td className="p-4"><p className="font-semibold">{row.guideName}</p><p className="text-xs text-gray-500">{row.guideEmail}</p><p className="mt-1 text-xs">Traveler: {row.travelerName}</p></td><td className="p-4"><p>{row.destinationName || "-"}</p><p className="text-xs text-gray-500">{row.startDate} to {row.endDate}</p></td><td className="p-4">{money(row.dailyRate,row.currency)}<p className="text-xs text-gray-500">{row.billableDays} day(s)</p></td><td className="p-4 font-semibold">{money(row.grossAmount,row.currency)}</td><td className="p-4 font-semibold text-[#b31919]">{money(row.commissionAmount,row.currency)}<p className="text-xs font-normal text-gray-500">{row.commissionPercentage}%</p></td><td className="p-4">{money(row.guideNetAmount,row.currency)}</td><td className="p-4"><StatusBadge status={row.paymentStatus} /></td><td className="p-4"><StatusBadge status={row.bookingStatus} /></td></tr>)}</tbody></table></div><Pagination page={page + 1} totalPages={pages} onPageChange={(next) => onPageChange(next - 1)} /></>}
    </div>
  </section>;
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return <button type="button" onClick={onClick} className={`flex-1 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition ${active ? "bg-white text-[#a51c1c] shadow-sm" : "text-gray-600 hover:text-[#a51c1c]"}`}>{children}</button>;
}
function LoadingBlock() { return <div className="grid min-h-32 place-items-center"><LoaderCircle className="h-7 w-7 animate-spin text-[#b31919]" /></div>; }
function InlineError({ message, onRetry }: { message: string; onRetry?: () => void }) { return <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"><span>{message}</span>{onRetry && <button type="button" onClick={onRetry} className="font-bold underline">Try again</button>}</div>; }
function EmptyLine({ text }: { text: string }) { return <p className="py-5 text-center text-sm text-gray-500">{text}</p>; }
function Metric({ label, value }: { label: string; value: string }) { return <div><dt className="text-xs text-gray-500">{label}</dt><dd className="mt-0.5 break-all font-semibold">{value}</dd></div>; }
function Detail({ label, value }: { label: string; value: string }) { return <div><dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</dt><dd className="mt-1 break-words font-semibold text-[#2d2925]">{value}</dd></div>; }

function money(amount: string, currency: string) { return `${currency} ${amount}`; }
function formatDate(value: string) { const date = new Date(value); return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(date); }
function toLocalInput(date: Date) { const offset = date.getTimezoneOffset(); return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16); }
function dateFilter(value: string) { if (!value) return undefined; const date = new Date(value); return Number.isNaN(date.getTime()) ? undefined : date.toISOString(); }
function positiveInteger(value: string) { return /^[1-9]\d*$/.test(value.trim()); }
function positiveDecimal(value: string) { const clean = value.trim(); return /^(?:0|[1-9]\d*)(?:\.\d+)?$/.test(clean) && /[1-9]/.test(clean); }
function validateCollection(form: CollectionForm): ValidationErrors {
  const errors: ValidationErrors = {};
  if (!positiveInteger(form.adminId)) errors.adminId = "Enter a positive whole-number admin ID.";
  if (!form.currency.trim()) errors.currency = "Currency is required.";
  if (!form.paymentMethod) errors.paymentMethod = "Payment method is required.";
  if (form.type === "PARTIAL" && !positiveDecimal(form.amount)) errors.amount = "Enter a positive decimal amount.";
  if (!form.collectedAt) errors.collectedAt = "Collection date and time are required.";
  else {
    const collectedAt = new Date(form.collectedAt);
    if (Number.isNaN(collectedAt.getTime())) errors.collectedAt = "Enter a valid collection date and time.";
    else if (collectedAt.getTime() > Date.now()) errors.collectedAt = "Collection date and time cannot be in the future.";
  }
  return errors;
}

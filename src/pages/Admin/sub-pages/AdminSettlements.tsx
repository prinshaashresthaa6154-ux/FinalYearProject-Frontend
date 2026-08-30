import {
  ArrowDownLeft,
  ArrowUpRight,
  Eye,
  LoaderCircle,
  ReceiptText,
  WalletCards,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { getApiError } from "../../../api/axios";
import Pagination from "../../../components/Pagination";
import {
  Button,
  EmptyState,
  ErrorState,
  Modal,
  StatusBadge,
} from "../../../components/ui";
import {
  settlementService,
  type AdminCommissionSummary,
  type CollectionReceipt,
  type CommissionPaymentStatus,
  type CommissionTransaction,
  type CommissionTransactionDetail,
  type LedgerEntryType,
  type SettlementLedgerEntry,
} from "../../../services/settlementService";

const PAGE_SIZE = 15;
const transactionStatuses: CommissionPaymentStatus[] = ["PAID", "REFUNDED"];
const ledgerTypes: LedgerEntryType[] = [
  "COMMISSION_ACCRUAL",
  "COLLECTION",
  "REFUND_REVERSAL",
  "COLLECTION_VOID",
  "MANUAL_ADJUSTMENT",
];

const toStart = (value: string) => (value ? `${value}T00:00:00.000Z` : undefined);
const toEnd = (value: string) => (value ? `${value}T23:59:59.999Z` : undefined);
const label = (value: string) => value.replaceAll("_", " ");

function formatDecimal(value: string | null | undefined) {
  if (value === null || value === undefined || value === "") return "-";
  const match = String(value).trim().match(/^([+-]?)(\d+)(?:\.(\d+))?$/);
  if (!match) return String(value);
  const [, sign, integer, fraction] = match;
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${sign}${grouped}${fraction ? `.${fraction}` : ""}`;
}

function money(currency: string, amount: string | null | undefined) {
  return `${currency} ${formatDecimal(amount)}`;
}

function formatDate(value: string | null) {
  if (!value) return "-";
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return value;
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

export default function AdminSettlements() {
  const [currency, setCurrency] = useState("");
  const [knownCurrencies, setKnownCurrencies] = useState<string[]>([]);

  const [summary, setSummary] = useState<AdminCommissionSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState("");

  const [transactions, setTransactions] = useState<CommissionTransaction[]>([]);
  const [transactionPage, setTransactionPage] = useState(0);
  const [transactionPages, setTransactionPages] = useState(0);
  const [transactionStatus, setTransactionStatus] = useState<CommissionPaymentStatus | "">("");
  const [transactionFrom, setTransactionFrom] = useState("");
  const [transactionTo, setTransactionTo] = useState("");
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [transactionsError, setTransactionsError] = useState("");

  const [ledger, setLedger] = useState<SettlementLedgerEntry[]>([]);
  const [ledgerPage, setLedgerPage] = useState(0);
  const [ledgerPages, setLedgerPages] = useState(0);
  const [ledgerType, setLedgerType] = useState<LedgerEntryType | "">("");
  const [ledgerFrom, setLedgerFrom] = useState("");
  const [ledgerTo, setLedgerTo] = useState("");
  const [ledgerLoading, setLedgerLoading] = useState(true);
  const [ledgerError, setLedgerError] = useState("");

  const [transactionDetail, setTransactionDetail] =
    useState<CommissionTransactionDetail | null>(null);
  const [transactionDetailOpen, setTransactionDetailOpen] = useState(false);
  const [transactionDetailLoading, setTransactionDetailLoading] = useState(false);
  const [transactionDetailError, setTransactionDetailError] = useState("");
  const [receipt, setReceipt] = useState<CollectionReceipt | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [receiptError, setReceiptError] = useState("");

  const loadSummary = useCallback(async () => {
    setSummaryLoading(true);
    setSummaryError("");
    try {
      const response = await settlementService.adminSummary({
        currency: currency || undefined,
      });
      const responseData = response.data.data;
      const data = responseData
        ? { ...responseData, balances: Array.isArray(responseData.balances) ? responseData.balances : [] }
        : null;
      setSummary(data);
      if (data) {
        setKnownCurrencies((current) =>
          Array.from(new Set([...current, ...data.balances.map((item) => item.currency)])).sort(),
        );
      }
    } catch (requestError) {
      setSummaryError(getApiError(requestError).message);
    } finally {
      setSummaryLoading(false);
    }
  }, [currency]);

  const loadTransactions = useCallback(async () => {
    setTransactionsLoading(true);
    setTransactionsError("");
    try {
      const response = await settlementService.adminTransactions({
        currency: currency || undefined,
        status: transactionStatus || undefined,
        from: toStart(transactionFrom),
        to: toEnd(transactionTo),
        page: transactionPage,
        size: PAGE_SIZE,
        sort: "completedAt,desc",
      });
      const data = response.data.data;
      setTransactions(data?.content ?? []);
      setTransactionPages(data?.totalPages ?? 0);
    } catch (requestError) {
      setTransactionsError(getApiError(requestError).message);
    } finally {
      setTransactionsLoading(false);
    }
  }, [currency, transactionFrom, transactionPage, transactionStatus, transactionTo]);

  const loadLedger = useCallback(async () => {
    setLedgerLoading(true);
    setLedgerError("");
    try {
      const response = await settlementService.adminSettlementHistory({
        currency: currency || undefined,
        type: ledgerType || undefined,
        from: toStart(ledgerFrom),
        to: toEnd(ledgerTo),
        page: ledgerPage,
        size: PAGE_SIZE,
      });
      const data = response.data.data;
      setLedger(data?.content ?? []);
      setLedgerPages(data?.totalPages ?? 0);
    } catch (requestError) {
      setLedgerError(getApiError(requestError).message);
    } finally {
      setLedgerLoading(false);
    }
  }, [currency, ledgerFrom, ledgerPage, ledgerTo, ledgerType]);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);
  useEffect(() => {
    void loadTransactions();
  }, [loadTransactions]);
  useEffect(() => {
    void loadLedger();
  }, [loadLedger]);

  const openTransaction = async (paymentId: number) => {
    setTransactionDetail(null);
    setTransactionDetailError("");
    setTransactionDetailOpen(true);
    setTransactionDetailLoading(true);
    try {
      const response = await settlementService.adminTransaction(paymentId);
      setTransactionDetail(response.data.data ?? null);
      if (!response.data.data) setTransactionDetailError("Transaction details are unavailable.");
    } catch (requestError) {
      setTransactionDetailError(getApiError(requestError).message);
    } finally {
      setTransactionDetailLoading(false);
    }
  };

  const openReceipt = async (collectionId: number) => {
    setReceipt(null);
    setReceiptError("");
    setReceiptOpen(true);
    setReceiptLoading(true);
    try {
      const response = await settlementService.adminCollection(collectionId);
      setReceipt(response.data.data ?? null);
      if (!response.data.data) setReceiptError("Collection receipt is unavailable.");
    } catch (requestError) {
      setReceiptError(getApiError(requestError).message);
    } finally {
      setReceiptLoading(false);
    }
  };

  const changeCurrency = (value: string) => {
    setCurrency(value);
    setTransactionPage(0);
    setLedgerPage(0);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#b31919]">
            Commission account
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold text-[#241f1a]">Settlements</h1>
          <p className="mt-2 text-sm text-gray-500">
            Track earned commission, collections, and settlement account activity.
          </p>
        </div>
        <label className="text-xs font-semibold text-gray-500">
          Currency
          <select
            value={currency}
            onChange={(event) => changeCurrency(event.target.value)}
            className="mt-1 block min-w-44 rounded-lg border border-[#ded5cd] bg-white px-3 py-2.5 text-sm text-gray-900"
          >
            <option value="">All currencies</option>
            {knownCurrencies.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </label>
      </header>

      <section aria-labelledby="settlement-summary-title">
        <div className="mb-3 flex items-center justify-between gap-4">
          <div>
            <h2 id="settlement-summary-title" className="font-display text-xl font-bold">
              Balance summary
            </h2>
            {summary && (
              <p className="mt-1 text-xs text-gray-500">
                Current commission rate: {formatDecimal(summary.currentCommissionPercentage)}%
              </p>
            )}
          </div>
          {summaryError && !summaryLoading && (
            <Button type="button" variant="secondary" onClick={() => void loadSummary()}>
              Retry
            </Button>
          )}
        </div>
        {summaryLoading ? (
          <Loading label="Loading settlement summary" />
        ) : summaryError ? (
          <ErrorState message={summaryError} onRetry={() => void loadSummary()} />
        ) : !summary || summary.balances.length === 0 ? (
          <EmptyState title="No settlement balances" description="No balance is available for the selected currency." />
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {summary.balances.map((balance) => (
              <article key={balance.currency} className="overflow-hidden rounded-2xl border border-[#eae3dc] bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-[#f0eae4] bg-[#fcfaf7] px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#b31919]/10 text-[#b31919]">
                      <WalletCards className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Currency</p>
                      <h3 className="font-display text-xl font-bold">{balance.currency}</h3>
                    </div>
                  </div>
                  <StatusBadge status={balance.status} />
                </div>
                <dl className="grid grid-cols-2 gap-px bg-[#eee7df] sm:grid-cols-3">
                  <Metric label="Commission accrued" value={money(balance.currency, balance.totalCommissionAccrued)} />
                  <Metric label="Collected" value={money(balance.currency, balance.totalCollected)} />
                  <Metric label="Adjustments" value={money(balance.currency, balance.totalAdjustments)} />
                  <Metric label="Credit balance" value={money(balance.currency, balance.creditBalance)} />
                  <Metric label="Outstanding" value={money(balance.currency, balance.remainingAmountToBePaid)} emphasize />
                  <Metric label="Paid transactions" value={money(balance.currency, balance.totalPaidTransactionAmount)} />
                </dl>
                <p className="px-5 py-3 text-xs text-gray-500">Last activity {formatDate(balance.lastActivityAt)}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <DataSection title="Commission transactions" description="Paid bookings and the commission accrued from each payment.">
        <div className="grid gap-3 border-b border-[#f0eae4] bg-[#fcfaf7] p-4 sm:grid-cols-3">
          <select
            value={transactionStatus}
            onChange={(event) => { setTransactionStatus(event.target.value as CommissionPaymentStatus | ""); setTransactionPage(0); }}
            className="rounded-lg border border-[#ded5cd] bg-white px-3 py-2.5 text-sm"
          >
            <option value="">All payment statuses</option>
            {transactionStatuses.map((value) => <option key={value} value={value}>{label(value)}</option>)}
          </select>
          <DateFilter label="Completed from" value={transactionFrom} onChange={(value) => { setTransactionFrom(value); setTransactionPage(0); }} />
          <DateFilter label="Completed to" value={transactionTo} onChange={(value) => { setTransactionTo(value); setTransactionPage(0); }} />
        </div>
        {transactionsLoading ? (
          <Loading label="Loading commission transactions" />
        ) : transactionsError ? (
          <div className="p-5"><ErrorState message={transactionsError} onRetry={() => void loadTransactions()} /></div>
        ) : transactions.length === 0 ? (
          <div className="p-5"><EmptyState title="No commission transactions" description="No transactions match the current filters." /></div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead className="bg-[#fcfaf7] text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-5 py-3">Transaction</th>
                    <th className="px-5 py-3">Booking</th>
                    <th className="px-5 py-3">Trip</th>
                    <th className="px-5 py-3">Gross</th>
                    <th className="px-5 py-3">Commission</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Completed</th>
                    <th className="px-5 py-3 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0eae4]">
                  {transactions.map((transaction) => (
                    <tr key={transaction.paymentId} className="hover:bg-[#fdfcfb]">
                      <td className="px-5 py-4 font-mono text-xs">{transaction.transactionId}</td>
                      <td className="px-5 py-4 font-semibold">{transaction.bookingReference}</td>
                      <td className="max-w-56 px-5 py-4"><span className="block truncate">{transaction.tripTitle}</span></td>
                      <td className="whitespace-nowrap px-5 py-4">{money(transaction.currency, transaction.grossAmount)}</td>
                      <td className="whitespace-nowrap px-5 py-4 font-semibold text-[#b31919]">{money(transaction.currency, transaction.commissionAmount)}</td>
                      <td className="px-5 py-4"><StatusBadge status={transaction.paymentStatus} /></td>
                      <td className="whitespace-nowrap px-5 py-4 text-gray-500">{formatDate(transaction.completedAt)}</td>
                      <td className="px-5 py-4 text-right">
                        <Button type="button" variant="secondary" aria-label={`View transaction ${transaction.transactionId}`} onClick={() => void openTransaction(transaction.paymentId)}>
                          <Eye className="h-4 w-4" /> View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 pb-5">
              <Pagination page={transactionPage + 1} totalPages={transactionPages} onPageChange={(next) => setTransactionPage(next - 1)} />
            </div>
          </>
        )}
      </DataSection>

      <DataSection title="Settlement history" description="The complete debit and credit ledger for your settlement account.">
        <div className="grid gap-3 border-b border-[#f0eae4] bg-[#fcfaf7] p-4 sm:grid-cols-3">
          <select
            value={ledgerType}
            onChange={(event) => { setLedgerType(event.target.value as LedgerEntryType | ""); setLedgerPage(0); }}
            className="rounded-lg border border-[#ded5cd] bg-white px-3 py-2.5 text-sm"
          >
            <option value="">All entry types</option>
            {ledgerTypes.map((value) => <option key={value} value={value}>{label(value)}</option>)}
          </select>
          <DateFilter label="Activity from" value={ledgerFrom} onChange={(value) => { setLedgerFrom(value); setLedgerPage(0); }} />
          <DateFilter label="Activity to" value={ledgerTo} onChange={(value) => { setLedgerTo(value); setLedgerPage(0); }} />
        </div>
        {ledgerLoading ? (
          <Loading label="Loading settlement history" />
        ) : ledgerError ? (
          <div className="p-5"><ErrorState message={ledgerError} onRetry={() => void loadLedger()} /></div>
        ) : ledger.length === 0 ? (
          <div className="p-5"><EmptyState title="No settlement history" description="No ledger entries match the current filters." /></div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[940px] text-left text-sm">
                <thead className="bg-[#fcfaf7] text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-5 py-3">Type</th>
                    <th className="px-5 py-3">Direction</th>
                    <th className="px-5 py-3">Amount</th>
                    <th className="px-5 py-3">Balance</th>
                    <th className="px-5 py-3">Description</th>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0eae4]">
                  {ledger.map((entry) => {
                    const canOpen = entry.collectionId !== null;
                    return (
                      <tr
                        key={entry.ledgerEntryId}
                        tabIndex={canOpen ? 0 : undefined}
                        role={canOpen ? "button" : undefined}
                        onClick={canOpen ? () => void openReceipt(entry.collectionId!) : undefined}
                        onKeyDown={canOpen ? (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); void openReceipt(entry.collectionId!); } } : undefined}
                        className={canOpen ? "cursor-pointer hover:bg-[#fdfcfb] focus:bg-[#fdfcfb] focus:outline-none" : ""}
                      >
                        <td className="px-5 py-4 font-semibold">{label(entry.entryType)}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1 font-semibold ${entry.direction === "CREDIT" ? "text-emerald-700" : "text-[#b31919]"}`}>
                            {entry.direction === "CREDIT" ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
                            {entry.direction}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 font-semibold">{money(entry.currency, entry.amount)}</td>
                        <td className="whitespace-nowrap px-5 py-4 text-gray-500">{formatDecimal(entry.balanceBefore)} → {formatDecimal(entry.balanceAfter)}</td>
                        <td className="max-w-72 px-5 py-4"><span className="block truncate">{entry.description}</span></td>
                        <td className="whitespace-nowrap px-5 py-4 text-gray-500">{formatDate(entry.createdAt)}</td>
                        <td className="px-5 py-4 text-right">
                          {canOpen ? (
                            <Button type="button" variant="secondary" aria-label={`View receipt ${entry.collectionReference ?? entry.collectionId}`} onClick={(event) => { event.stopPropagation(); void openReceipt(entry.collectionId!); }}>
                              <ReceiptText className="h-4 w-4" /> View
                            </Button>
                          ) : <span className="text-gray-400">-</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-5 pb-5">
              <Pagination page={ledgerPage + 1} totalPages={ledgerPages} onPageChange={(next) => setLedgerPage(next - 1)} />
            </div>
          </>
        )}
      </DataSection>

      <Modal open={transactionDetailOpen} onClose={() => setTransactionDetailOpen(false)} title="Commission transaction" size="lg">
        {transactionDetailLoading ? (
          <Loading label="Loading transaction details" compact />
        ) : transactionDetailError ? (
          <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{transactionDetailError}</p>
        ) : transactionDetail && (
          <div className="grid gap-x-8 sm:grid-cols-2">
            <Detail label="Transaction" value={transactionDetail.transactionId} />
            <Detail label="Payment status" value={<StatusBadge status={transactionDetail.paymentStatus} />} />
            <Detail label="Booking" value={transactionDetail.bookingReference} />
            <Detail label="Trip" value={transactionDetail.tripTitle} />
            <Detail label="Gross amount" value={money(transactionDetail.currency, transactionDetail.grossAmount)} />
            <Detail label={`Commission (${formatDecimal(transactionDetail.commissionPercentage)}%)`} value={money(transactionDetail.currency, transactionDetail.commissionAmount)} />
            <Detail label="Admin net" value={money(transactionDetail.currency, transactionDetail.adminNetAmount)} />
            <Detail label="Commission state" value={label(transactionDetail.commissionState)} />
            <Detail label="Completed" value={formatDate(transactionDetail.completedAt)} />
            <Detail label="Accrued" value={formatDate(transactionDetail.accruedAt)} />
            <Detail label="Reversed" value={formatDate(transactionDetail.reversedAt)} />
            <Detail label="Ledger entry" value={`#${transactionDetail.ledgerEntryId}`} />
          </div>
        )}
      </Modal>

      <Modal open={receiptOpen} onClose={() => setReceiptOpen(false)} title="Collection receipt" size="lg">
        {receiptLoading ? (
          <Loading label="Loading collection receipt" compact />
        ) : receiptError ? (
          <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{receiptError}</p>
        ) : receipt && (
          <div>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#fcfaf7] p-4">
              <div>
                <p className="font-mono text-sm font-bold">{receipt.collectionReference}</p>
                <p className="mt-1 text-2xl font-bold text-[#b31919]">{money(receipt.currency, receipt.amount)}</p>
              </div>
              <StatusBadge status={receipt.status} />
            </div>
            <div className="grid gap-x-8 sm:grid-cols-2">
              <Detail label="Settlement type" value={label(receipt.settlementType)} />
              <Detail label="Payment method" value={label(receipt.paymentMethod)} />
              <Detail label="Balance before" value={money(receipt.currency, receipt.balanceBefore)} />
              <Detail label="Balance after" value={money(receipt.currency, receipt.balanceAfter)} />
              <Detail label="Collected at" value={formatDate(receipt.collectedAt)} />
              <Detail label="Recorded by" value={receipt.recordedBy.fullName} />
              <Detail label="External reference" value={receipt.externalReference ?? "-"} />
              <Detail label="Created" value={formatDate(receipt.createdAt)} />
              <Detail label="Note" value={receipt.note ?? "-"} />
              <Detail label="Void reason" value={receipt.voidReason ?? "-"} />
              {receipt.voidedAt && <Detail label="Voided at" value={formatDate(receipt.voidedAt)} />}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function DataSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#eae3dc] bg-white shadow-sm">
      <div className="border-b border-[#f0eae4] px-5 py-4">
        <h2 className="font-display text-xl font-bold">{title}</h2>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>
      {children}
    </section>
  );
}

function DateFilter({ label: text, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="text-xs font-semibold text-gray-500">
      {text}
      <input value={value} onChange={(event) => onChange(event.target.value)} type="date" className="mt-1 block w-full rounded-lg border border-[#ded5cd] bg-white px-3 py-2 text-sm text-gray-900" />
    </label>
  );
}

function Loading({ label: text, compact = false }: { label: string; compact?: boolean }) {
  return (
    <div className={`grid place-items-center ${compact ? "min-h-32" : "min-h-48"}`} role="status">
      <div className="text-center text-sm text-gray-500">
        <LoaderCircle className="mx-auto mb-2 h-7 w-7 animate-spin text-[#b31919]" />
        {text}
      </div>
    </div>
  );
}

function Metric({ label: text, value, emphasize = false }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div className="bg-white p-4">
      <dt className="text-xs text-gray-500">{text}</dt>
      <dd className={`mt-1 text-sm font-bold sm:text-base ${emphasize ? "text-[#b31919]" : "text-[#241f1a]"}`}>{value}</dd>
    </div>
  );
}

function Detail({ label: text, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#eee7df] py-3 text-sm">
      <span className="text-gray-500">{text}</span>
      <span className="max-w-[65%] text-right font-semibold text-[#241f1a]">{value}</span>
    </div>
  );
}

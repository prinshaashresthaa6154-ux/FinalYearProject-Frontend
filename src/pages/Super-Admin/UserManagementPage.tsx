import {
  Edit3,
  LoaderCircle,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { getApiError } from "../../api/axios";
import Pagination from "../../components/Pagination";
import {
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Modal,
  StatusBadge,
} from "../../components/ui";
import {
  superadminService,
  type ManagedUser,
  type ResourceFilters,
  type UserPayload,
} from "../../services/superadminService";

const emptyForm: UserPayload = {
  fullName: "",
  email: "",
  phone: "",
  profileImage: null,
  password: "",
  role: "USER",
  status: "ACTIVE",
};

export default function UserManagementPage() {
  const [rows, setRows] = useState<ManagedUser[]>([]);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(0);
  const [filters, setFilters] = useState<ResourceFilters>({});
  const [applied, setApplied] = useState<ResourceFilters>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState<"create" | "edit" | "detail" | null>(null);
  const [selected, setSelected] = useState<ManagedUser | null>(null);
  const [form, setForm] = useState<UserPayload>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ManagedUser | null>(null);
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await superadminService.managedUsers({
        ...applied,
        page,
        size: 20,
      });
      setRows(response.data.data?.content ?? []);
      setPages(response.data.data?.totalPages ?? 0);
    } catch (e) {
      setError(getApiError(e).message);
    } finally {
      setLoading(false);
    }
  }, [applied, page]);
  useEffect(() => {
    void load();
  }, [load]);
  const apply = (event: FormEvent) => {
    event.preventDefault();
    setPage(0);
    setApplied(filters);
  };
  const openCreate = () => {
    setForm(emptyForm);
    setSelected(null);
    setModal("create");
  };
  const openEdit = async (user: ManagedUser) => {
    setSelected(user);
    setForm({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone ?? "",
      profileImage: user.profileImage ?? null,
      password: "",
      role: user.role,
      status: user.status,
    });
    setModal("edit");
    try {
      const response = await superadminService.managedUser(user.id);
      if (response.data.data) setSelected(response.data.data);
    } catch (e) {
      setError(getApiError(e).message);
    }
  };
  const openDetail = async (user: ManagedUser) => {
    setSelected(user);
    setModal("detail");
    try {
      const response = await superadminService.managedUser(user.id);
      setSelected(response.data.data ?? user);
    } catch (e) {
      setError(getApiError(e).message);
    }
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      if (modal === "create") await superadminService.createManagedUser(form);
      else if (selected)
        await superadminService.updateManagedUser(selected.id, {
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          profileImage: form.profileImage,
          role: form.role,
          status: form.status,
        });
      setModal(null);
      await load();
    } catch (e) {
      setError(getApiError(e).message);
    } finally {
      setSubmitting(false);
    }
  };
  const remove = async (id: number) => {
    setDeleting(id);
    try {
      await superadminService.deleteManagedUser(id);
      setPendingDelete(null);
      await load();
    } catch (e) {
      setError(getApiError(e).message);
    } finally {
      setDeleting(null);
    }
  };
  const toggleVerification = async (user: ManagedUser) => {
    try {
      const response = await superadminService.setRoleVerification(
        user.id,
        !user.roleVerified,
      );
      setRows((current) =>
        current.map((item) =>
          item.id === user.id
            ? (response.data.data ?? {
                ...item,
                roleVerified: !user.roleVerified,
              })
            : item,
        ),
      );
    } catch (e) {
      setError(getApiError(e).message);
    }
  };
  const setField = (key: keyof UserPayload, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#b31919]">
            Account administration
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold">
            User Management
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Create, inspect, update, verify, and remove platform accounts.
          </p>
        </div>
        <Button type="button" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Create user
        </Button>
      </header>
      <form
        onSubmit={apply}
        className="rounded-2xl border border-[#e5ddd6] bg-white p-4 shadow-sm"
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <label className="relative sm:col-span-2">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              value={filters.keyword ?? ""}
              onChange={(e) =>
                setFilters({ ...filters, keyword: e.target.value })
              }
              placeholder="Search users"
              className="w-full rounded-lg border px-9 py-2.5 text-sm"
            />
          </label>
          <select
            value={filters.role ?? ""}
            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
            className="rounded-lg border px-3 py-2.5 text-sm"
          >
            <option value="">All roles</option>
            <option>USER</option>
            <option>ADMIN</option>
            <option>FREELANCE_GUIDE</option>
          </select>
          <select
            value={filters.status ?? ""}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="rounded-lg border px-3 py-2.5 text-sm"
          >
            <option value="">All statuses</option>
            <option>ACTIVE</option>
            <option>INACTIVE</option>
            <option>SUSPENDED</option>
          </select>
          <select
            value={String(filters.emailVerified ?? "")}
            onChange={(e) =>
              setFilters({
                ...filters,
                emailVerified:
                  e.target.value === "" ? "" : e.target.value === "true",
              })
            }
            className="rounded-lg border px-3 py-2.5 text-sm"
          >
            <option value="">Any email status</option>
            <option value="true">Verified email</option>
            <option value="false">Unverified email</option>
          </select>
          <Button type="submit">
            <Search className="h-4 w-4" /> Filter
          </Button>
        </div>
      </form>
      {error && <ErrorState message={error} onRetry={() => void load()} />}
      {loading ? (
        <div className="grid min-h-52 place-items-center">
          <LoaderCircle className="h-8 w-8 animate-spin text-[#b31919]" />
        </div>
      ) : !error && rows.length === 0 ? (
        <EmptyState
          title="No users found"
          description="Try changing the filters or create a new user."
        />
      ) : (
        !error && (
          <>
            <div className="overflow-x-auto rounded-2xl border border-[#e5ddd6] bg-white shadow-sm">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead className="bg-[#faf7f4] text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Verification</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eee8e3]">
                  {rows.map((user) => (
                    <tr key={user.id} className="hover:bg-[#fffaf7]">
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => void openDetail(user)}
                          className="text-left"
                        >
                          <p className="font-semibold hover:text-[#b31919]">
                            {user.fullName}
                          </p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </button>
                      </td>
                      <td className="px-4 py-4">{user.phone || "-"}</td>
                      <td className="px-4 py-4">{user.role}</td>
                      <td className="px-4 py-4">
                        <StatusBadge status={user.status} />
                      </td>
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => void toggleVerification(user)}
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${user.roleVerified ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"}`}
                        >
                          <ShieldCheck className="h-3.5 w-3.5" />{" "}
                          {user.roleVerified ? "Verified" : "Not verified"}
                        </button>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => void openEdit(user)}
                            className="rounded border p-2 text-gray-600 hover:border-[#b31919] hover:text-[#b31919]"
                            aria-label="Edit user"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setPendingDelete(user)}
                            disabled={deleting === user.id}
                            className="rounded border p-2 text-red-700 hover:bg-red-50 disabled:opacity-50"
                            aria-label="Delete user"
                          >
                            {deleting === user.id ? (
                              <LoaderCircle className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={page + 1}
              totalPages={pages}
              onPageChange={(next) => setPage(next - 1)}
            />
          </>
        )
      )}
      <Modal
        open={modal === "create" || modal === "edit"}
        onClose={() => setModal(null)}
        title={modal === "create" ? "Create user" : "Edit user"}
        size="lg"
      >
        <UserForm
          form={form}
          edit={modal === "edit"}
          loading={submitting}
          onChange={setField}
          onSubmit={submit}
          onCancel={() => setModal(null)}
        />
      </Modal>
      <Modal
        open={modal === "detail"}
        onClose={() => setModal(null)}
        title="User details"
      >
        <div className="space-y-4">
          {selected && (
            <>
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-red-50 text-[#b31919]">
                  <UserRound className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-display text-xl font-bold">
                    {selected.fullName}
                  </p>
                  <p className="text-sm text-gray-500">{selected.email}</p>
                </div>
              </div>
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <Detail label="Phone" value={selected.phone || "-"} />
                <Detail label="Role" value={selected.role} />
                <Detail label="Status" value={selected.status} />
                <Detail
                  label="Email verification"
                  value={selected.emailVerified ? "Verified" : "Unverified"}
                />
                <Detail
                  label="Role verification"
                  value={selected.roleVerified ? "Verified" : "Not verified"}
                />
              </dl>
              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={() => {
                    setModal("edit");
                    setForm({
                      fullName: selected.fullName,
                      email: selected.email,
                      phone: selected.phone ?? "",
                      profileImage: selected.profileImage ?? null,
                      password: "",
                      role: selected.role,
                      status: selected.status,
                    });
                  }}
                >
                  <Edit3 className="h-4 w-4" /> Edit user
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete user account?"
        message={pendingDelete ? `You are about to permanently delete ${pendingDelete.fullName}'s account. This action cannot be undone.` : "This action cannot be undone."}
        confirmLabel="Delete account"
        loading={pendingDelete !== null && deleting === pendingDelete.id}
        onCancel={() => {
          if (deleting === null) setPendingDelete(null);
        }}
        onConfirm={() => {
          if (pendingDelete) void remove(pendingDelete.id);
        }}
      />
    </div>
  );
}

function UserForm({
  form,
  edit,
  loading,
  onChange,
  onSubmit,
  onCancel,
}: {
  form: UserPayload;
  edit: boolean;
  loading: boolean;
  onChange: (key: keyof UserPayload, value: string) => void;
  onSubmit: (event: FormEvent) => void;
  onCancel: () => void;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Full name"
          value={form.fullName}
          onChange={(value) => onChange("fullName", value)}
          required
        />
        <Field
          label="Email"
          type="email"
          value={form.email}
          onChange={(value) => onChange("email", value)}
          required
        />
        <Field
          label="Phone"
          value={form.phone ?? ""}
          onChange={(value) => onChange("phone", value)}
        />
        <Field
          label={edit ? "New password (not required)" : "Password"}
          type="password"
          value={form.password ?? ""}
          onChange={(value) => onChange("password", value)}
          required={!edit}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5">
          <span className="text-xs font-bold uppercase text-gray-500">
            Role
          </span>
          <select
            value={form.role}
            onChange={(e) => onChange("role", e.target.value)}
            className="w-full rounded-lg border px-3 py-2.5 text-sm"
          >
            <option>USER</option>
            <option>ADMIN</option>
            <option>FREELANCE_GUIDE</option>
          </select>
        </label>
        <label className="space-y-1.5">
          <span className="text-xs font-bold uppercase text-gray-500">
            Status
          </span>
          <select
            value={form.status}
            onChange={(e) => onChange("status", e.target.value)}
            className="w-full rounded-lg border px-3 py-2.5 text-sm"
          >
            <option>ACTIVE</option>
            <option>INACTIVE</option>
            <option>SUSPENDED</option>
          </select>
        </label>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {edit ? "Save changes" : "Create user"}
        </Button>
      </div>
    </form>
  );
}
function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="space-y-1.5">
      <span className="text-xs font-bold uppercase text-gray-500">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border px-3 py-2.5 text-sm"
      />
    </label>
  );
}
function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase text-gray-500">{label}</dt>
      <dd className="mt-1 font-semibold">{value}</dd>
    </div>
  );
}

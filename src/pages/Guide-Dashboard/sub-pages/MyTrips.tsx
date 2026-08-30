import {
  CalendarDays,
  LoaderCircle,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useAuth } from "../../../context/AuthContext";
import { getApiError } from "../../../api/axios";
import { Button, EmptyState, Input } from "../../../components/ui";
import type { Destination } from "../../../services/destinationService";
import { guideService } from "../../../services/guideService";
import {
  groupService,
  type GroupTripInput,
  type GroupTripParticipant,
  type StandaloneGroupTrip,
} from "../../../services/groupService";

const emptyForm: GroupTripInput = {
  tripName: "",
  destinationId: 0,
  maximumMembers: 10,
  minimumMembers: 4,
  price: 0,
  date: "",
};

const tomorrow = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
};

export default function MyTrips() {
  const { userDTO } = useAuth();
  const [rows, setRows] = useState<StandaloneGroupTrip[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [form, setForm] = useState<GroupTripInput>(emptyForm);
  const [editing, setEditing] = useState<number | null>(null);
  const [participants, setParticipants] = useState<
    Record<number, GroupTripParticipant[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await groupService.list({
        page: 0,
        size: 100,
        sortBy: "date",
        sortDir: "asc",
      });
      setRows(
        (response.data.data?.content ?? []).filter(
          (trip) => trip.guide.id === userDTO?.id,
        ),
      );
    } catch (requestError) {
      setError(getApiError(requestError).message);
    } finally {
      setLoading(false);
    }
  }, [userDTO?.id]);

  useEffect(() => {
    void load();
    guideService
      .me()
      .then((response) => setDestinations((response.data.data?.destinations ?? []) as Destination[]))
      .catch(() => setDestinations([]));
  }, [load]);

  const update = <K extends keyof GroupTripInput>(
    key: K,
    value: GroupTripInput[K],
  ) => setForm((current) => ({ ...current, [key]: value }));
  const openEdit = (row: StandaloneGroupTrip) => {
    setEditing(row.id);
    setForm({
      tripName: row.tripName,
      destinationId: row.destination.id,
      maximumMembers: row.maximumMembers,
      minimumMembers: row.minimumMembers,
      price: row.price,
      date: row.date,
    });
    setNotice("");
  };
  const reset = () => {
    setEditing(null);
    setForm(emptyForm);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    if (!form.tripName.trim() || form.tripName.trim().length > 180) {
      setError("Trip name is required and must be 180 characters or fewer.");
      setSaving(false);
      return;
    }
    if (!Number.isInteger(form.destinationId) || form.destinationId <= 0) {
      setError("Select a valid destination.");
      setSaving(false);
      return;
    }
    if (
      !Number.isInteger(form.maximumMembers) ||
      form.maximumMembers < 2 ||
      form.maximumMembers > 10000
    ) {
      setError("Maximum members must be a whole number between 2 and 10000.");
      setSaving(false);
      return;
    }
    if (
      !Number.isInteger(form.minimumMembers) ||
      form.minimumMembers < 2 ||
      form.minimumMembers > 10000
    ) {
      setError("Minimum members must be a whole number between 2 and 10000.");
      setSaving(false);
      return;
    }
    if (
      !Number.isFinite(form.price) ||
      form.price < 0 ||
      Number(form.price.toFixed(2)) !== form.price
    ) {
      setError("Price must be zero or greater with at most two decimal places.");
      setSaving(false);
      return;
    }
    if (!form.date || form.date < tomorrow()) {
      setError("Group trip date must be in the future.");
      setSaving(false);
      return;
    }
    if (form.minimumMembers > form.maximumMembers) {
      setError("Minimum members cannot exceed maximum members.");
      setSaving(false);
      return;
    }
    try {
      const input = { ...form, tripName: form.tripName.trim() };
      const response = editing
        ? await groupService.update(editing, input)
        : await groupService.create(input);
      if (!response.data.success)
        throw new Error(response.data.message || "Unable to save group trip.");
      setNotice(
        response.data.message ||
          (editing
            ? "Group trip updated."
            : "Group trip created. Customers join this group trip as members, not through standard bookings."),
      );
      reset();
      await load();
    } catch (requestError) {
      const apiError = getApiError(requestError);
      setError(
        Object.values(apiError.validationErrors).join(" ") || apiError.message,
      );
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm("Delete this group trip?")) return;
    setDeleting(id);
    setError("");
    try {
      await groupService.delete(id);
      setNotice("Group trip deleted.");
      await load();
    } catch (requestError) {
      setError(getApiError(requestError).message);
    } finally {
      setDeleting(null);
    }
  };
  const showParticipants = async (id: number) => {
    try {
      const response = await groupService.participants(id);
      setParticipants((current) => ({
        ...current,
        [id]: response.data.data?.content ?? [],
      }));
    } catch (requestError) {
      setError(getApiError(requestError).message);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#b31919]">
            Guide-owned groups
          </p>
          <h2 className="mt-1 font-display text-3xl font-bold">Group trips</h2>
          <p className="mt-2 text-sm text-gray-500">
            Create and manage your own guide-led group departures.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => {
            reset();
            setNotice("");
          }}
        >
          <Plus className="h-4 w-4" /> New group trip
        </Button>
      </header>
      <form
        onSubmit={submit}
        className="grid gap-4 rounded-lg border border-[#e2d9d1] bg-white p-6 shadow-sm sm:grid-cols-2"
      >
        <Input
          label="Trip name"
          value={form.tripName}
          onChange={(event) => update("tripName", event.target.value)}
          required
          maxLength={180}
          className="sm:col-span-2"
        />
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold">Destination</span>
          <select
            value={form.destinationId}
            onChange={(event) =>
              update("destinationId", Number(event.target.value))
            }
            required
            className="min-h-10 w-full rounded-lg border border-[#d8cec0] bg-white px-3"
          >
            <option value={0} disabled>
              Select destination
            </option>
            {destinations.map((destination) => (
              <option key={destination.id} value={destination.id}>
                {destination.name}
              </option>
            ))}
          </select>
        </label>
        <Input
          label="Date"
          type="date"
          value={form.date}
          onChange={(event) => update("date", event.target.value)}
          min={tomorrow()}
          required
        />
        <Input
          label="Maximum members"
          type="number"
          min="2"
          max="10000"
          value={form.maximumMembers}
          onChange={(event) =>
            update("maximumMembers", Number(event.target.value))
          }
          required
        />
        <Input
          label="Minimum members"
          type="number"
          min="2"
          max="10000"
          value={form.minimumMembers}
          onChange={(event) =>
            update("minimumMembers", Number(event.target.value))
          }
          required
        />
        <Input
          label="Price"
          type="number"
          min="0"
          step="0.01"
          value={form.price}
          onChange={(event) => update("price", Number(event.target.value))}
          required
        />
        <div className="flex items-end gap-2">
          <Button type="submit" loading={saving}>
            {editing ? "Update trip" : "Create trip"}
          </Button>
          {editing && (
            <Button type="button" variant="secondary" onClick={reset}>
              Cancel
            </Button>
          )}
        </div>
      </form>
      {error && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </p>
      )}
      {notice && (
        <p
          role="status"
          className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800"
        >
          {notice}
        </p>
      )}
      {loading ? (
        <div className="grid min-h-52 place-items-center">
          <LoaderCircle className="h-8 w-8 animate-spin text-[#b31919]" />
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          title="No group trips"
          description="Create a future group departure to see it here."
        />
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {rows.map((row) => (
            <article
              key={row.id}
              className="rounded-lg border border-[#e2d9d1] bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-xl font-bold">
                    {row.tripName}
                  </h3>
                  <p className="mt-1 text-xs font-bold text-[#b31919]">
                    {row.status}
                  </p>
                </div>
                <span className="text-sm font-bold">
                  {row.availableSeats} seats left
                </span>
              </div>
              <div className="mt-5 grid gap-3 text-sm text-gray-600 sm:grid-cols-2">
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> {row.destination.name}
                </p>
                <p className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" /> {row.date}
                </p>
                <p className="flex items-center gap-2">
                  <Users className="h-4 w-4" /> {row.currentMembers}/
                  {row.maximumMembers} members
                </p>
                <p>
                  Price: <b>{row.price.toLocaleString()}</b>
                </p>
              </div>
              <div className="mt-5 flex flex-wrap gap-2 border-t border-[#eee7e1] pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => openEdit(row)}
                  disabled={row.status !== "OPEN"}
                >
                  <Pencil className="h-4 w-4" /> Edit
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => void remove(row.id)}
                  loading={deleting === row.id}
                  disabled={row.status !== "OPEN"}
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => void showParticipants(row.id)}
                >
                  <Users className="h-4 w-4" /> Participants
                </Button>
              </div>
              {participants[row.id] && (
                <div className="mt-4 border-t border-[#eee7e1] pt-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#897b70]">
                    Participants
                  </p>
                  {participants[row.id].length === 0 ? (
                    <p className="mt-2 text-sm text-gray-500">
                      No participants yet.
                    </p>
                  ) : (
                    <ul className="mt-2 space-y-2">
                      {participants[row.id].map((participant) => (
                        <li key={participant.id} className="text-sm">
                          <b>{participant.fullName}</b>{" "}
                          <span className="text-gray-500">
                            {participant.email}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

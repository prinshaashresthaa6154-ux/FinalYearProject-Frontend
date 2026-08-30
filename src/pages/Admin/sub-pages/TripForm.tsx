import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import type { ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { getApiError } from "../../../api/axios";
import {
  Button,
  FileUpload,
  Input,
  LoadingSpinner,
  Textarea,
} from "../../../components/ui";
import {
  categoryService,
  type Category,
} from "../../../services/categoryService";
import {
  destinationService,
  type Destination,
  type DestinationDifficulty,
} from "../../../services/destinationService";
import {
  decodeItineraryDay,
  encodeItineraryDay,
  tripService,
  type ItineraryDay,
  type TripInput,
} from "../../../services/tripService";

const emptyDay = (number: number): ItineraryDay => ({
  dayNumber: number,
  title: `Day ${number}`,
  description: "",
  activities: "",
  accommodation: "",
  meals: "",
});
const initial: TripInput = {
  title: "",
  shortDescription: "",
  description: "",
  destinationId: 0,
  categoryId: 0,
  duration: 1,
  startLocation: "",
  endLocation: "",
  itinerary: [encodeItineraryDay(emptyDay(1))],
  price: 0,
  currency: "NPR",
  maxParticipants: 10,
  minimumParticipants: 1,
  startDate: null,
  endDate: null,
  bookingStartDate: null,
  bookingEndDate: null,
  inclusions: [""],
  exclusions: [""],
  requirements: [""],
  difficulty: "MODERATE",
  groupJoinEnabled: false,
};
const difficulties: DestinationDifficulty[] = [
  "EASY",
  "MODERATE",
  "CHALLENGING",
  "DIFFICULT",
  "EXTREME",
];
const toDate = (value?: string | null) => value ?? "";

export default function TripForm() {
  const { id } = useParams();
  const tripId = id ? Number(id) : null;
  const navigate = useNavigate();
  const [form, setForm] = useState<TripInput>(initial);
  const [days, setDays] = useState<ItineraryDay[]>([emptyDay(1)]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [featured, setFeatured] = useState<File | null>(null);
  const [gallery, setGallery] = useState<File[]>([]);
  const [loading, setLoading] = useState(Boolean(tripId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    Promise.all([
      categoryService.myCategories({
        status: "ACTIVE",
        page: 0,
        size: 100,
        sortBy: "name",
        sortDir: "asc",
      }),
      destinationService.adminList({
        status: "ACTIVE",
        page: 0,
        size: 100,
        sortBy: "name",
        sortDir: "asc",
      }),
    ])
      .then(([c, d]) => {
        setCategories(c.data.data?.content ?? []);
        setDestinations(d.data.data?.content ?? []);
      })
      .catch((e) => setError(getApiError(e).message));
    if (tripId)
      tripService
        .adminById(tripId)
        .then((r) => {
          const t = r.data.data;
          if (t) {
            setForm({
              title: t.title,
              shortDescription: t.shortDescription,
              description: t.description,
              destinationId: t.destination.id,
              categoryId: t.category.id,
              duration: t.duration,
              startLocation: t.startLocation,
              endLocation: t.endLocation,
              itinerary: t.itinerary,
              price: Number(t.price),
              currency: t.currency,
              maxParticipants: t.maxParticipants,
              minimumParticipants: t.minimumParticipants,
              startDate: t.startDate,
              endDate: t.endDate,
              bookingStartDate: t.bookingStartDate,
              bookingEndDate: t.bookingEndDate,
              inclusions: t.inclusions,
              exclusions: t.exclusions,
              requirements: t.requirements,
              difficulty: t.difficulty,
              groupJoinEnabled: false,
            });
            setDays(t.itinerary.map(decodeItineraryDay));
          }
        })
        .catch((e) => setError(getApiError(e).message))
        .finally(() => setLoading(false));
  }, [tripId]);
  const update = <K extends keyof TripInput>(key: K, value: TripInput[K]) =>
    setForm((current) => ({ ...current, [key]: value }));
  const updateDuration = (duration: number) => {
    const nextDuration = Math.max(1, Math.min(365, duration || 1));
    setForm((current) => ({ ...current, duration: nextDuration }));
    setDays((current) =>
      Array.from(
        { length: nextDuration },
        (_, index) => current[index] ?? emptyDay(index + 1),
      ),
    );
  };
  const updateDay = (index: number, value: ItineraryDay) =>
    setDays((current) => current.map((day, i) => (i === index ? value : day)));
  const listUpdate = (
    key: "inclusions" | "exclusions" | "requirements",
    index: number,
    value: string,
  ) =>
    setForm((current) => ({
      ...current,
      [key]: current[key].map((item, i) => (i === index ? value : item)),
    }));
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    const itinerary = days.map((day, index) =>
      encodeItineraryDay({ ...day, dayNumber: index + 1 }),
    );
    const data = {
      ...form,
      groupJoinEnabled: false,
      title: form.title.trim(),
      shortDescription: form.shortDescription.trim(),
      description: form.description.trim(),
      startLocation: form.startLocation.trim(),
      endLocation: form.endLocation.trim(),
      currency: form.currency.trim().toUpperCase(),
      itinerary,
      inclusions: form.inclusions.map((v) => v.trim()).filter(Boolean),
      exclusions: form.exclusions.map((v) => v.trim()).filter(Boolean),
      requirements: form.requirements.map((v) => v.trim()).filter(Boolean),
    };
    if (!data.destinationId || !data.categoryId) {
      setError("Select a category and destination.");
      setSaving(false);
      return;
    }
    if (data.minimumParticipants > data.maxParticipants) {
      setError("Minimum participants cannot exceed maximum participants.");
      setSaving(false);
      return;
    }
    try {
      if (tripId) await tripService.update(tripId, data, featured, gallery);
      else await tripService.create(data, featured, gallery);
      navigate("/admin/trips", { replace: true });
    } catch (e) {
      const details = getApiError(e);
      const fieldErrors = Object.entries(details.validationErrors)
        .map(([field, message]) => `${field}: ${message}`)
        .join(" ");
      setError(fieldErrors || details.message);
    } finally {
      setSaving(false);
    }
  };
  if (loading)
    return (
      <div className="grid min-h-64 place-items-center">
        <LoadingSpinner label="Loading trip" />
      </div>
    );
  return (
    <div className="mx-auto max-w-5xl">
      <Link
        to="/admin/trips"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#8f211c]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to trips
      </Link>
      <form onSubmit={submit} className="mt-5 space-y-5">
        <Section title="Basic details">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Title"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              required
              maxLength={180}
              className="sm:col-span-2"
            />
            <Input
              label="Short description"
              value={form.shortDescription}
              onChange={(e) => update("shortDescription", e.target.value)}
              required
              maxLength={500}
              className="sm:col-span-2"
            />
            <Textarea
              label="Full description"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              required
              maxLength={5000}
              rows={7}
              className="sm:col-span-2"
            />
          </div>
        </Section>
        <Section title="Classification">
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Category"
              value={form.categoryId}
              onChange={(v) => update("categoryId", Number(v))}
              options={categories.map((v) => [v.id, v.name])}
            />
            <Select
              label="Destination"
              value={form.destinationId}
              onChange={(v) => update("destinationId", Number(v))}
              options={destinations.map((v) => [
                v.id,
                `${v.name} (${v.province})`,
              ])}
            />
          </div>
        </Section>
        <Section title="Duration and pricing">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Duration (days)"
              type="number"
              min="1"
              max="365"
              value={form.duration}
              onChange={(event) => updateDuration(Number(event.target.value))}
              required
            />
            <Input
              label="Currency"
              value={form.currency}
              onChange={(e) => update("currency", e.target.value.toUpperCase())}
              maxLength={3}
              required
            />
            <Input
              label="Start location"
              value={form.startLocation}
              onChange={(e) => update("startLocation", e.target.value)}
              required
            />
            <Input
              label="End location"
              value={form.endLocation}
              onChange={(e) => update("endLocation", e.target.value)}
              required
            />
            <Input
              label="Price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => update("price", Number(e.target.value))}
              required
            />
            <Input
              label="Maximum participants"
              type="number"
              min="1"
              value={form.maxParticipants}
              onChange={(e) =>
                update("maxParticipants", Number(e.target.value))
              }
              required
            />
            <Input
              label="Minimum participants"
              type="number"
              min="1"
              value={form.minimumParticipants}
              onChange={(e) =>
                update("minimumParticipants", Number(e.target.value))
              }
              required
            />
            <Select
              label="Difficulty"
              value={form.difficulty}
              onChange={(v) => update("difficulty", v as DestinationDifficulty)}
              options={difficulties.map((v) => [v, v])}
            />
          </div>
        </Section>
        <Section title="Dates">
          <div className="grid gap-4 sm:grid-cols-2">
            <DateInput
              label="Start date"
              value={form.startDate}
              onChange={(v) => update("startDate", v || null)}
            />
            <DateInput
              label="End date"
              value={form.endDate}
              onChange={(v) => update("endDate", v || null)}
            />
            <DateInput
              label="Booking start"
              value={form.bookingStartDate}
              onChange={(v) => update("bookingStartDate", v || null)}
            />
            <DateInput
              label="Booking end"
              value={form.bookingEndDate}
              onChange={(v) => update("bookingEndDate", v || null)}
            />
          </div>
        </Section>
        <Section title="Itinerary">
          <div className="space-y-4">
            {days.map((day, index) => (
              <div
                key={index}
                className="rounded-xl border border-[#e5ddd6] bg-[#fcfaf7] p-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-bold">
                    Day {index + 1}
                  </h3>
                  {days.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setDays((current) =>
                          current.filter((_, i) => i !== index),
                        )
                      }
                      className="text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <Input
                    label="Day title"
                    value={day.title}
                    onChange={(e) =>
                      updateDay(index, { ...day, title: e.target.value })
                    }
                    required
                  />
                  <Input
                    label="Activities"
                    value={day.activities}
                    onChange={(e) =>
                      updateDay(index, { ...day, activities: e.target.value })
                    }
                    placeholder="Trek, visit, transfer"
                    required
                  />
                  <Textarea
                    label="Description"
                    value={day.description}
                    onChange={(e) =>
                      updateDay(index, { ...day, description: e.target.value })
                    }
                    required
                    rows={3}
                  />
                  <Textarea
                    label="Accommodation"
                    value={day.accommodation}
                    onChange={(e) =>
                      updateDay(index, {
                        ...day,
                        accommodation: e.target.value,
                      })
                    }
                    rows={3}
                  />
                  <Input
                    label="Meals"
                    value={day.meals}
                    onChange={(e) =>
                      updateDay(index, { ...day, meals: e.target.value })
                    }
                    placeholder="Breakfast, lunch, dinner"
                    className="sm:col-span-2"
                  />
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                setDays((current) => [...current, emptyDay(current.length + 1)])
              }
            >
              <Plus className="h-4 w-4" /> Add itinerary day
            </Button>
          </div>
        </Section>
        <Section title="Inclusions, exclusions, and requirements">
          <div className="grid gap-5 md:grid-cols-3">
            <ListEditor
              label="Inclusions"
              values={form.inclusions}
              onChange={(i, v) => listUpdate("inclusions", i, v)}
              onAdd={() => update("inclusions", [...form.inclusions, ""])}
            />
            <ListEditor
              label="Exclusions"
              values={form.exclusions}
              onChange={(i, v) => listUpdate("exclusions", i, v)}
              onAdd={() => update("exclusions", [...form.exclusions, ""])}
            />
            <ListEditor
              label="Requirements"
              values={form.requirements}
              onChange={(i, v) => listUpdate("requirements", i, v)}
              onAdd={() => update("requirements", [...form.requirements, ""])}
            />
          </div>
        </Section>
        <Section title="Media">
          <div className="grid gap-5 sm:grid-cols-2">
            <FileUpload
              label={
                tripId ? "Replace featured image (optional)" : "Featured image"
              }
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setFeatured(e.target.files?.[0] ?? null)}
            />
            <FileUpload
              label="Gallery images"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={(e) => setGallery(Array.from(e.target.files ?? []))}
            />
            <p className="text-sm text-[#75695f]">
              Package group offers are disabled. Guide-led departures are managed from Group Trips.
            </p>
          </div>
        </Section>
        {error && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {error}
          </p>
        )}
        <div className="flex flex-wrap justify-end gap-3 rounded-2xl border border-[#eae3dc] bg-white p-5">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate("/admin/trips")}
          >
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            <Save className="h-4 w-4" /> Save Draft
          </Button>
        </div>
      </form>
    </div>
  );
}
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-[#eae3dc] bg-white p-6 shadow-sm">
      <h2 className="font-display text-2xl font-bold">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}
function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  options: Array<[string | number, string]>;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-semibold text-[#40382f]">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="min-h-10 w-full rounded-lg border border-[#d8cec0] bg-white px-3 py-2 text-sm"
      >
        <option value={0} disabled>
          Select {label.toLowerCase()}
        </option>
        {options.map(([id, name]) => (
          <option key={id} value={id}>
            {name}
          </option>
        ))}
      </select>
    </label>
  );
}
function DateInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: string | null;
  onChange: (value: string) => void;
}) {
  return (
    <Input
      label={label}
      type="date"
      value={toDate(value)}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
function ListEditor({
  label,
  values,
  onChange,
  onAdd,
}: {
  label: string;
  values: string[];
  onChange: (index: number, value: string) => void;
  onAdd: () => void;
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-[#40382f]">{label}</p>
      <div className="mt-2 space-y-2">
        {values.map((value, index) => (
          <Input
            key={index}
            value={value}
            onChange={(e) => onChange(index, e.target.value)}
            placeholder={`${label} item`}
            required={label === "Inclusions"}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={onAdd}
        className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#a62922]"
      >
        <Plus className="h-3.5 w-3.5" /> Add item
      </button>
    </div>
  );
}

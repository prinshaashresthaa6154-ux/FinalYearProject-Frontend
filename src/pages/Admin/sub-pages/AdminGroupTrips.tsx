import { Link } from "react-router";

export default function AdminGroupTrips() {
  return (
    <section className="rounded-2xl border border-[#eae3dc] bg-white p-8 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-widest text-[#b31919]">
        Package groups retired
      </p>
      <h2 className="mt-2 font-display text-3xl font-bold">
        Group offers are disabled
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">
        Package-level group joining is no longer available. Group departures are
        created by approved freelance guides and listed in the guide-led Group
        Trips catalog.
      </p>
      <Link
        to="/grouptrips"
        className="mt-6 inline-flex rounded-lg bg-[#b31919] px-4 py-2.5 text-sm font-bold text-white"
      >
        View guide group trips
      </Link>
    </section>
  );
}

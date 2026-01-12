import TripFinder from '@/app/components/trip-finder/TripFinder';

export default function Page() {
  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">TripMatch<span>✈️</span></h1>
        <p className="text-white">
          Tell us what you want — we’ll show destinations you can realistically afford.
        </p>
      </div>

      <div className="mt-6">
        <TripFinder />
      </div>
    </main>
  );
}

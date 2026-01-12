'use client';

import { useMemo, useState } from 'react';

type SpendStyle = 'BUDGET' | 'MID' | 'COMFORT';

type ApiResult = {
  destination: {
    id: string;
    city: string;
    country: string;
    iataCityCode?: string | null;
  };
  cost: {
    flightEur: number;
    hotelEur: number;
    dailyEur: number;
    totalEur: number;
    rangeLowEur: number;
    rangeHighEur: number;
    assumptions: string[];
  };
};

type ApiResponse = {
  prefs: any;
  results: ApiResult[];
};

function eur(n: number) {
  // Simple formatting (good enough for MVP)
  return `€${Math.round(n).toLocaleString('de-DE')}`;
}

export default function TripFinder() {
  // Questionnaire state (MVP)
  const [originIata, setOriginIata] = useState('BER');
  const [budgetMax, setBudgetMax] = useState(1200);
  const [nights, setNights] = useState(5);
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [spendStyle, setSpendStyle] = useState<SpendStyle>('MID');

  // Results state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ApiResult[]>([]);

  const assumptionsSummary = useMemo(() => {
    return `${originIata} · ${nights} nights · ${month}/${year} · ${spendStyle}`;
  }, [originIata, nights, month, year, spendStyle]);

  async function fetchRecommendations() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originIata,
          nights,
          travelers: 2,
          year,
          month,
          spendStyle,
        }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`API ${res.status}: ${txt}`);
      }

      const data = (await res.json()) as ApiResponse;
      setResults(data.results ?? []);
    } catch (e: any) {
      setError(e?.message ?? 'Unknown error');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  // Client-side budget filter (fast & simple for MVP)
  const filtered = useMemo(() => {
    return results.filter((r) => r.cost.rangeLowEur <= budgetMax);
  }, [results, budgetMax]);

  return (
    <div className="space-y-6">
      {/* Questionnaire */}
      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-500">Find a trip</h2>
            <p className="text-sm text-gray-500">Assumptions: {assumptionsSummary}</p>
          </div>

          <button
            onClick={fetchRecommendations}
            disabled={loading}
            className="rounded-2xl border px-4 py-2 font-bold bg-black hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
          >
            {loading ? 'Loading…' : 'Show destinations'}
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-5">
          <label className="space-y-1">
            <div className="text-sm font-medium text-gray-500">Origin (IATA)</div>
            <input
              value={originIata}
              onChange={(e) => setOriginIata(e.target.value.toUpperCase().slice(0, 3))}
              placeholder="BER"
              className="w-full rounded-xl border px-3 py-2 text-gray-400"
            />
            <div className="text-xs text-gray-700">Example: BER, MUC, FRA</div>
          </label>

          <label className="space-y-1">
            <div className="text-sm font-medium text-gray-500">Max budget</div>
            <input
              type="number"
              min={200}
              step={50}
              value={budgetMax}
              onChange={(e) => setBudgetMax(Number(e.target.value))}
              className="w-full rounded-xl border px-3 py-2 text-gray-400"
            />
            <div className="text-xs text-gray-700">Filters results locally</div>
          </label>

          <label className="space-y-1">
            <div className="text-sm font-medium text-gray-500">Nights</div>
            <input
              type="number"
              min={1}
              max={21}
              value={nights}
              onChange={(e) => setNights(Number(e.target.value))}
              className="w-full rounded-xl border px-3 py-2 text-gray-400"
            />
          </label>

          <label className="space-y-1">
            <div className="text-sm font-medium text-gray-500">Month</div>
            <input
              type="number"
              min={1}
              max={12}
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="w-full rounded-xl border px-3 py-2 text-gray-400"
            />
          </label>

          <label className="space-y-1">
            <div className="text-sm font-medium text-gray-500">Spend style</div>
            <select
              value={spendStyle}
              onChange={(e) => setSpendStyle(e.target.value as SpendStyle)}
              className="w-full rounded-xl border px-3 py-2 text-gray-400"
            >
              <option value="BUDGET">Budget</option>
              <option value="MID">Mid</option>
              <option value="COMFORT">Comfort</option>
            </select>
          </label>
        </div>

        <div className="mt-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <label className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Year</span>
            <input
              type="number"
              min={new Date().getFullYear()}
              max={new Date().getFullYear() + 2}
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-28 rounded-xl border px-3 py-2 text-gray-400"
            />
          </label>

          <div className="text-xs text-gray-700">
            Tip: This is an MVP estimate. We’ll show ranges to keep it honest.
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </section>

      {/* Results */}
      <section className="space-y-3">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-xl font-semibold">Results</h2>
          <div className="text-sm text-white">
            Showing {filtered.length} / {results.length} under {eur(budgetMax)} (low-end)
          </div>
        </div>

        {(!loading && results.length === 0) && (
          <div className="rounded-2xl border bg-white p-6 text-gray-700 shadow-sm">
            Click <span className="font-medium">Show destinations</span> to load results.
          </div>
        )}

        {(!loading && results.length > 0 && filtered.length === 0) && (
          <div className="rounded-2xl border bg-white p-6 text-gray-700 shadow-sm">
            No destinations fit your budget. Try increasing the max budget or reducing nights.
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filtered.map((r) => (
            <div key={r.destination.id} className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-lg font-semibold">
                    {r.destination.city}, {r.destination.country}
                  </div>
                  <div className="text-sm text-gray-700">
                    Estimated total: <span className="font-medium">{eur(r.cost.totalEur)}</span>{' '}
                    <span className="text-gray-700">
                      ({eur(r.cost.rangeLowEur)}–{eur(r.cost.rangeHighEur)})
                    </span>
                  </div>
                </div>

                {r.destination.iataCityCode && (
                  <div className="rounded-xl border px-2 py-1 text-xs text-gray-700">
                    {r.destination.iataCityCode}
                  </div>
                )}
              </div>

              <div className="mt-3 text-sm text-gray-800">
                Flights {eur(r.cost.flightEur)} · Hotel {eur(r.cost.hotelEur)} · Daily {eur(r.cost.dailyEur)}
              </div>

              <div className="mt-3">
                <div className="text-xs font-medium text-gray-700">Assumptions</div>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-xs text-gray-700">
                  {r.cost.assumptions.slice(0, 4).map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 flex gap-2">
                <button className="rounded-2xl border px-3 py-2 text-sm hover:bg-gray-50">
                  View details
                </button>
                <button className="rounded-2xl border px-3 py-2 text-sm hover:bg-gray-50">
                  Save
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

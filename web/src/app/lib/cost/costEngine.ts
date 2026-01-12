import { DailySpendTier, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type TripPrefs = {
  originIata: string;     // e.g. BER
  nights: number;         // e.g. 5
  travelers: number;      // e.g. 2
  year: number;           // e.g. 2026
  month: number;          // 1..12
  hotelClass: 'BUDGET' | 'MID'; // MVP: keep simple
  spendStyle: DailySpendTier;   // BUDGET/MID/COMFORT
};

export type CostBreakdown = {
  flightEur: number;
  hotelEur: number;
  dailyEur: number;
  totalEur: number;
  rangeLowEur: number;
  rangeHighEur: number;
  assumptions: string[];
};

const DAILY_SPEND_EUR: Record<DailySpendTier, number> = {
  BUDGET: 35,
  MID: 60,
  COMFORT: 90
};

export async function estimateTripCost(destinationId: string, prefs: TripPrefs): Promise<CostBreakdown> {
  const dest = await prisma.destination.findUnique({
    where: { id: destinationId },
    include: { seasonality: true }
  });
  if (!dest) throw new Error('Destination not found');

  const season = dest.seasonality.find((s) => s.month === prefs.month);
  const multiplier = season?.multiplier ?? 1.0;

  // Flights: live later, cached now (fallback to heuristic if no cache)
  let flightEur = 220; // fallback default
  if (dest.iataCityCode) {
    const cached = await prisma.flightQuoteCache.findUnique({
      where: {
        originIata_destIataCity_year_month: {
          originIata: prefs.originIata,
          destIataCity: dest.iataCityCode,
          year: prefs.year,
          month: prefs.month
        }
      }
    });
    if (cached) flightEur = cached.medianEur;
  }

  const hotelBase = dest.hotelNightEur * prefs.nights;
  const hotelEur = Math.round(hotelBase * multiplier);

  const dailyBase = DAILY_SPEND_EUR[prefs.spendStyle] * (prefs.nights + 1); // days = nights+1
  const dailyEur = Math.round(dailyBase * multiplier);

  const totalEur = flightEur + hotelEur + dailyEur;

  // Confidence range (protect credibility)
  const rangeLowEur = Math.round(totalEur * 0.9);
  const rangeHighEur = Math.round(totalEur * 1.15);

  return {
    flightEur,
    hotelEur,
    dailyEur,
    totalEur,
    rangeLowEur,
    rangeHighEur,
    assumptions: [
      `From ${prefs.originIata}`,
      `${prefs.nights} nights`,
      `Seasonality x${multiplier.toFixed(2)}`,
      `Daily spend: ${prefs.spendStyle}`,
      `Flight: median estimate (cached or fallback)`
    ]
  };
}

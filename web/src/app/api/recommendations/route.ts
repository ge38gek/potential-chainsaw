import { NextResponse } from 'next/server';
import { PrismaClient, DailySpendTier } from '@prisma/client';
import { estimateTripCost } from '@/app/lib/cost/costEngine';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const body = await req.json();

  const prefs = {
    originIata: body.originIata ?? 'BER',
    nights: Number(body.nights ?? 5),
    travelers: Number(body.travelers ?? 2),
    year: Number(body.year ?? new Date().getFullYear()),
    month: Number(body.month ?? new Date().getMonth() + 1),
    hotelClass: 'MID' as const,
    spendStyle: (body.spendStyle as DailySpendTier) ?? DailySpendTier.MID
  };

  const destinations = await prisma.destination.findMany({ take: 30, orderBy: { city: 'asc' } });

  const results = await Promise.all(
    destinations.map(async (d) => {
      const cost = await estimateTripCost(d.id, prefs);
      return { destination: d, cost };
    })
  );

  // Sort by "best value": lowest total for now (later mix fit score)
  results.sort((a, b) => a.cost.totalEur - b.cost.totalEur);

  return NextResponse.json({ prefs, results });
}

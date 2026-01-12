import { PrismaClient, DailySpendTier, SeasonType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const data = [
    {
      city: 'Lisbon',
      country: 'Portugal',
      iataCityCode: 'LIS',
      lat: 38.7223,
      lng: -9.1393,
      hotelNightEur: 120,
      dailySpendTier: DailySpendTier.MID,
      seasonality: [
        { month: 1, season: SeasonType.LOW, multiplier: 0.85 },
        { month: 6, season: SeasonType.HIGH, multiplier: 1.25 },
        { month: 9, season: SeasonType.SHOULDER, multiplier: 1.0 }
      ]
    },
    {
      city: 'Budapest',
      country: 'Hungary',
      iataCityCode: 'BUD',
      lat: 47.4979,
      lng: 19.0402,
      hotelNightEur: 95,
      dailySpendTier: DailySpendTier.BUDGET,
      seasonality: [
        { month: 1, season: SeasonType.LOW, multiplier: 0.9 },
        { month: 7, season: SeasonType.HIGH, multiplier: 1.2 },
        { month: 10, season: SeasonType.SHOULDER, multiplier: 1.0 }
      ]
    }
  ];

  for (const d of data) {
    await prisma.destination.upsert({
      where: { city_country: { city: d.city, country: d.country } } as any,
      update: {},
      create: {
        city: d.city,
        country: d.country,
        iataCityCode: d.iataCityCode,
        lat: d.lat,
        lng: d.lng,
        hotelNightEur: d.hotelNightEur,
        dailySpendTier: d.dailySpendTier,
        seasonality: {
          create: Array.from({ length: 12 }).map((_, i) => {
            const month = i + 1;
            const found = d.seasonality.find((x) => x.month === month);
            return found
              ? found
              : { month, season: SeasonType.SHOULDER, multiplier: 1.0 };
          })
        }
      }
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    return prisma.$disconnect().finally(() => process.exit(1));
  });

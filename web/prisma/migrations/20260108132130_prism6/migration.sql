-- CreateEnum
CREATE TYPE "DailySpendTier" AS ENUM ('BUDGET', 'MID', 'COMFORT');

-- CreateEnum
CREATE TYPE "SeasonType" AS ENUM ('LOW', 'SHOULDER', 'HIGH');

-- CreateTable
CREATE TABLE "Destination" (
    "id" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "iataCityCode" TEXT,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "hotelNightEur" INTEGER NOT NULL,
    "dailySpendTier" "DailySpendTier" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Destination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeasonalityMonth" (
    "id" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "season" "SeasonType" NOT NULL,
    "multiplier" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "SeasonalityMonth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlightQuoteCache" (
    "id" TEXT NOT NULL,
    "originIata" TEXT NOT NULL,
    "destIataCity" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "medianEur" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FlightQuoteCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Destination_country_idx" ON "Destination"("country");

-- CreateIndex
CREATE INDEX "Destination_city_idx" ON "Destination"("city");

-- CreateIndex
CREATE INDEX "SeasonalityMonth_month_idx" ON "SeasonalityMonth"("month");

-- CreateIndex
CREATE UNIQUE INDEX "SeasonalityMonth_destinationId_month_key" ON "SeasonalityMonth"("destinationId", "month");

-- CreateIndex
CREATE INDEX "FlightQuoteCache_originIata_idx" ON "FlightQuoteCache"("originIata");

-- CreateIndex
CREATE INDEX "FlightQuoteCache_destIataCity_idx" ON "FlightQuoteCache"("destIataCity");

-- CreateIndex
CREATE UNIQUE INDEX "FlightQuoteCache_originIata_destIataCity_year_month_key" ON "FlightQuoteCache"("originIata", "destIataCity", "year", "month");

-- AddForeignKey
ALTER TABLE "SeasonalityMonth" ADD CONSTRAINT "SeasonalityMonth_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE CASCADE ON UPDATE CASCADE;

/*
  Warnings:

  - A unique constraint covering the columns `[city,country]` on the table `Destination` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Destination_city_country_key" ON "Destination"("city", "country");

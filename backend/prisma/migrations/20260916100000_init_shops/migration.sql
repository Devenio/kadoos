-- CreateSchema
CREATE TABLE "Shop" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "nameEn" TEXT NOT NULL,
    "nameFa" TEXT NOT NULL,
    "taglineEn" TEXT NOT NULL,
    "taglineFa" TEXT NOT NULL,
    "neighborhoodEn" TEXT NOT NULL,
    "neighborhoodFa" TEXT NOT NULL,
    "cityEn" TEXT NOT NULL,
    "cityFa" TEXT NOT NULL,
    "descriptionEn" TEXT NOT NULL,
    "descriptionFa" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shop_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Barber" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameFa" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "titleFa" TEXT NOT NULL,
    "bioEn" TEXT NOT NULL,
    "bioFa" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Barber_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameFa" TEXT NOT NULL,
    "durationMin" INTEGER NOT NULL,
    "priceToman" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ShopHours" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "weekday" INTEGER NOT NULL,
    "closed" BOOLEAN NOT NULL DEFAULT false,
    "opensAt" TEXT,
    "closesAt" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopHours_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Shop_slug_key" ON "Shop"("slug");
CREATE INDEX "Shop_published_sortOrder_idx" ON "Shop"("published", "sortOrder");
CREATE INDEX "Barber_shopId_sortOrder_idx" ON "Barber"("shopId", "sortOrder");
CREATE INDEX "Service_shopId_sortOrder_idx" ON "Service"("shopId", "sortOrder");
CREATE UNIQUE INDEX "ShopHours_shopId_weekday_key" ON "ShopHours"("shopId", "weekday");

ALTER TABLE "Barber" ADD CONSTRAINT "Barber_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Service" ADD CONSTRAINT "Service_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ShopHours" ADD CONSTRAINT "ShopHours_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

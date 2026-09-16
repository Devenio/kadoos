-- AlterTable
ALTER TABLE "Shop" ADD COLUMN "addressEn" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Shop" ADD COLUMN "addressFa" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Shop" ADD COLUMN "lat" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Shop" ADD COLUMN "lng" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Shop" ADD COLUMN "photoUrl" TEXT NOT NULL DEFAULT '';

UPDATE "Shop"
SET
  "addressEn" = '12 Gandhi Street, above Vanak Square',
  "addressFa" = 'خیابان گاندی ۱۲، بالای میدان ونک',
  "lat" = 35.7572,
  "lng" = 51.4099,
  "photoUrl" = 'https://images.unsplash.com/photo-1503951914875-bfd160836fd3?auto=format&fit=crop&w=1400&q=80'
WHERE "slug" = 'farhad';

UPDATE "Shop"
SET
  "addressEn" = 'Shahrdari Street, above Tajrish Square',
  "addressFa" = 'خیابان شهرداری، بالای میدان تجریش',
  "lat" = 35.8044,
  "lng" = 51.4347,
  "photoUrl" = 'https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&w=1400&q=80'
WHERE "slug" = 'siah';

UPDATE "Shop"
SET
  "addressEn" = 'Near Naziabad Metro, south Tehran',
  "addressFa" = 'نزدیک مترو نازی‌آباد، جنوب تهران',
  "lat" = 35.6478,
  "lng" = 51.3967,
  "photoUrl" = 'https://images.unsplash.com/photo-1599351431202-1e0f013fdcec?auto=format&fit=crop&w=1400&q=80'
WHERE "slug" = 'khosrow';

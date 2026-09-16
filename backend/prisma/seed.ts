import bcrypt from 'bcryptjs';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaClient } from '../src/generated/prisma/client.js';

const weekdays = [0, 1, 2, 3, 4, 5, 6] as const;

type HoursSpec = {
  closedOn: number[];
  opensAt: string;
  closesAt: string;
};

function hours(spec: HoursSpec) {
  return weekdays.map((weekday) => {
    const closed = spec.closedOn.includes(weekday);
    return {
      weekday,
      closed,
      opensAt: closed ? null : spec.opensAt,
      closesAt: closed ? null : spec.closesAt,
    };
  });
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is required');
  }

  const pool = new Pool({ connectionString });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  try {
    await prisma.appointment.deleteMany();
    await prisma.user.deleteMany();
    await prisma.shopHours.deleteMany();
    await prisma.service.deleteMany();
    await prisma.barber.deleteMany();
    await prisma.shop.deleteMany();

    const farhad = await prisma.shop.create({
      data: {
        slug: 'farhad',
        sortOrder: 1,
        nameEn: 'Farhad',
        nameFa: 'فرهاد',
        taglineEn: 'A quiet chair in Vanak.',
        taglineFa: 'صندلی آرام در ونک',
        neighborhoodEn: 'Vanak',
        neighborhoodFa: 'ونک',
        cityEn: 'Tehran',
        cityFa: 'تهران',
        descriptionEn:
          'Farhad keeps a small room above the square. The chairs are few, the scissors are slow, and the conversation is optional.',
        descriptionFa:
          'فرهاد یک اتاق کوچک بالای میدان دارد. صندلی‌ها کم‌اند، قیچی آرام است، و حرف زدن اجباری نیست.',
        addressEn: '12 Gandhi Street, above Vanak Square',
        addressFa: 'خیابان گاندی ۱۲، بالای میدان ونک',
        lat: 35.7572,
        lng: 51.4099,
        photoUrl:
          'https://images.unsplash.com/photo-1503951914875-bfd160836fd3?auto=format&fit=crop&w=1400&q=80',
        barbers: {
          create: [
            {
              sortOrder: 1,
              nameEn: 'Farhad Karimi',
              nameFa: 'فرهاد کریمی',
              titleEn: 'Master barber',
              titleFa: 'استاد آرایشگر',
              bioEn: 'Twenty years on the chair. Skin fades and a clean nape.',
              bioFa: 'بیست سال روی صندلی. فید پوست و پس‌گردن تمیز.',
            },
            {
              sortOrder: 2,
              nameEn: 'Amin',
              nameFa: 'امین',
              titleEn: 'Barber',
              titleFa: 'آرایشگر',
              bioEn: 'Beards, outlines, and the last appointment of the day.',
              bioFa: 'ریش، خط کنار، و آخرین نوبت روز.',
            },
          ],
        },
        services: {
          create: [
            { sortOrder: 1, nameEn: 'Classic cut', nameFa: 'کات کلاسیک', durationMin: 45, priceToman: 850000 },
            { sortOrder: 2, nameEn: 'Skin fade', nameFa: 'فید پوست', durationMin: 50, priceToman: 950000 },
            { sortOrder: 3, nameEn: 'Beard', nameFa: 'ریش', durationMin: 25, priceToman: 450000 },
            { sortOrder: 4, nameEn: 'Hot towel shave', nameFa: 'اصلاح با حوله گرم', durationMin: 35, priceToman: 600000 },
          ],
        },
        hours: {
          create: hours({ closedOn: [5], opensAt: '10:00', closesAt: '20:00' }),
        },
      },
    });

    const siah = await prisma.shop.create({
      data: {
        slug: 'siah',
        sortOrder: 2,
        nameEn: 'Siah',
        nameFa: 'سیاه',
        taglineEn: 'Late light, Tajrish.',
        taglineFa: 'نور دیر، تجریش',
        neighborhoodEn: 'Tajrish',
        neighborhoodFa: 'تجریش',
        cityEn: 'Tehran',
        cityFa: 'تهران',
        descriptionEn:
          'A darker room for men who come after work. Music low, clippers fast, the square still busy when you leave.',
        descriptionFa:
          'اتاقی تیره‌تر برای مردهایی که بعد از کار می‌آیند. موسیقی آرام، ماشین تند، و میدان هنوز شلوغ است وقتی بیرون می‌روید.',
        addressEn: 'Shahrdari Street, above Tajrish Square',
        addressFa: 'خیابان شهرداری، بالای میدان تجریش',
        lat: 35.8044,
        lng: 51.4347,
        photoUrl:
          'https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&w=1400&q=80',
        barbers: {
          create: [
            {
              sortOrder: 1,
              nameEn: 'Navid',
              nameFa: 'نوید',
              titleEn: 'Lead barber',
              titleFa: 'آرایشگر اصلی',
              bioEn: 'Sharp outlines after dark. Prefers a tight fade.',
              bioFa: 'خط تیز بعد از غروب. فید جمع را ترجیح می‌دهد.',
            },
            {
              sortOrder: 2,
              nameEn: 'Pouya',
              nameFa: 'پویا',
              titleEn: 'Barber',
              titleFa: 'آرایشگر',
              bioEn: 'Texture, length, and a beard that still looks like a beard.',
              bioFa: 'بافت، بلندی، و ریشی که هنوز شبیه ریش است.',
            },
          ],
        },
        services: {
          create: [
            { sortOrder: 1, nameEn: 'Night fade', nameFa: 'فید شب', durationMin: 50, priceToman: 1100000 },
            { sortOrder: 2, nameEn: 'Crop', nameFa: 'کراپ', durationMin: 40, priceToman: 900000 },
            { sortOrder: 3, nameEn: 'Beard sculpt', nameFa: 'فرم ریش', durationMin: 30, priceToman: 550000 },
          ],
        },
        hours: {
          create: hours({ closedOn: [], opensAt: '12:00', closesAt: '22:00' }),
        },
      },
    });

    const khosrow = await prisma.shop.create({
      data: {
        slug: 'khosrow',
        sortOrder: 3,
        nameEn: 'Khosrow',
        nameFa: 'خسرو',
        taglineEn: 'Father, son, and the same chair.',
        taglineFa: 'پدر، پسر، و همان صندلی',
        neighborhoodEn: 'Naziabad',
        neighborhoodFa: 'نازی‌آباد',
        cityEn: 'Tehran',
        cityFa: 'تهران',
        descriptionEn:
          'A neighborhood shop that has not changed its hours in a decade. You come for a cut you can live with until next month.',
        descriptionFa:
          'آرایشگاه محله که ساعتش ده سال عوض نشده. می‌آیید برای کاتی که تا ماه بعد با آن زندگی کنید.',
        addressEn: 'Near Naziabad Metro, south Tehran',
        addressFa: 'نزدیک مترو نازی‌آباد، جنوب تهران',
        lat: 35.6478,
        lng: 51.3967,
        photoUrl:
          'https://images.unsplash.com/photo-1599351431202-1e0f013fdcec?auto=format&fit=crop&w=1400&q=80',
        barbers: {
          create: [
            {
              sortOrder: 1,
              nameEn: 'Khosrow',
              nameFa: 'خسرو',
              titleEn: 'Owner',
              titleFa: 'صاحب مغازه',
              bioEn: 'Scissors, a comb, and the same stories.',
              bioFa: 'قیچی، شانه، و همان قصه‌ها.',
            },
            {
              sortOrder: 2,
              nameEn: 'Reza',
              nameFa: 'رضا',
              titleEn: 'Barber',
              titleFa: 'آرایشگر',
              bioEn: 'Learned the chair from his father. Faster with the clipper.',
              bioFa: 'صندلی را از پدر یاد گرفته. با ماشین تندتر است.',
            },
          ],
        },
        services: {
          create: [
            { sortOrder: 1, nameEn: 'Neighborhood cut', nameFa: 'کات محله', durationMin: 30, priceToman: 450000 },
            { sortOrder: 2, nameEn: 'Clipper cut', nameFa: 'کات ماشین', durationMin: 25, priceToman: 380000 },
            { sortOrder: 3, nameEn: 'Beard trim', nameFa: 'اصلاح ریش', durationMin: 15, priceToman: 200000 },
          ],
        },
        hours: {
          create: hours({ closedOn: [5], opensAt: '09:00', closesAt: '21:00' }),
        },
      },
    });

    const passwordHash = await bcrypt.hash('chair123', 10);
    await prisma.user.createMany({
      data: [
        {
          email: 'farhad@kadoos.local',
          passwordHash,
          name: 'Farhad',
          shopId: farhad.id,
        },
        {
          email: 'siah@kadoos.local',
          passwordHash,
          name: 'Navid',
          shopId: siah.id,
        },
        {
          email: 'khosrow@kadoos.local',
          passwordHash,
          name: 'Khosrow',
          shopId: khosrow.id,
        },
      ],
    });
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

await main();

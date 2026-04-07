import { PrismaClient, Prisma } from '@prisma/client';

export async function seedAchievements(prisma: PrismaClient) {
  const achievements = [
    {
      code: 'reckless',
      title: { en: 'Reckless', uk: 'Необачний' },
      description: {
        en: 'Break any equipment for the first time.',
        uk: 'Зламати щось зі спорядження вперше.',
      },
      imageUrl:
        'https://ysmdydtvfgtffymgillf.supabase.co/storage/v1/object/sign/Game/achievements_icons/achievement_reckless.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zYWEzNmIwMC1mZDM5LTRjNzYtOGY4NC1jOTk0NWE1OGJjYjYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJHYW1lL2FjaGlldmVtZW50c19pY29ucy9hY2hpZXZlbWVudF9yZWNrbGVzcy5wbmciLCJpYXQiOjE3NzUzMDMyMDUsImV4cCI6NDg5NzM2NzIwNX0.2s_UzpvkTRi6IY36d0WyWRNOBIAQSywd7f247hoQ-O0',
      order: 1,
    },
    {
      code: 'sportsman_fisher',
      title: {
        en: 'Sportsman fisher',
        uk: 'Рибак спортсмен',
      },
      description: {
        en: 'Catch a trophy fish.',
        uk: 'Витягти трофейну рибу.',
      },
      imageUrl:
        'https://ysmdydtvfgtffymgillf.supabase.co/storage/v1/object/sign/Game/achievements_icons/achievement_sportsman_fisher.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zYWEzNmIwMC1mZDM5LTRjNzYtOGY4NC1jOTk0NWE1OGJjYjYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJHYW1lL2FjaGlldmVtZW50c19pY29ucy9hY2hpZXZlbWVudF9zcG9ydHNtYW5fZmlzaGVyLnBuZyIsImlhdCI6MTc3NTMwMzI1MywiZXhwIjoxNzgzODU2ODUzfQ.r5WcTNUEUlmEwfkPA8HHohgcpHWnyEHhDZo96e_0IdI',
      order: 2,
    },
  ];

  for (const ach of achievements) {
    const existing = await prisma.achievement.findUnique({
      where: { code: ach.code },
    });

    const createInput: Prisma.AchievementCreateInput = {
      code: ach.code,
      imageUrl: ach.imageUrl,
      order: ach.order,
      translations: {
        create: [
          {
            language: 'en',
            title: ach.title.en,
            description: ach.description.en,
          },
          {
            language: 'uk',
            title: ach.title.uk,
            description: ach.description.uk,
          },
        ],
      },
    };

    if (existing) {
      await prisma.achievement.update({
        where: { id: existing.id },
        data: {
          imageUrl: ach.imageUrl,
          order: ach.order,
          translations: {
            deleteMany: {},
            create: [
              {
                language: 'en',
                title: ach.title.en,
                description: ach.description.en,
              },
              {
                language: 'uk',
                title: ach.title.uk,
                description: ach.description.uk,
              },
            ],
          },
        },
      });
    } else {
      await prisma.achievement.create({
        data: createInput,
      });
    }
  }

  console.log('Achievements seeded successfully.');
}

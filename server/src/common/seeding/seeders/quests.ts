import { PrismaClient, Prisma } from '@prisma/client';

export async function seedQuests(prisma: PrismaClient) {
  const quests = [
    {
      title: { uk: 'Майстер поплавка', en: 'Float Master' },
      description: {
        uk: 'Зловити 10 риб на поплавкову вудку',
        en: 'Catch 10 fish using a float rod',
      },
      conditions: [
        {
          id: 'float_10',
          type: 'CATCH_METHOD',
          value: 'FLOAT',
          target: 10,
          label: {
            uk: 'Зловити 10 риб на поплавок',
            en: 'Catch 10 fish with float',
          },
        },
      ],
      xpReward: 100,
      moneyReward: 500,
      order: 1,
      imageUrl:
        'https://ysmdydtvfgtffymgillf.supabase.co/storage/v1/object/sign/Game/quests_icons/quest_1_float_master.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zYWEzNmIwMC1mZDM5LTRjNzYtOGY4NC1jOTk0NWE1OGJjYjYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJHYW1lL3F1ZXN0c19pY29ucy9xdWVzdF8xX2Zsb2F0X21hc3Rlci5wbmciLCJpYXQiOjE3NzUyOTU0MzUsImV4cCI6NDg5NzM1OTQzNX0.9U3XwZOfEQbxC2B3b2EbVj2RgsqvieCKxpG1lVN4eWM',
    },
    {
      title: { uk: 'Майстер спінінга', en: 'Spinning Master' },
      description: {
        uk: 'Впіймати 10 риб на спінінг',
        en: 'Catch 10 fish using a spinning rod',
      },
      conditions: [
        {
          id: 'spin_10',
          type: 'CATCH_METHOD',
          value: 'SPINNING',
          target: 10,
          label: {
            uk: 'Впіймати 10 риб на спінінг',
            en: 'Catch 10 fish with spinning',
          },
        },
      ],
      xpReward: 150,
      moneyReward: 750,
      order: 2,
      imageUrl:
        'https://ysmdydtvfgtffymgillf.supabase.co/storage/v1/object/sign/Game/quests_icons/quest_2_spining_master.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zYWEzNmIwMC1mZDM5LTRjNzYtOGY4NC1jOTk0NWE1OGJjYjYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJHYW1lL3F1ZXN0c19pY29ucy9xdWVzdF8yX3NwaW5pbmdfbWFzdGVyLnBuZyIsImlhdCI6MTc3NTI5NTYwNSwiZXhwIjo0ODk3MzU5NjA1fQ.PZywBP-p6gYWZcx0zqUFuHdrg5dGxuSZif5xgZpverQ',
    },
    {
      title: { uk: 'Майстер фідера', en: 'Feeder Master' },
      description: {
        uk: 'Впіймати 10 риб на фідер',
        en: 'Catch 10 fish using a feeder rod',
      },
      conditions: [
        {
          id: 'feeder_10',
          type: 'CATCH_METHOD',
          value: 'FEEDER',
          target: 10,
          label: {
            uk: 'Впіймати 10 риб на фідер',
            en: 'Catch 10 fish with feeder',
          },
        },
      ],
      xpReward: 200,
      moneyReward: 1000,
      order: 3,
      imageUrl:
        'https://ysmdydtvfgtffymgillf.supabase.co/storage/v1/object/sign/Game/quests_icons/quest_3_feeder_master.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zYWEzNmIwMC1mZDM5LTRjNzYtOGY4NC1jOTk0NWE1OGJjYjYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJHYW1lL3F1ZXN0c19pY29ucy9xdWVzdF8zX2ZlZWRlcl9tYXN0ZXIucG5nIiwiaWF0IjoxNzc1Mjk1NjI1LCJleHAiOjQ4OTczNTk2MjV9.jZ03XcCjdvj7r6RNIivu8Y8Snm5p8k5Plexlv5OWJkk',
    },
  ];

  for (const quest of quests) {
    const existing = await prisma.quest.findFirst({
      where: {
        translations: {
          some: {
            language: 'en',
            title: quest.title.en,
          },
        },
      },
    });

    const createInput: Prisma.QuestCreateInput = {
      imageUrl: quest.imageUrl,
      conditions: quest.conditions as unknown as Prisma.InputJsonValue,
      xpReward: quest.xpReward,
      moneyReward: quest.moneyReward,
      order: quest.order,
      translations: {
        create: [
          {
            language: 'en',
            title: quest.title.en,
            description: quest.description.en,
          },
          {
            language: 'uk',
            title: quest.title.uk,
            description: quest.description.uk,
          },
        ],
      },
    };

    if (existing) {
      await prisma.quest.update({
        where: { id: existing.id },
        data: {
          imageUrl: quest.imageUrl,
          conditions: quest.conditions as unknown as Prisma.InputJsonValue,
          xpReward: quest.xpReward,
          moneyReward: quest.moneyReward,
          order: quest.order,
          // For simplicity, we just delete and recreation of translations on seed
          translations: {
            deleteMany: {},
            create: [
              {
                language: 'en',
                title: quest.title.en,
                description: quest.description.en,
              },
              {
                language: 'uk',
                title: quest.title.uk,
                description: quest.description.uk,
              },
            ],
          },
        },
      });
    } else {
      await prisma.quest.create({
        data: createInput,
      });
    }
  }

  console.log('Quests seeded successfully.');
}

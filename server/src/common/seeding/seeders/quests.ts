import { PrismaClient, Prisma } from '@prisma/client';

export async function seedQuests(prisma: PrismaClient) {
  const quests = [
    {
      title: { uk: 'Прибиральник', en: 'Trash Scavenger' },
      description: {
        uk: 'Виловити 10 одиниць сміття з водойми',
        en: 'Catch 10 pieces of trash from the water',
      },
      conditions: [
        {
          id: 'trash_10',
          type: 'CATCH_TRASH',
          value: 'any',
          target: 10,
          label: {
            uk: 'Виловити 10 одиниць сміття',
            en: 'Catch 10 pieces of trash',
          },
        },
      ],
      xpReward: 50,
      moneyReward: 200,
      order: 1,
      imageUrl:
        'https://ysmdydtvfgtffymgillf.supabase.co/storage/v1/object/sign/Game/quests_icons/quest_7_scavenger.webp?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zYWEzNmIwMC1mZDM5LTRjNzYtOGY4NC1jOTk0NWE1OGJjYjYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJHYW1lL3F1ZXN0c19pY29ucy9xdWVzdF83X3NjYXZlbmdlci53ZWJwIiwiaWF0IjoxNzc3MDIxNDg4LCJleHAiOjQ4OTkwODU0ODh9.FHWgnS_sUfYsPl9yth57ebdn7EuzVhx6BFaubxHk_LI',
    },
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
      xpReward: 50,
      moneyReward: 150,
      order: 2,
      imageUrl:
        'https://ysmdydtvfgtffymgillf.supabase.co/storage/v1/object/sign/Game/quests_icons/quest_1_float_master.webp?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zYWEzNmIwMC1mZDM5LTRjNzYtOGY4NC1jOTk0NWE1OGJjYjYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJHYW1lL3F1ZXN0c19pY29ucy9xdWVzdF8xX2Zsb2F0X21hc3Rlci53ZWJwIiwiaWF0IjoxNzc1ODIwODA2LCJleHAiOjQ4OTc4ODQ4MDZ9.6e9ZMNzzNKruNtZhRycKlEsT72uT5H3D9xdZZ9GDYro',
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
      xpReward: 50,
      moneyReward: 150,
      order: 3,
      imageUrl:
        'https://ysmdydtvfgtffymgillf.supabase.co/storage/v1/object/sign/Game/quests_icons/quest_2_spining_master.webp?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zYWEzNmIwMC1mZDM5LTRjNzYtOGY4NC1jOTk0NWE1OGJjYjYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJHYW1lL3F1ZXN0c19pY29ucy9xdWVzdF8yX3NwaW5pbmdfbWFzdGVyLndlYnAiLCJpYXQiOjE3NzU4MjA4NDIsImV4cCI6NDg5Nzg4NDg0Mn0.nQx-QGOkar115zJ7n2tHTYgPNmYRfDdyjO7D0d7SvTs',
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
      xpReward: 50,
      moneyReward: 150,
      order: 4,
      imageUrl:
        'https://ysmdydtvfgtffymgillf.supabase.co/storage/v1/object/sign/Game/quests_icons/quest_3_feeder_master.webp?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zYWEzNmIwMC1mZDM5LTRjNzYtOGY4NC1jOTk0NWE1OGJjYjYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJHYW1lL3F1ZXN0c19pY29ucy9xdWVzdF8zX2ZlZWRlcl9tYXN0ZXIud2VicCIsImlhdCI6MTc3NTgyMDg2MiwiZXhwIjo0ODk3ODg0ODYyfQ.0j0rytc4NiXhXlWPU0RrdE6z4Rt6B0BaFWT1XpiDCEE',
    },
    {
      title: { uk: 'Майстер Лісового озера', en: 'Master of Forest Lake' },
      description: {
        uk: 'Виловити по 1 екземпляру кожного виду риб, що живуть у Лісовому озері',
        en: 'Catch at least one specimen of every fish species in the Forest Lake',
      },
      conditions: [
        {
          id: 'forest_crucian',
          type: 'CATCH_SPECIES_ON_LAKE',
          lakeId: 'forest_lake',
          value: 'crucian',
          target: 1,
          label: { uk: 'Зловити карася', en: 'Catch a Crucian Carp' },
        },
        {
          id: 'forest_roach',
          type: 'CATCH_SPECIES_ON_LAKE',
          lakeId: 'forest_lake',
          value: 'roach',
          target: 1,
          label: { uk: 'Зловити плітку', en: 'Catch a Roach' },
        },
        {
          id: 'forest_perch',
          type: 'CATCH_SPECIES_ON_LAKE',
          lakeId: 'forest_lake',
          value: 'perch',
          target: 1,
          label: { uk: 'Зловити окуня', en: 'Catch a Perch' },
        },
        {
          id: 'forest_pike',
          type: 'CATCH_SPECIES_ON_LAKE',
          lakeId: 'forest_lake',
          value: 'pike',
          target: 1,
          label: { uk: 'Зловити щуку', en: 'Catch a Pike' },
        },
        {
          id: 'forest_ruffe',
          type: 'CATCH_SPECIES_ON_LAKE',
          lakeId: 'forest_lake',
          value: 'ruffe',
          target: 1,
          label: { uk: 'Зловити йоржа', en: 'Catch a Ruffe' },
        },
        {
          id: 'forest_tench',
          type: 'CATCH_SPECIES_ON_LAKE',
          lakeId: 'forest_lake',
          value: 'tench',
          target: 1,
          label: { uk: 'Зловити лина', en: 'Catch a Tench' },
        },
        {
          id: 'forest_weatherfish',
          type: 'CATCH_SPECIES_ON_LAKE',
          lakeId: 'forest_lake',
          value: 'weatherfish',
          target: 1,
          label: { uk: "Зловити в'юна", en: 'Catch a Weatherfish' },
        },
      ],
      xpReward: 125,
      moneyReward: 350,
      order: 5,
      imageUrl:
        'https://ysmdydtvfgtffymgillf.supabase.co/storage/v1/object/sign/Game/quests_icons/quest_5_master_of_forest.webp?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zYWEzNmIwMC1mZDM5LTRjNzYtOGY4NC1jOTk0NWE1OGJjYjYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJHYW1lL3F1ZXN0c19pY29ucy9xdWVzdF81X21hc3Rlcl9vZl9mb3Jlc3Qud2VicCIsImlhdCI6MTc3NTgyMTQ0OSwiZXhwIjo0ODk3ODg1NDQ5fQ.o0Rhfy3dRSzn3HQd_SXNijwP6NXEHv5JJWElbANT3zM',
    },

    {
      title: {
        uk: 'Майстер Пасовищного каналу',
        en: 'Master of Pasture Canal',
      },
      description: {
        uk: 'Виловити по 1 екземпляру кожного виду риб, що живуть у Пасовищному каналі',
        en: 'Catch at least one specimen of every fish species in the Pasture Canal',
      },
      conditions: [
        {
          id: 'canal_asp',
          type: 'CATCH_SPECIES_ON_LAKE',
          lakeId: 'pasture_canal',
          value: 'asp',
          target: 1,
          label: { uk: 'Зловити жереха', en: 'Catch an Asp' },
        },
        {
          id: 'canal_bream',
          type: 'CATCH_SPECIES_ON_LAKE',
          lakeId: 'pasture_canal',
          value: 'bream',
          target: 1,
          label: { uk: 'Зловити ляща', en: 'Catch a Bream' },
        },
        {
          id: 'canal_catfish',
          type: 'CATCH_SPECIES_ON_LAKE',
          lakeId: 'pasture_canal',
          value: 'american_catfish',
          target: 1,
          label: {
            uk: 'Зловити американського сомика',
            en: 'Catch an American Catfish',
          },
        },
        {
          id: 'canal_eel',
          type: 'CATCH_SPECIES_ON_LAKE',
          lakeId: 'pasture_canal',
          value: 'eel',
          target: 1,
          label: { uk: 'Зловити вугра', en: 'Catch an Eel' },
        },
        {
          id: 'canal_gudgeon',
          type: 'CATCH_SPECIES_ON_LAKE',
          lakeId: 'pasture_canal',
          value: 'gudgeon',
          target: 1,
          label: { uk: 'Зловити пічкура', en: 'Catch a Gudgeon' },
        },
        {
          id: 'canal_crayfish',
          type: 'CATCH_SPECIES_ON_LAKE',
          lakeId: 'pasture_canal',
          value: 'crayfish',
          target: 1,
          label: { uk: 'Зловити рака', en: 'Catch a Crayfish' },
        },
        {
          id: 'canal_pike',
          type: 'CATCH_SPECIES_ON_LAKE',
          lakeId: 'pasture_canal',
          value: 'pike',
          target: 1,
          label: { uk: 'Зловити щуку', en: 'Catch a Pike' },
        },
        {
          id: 'canal_perch',
          type: 'CATCH_SPECIES_ON_LAKE',
          lakeId: 'pasture_canal',
          value: 'perch',
          target: 1,
          label: { uk: 'Зловити окуня', en: 'Catch a Perch' },
        },
        {
          id: 'canal_roach',
          type: 'CATCH_SPECIES_ON_LAKE',
          lakeId: 'pasture_canal',
          value: 'roach',
          target: 1,
          label: { uk: 'Зловити плітку', en: 'Catch a Roach' },
        },
        {
          id: 'canal_crucian',
          type: 'CATCH_SPECIES_ON_LAKE',
          lakeId: 'pasture_canal',
          value: 'crucian',
          target: 1,
          label: { uk: 'Зловити карася', en: 'Catch a Crucian Carp' },
        },
      ],
      xpReward: 135,
      moneyReward: 400,
      order: 6,
      imageUrl:
        'https://ysmdydtvfgtffymgillf.supabase.co/storage/v1/object/sign/Game/quests_icons/quest_6_master_of_pasture.webp?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zYWEzNmIwMC1mZDM5LTRjNzYtOGY4NC1jOTk0NWE1OGJjYjYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJHYW1lL3F1ZXN0c19pY29ucy9xdWVzdF82X21hc3Rlcl9vZl9wYXN0dXJlLndlYnAiLCJpYXQiOjE3NzcwMjE2NzQsImV4cCI6NDg5OTA4NTY3NH0.YDtj4D4T01VTxDFZK-Gxy8fDgItwoW1bkr8zrGuYsus',
    },
    {
      title: { uk: 'Майстер Рибхозу', en: 'Master of Fish Farm' },
      description: {
        uk: 'Виловити по 1 екземпляру кожного виду риб, що живуть у Рибхозі',
        en: 'Catch at least one specimen of every fish species in the Fish Farm Reservoir',
      },
      conditions: [
        {
          id: 'farm_carp',
          type: 'CATCH_SPECIES_ON_LAKE',
          lakeId: 'fish_farm',
          value: 'carp',
          target: 1,
          label: { uk: 'Зловити коропа', en: 'Catch a Carp' },
        },
        {
          id: 'farm_grass_carp',
          type: 'CATCH_SPECIES_ON_LAKE',
          lakeId: 'fish_farm',
          value: 'grass_carp',
          target: 1,
          label: { uk: 'Зловити білого амура', en: 'Catch a Grass Carp' },
        },
        {
          id: 'farm_crucian',
          type: 'CATCH_SPECIES_ON_LAKE',
          lakeId: 'fish_farm',
          value: 'crucian',
          target: 1,
          label: { uk: 'Зловити карася', en: 'Catch a Crucian Carp' },
        },
        {
          id: 'farm_zander',
          type: 'CATCH_SPECIES_ON_LAKE',
          lakeId: 'fish_farm',
          value: 'zander',
          target: 1,
          label: { uk: 'Зловити судака', en: 'Catch a Zander' },
        },
        {
          id: 'farm_catfish',
          type: 'CATCH_SPECIES_ON_LAKE',
          lakeId: 'fish_farm',
          value: 'catfish',
          target: 1,
          label: { uk: 'Зловити сома', en: 'Catch a Catfish' },
        },
        {
          id: 'farm_roach',
          type: 'CATCH_SPECIES_ON_LAKE',
          lakeId: 'fish_farm',
          value: 'roach',
          target: 1,
          label: { uk: 'Зловити плітку', en: 'Catch a Roach' },
        },
        {
          id: 'farm_perch',
          type: 'CATCH_SPECIES_ON_LAKE',
          lakeId: 'fish_farm',
          value: 'perch',
          target: 1,
          label: { uk: 'Зловити окуня', en: 'Catch a Perch' },
        },
        {
          id: 'farm_silver_carp',
          type: 'CATCH_SPECIES_ON_LAKE',
          lakeId: 'fish_farm',
          value: 'silver_carp',
          target: 1,
          label: { uk: 'Зловити товстолоба', en: 'Catch a Silver Carp' },
        },
        {
          id: 'farm_crayfish',
          type: 'CATCH_SPECIES_ON_LAKE',
          lakeId: 'fish_farm',
          value: 'crayfish',
          target: 1,
          label: { uk: 'Зловити рака', en: 'Catch a Crayfish' },
        },
        {
          id: 'farm_bream',
          type: 'CATCH_SPECIES_ON_LAKE',
          lakeId: 'fish_farm',
          value: 'bream',
          target: 1,
          label: { uk: 'Зловити ляща', en: 'Catch a Bream' },
        },
      ],
      xpReward: 150,
      moneyReward: 450,
      order: 7,
      imageUrl:
        'https://ysmdydtvfgtffymgillf.supabase.co/storage/v1/object/sign/Game/quests_icons/quest_4_master_of_reservoir.webp?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zYWEzNmIwMC1mZDM5LTRjNzYtOGY4NC1jOTk0NWE1OGJjYjYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJHYW1lL3F1ZXN0c19pY29ucy9xdWVzdF80X21hc3Rlcl9vZl9yZXNlcnZvaXIud2VicCIsImlhdCI6MTc3NTgyMTM3NiwiZXhwIjo0ODk3ODg1Mzc2fQ.dre2ptN55jvu3DVUnhokuHgJpBEtQ83ncLp6dB1Ct2w',
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

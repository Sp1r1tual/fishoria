import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

import { seedNews } from './seeders/news';
import { seedQuests } from './seeders/quests';
import { seedAchievements } from './seeders/achievements';

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
export const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

async function seed() {
  console.log('Seeding news...');
  await seedNews(prisma);

  console.log('Seeding quests...');
  await seedQuests(prisma);

  console.log('Seeding achievements...');
  await seedAchievements(prisma);
}

seed()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

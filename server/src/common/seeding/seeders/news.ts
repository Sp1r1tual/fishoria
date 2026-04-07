import { PrismaClient } from '@prisma/client';

export async function seedNews(prisma: PrismaClient) {
  const newsItems = [
    {
      title: { en: 'Welcome to the Beta Version!', uk: 'Запуск Бета-версії!' },
      content: {
        en: `
# Welcome to the Web Fishing World!

We have just opened access to the **first beta version** of the game — and this is only the beginning. This isn't just another "clicker", but a thoughtful fishing simulation where the result depends on your decisions, not random chance.

### What awaits you:
* **Explore** diverse lakes
* **Equip** various gear and experiment with strategies
* **Study** fish behavior (each species has its own habits, preferences, and reactions)

> **Key to success:** if you want to consistently catch fish — you will have to think, analyze, and adapt.

---

### Important Notice: Early Beta
Most mechanics and features are currently in a raw state and will be significantly reworked and expanded in the future. What you see today is the **foundation**, not the final look of the game.

Yes, *bugs are possible* — and we don't hide this fact. What matters is that the project is actively developing, and **your feedback truly influences its direction**.

If you encounter any errors — please don't ignore them. Send bug reports to our email [atmosphoria.software@gmail.com](mailto:atmosphoria.software@gmail.com). No message will go unnoticed.

---

### Notice to Testers:
During the testing period, a **debugger** is available (only at lake locations) by pressing the **\`** key or triple-tapping the information panel at the lake.

Progress achieved during beta will be reset upon release, but all beta participants will be rewarded!

**Happy Fishing!**
        `,
        uk: `
# Ласкаво просимо у браузерний світ риболовлі!

Ми щойно відкрили доступ до **першої бета-версії** гри — і це лише початок. Перед вами не просто чергова «клікалка», а продумана симуляція риболовлі, де результат залежатиме не від випадковості, а від ваших рішень.

### Що на вас чекає:
* **Досліджуйте** різноманітні озера
* **Підбирайте** снасті та експериментуйте зі стратегіями
* **Вивчайте** поведінку риби (кожен вид має свої звички, вподобання та реакції)

> **Ключ до успіху:** якщо хочете стабільно ловити — доведеться думати, аналізувати і адаптуватися.

---

### Важливий момент: це рання бета
Більшість механік і весь функціонал зараз у сирому стані й у майбутньому будуть суттєво перероблятися та розширюватися. Те, що ви бачите сьогодні — це **фундамент**, а не фінальний вигляд гри.

Так, *баги можливі* — і ми цього не приховуємо. Але важливо інше: проєкт активно розвивається, і **кожен ваш фідбек реально впливає на його напрямок**.

Якщо натрапите на помилки — не ігноруйте. Надсилайте баг-репорти на нашу пошту [atmosphoria.software@gmail.com](mailto:atmosphoria.software@gmail.com). Жодне повідомлення не залишиться без уваги.

---

### До уваги тестувальників:
На період тестування кожному користувачу доступний **дебагер** (лише на локаціях озер) при натисканні на клавішу **\`** та потрійному тапі по інформаційній панелі на озері.

Здобутий прогрес при релізі буде анульовано, проте всі учасники бета-тестування будуть нагороджені!

**Приємної риболовлі!**
        `,
      },
      imageUrl:
        'https://ysmdydtvfgtffymgillf.supabase.co/storage/v1/object/sign/Game/news_icons/game_banner.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zYWEzNmIwMC1mZDM5LTRjNzYtOGY4NC1jOTk0NWE1OGJjYjYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJHYW1lL25ld3NfaWNvbnMvZ2FtZV9iYW5uZXIuanBnIiwiaWF0IjoxNzc1NDExNTY4LCJleHAiOjQ4OTc0NzU1Njh9.CXWWTzaCF667OSGP1n8LofNzH_I7UrBQsHeZg0HgdCU',
    },
  ];

  for (const item of newsItems) {
    const existing = await prisma.news.findFirst({
      where: {
        translations: {
          some: {
            language: 'en',
            title: item.title.en,
          },
        },
      },
    });

    if (!existing) {
      await prisma.news.create({
        data: {
          imageUrl: item.imageUrl,
          translations: {
            create: [
              {
                language: 'en',
                title: item.title.en,
                content: item.content.en,
              },
              {
                language: 'uk',
                title: item.title.uk,
                content: item.content.uk,
              },
            ],
          },
        },
      });
    }
  }
}

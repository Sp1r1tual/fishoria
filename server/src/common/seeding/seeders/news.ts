import { PrismaClient } from '@prisma/client';

export async function seedNews(prisma: PrismaClient) {
  const newsItems: {
    title: { en: string; uk: string };
    content: { en: string; uk: string };
    imageUrl?: string | null;
    createdAt?: Date;
  }[] = [
    {
      title: {
        en: 'Update 0.5.0: Online Update & Interactions',
        uk: 'Оновлення 0.5.0: Онлайн та Спілкування',
      },
      content: {
        en: `
### The World is Now Online!
* **Real-time Chat System**: Connect with other anglers on the lake! Each location now has its own chat channel where you can share tips or just hang out.
* **Live Catch Broadcasts**: Celebrate your trophies! Every significant catch is now broadcast to all players at your location in real-time.
* **Smart UI Polish**: We have significantly refined the overall interface. Transitions are smoother, layouts are cleaner, and the chat experience feels truly premium.
* **Perspective Scaling**: Improved visual realism – the bobber now correctly scales based on your cast distance, creating a true sense of depth.
* **Performance & Bugs**: Multiple under-the-hood optimizations and critical bug fixes for a more stable experience.

Tight lines and enjoy the new social of Fishoria!
        `,
        uk: `
### Світ став онлайн!
* **Чат у реальному часі**: Спілкуйтеся з іншими рибалками прямо на озері! Кожна локація тепер має свій канал чату, де можна ділитися порадами або просто розмовляти.
* **Живі логи вилову**: Святкуйте свої перемоги разом! Кожен значущий улов тепер транслюється всім гравцям на локації в реальному часі.
* **Вдосконалення інтерфейсу**: Ми суттєво оновили дизайн та логіку роботи HUD. Анімації стали плавнішими, а робота з чатом — максимально комфортною та преміальною.
* **Ефект перспективи**: Покращено візуальний реалізм — поплавець тепер динамічно змінює розмір залежно від дальності закиду, створюючи справжнє відчуття глибини.
* **Стабільність**: Проведено велику роботу над виправленням помилок та загальною оптимізацією продуктивності клієнта.

Гарного кльову та насолоджуйтесь новою ерою у Fishoria!
        `,
      },
      imageUrl:
        'https://ysmdydtvfgtffymgillf.supabase.co/storage/v1/object/sign/Game/news_icons/0.5.0-beta_update.webp?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zYWEzNmIwMC1mZDM5LTRjNzYtOGY4NC1jOTk0NWE1OGJjYjYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJHYW1lL25ld3NfaWNvbnMvMC41LjAtYmV0YV91cGRhdGUud2VicCIsImlhdCI6MTc3NzI3ODUzNCwiZXhwIjo0ODk5MzQyNTM0fQ.H8P0Fnxx0bAkIoIZw7EP31Fg71CQMFgKoV6E328kV0g',
      createdAt: new Date('2026-04-27T11:00:00Z'),
    },
    {
      title: {
        en: 'Update 0.4.0: Social Fishing & New Fish Behavior',
        uk: 'Оновлення 0.4.0: Соціальна Риболовля та Нова Поведінка Риб',
      },
      content: {
        en: `
### Key Changes:
* **New Fish Behavior System**: We have completely reworked the fish behavior system, moving it to a probabilistic model. This technical improvement does not negatively impact the gameplay experience but lays the foundation for a future online mode.
* **Preparing for Online**: The new system enables real-time gameplay with other players on the same lake. Our team is already actively working on implementing this feature!
* **New Location Unlocked**: A brand new reservoir is now open for exploration! Discover unique spots and master its depths.
* **New Fish Species**: Several new species have been added to the game world. Update your guide and try to catch them all!
* **Interface Refinement**: Significant UI improvements for a more intuitive and enjoyable experience.
* **New Quests**: Added 2 new quests to diversify your adventures.
* **Bug Fixes**: Resolved many critical bugs to enhance game stability.

Thank you for being part of our journey!
        `,
        uk: `
### Ключові зміни:
* **Нова система поведінки риб**: Ми повністю переробили систему поведінки риб, перевівши її на імовірнісну модель. Це технічне вдосконалення ніяк не погіршує ігровий досвід, але закладає фундамент для майбутнього онлайн-режиму.
* **Підготовка до Online**: Нова система дозволяє впровадити гру з іншими гравцями на одному озері в реальному часі. Наша команда вже активно працює над реалізацією цієї можливості!
* **Нова локація відкрита**: Абсолютно нове водосховище тепер доступне для дослідження! Відкрийте для себе унікальні місця та підкоріть його глибини.
* **Нові види риб**: До ігрового світу додано кілька нових видів риб. Оновіть свій довідник і спробуйте впіймати їх усіх!
* **Оновлення інтерфейсу**: Суттєво доопрацьовано користувацький інтерфейс для більш зручної та приємної гри.
* **Нові квести**: Додано 2 нові квести, щоб урізноманітнити ваші пригоди.
* **Виправлення помилок**: Усунено багато критичних помилок для покращення стабільності гри.

Дякуємо, що ви з нами!
        `,
      },
      imageUrl:
        'https://ysmdydtvfgtffymgillf.supabase.co/storage/v1/object/sign/Game/news_icons/0.4.0-beta_update.webp?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zYWEzNmIwMC1mZDM5LTRjNzYtOGY4NC1jOTk0NWE1OGJjYjYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJHYW1lL25ld3NfaWNvbnMvMC40LjAtYmV0YV91cGRhdGUud2VicCIsImlhdCI6MTc3NzAyMTMxNCwiZXhwIjo0ODk5MDg1MzE0fQ.WLEQTgGMbptPKHVxqWlxYcOOzqRF-mmUId65uFSHpoQ',
      createdAt: new Date('2026-04-24T10:00:00Z'),
    },
    {
      title: {
        en: 'Update 0.3.0-beta: Balance & Technical Improvements',
        uk: 'Оновлення 0.3.0-beta: Баланс та Технічні Покращення',
      },
      content: {
        en: `
### Key Changes & Features:
* **Gameplay Balance Rework**: Core balance adjustments across the game to improve progression, challenge, and overall gameplay feel.
* **New Quests**: Added 2 new quests to expand player objectives and provide additional rewards.
* **Performance Optimization**: General optimization improvements for smoother gameplay and better stability across devices.

### Audio & Content:
* **New Menu Music**: Added 2 new background tracks to the main menu for a fresher and more immersive atmosphere.

### Visual & UI Improvements:
* **Improved Interface**: Various UI enhancements for better usability, clarity, and overall user experience.

### Bug Fixes:
* **General Fixes**: Multiple bug fixes addressing gameplay issues and improving overall stability.

Thank you for being part of our journey!
        `,
        uk: `
### Основні зміни та нововведення:
* **Переробка ігрового балансу**: Ключові коригування балансу в усій грі для покращення прогресії, виклику та загальних відчуттів від геймплею.
* **Нові квести**: Додано 2 нових квести, щоб розширити цілі гравця та надати додаткові нагороди.
* **Оптимізація продуктивності**: Загальні покращення оптимізації для більш плавного геймплею та кращої стабільності на різних пристроях.

### Аудіо та контент:
* **Нова музика в меню**: Додано 2 нові фонові треки до головного меню для свіжої та атмосферної обстановки.

### Візуальні та UI покращення:
* **Покращений інтерфейс**: Різні вдосконалення інтерфейсу для зручності використання, чіткості та покращення загального користувацького досвіду.

### Виправлення помилок:
* **Загальні виправлення**: Численні виправлення помилок, що стосуються геймплейних моментів та загальної стабільності.

Дякуємо, що ви з нами!
        `,
      },
      createdAt: new Date('2026-04-14T10:00:00Z'),
    },
    {
      title: {
        en: 'Update 0.2.0: Balance & Technical Improvements',
        uk: 'Оновлення 0.2.0: Баланс та Технічні Покращення',
      },
      content: {
        en: `
### Key Changes & Features:
* **Advanced Balance & Fish Behavior**: Deep rework of fish resistance logic and behavior in challenging conditions. Lake depth now correctly affects line tension (slack ratio), making the fight feel more dynamic and realistic.
* **Seamless Auto-Updates**: Introduced a version tracking system. The client now automatically refreshes when a new deployment is detected, eliminating "chunk load" errors and stale cache issues.
* **Enhanced Buffering**: Changing equipment at locations is now smoother thanks to implemented buffering logic for gear updates.

### Visual & UI Improvements:
* **Refined Interface**: Completely redesigned modal windows and notification system (toasts) with smoother animations and cleaner aesthetics.
* **Lake Selection**: Updated visual style for the lake selection screen and fixed picker styles for a more premium look.
* **Mobile Adaptiveness**: Fixed background icon scaling on small screens and resolved the annoying auto-zoom issue in Safari (Webkit).
* **Optimized Debug Mode**: Improved the built-in debugger for testers with better data visualization.

### Bug Fixes:
* **Equipment Safety**: Fixed a critical issue where broken rods or reels could be unfairly "written off" during a line break or lost fish.
* **Audio Stability**: Resolved overlapping ambient sounds and playback issues specifically on iOS devices (Webkit).
* **Balance**: Fixed an issue where fish could get stuck in textures.

Thank you for being part of our journey!
        `,
        uk: `
### Основні нововведення та фічі:
* **Просунутий Баланс та Поведінка Риби**: Глибока переробка логіку опору риби та її поведінки у складних умовах. Тепер глибина водойми коректно впливає на натяг ліски (slack ratio), що робить процес викачування більш динамічним та реалістичним.
* **Автоматичне Оновлення**: Впроваджено систему відстеження версій. Клієнт самостійно оновлює сторінку при виявленні нового деплою, що назавжди вирішує проблему помилок завантаження через застарілий кеш.
* **Буферизація Спорядження**: Зміна екіпірування на локаціях тепер відбувається значно плавніше завдяки впровадженню логіки буферизації запитів.

### Візуальні та UI покращення:
* **Оновлений Інтерфейс**: Повністю перероблені модальні вікна та система сповіщень (toasts). Анімації стали плавнішими, а візуальний стиль – чистішим.
* **Вибір Озер**: Оновлено дизайн екрана вибору озер та виправлено стилі пікерів для більш "преміального" вигляду.
* **Мобільна Адаптивність**: Виправлено масштаб фонових іконок на малих екранах та вирішено проблему з небажаним авто-зумом у Safari (Webkit).
* **Оптимізація Debug-режиму**: Покращено вбудований дебагер для тестувальників з більш зручним відображенням даних.

### Виправлення помилок:
* **Чесна Економіка**: Виправлено критичну помилку, через яку зламане спорядження могло бути несправедливо списане при звичайному обриві ліски або втраті риби.
* **Звук на iOS**: Вирішено проблему з накладанням амбієнтних звуків та помилками відтворення на пристроях Apple (Webkit).
* **Баланс**: Виправлено помилку, через яку риба могла застрягати в текстурах.

Дякуємо, що ви з нами!
        `,
      },
      createdAt: new Date('2026-04-12T10:00:00Z'),
    },
    {
      title: { en: 'Welcome to the Beta Version!', uk: 'Запуск Бета-версії!' },
      content: {
        en: `
# Welcome to the Web Fishing World!

We have just opened access to the **first beta version** of the game – and this is only the beginning. This isn't just another "clicker", but a thoughtful fishing simulation where the result depends on your decisions, not random chance.

### What awaits you:
* **Explore** diverse lakes
* **Equip** various gear and experiment with strategies
* **Study** fish behavior (each species has its own habits, preferences, and reactions)

> **Key to success:** if you want to consistently catch fish – you will have to think, analyze, and adapt.

---

### Important Notice: Early Beta
Most mechanics and features are currently in a raw state and will be significantly reworked and expanded in the future. What you see today is the **foundation**, not the final look of the game.

Yes, *bugs are possible* – and we don't hide this fact. What matters is that the project is actively developing, and **your feedback truly influences its direction**.

If you encounter any errors – please don't ignore them. Send bug reports to our email [atmosphoria.software@gmail.com](mailto:atmosphoria.software@gmail.com). No message will go unnoticed.

---

### Notice to Testers:
During the testing period, a **debugger** is available (only at lake locations) by pressing the **\`** key or triple-tapping the information panel at the lake.

Progress achieved during beta will be reset upon release, but all beta participants will be rewarded!

**Happy Fishing!**
        `,
        uk: `
# Ласкаво просимо у браузерний світ риболовлі!

Ми щойно відкрили доступ до **першої бета-версії** гри – і це лише початок. Перед вами не просто чергова «клікалка», а продумана симуляція риболовлі, де результат залежатиме не від випадковості, а від ваших рішень.

### Що на вас чекає:
* **Досліджуйте** різноманітні озера
* **Підбирайте** снасті та експериментуйте зі стратегіями
* **Вивчайте** поведінку риби (кожен вид має свої звички, вподобання та реакції)

> **Ключ до успіху:** якщо хочете стабільно ловити – доведеться думати, аналізувати і адаптуватися.

---

### Важливий момент: це рання бета
Більшість механік і весь функціонал зараз у сирому стані й у майбутньому будуть суттєво перероблятися та розширюватися. Те, що ви бачите сьогодні – це **фундамент**, а не фінальний вигляд гри.

Так, *баги можливі* – і ми цього не приховуємо. Але важливо інше: проєкт активно розвивається, і **кожен ваш фідбек реально впливає на його напрямок**.

Якщо натрапите на помилки – не ігноруйте. Надсилайте баг-репорти на нашу пошту [atmosphoria.software@gmail.com](mailto:atmosphoria.software@gmail.com). Жодне повідомлення не залишиться без уваги.

---

### До уваги тестувальників:
На період тестування кожному користувачу доступний **дебагер** (лише на локаціях озер) при натисканні на клавішу **\`** та потрійному тапі по інформаційній панелі на озері.

Здобутий прогрес при релізі буде анульовано, проте всі учасники бета-тестування будуть нагороджені!

**Приємної риболовлі!**
        `,
      },
      imageUrl:
        'https://ysmdydtvfgtffymgillf.supabase.co/storage/v1/object/sign/Game/news_icons/game_banner.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zYWEzNmIwMC1mZDM5LTRjNzYtOGY4NC1jOTk0NWE1OGJjYjYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJHYW1lL25ld3NfaWNvbnMvZ2FtZV9iYW5uZXIuanBnIiwiaWF0IjoxNzc1NDExNTY4LCJleHAiOjQ4OTc0NzU1Njh9.CXWWTzaCF667OSGP1n8LofNzH_I7UrBQsHeZg0HgdCU',
      createdAt: new Date('2026-04-09T10:00:00Z'),
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
          imageUrl: item.imageUrl || null,
          createdAt: item.createdAt || undefined,
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

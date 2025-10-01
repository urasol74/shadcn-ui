# 🛍️ Benetton E-Commerce - Полная документация проекта

## 📋 Оглавление
1. [Общее описание проекта](#общее-описание-проекта)
2. [Стек технологий](#стек-технологий)
3. [Структура проекта](#структура-проекта)
4. [Корневые файлы конфигурации](#корневые-файлы-конфигурации)
5. [Структура директорий](#структура-директорий)
6. [Архитектура приложения](#архитектура-приложения)
7. [База данных и API](#база-данных-и-api)
8. [Команды для работы](#команды-для-работы)

---

## 🎯 Общее описание проекта

Это полнофункциональный интернет-магазин одежды **Benetton** (Одесса), построенный на современном стеке технологий. Проект представляет собой SPA (Single Page Application) с серверной интеграцией через Supabase.

**Основные возможности:**
- 🛒 Каталог товаров с фильтрацией по полу, сезону, категориям
- 🔍 Живой поиск товаров
- 💰 Система скидок и персональных цен для зарегистрированных пользователей
- ❤️ Избранное (локальное хранилище)
- 🛍️ Корзина покупок
- 📦 Быстрый заказ без регистрации
- 👤 Система авторизации и регистрации
- 👨‍💼 Админ-панель для управления заказами
- 📱 Адаптивный дизайн (mobile-first)

---

## 🚀 Стек технологий

### Frontend Framework
- **React 18.3.1** - библиотека для построения UI
- **TypeScript 5.9.2** - типизированный JavaScript
- **Vite 5.4.20** - сборщик и dev-сервер нового поколения

### Styling & UI
- **Tailwind CSS 3.4.17** - utility-first CSS фреймворк
- **shadcn/ui** - коллекция готовых компонентов на базе Radix UI
- **Radix UI** - примитивы для доступных UI компонентов
- **Lucide React** - иконки
- **class-variance-authority** - управление вариантами стилей
- **tailwind-merge** - умное слияние Tailwind классов

### Routing & State
- **React Router DOM 6.30.1** - маршрутизация
- **TanStack Query 5.90.2** - управление серверным состоянием и кэшированием

### Backend & Database
- **Supabase 2.58.0** - Backend-as-a-Service (PostgreSQL, Auth, Storage)
- **Axios 1.12.2** - HTTP клиент

### Forms & Validation
- **React Hook Form 7.63.0** - управление формами
- **Zod 3.25.76** - валидация схем
- **@hookform/resolvers** - интеграция валидаторов с формами

### Additional Libraries
- **date-fns** - работа с датами
- **sonner** - уведомления (toast)
- **embla-carousel-react** - карусель изображений
- **recharts** - графики и диаграммы (для админки)
- **next-themes** - переключение темы

### Development Tools
- **ESLint** - линтер кода
- **PostCSS** - обработка CSS
- **Autoprefixer** - автоматические вендорные префиксы
- **@vitejs/plugin-react-swc** - быстрая компиляция React через SWC

---

## 📁 Структура проекта

```
/home/ubuntu/shadcn-ui/
│
├── 📄 Корневые конфигурационные файлы
├── 📂 public/              # Статические файлы и изображения
├── 📂 src/                 # Исходный код приложения
├── 📂 node_modules/        # Зависимости (генерируется)
└── 📂 .git/                # Git репозиторий
```

---

## 📄 Корневые файлы конфигурации

### `package.json`
**Назначение:** Манифест проекта с зависимостями и скриптами.

**Ключевые поля:**
- `"type": "module"` - использование ES модулей
- `"packageManager": "pnpm@8.10.0"` - менеджер пакетов
- `scripts` - команды для разработки:
  - `dev` - запуск dev-сервера на порту 5173 с доступом по сети
  - `build` - production сборка
  - `lint` - проверка кода
  - `preview` - предпросмотр production сборки

**Важные зависимости:**
- `@supabase/supabase-js` - клиент для работы с Supabase
- `@tanstack/react-query` - кэширование и управление данными
- `react-router-dom` - маршрутизация
- Все компоненты `@radix-ui/*` - UI примитивы

---

### `vite.config.ts`
**Назначение:** Конфигурация сборщика Vite.

**Основные настройки:**
```typescript
{
  plugins: [
    viteSourceLocator(),  // Локатор исходников для отладки
    react()               // Поддержка React через SWC
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")  // Алиас для импортов
    }
  },
  server: {
    host: true,    // Доступ с любого IP (для удаленной разработки)
    port: 5173     // Порт dev-сервера
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          utils: ['@/lib/database', '@/lib/supabase-api']
        }
      }
    },
    minify: 'esbuild',
    chunkSizeWarningLimit: 1000
  }
}
```

**Что делает:**
- Настраивает алиас `@/` → `src/`
- Оптимизирует сборку, разделяя код на чанки
- Позволяет подключаться к dev-серверу по сети

---

### `tsconfig.json`
**Назначение:** Главная конфигурация TypeScript (ссылается на другие конфиги).

**Структура:**
- Использует project references для разделения конфигураций
- `tsconfig.app.json` - для исходного кода приложения
- `tsconfig.node.json` - для Node.js скриптов (vite.config.ts)

**Настройки компилятора:**
- `baseUrl: "."` - базовый путь
- `paths: { "@/*": ["./src/*"] }` - алиасы путей
- `noImplicitAny: false` - разрешает неявный any
- `skipLibCheck: true` - пропускает проверку типов в библиотеках
- `strictNullChecks: false` - отключает строгую проверку null

---

### `tailwind.config.ts`
**Назначение:** Конфигурация Tailwind CSS.

**Ключевые настройки:**
```typescript
{
  darkMode: ["class"],  // Темная тема через класс
  content: [            // Где искать классы
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // CSS переменные для динамической темы
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        primary: { ... },
        secondary: { ... },
        // ... и т.д.
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
      },
      keyframes: {
        "accordion-down": { ... },
        "accordion-up": { ... }
      }
    }
  },
  plugins: [
    tailwindcssAnimate,      // Анимации
    tailwindcssAspectRatio   // Aspect ratio утилиты
  ]
}
```

**Что делает:**
- Определяет цветовую схему через CSS переменные
- Добавляет кастомные анимации
- Настраивает адаптивные брейкпоинты

---

### `components.json`
**Назначение:** Конфигурация для CLI shadcn/ui.

**Содержимое:**
```json
{
  "style": "default",      // Стиль компонентов
  "rsc": false,            // Не используем React Server Components
  "tsx": true,             // TypeScript
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

**Что делает:**
- Указывает CLI shadcn/ui, куда устанавливать компоненты
- Определяет алиасы для импортов

---

### `.env`
**Назначение:** Переменные окружения (НЕ коммитится в Git!).

**Содержимое:**
```env
VITE_SUPABASE_URL=http://178.212.198.23:8000
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ ВАЖНО:** 
- Локальная БД (http://178.212.198.23:8000) закомментирована
- Сейчас сайт работает на облачном Supabase (https://fquvncbvvkfukbwsjhns.supabase.co)
- Можно переключаться между локальной и облачной БД в файле `src/lib/supabase.ts`
- Для production используйте переменные окружения сервера

---

### `index.html`
**Назначение:** Точка входа HTML приложения.

**Структура:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Benetton Одесса - Официальный магазин</title>
  <meta name="description" content="..." />
  <!-- SEO мета-теги -->
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
```

**Что делает:**
- Определяет контейнер `#root` для React
- Подключает точку входа приложения
- Содержит SEO мета-теги

---

### `eslint.config.js`
**Назначение:** Конфигурация линтера ESLint.

**Правила:**
- Использует рекомендованные правила для TypeScript
- Настроены плагины для React Hooks
- Отключено предупреждение о неиспользуемых переменных

---

### `postcss.config.js`
**Назначение:** Конфигурация PostCSS для обработки CSS.

**Плагины:**
- `tailwindcss` - обработка Tailwind директив
- `autoprefixer` - автоматические вендорные префиксы

---

## 📂 Структура директорий

### `src/` - Исходный код приложения

```
src/
├── main.tsx              # Точка входа React
├── App.tsx               # Корневой компонент с роутингом
├── index.css             # Глобальные стили и Tailwind директивы
├── vite-env.d.ts         # TypeScript определения для Vite
│
├── 📂 components/        # React компоненты
│   ├── ui/              # shadcn/ui компоненты (50+ файлов)
│   ├── Header.tsx       # Шапка сайта
│   ├── ProductCard.tsx  # Карточка товара
│   ├── FilterPanel.tsx  # Панель фильтров
│   └── ...              # Другие компоненты
│
├── 📂 pages/            # Страницы приложения
│   ├── Index.tsx        # Главная страница
│   ├── ProductPage.tsx  # Страница товара
│   ├── CartPage.tsx     # Корзина
│   ├── AdminPage.tsx    # Админ-панель
│   └── ...              # Другие страницы
│
├── 📂 hooks/            # Custom React hooks
│   ├── useAuth.ts       # Хук авторизации
│   ├── useCatalogData.ts # Хук загрузки каталога
│   └── ...
│
├── 📂 lib/              # Утилиты и сервисы
│   ├── supabase.ts      # Клиент Supabase
│   ├── supabase-api.ts  # API методы
│   ├── database.ts      # Интерфейсы БД
│   ├── utils.ts         # Утилиты (cn функция)
│   ├── cacheService.ts  # Сервис кэширования
│   └── priceUtils.ts    # Утилиты для работы с ценами
│
└── 📂 workers/          # Web Workers (если есть)
```

---

### Детальное описание `src/components/`

#### `components/ui/` - UI компоненты shadcn/ui
**Назначение:** Готовые, переиспользуемые UI компоненты.

**Полный список (50+ компонентов):**
- `button.tsx` - Кнопки с вариантами
- `card.tsx` - Карточки
- `dialog.tsx` - Модальные окна
- `dropdown-menu.tsx` - Выпадающие меню
- `input.tsx` - Поля ввода
- `select.tsx` - Селекты
- `checkbox.tsx` - Чекбоксы
- `slider.tsx` - Слайдеры
- `toast.tsx` / `sonner.tsx` - Уведомления
- `tooltip.tsx` - Подсказки
- `sheet.tsx` - Боковые панели
- `carousel.tsx` - Карусель
- `accordion.tsx` - Аккордеон
- `alert.tsx` - Алерты
- `avatar.tsx` - Аватары
- `badge.tsx` - Бейджи
- `calendar.tsx` - Календарь
- `command.tsx` - Command palette
- `form.tsx` - Формы
- `table.tsx` - Таблицы
- `tabs.tsx` - Вкладки
- И многие другие...

**Особенности:**
- Все компоненты построены на Radix UI
- Полностью кастомизируемы через Tailwind
- Доступны (accessibility)
- Типизированы TypeScript

---

#### Пользовательские компоненты

**`Header.tsx`**
**Назначение:** Шапка сайта с навигацией.

**Функционал:**
- Логотип с ссылкой на главную
- Живой поиск (на десктопе) / кнопка поиска (на мобильных)
- Иконки: Избранное, Корзина, Вход/Регистрация
- Счетчики товаров в избранном и корзине
- Кнопка выхода для авторизованных
- Админ-панель для администратора (tel === '380994580337')

**Состояние:**
- Подписка на изменения localStorage (favorites, cart)
- Проверка авторизации через `useAuth` хук

---

**`ProductCard.tsx`**
**Назначение:** Карточка товара в каталоге.

**Отображает:**
- Изображение товара (с fallback на placeholder)
- Название товара
- Старую цену (перечеркнутую, если есть скидка)
- Актуальную цену
- Бейдж "Скидка X%" или "Новая коллекция"

**Особенности:**
- Вся карточка - это ссылка на страницу товара
- Центрированный текст
- Адаптивная высота
- Hover эффекты

---

**`FilterPanel.tsx`**
**Назначение:** Панель навигации по каталогу.

**Содержит:**
- Переключатель пола (Он/Она/Мальчик/Девочка)
- Выбор сезона
- Список категорий
- Кнопка "Все товары"

**Особенности:**
- На мобильных - в боковой панели (Sheet)
- На десктопе - горизонтальная панель
- Динамическая загрузка категорий из БД

---

**`ProductFilter.tsx`**
**Назначение:** Фильтры товаров (не используется на всех страницах).

**Фильтры:**
- По категориям (чекбоксы)
- По цене (слайдер)
- Только в наличии (чекбокс)

---

**`LiveSearch.tsx`**
**Назначение:** Живой поиск товаров.

**Функционал:**
- Поиск по названию и артикулу
- Дебаунс запросов
- Выпадающий список результатов
- Переход на страницу товара

---

**`QuickOrderModal.tsx`**
**Назначение:** Модальное окно быстрого заказа.

**Функционал:**
- Форма с полями: имя, телефон, комментарий
- Отправка заказа в БД без регистрации
- Валидация полей

---

**`ProductImage.tsx`**
**Назначение:** Компонент для отображения изображения товара с обработкой ошибок.

---

**`RecommendedProducts.tsx`**
**Назначение:** Блок рекомендованных товаров.

---

**`Logo.tsx`**
**Назначение:** Логотип Benetton с ссылкой на главную.

---

### Детальное описание `src/pages/`

**`Index.tsx`** - Главная страница
**Содержит:**
- Hero секция с фоновым изображением
- Кнопка "Каталог магазина"
- Блок с новыми товарами (`ProductCardIndex`)
- Секция "История цвета"
- Footer

---

**`GenderSeasonPage.tsx`** - Страница каталога ⭐
**URL:** `/gender/:gender/season/:season/category/:categoryId?`

**Функционал:**
- Отображение товаров по полу, сезону, категории
- Панель фильтров
- Сетка товаров (адаптивная: 2-3-4-5 колонок)
- Кнопки "Назад" и "На главную"
- Обработка случая, когда URL - это товар (редирект)

**Логика:**
- Загрузка сезонов и категорий через `useCatalogData`
- Загрузка товаров через Supabase
- Обработка вариантов товара (группировка по цене)

### 🔧 Используемые компоненты в GenderSeasonPage:

#### **React Router (из 'react-router-dom'):**
- `useParams()` - получение параметров URL (gender, season, categoryId)
- `useNavigate()` - навигация (кнопка "Назад")
- `Link` - ссылка на главную

#### **Custom Components:**
1. **`Header`** (`@/components/Header`) - шапка сайта
2. **`ProductCard`** (`@/components/ProductCard`) - карточка товара в сетке
3. **`FilterPanel`** (`@/components/FilterPanel`) - панель фильтров (пол, сезон, категории)
4. **`ProductViewInline`** (`@/components/ProductViewInline`) - встроенный просмотр товара (если URL - это товар)

#### **shadcn/ui Components:**
1. **`Button`** (`@/components/ui/button`) - кнопки "Назад" и "На главную"
2. **`Sheet`** (`@/components/ui/sheet`) - боковая панель для мобильных:
   - `SheetTrigger` - кнопка открытия
   - `SheetContent` - содержимое панели
   - `SheetHeader` - заголовок
   - `SheetTitle` - текст заголовка

#### **Lucide Icons:**
- `Menu` - иконка меню (мобильная версия)
- `ArrowLeft` - стрелка назад
- `Home` - иконка дома

#### **Custom Hooks:**
1. **`useIsProduct`** (`@/hooks/useIsProduct`) - определяет, является ли URL товаром
2. **`useCatalogData`** (`@/hooks/useCatalogData`) - загружает сезоны и категории

#### **Supabase:**
- `supabase.from('products').select(...)` - загрузка товаров с фильтрацией

#### **Логика работы:**
```typescript
// 1. Получаем параметры URL
const { season, gender, categoryId } = useParams();

// 2. Проверяем, не является ли это страницей товара
const { isProduct, productData } = useIsProduct(decodedSeason, categoryId);

// 3. Загружаем каталожные данные (сезоны, категории)
const { seasons, categories, loading } = useCatalogData(gender, decodedSeason, isProduct);

// 4. Загружаем товары из Supabase
const query = supabase
  .from('products')
  .select('id, article, name, gender, season, category_id, categories(name), image, variants!inner(...)')
  .eq('gender', gender)
  .gt('variants.stock', 0); // Только товары в наличии

// 5. Обрабатываем варианты: группируем по цене (чтобы не дублировать товары)
data.forEach(product => {
  product.variants.forEach(variant => {
    // Добавляем только уникальные комбинации product_id + sale_price
    if (!existing) {
      result.push({ product_id, article, name, purchase_price, sale_price, discount, ... });
    }
  });
});

// 6. Отображаем в сетке через ProductCard
```

#### **Адаптивность:**
- **Desktop (md+):** FilterPanel отображается горизонтально
- **Mobile:** FilterPanel в боковой панели Sheet (открывается кнопкой "Навигация")
- **Сетка товаров:**
  - Mobile: `grid-cols-2` (2 колонки)
  - Tablet: `md:grid-cols-3` (3 колонки)
  - Desktop: `lg:grid-cols-4` (4 колонки)
  - Large: `xl:grid-cols-5` (5 колонок)

---

**`ProductPage.tsx`** - Страница товара ⭐⭐
**URL:** `/product/:id` или `/gender/:gender/season/:season/category/:categoryId/:article`

**Функционал:**
- Карусель изображений товара (умная загрузка всех изображений по префиксу)
- Информация о товаре (название, артикул, категория, сезон)
- Выбор цвета и размера
- Отображение цен (с учетом скидок и персональной скидки)
- Кнопки "Купить" и "Заказать быстро"
- Добавление в избранное
- Полноэкранный просмотр изображений

**Логика цен:**
- Если есть скидка → показываем старую и новую цену
- Если нет скидки, но есть персональная скидка пользователя → показываем "Ваша цена"
- Иначе → показываем обычную цену

### 🔧 Используемые компоненты в ProductPage:

#### **React Router (из 'react-router-dom'):**
- `useParams()` - получение параметров URL (gender, season, article)
- `useNavigate()` - навигация и редиректы
- `Link` - ссылки на категорию и сезон

#### **Custom Components:**
1. **`Header`** (`@/components/Header`) - шапка сайта
2. **`QuickOrderModal`** (`@/components/QuickOrderModal`) - модальное окно быстрого заказа
3. **`FullscreenImageModal`** (`@/components/ui/FullscreenImageModal`) - полноэкранный просмотр изображений

#### **shadcn/ui Components:**
1. **`Button`** (`@/components/ui/button`) - все кнопки на странице:
   - "Назад" / "На главную"
   - Кнопка избранного (Heart icon)
   - Кнопки выбора размера
   - "Купить" / "Заказать быстро"

2. **`Carousel`** (`@/components/ui/carousel`) - карусель изображений:
   - `CarouselContent` - контейнер слайдов
   - `CarouselItem` - отдельный слайд
   - `CarouselNext` - кнопка "следующий"
   - `CarouselPrevious` - кнопка "предыдущий"
   - `CarouselApi` - API для управления каруселью

#### **Lucide Icons:**
- `Heart` - иконка избранного (заливается красным при активации)
- `ArrowLeft` - стрелка назад
- `Home` - иконка дома

#### **Custom Hooks:**
1. **`useAuth`** (`@/hooks/useAuth`) - получение данных пользователя (для персональной скидки)

#### **Libraries:**
1. **`sonner`** - toast уведомления:
   - `toast.success()` - успешное добавление в корзину/избранное
   - `toast.error()` - ошибки
   - `toast.info()` - информационные сообщения
   - `toast.warning()` - предупреждения

2. **`@/lib/priceUtils`** - утилиты форматирования:
   - `formatPrice()` - форматирование цены ("2 109,0 грн")
   - `formatDiscount()` - форматирование скидки ("15%")

#### **Supabase:**
1. **Загрузка товара:**
```typescript
supabase
  .from('products')
  .select(`
    id, article, name, gender, season, category_id, image,
    categories(name),
    variants!inner(id, size, color, purchase_price, sale_price, discount, stock)
  `)
  .eq('article', article)
  .eq('gender', gender)
  .eq('season', decodedSeason)
  .single(); // Один товар
```

2. **Умная загрузка изображений:**
```typescript
// Получаем префикс артикула (например, '5S486X00W' из '5S486X00W.webp')
const imagePrefix = product.image.split('.')[0];

// Ищем все файлы с этим префиксом в Supabase Storage
const { data: imageList } = await supabase
  .storage
  .from('image')
  .list('img-site', {
    search: imagePrefix // Найдет: 5S486X00W.webp, 5S486X00W-1.webp, 5S486X00W-2.webp и т.д.
  });

// Формируем полные URL
const imageUrls = imageList.map(file => 
  `https://fquvncbvvkfukbwsjhns.supabase.co/storage/v1/object/public/image/img-site/${file.name}`
);
```

#### **Логика работы:**

**1. Загрузка данных:**
```typescript
// Загружаем товар и все его изображения
useEffect(() => {
  // Загрузка товара из БД
  const { data } = await supabase.from('products').select(...).single();
  
  // Умная загрузка всех изображений по префиксу артикула
  const imageList = await supabase.storage.from('image').list('img-site', { search: prefix });
  
  // Группировка вариантов по цвету
  const grouped = {};
  product.variants.forEach(variant => {
    grouped[variant.color] = grouped[variant.color] || [];
    grouped[variant.color].push(variant);
  });
  
  // Сортировка размеров внутри каждого цвета
  for (const color in grouped) {
    grouped[color].sort((a, b) => a.size.localeCompare(b.size, undefined, { numeric: true }));
  }
}, [article, gender, season]);
```

**2. Управление избранным:**
```typescript
const handleToggleFavorite = () => {
  let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  
  if (isFavorite) {
    favorites = favorites.filter(id => id !== product.id);
    toast.info("Товар удален из избранного");
  } else {
    favorites.push(product.id);
    toast.success("Товар добавлен в избранное!");
  }
  
  localStorage.setItem('favorites', JSON.stringify(favorites));
  window.dispatchEvent(new CustomEvent('favoritesChange')); // Обновляем счетчик в Header
};
```

**3. Добавление в корзину:**
```typescript
const handleAddToCart = () => {
  // Проверка авторизации
  if (!user) {
    toast.info("Пожалуйста, войдите в аккаунт", {
      action: { label: "Войти", onClick: () => navigate('/login') }
    });
    return;
  }
  
  // Расчет цены с учетом скидок
  let priceForCart = selectedVariant.purchase_price;
  if (selectedVariant.discount > 0) {
    priceForCart = selectedVariant.sale_price; // Цена со скидкой
  } else if (user.sale > 0) {
    priceForCart = selectedVariant.purchase_price * (1 - user.sale / 100); // Персональная скидка
  }
  
  // Добавление в корзину (localStorage)
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const existingItem = cart.find(item => item.id === selectedVariant.id);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: selectedVariant.id,
      productId: product.id,
      name: product.name,
      article: product.article,
      image: product.image,
      color: selectedVariant.color,
      size: selectedVariant.size,
      price: priceForCart,
      quantity: 1,
      stock: selectedVariant.stock
    });
  }
  
  localStorage.setItem('cart', JSON.stringify(cart));
  window.dispatchEvent(new CustomEvent('cartChange')); // Обновляем счетчик в Header
};
```

**4. Карусель изображений:**
```typescript
// Управление каруселью через API
const [api, setApi] = useState<CarouselApi>();
const [current, setCurrent] = useState(0);

useEffect(() => {
  if (!api) return;
  
  setCurrent(api.selectedScrollSnap()); // Текущий слайд
  
  api.on("select", () => {
    setCurrent(api.selectedScrollSnap()); // Обновляем при переключении
  });
}, [api]);

// Миниатюры под каруселью
{productImages.map((src, index) => (
  <button onClick={() => api?.scrollTo(index)}>
    <img src={src} className={current === index ? 'border-blue-500' : ''} />
  </button>
))}
```

**5. Отображение цен:**
```typescript
const inStock = selectedVariant && selectedVariant.stock > 0;
const hasDiscount = selectedVariant && selectedVariant.discount > 0;
const userSale = user?.sale > 0;

// Расчет персональной цены
let yourPrice = selectedVariant.purchase_price;
if (!hasDiscount && userSale) {
  yourPrice = selectedVariant.purchase_price * (1 - user.sale / 100);
}

// Отображение:
{hasDiscount ? (
  <>
    <p className="line-through">Цена: {formatPrice(purchase_price)}</p>
    <p className="text-red-600">Новая цена: {formatPrice(sale_price)}</p>
    <p>Скидка: {formatDiscount(discount)}</p>
  </>
) : (
  <>
    <p className={userSale ? 'line-through' : ''}>Цена: {formatPrice(purchase_price)}</p>
    {userSale && <p className="text-blue-600">Ваша цена: {formatPrice(yourPrice)}</p>}
  </>
)}
```

#### **Особенности реализации:**

1. **Умная загрузка изображений:**
   - Не хардкодим количество изображений
   - Автоматически находим все файлы по префиксу артикула
   - Основное изображение всегда первое

2. **Группировка вариантов:**
   - Варианты группируются по цвету
   - Внутри каждого цвета размеры сортируются (S, M, L, XL, 42, 44, 46...)
   - Недоступные размеры (stock = 0) отображаются серыми

3. **Адаптивная сетка:**
   - Desktop: 2 колонки (изображения | информация)
   - Mobile: 1 колонка (изображения сверху, информация снизу)

4. **Интеграция с localStorage:**
   - Избранное хранится как массив ID товаров
   - Корзина хранится как массив объектов CartItem
   - События `favoritesChange` и `cartChange` обновляют счетчики в Header

---

**`CartPage.tsx`** - Корзина
**Функционал:**
- Список товаров в корзине
- Изменение количества
- Удаление товаров
- Итоговая сумма
- Кнопка "Оформить заказ"

**Хранение:** localStorage

---

**`CheckoutPage.tsx`** - Оформление заказа
**Функционал:**
- Форма с данными покупателя
- Выбор способа доставки
- Подтверждение заказа
- Отправка в БД

---

**`FavoritesPage.tsx`** - Избранное
**Функционал:**
- Список избранных товаров
- Удаление из избранного
- Переход на страницу товара

**Хранение:** localStorage

---

**`AdminPage.tsx`** - Админ-панель (список пользователей)
**Доступ:** только для tel === '380994580337'

**Функционал:**
- Список всех пользователей
- Поиск по имени/телефону
- Просмотр заказов пользователя

---

**`AdminProductsPage.tsx`** - Управление товарами
**Функционал:**
- Список всех товаров
- Редактирование товаров
- Добавление новых товаров

---

**`QuickOrdersAdminPage.tsx`** - Быстрые заказы
**Функционал:**
- Список заказов через "Быстрый заказ"
- Изменение статуса заказа

---

**`UserOrdersPage.tsx`** - Заказы пользователя
**Функционал:**
- История заказов конкретного пользователя
- Детали каждого заказа

---

**`SearchPage.tsx`** - Страница поиска (мобильная версия)
**Функционал:**
- Полноэкранный поиск для мобильных устройств

---

**`LoginPage.tsx`** - Вход
**Функционал:**
- Форма входа (телефон + пароль)
- Валидация
- Сохранение в localStorage

---

**`RegistrationPage.tsx`** - Регистрация
**Функционал:**
- Форма регистрации
- Валидация
- Создание пользователя в БД

---

**`OrderSuccessPage.tsx`** - Успешный заказ
**Функционал:**
- Страница благодарности после оформления заказа

---

**`NotFound.tsx`** - 404
**Функционал:**
- Страница "Не найдено"

---

### Детальное описание `src/hooks/`

**`useAuth.ts`** - Хук авторизации
**Возвращает:**
- `user` - объект пользователя или null
- `loading` - статус загрузки
- `logout` - функция выхода

**Логика:**
- Читает данные из localStorage
- Парсит поле `sale` (скидка пользователя)

---

**`useCatalogData.ts`** - Хук загрузки каталога
**Параметры:**
- `gender` - пол
- `decodedSeason` - сезон
- `isProduct` - флаг, является ли URL товаром

**Возвращает:**
- `seasons` - список сезонов
- `categories` - список категорий
- `loading` - статус загрузки

**Логика:**
- Загружает уникальные сезоны для выбранного пола
- Загружает категории с товарами в наличии
- Фильтрует по сезону (если выбран)

---

**`useIsProduct.ts`** - Хук определения типа URL
**Назначение:** Определяет, является ли URL страницей товара или каталога.

**Возвращает:**
- `isProduct` - boolean или null
- `productData` - данные товара (если найден)

---

**`useProductFilters.ts`** - Хук фильтрации товаров
**Назначение:** Управление состоянием фильтров.

---

**`use-mobile.tsx`** - Хук определения мобильного устройства
**Возвращает:** boolean

---

**`use-toast.ts`** - Хук для уведомлений
**Назначение:** Управление toast уведомлениями.

---

### Детальное описание `src/lib/`

**`supabase.ts`** - Клиент Supabase
**Содержит:**
- Инициализация клиента Supabase
- URL и ключ API
- Интерфейс `Database` с типами таблиц

**Таблицы:**
- `categories` - категории товаров
- `products` - товары
- `variants` - варианты товаров (размер, цвет, цена)

---

**`supabase-api.ts`** - API методы
**Методы:**
- `searchProducts(query)` - поиск товаров
- `getProduct(article)` - получение товара по артикулу

**Особенности:**
- Использует кэширование через `cacheService`
- Обрабатывает варианты товара
- Возвращает плоскую структуру для `ProductCard`

---

**`database.ts`** - Интерфейсы БД
**Содержит:**
- TypeScript интерфейсы для таблиц
- Mock данные для разработки
- Функции для работы с mock данными

---

**`cacheService.ts`** - Сервис кэширования
**Назначение:** In-memory кэш для API запросов.

**Методы:**
- `get(key)` - получить из кэша
- `set(key, data)` - сохранить в кэш
- `remove(key)` - удалить из кэша
- `clear()` - очистить весь кэш
- `generateKey(url, params)` - генерация ключа

**TTL:** 5 минут по умолчанию

---

**`priceUtils.ts`** - Утилиты для работы с ценами
**Функции:**
- `parseDbPrice(value)` - парсинг цены из БД (обрабатывает формат "2,109")
- `formatPrice(value)` - форматирование цены для отображения ("2 109,0 грн")
- `formatDiscount(value)` - форматирование скидки ("15%")

**Особенности:**
- Обрабатывает запятую как разделитель тысяч
- Всегда добавляет ",0" в конце
- Использует локаль ru-RU

---

**`utils.ts`** - Общие утилиты
**Функция `cn(...inputs)`:**
- Объединяет классы Tailwind
- Использует `clsx` и `tailwind-merge`
- Предотвращает конфликты классов

---

**`getProductImageCandidates.ts`** - Утилита для работы с изображениями
**Назначение:** Генерация списка возможных URL изображений товара.

---

### `public/` - Статические файлы

```
public/
└── img-site/           # Изображения товаров
    ├── *.webp          # Изображения в формате WebP
    ├── placeholder.webp # Заглушка для отсутствующих изображений
    └── ...
```

**Особенности:**
- Изображения хранятся в Supabase Storage
- Локальная папка используется для разработки
- Формат: `{article}.webp`, `{article}-1.webp`, `{article}-2.webp` и т.д.

---

## 🏗️ Архитектура приложения

### Роутинг

**Структура маршрутов:**
```
/ - Главная страница
/registration - Регистрация
/login - Вход
/cart - Корзина
/checkout - Оформление заказа
/order-success - Успешный заказ
/favorites - Избранное
/search - Поиск (мобильная версия)
/product/:id - Страница товара (новый формат)

/gender/:gender/season/:season - Каталог
/gender/:gender/season/:season/category/:categoryId - Категория
/category/:gender/:categoryId - Категория (старый формат)

/admin - Админ-панель (редирект на /admin/user)
/admin/user - Список пользователей
/admin/products - Управление товарами
/admin/user/:id - Заказы пользователя
/admin/quick-orders - Быстрые заказы

/* - 404
```

**Особенности:**
- Использует React Router v6
- Поддержка legacy URL структуры
- Защита админских маршрутов (проверка в компонентах)

---

### Управление состоянием

**Глобальное состояние:**
- **TanStack Query** - серверное состояние (кэширование, рефетчинг)
- **localStorage** - корзина, избранное, пользователь

**Локальное состояние:**
- **useState** - для UI состояния
- **Custom hooks** - для переиспользуемой логики

---

### Аутентификация

**Текущая реализация:**
- Простая система на localStorage
- Проверка по телефону и паролю
- Хранение объекта пользователя в localStorage

**⚠️ Для production:**
- Нужно использовать Supabase Auth
- JWT токены
- Защищенные роуты

---

### Работа с изображениями

**Стратегия загрузки:**
1. Основное изображение: `{article}.webp`
2. Дополнительные: `{article}-1.webp`, `{article}-2.webp` и т.д.
3. Умная загрузка: запрос списка файлов по префиксу
4. Fallback на placeholder при ошибке

**Хранилище:**
- Supabase Storage bucket: `image/img-site/`
- Публичный доступ

---

## 💾 База данных и API

### Структура БД (Supabase/PostgreSQL)

**Таблица `categories`:**
```sql
id: integer (PK)
name: text
```

**Таблица `products`:**
```sql
id: integer (PK)
article: text (уникальный артикул)
name: text
category_id: integer (FK → categories)
brand: text
season: text
gender: text ('чол', 'жiн', 'хлопч', 'дiвч')
image: text (имя файла)
```

**Таблица `variants`:**
```sql
id: integer (PK)
product_id: integer (FK → products)
size: text
color: text
barcode: text
stock: integer (количество на складе)
purchase_price: numeric (закупочная цена)
sale_price: numeric (цена продажи)
discount: numeric (процент скидки)
```

**Таблица `users` (предполагается):**
```sql
id: integer (PK)
name: text
tel: text (уникальный)
password: text (хешированный)
sale: numeric (персональная скидка в %)
```

**Таблица `orders` (предполагается):**
```sql
id: integer (PK)
user_id: integer (FK → users)
created_at: timestamp
status: text
total: numeric
items: jsonb (массив товаров)
```

**Таблица `quick_orders` (предполагается):**
```sql
id: integer (PK)
name: text
tel: text
product_id: integer
variant_id: integer
comment: text
created_at: timestamp
status: text
```

---

### API Endpoints (через Supabase)

**Все запросы идут через Supabase Client:**

**Получение товаров:**
```typescript
supabase
  .from('products')
  .select('*, categories(name), variants(*)')
  .eq('gender', gender)
  .gt('variants.stock', 0)
```

**Поиск:**
```typescript
supabase
  .from('products')
  .select('*, variants!inner(*)')
  .or(`name.ilike.%${query}%,article.ilike.%${query}%`)
  .gt('variants.stock', 0)
```

**Получение товара:**
```typescript
supabase
  .from('products')
  .select('*, categories(name), variants(*)')
  .eq('article', article)
  .single()
```

---

### Кэширование

**Стратегия:**
- In-memory кэш через `cacheService`
- TTL: 5 минут
- Ключи генерируются из URL и параметров

**Что кэшируется:**
- Результаты поиска
- Данные товаров
- Списки категорий и сезонов

---

## 🎨 Стилизация

### Tailwind CSS

**Кастомные классы:**
```css
.collections-buttons - Кнопки коллекций (адаптивные)
.recommended-grid - Сетка рекомендованных товаров
```

**CSS переменные (в `index.css`):**
```css
--background, --foreground
--primary, --primary-foreground
--secondary, --secondary-foreground
--accent, --accent-foreground
--muted, --muted-foreground
--destructive, --destructive-foreground
--border, --input, --ring
--radius
--sidebar-*
```

**Темная тема:**
- Переключается через класс `.dark`
- Все цвета через CSS переменные

---

### Адаптивность

**Брейкпоинты Tailwind:**
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1400px (кастомный)

**Сетки товаров:**
- Mobile: 2 колонки
- Tablet: 3 колонки
- Desktop: 4-5 колонок

---

## 🛠️ Команды для работы

### Установка зависимостей
```bash
pnpm install
```

### Запуск dev-сервера
```bash
pnpm run dev
```
**Доступ:**
- Local: http://localhost:5174/
- Network: http://192.168.5.109:5174/ (и другие IP)

### Production сборка
```bash
pnpm run build
```
**Результат:** папка `dist/`

### Предпросмотр production сборки
```bash
pnpm run preview
```

### Линтинг
```bash
pnpm run lint
```

### Добавление компонента shadcn/ui
```bash
npx shadcn-ui@latest add <component-name>
```

---

## 🔍 Что я понял

### ✅ Полностью понятно:

1. **Архитектура проекта** - классический React SPA с Vite
2. **Роутинг** - React Router v6 с поддержкой legacy URL
3. **Стилизация** - Tailwind CSS + shadcn/ui компоненты
4. **База данных** - Supabase (PostgreSQL) с таблицами products, variants, categories
5. **Аутентификация** - простая система на localStorage (для production нужна доработка)
6. **Управление состоянием** - TanStack Query + localStorage
7. **Работа с изображениями** - Supabase Storage с умной загрузкой по префиксу
8. **Кэширование** - in-memory кэш с TTL 5 минут
9. **Адаптивность** - mobile-first подход
10. **Компоненты** - переиспользуемые, типизированные

### ❓ Требует уточнения:

1. **Структура таблиц `users`, `orders`, `quick_orders`** - предполагаю структуру, но нужно проверить в БД
2. **Полная логика оформления заказа** - как сохраняются заказы, какие статусы
3. **Система оплаты** - есть ли интеграция с платежными системами?
4. **Отправка email/SMS** - есть ли уведомления после заказа?
5. **Админские права** - только проверка по телефону или есть роли в БД?
6. **Логирование и аналитика** - какие инструменты используются?
7. **Деплой** - где хостится приложение? (Vercel, Netlify, VPS?)
8. **CI/CD** - есть ли автоматический деплой?
9. **Тестирование** - есть ли тесты? (unit, integration, e2e)
10. **Мониторинг ошибок** - Sentry, LogRocket?

---

## 📝 Рекомендации для улучшения

1. **Безопасность:**
   - Переместить аутентификацию на Supabase Auth
   - Использовать Row Level Security (RLS) в БД
   - Хранить чувствительные данные в переменных окружения

2. **Производительность:**
   - Добавить lazy loading для страниц
   - Оптимизировать изображения (responsive images)
   - Использовать React.memo для тяжелых компонентов

3. **SEO:**
   - Добавить Server-Side Rendering (Next.js) или Static Site Generation
   - Улучшить мета-теги для каждой страницы
   - Добавить sitemap.xml и robots.txt

4. **UX:**
   - Добавить скелетоны вместо "Загрузка..."
   - Улучшить обработку ошибок
   - Добавить анимации переходов

5. **Разработка:**
   - Добавить unit тесты (Vitest)
   - Настроить Storybook для компонентов
   - Добавить pre-commit хуки (Husky + lint-staged)

---

## 🤝 Готов помочь с:

1. Уточнением структуры БД
2. Доработкой функционала
3. Оптимизацией производительности
4. Настройкой деплоя
5. Добавлением новых фич
6. Рефакторингом кода
7. Написанием тестов
8. Улучшением документации

**Задавайте вопросы по любому аспекту проекта!** 🚀

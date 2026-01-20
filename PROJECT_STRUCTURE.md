# 📁 Структура проекта

Проект построен по методологии **Feature-Sliced Design (FSD)** для обеспечения масштабируемости и поддерживаемости кода.

## Структура папок

```
ruletka/
├── public/
│   └── vite.svg                    # Иконка приложения
├── src/
│   ├── app/                        # 🎯 Слой приложения
│   │   ├── App.tsx                 # Корневой компонент
│   │   └── styles/
│   │       └── index.css           # Глобальные стили
│   │
│   ├── pages/                      # 📄 Страницы
│   │   └── GamePage/
│   │       ├── ui/
│   │       │   ├── GamePage.tsx    # Главная страница игры
│   │       │   └── GamePage.css
│   │       └── index.ts
│   │
│   ├── widgets/                    # 🧩 Виджеты (композитные блоки)
│   │   ├── SlotMachine/            # Слот-машина
│   │   │   ├── ui/
│   │   │   │   ├── SlotMachine.tsx
│   │   │   │   ├── SlotMachine.css
│   │   │   │   ├── SymbolView/     # Отображение символа
│   │   │   │   ├── ReelView/       # Отображение барабана
│   │   │   │   └── LinesOverlay/   # Оверлей выигрышных линий
│   │   │   └── index.ts
│   │   │
│   │   ├── ControlPanel/           # Панель управления
│   │   │   ├── ui/
│   │   │   │   ├── ControlPanel.tsx
│   │   │   │   └── ControlPanel.css
│   │   │   └── index.ts
│   │   │
│   │   ├── InfoPanel/              # Информационная панель
│   │   │   ├── ui/
│   │   │   │   ├── InfoPanel.tsx
│   │   │   │   └── InfoPanel.css
│   │   │   └── index.ts
│   │   │
│   │   └── PaytableModal/          # Модальное окно таблицы выплат
│   │       ├── ui/
│   │       │   ├── PaytableModal.tsx
│   │       │   └── PaytableModal.css
│   │       └── index.ts
│   │
│   ├── entities/                   # 📦 Бизнес-сущности
│   │   └── game/
│   │       ├── model/
│   │       │   └── store.ts        # Zustand store игры
│   │       └── index.ts
│   │
│   └── shared/                     # 🔧 Общий код
│       ├── types/
│       │   └── game.ts             # TypeScript типы
│       ├── config/
│       │   ├── lines.ts            # Конфигурация 20 линий
│       │   └── payouts.ts          # Таблица выплат
│       ├── lib/
│       │   ├── symbolGenerator.ts  # Генерация символов
│       │   └── winCalculator.ts    # Расчет выигрышей
│       └── ui/
│           └── Button/             # Переиспользуемая кнопка
│               ├── Button.tsx
│               ├── Button.css
│               └── index.ts
│
├── package.json                    # Зависимости
├── vite.config.ts                  # Конфигурация Vite
├── tsconfig.json                   # Конфигурация TypeScript
├── README.md                       # Основная документация
├── GAME_RULES.md                   # Правила игры
└── PROJECT_STRUCTURE.md            # Этот файл

```

## Слои FSD

### 1. **app** - Инициализация приложения
- Настройка провайдеров
- Глобальные стили
- Точка входа приложения

### 2. **pages** - Страницы приложения
- `GamePage` - основная игровая страница
- Композиция виджетов

### 3. **widgets** - Крупные блоки UI
- `SlotMachine` - визуализация игрового поля
- `ControlPanel` - управление игрой
- `InfoPanel` - отображение статистики
- `PaytableModal` - информация о выплатах

### 4. **entities** - Бизнес-сущности
- `game` - состояние игры (Zustand store)
- Логика управления состоянием

### 5. **shared** - Переиспользуемый код
- **types** - TypeScript интерфейсы и типы
- **config** - конфигурация игры
- **lib** - утилиты и хелперы
- **ui** - переиспользуемые UI компоненты

## Ключевые файлы

### Конфигурация игры

**`shared/config/lines.ts`**
- 20 фиксированных линий выигрыша
- Паттерны линий для 5×3 поля

**`shared/config/payouts.ts`**
- Таблица выплат для всех символов
- Веса символов для генерации
- Настройки бонусной игры

### Логика игры

**`shared/lib/symbolGenerator.ts`**
- Генерация случайных символов
- Генерация барабанов
- Специальная логика для бонусов

**`shared/lib/winCalculator.ts`**
- Проверка выигрышных комбинаций
- Расчет выплат
- Обработка Wild символов

**`entities/game/model/store.ts`**
- Zustand store для управления состоянием
- Действия: spin, setBet, buyBonus
- Обработка бонусной игры

## Технологический стек

- **React 18** - UI библиотека
- **TypeScript** - типизация
- **Vite** - сборщик и dev сервер
- **Zustand** - управление состоянием
- **CSS3** - стилизация и анимации

## Путевые алиасы

Настроены алиасы для удобного импорта:

```typescript
import { useGameStore } from '@entities/game';
import { Button } from '@shared/ui/Button';
import { PAYLINES } from '@shared/config/lines';
import { SlotMachine } from '@widgets/SlotMachine';
```

Доступные алиасы:
- `@app/*` → `src/app/*`
- `@pages/*` → `src/pages/*`
- `@widgets/*` → `src/widgets/*`
- `@entities/*` → `src/entities/*`
- `@shared/*` → `src/shared/*`

## Преимущества FSD архитектуры

1. **Масштабируемость** - легко добавлять новые фичи
2. **Изолированность** - слои не зависят друг от друга
3. **Переиспользование** - shared компоненты доступны везде
4. **Понятность** - четкая структура и ответственность
5. **Тестируемость** - легко тестировать отдельные части

## Добавление новых функций

### Добавить новый символ
1. Обновить `SymbolType` enum в `shared/types/game.ts`
2. Добавить выплаты в `shared/config/payouts.ts`
3. Добавить вес в `SYMBOL_WEIGHTS`
4. Добавить отображение в `SymbolView.tsx`

### Добавить новую линию
1. Добавить паттерн в `shared/config/lines.ts`
2. Линия автоматически будет учитываться в расчетах

### Добавить новую фичу
1. Создать папку в `features/`
2. Добавить UI компоненты
3. Интегрировать в store или создать отдельный
4. Подключить в widget или page

## Стилизация

- **CSS Modules** не используются (классический CSS)
- **БЭМ** методология для именования классов
- **CSS переменные** можно добавить в `app/styles/index.css`
- **Анимации** через @keyframes

## State Management

### Zustand Store (`entities/game/model/store.ts`)

**State:**
- `reels` - текущие символы на барабанах
- `balance` - баланс игрока
- `bet` - текущая ставка
- `isSpinning` - идет ли вращение
- `isBonusGame` - активна ли бонусная игра
- `freeSpinsLeft` - оставшиеся фриспины
- `winningLines` - выигрышные линии

**Actions:**
- `spin()` - запуск спина
- `setBet(bet)` - изменение ставки
- `buyBonus()` - покупка бонуса
- `reset()` - сброс игры

## Расширение проекта

Проект готов к расширению:
- Добавить звуковые эффекты
- Сохранение прогресса (LocalStorage)
- История игр
- Турнирный режим
- Мультиплеер
- Бэкенд интеграция


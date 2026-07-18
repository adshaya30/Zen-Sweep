# Zen Sweep — Mobile App

A production-ready React Native mobile application. This document is the starting point for every team member: it explains the tech stack, the folder structure, and how to run the app.

## Tech Stack

| Area         | Technology                          | Purpose                                        |
| ------------ | ----------------------------------- | ---------------------------------------------- |
| Framework    | Expo SDK 54                         | React Native toolchain, build, and dev tooling |
| Language     | TypeScript (strict)                 | Type-safe application code                     |
| UI runtime   | React Native                        | Native mobile UI                               |
| Styling      | NativeWind v4 (Tailwind CSS)        | Utility-class styling via `className`          |
| Navigation   | React Navigation (native stack)     | Screen routing (Expo Router is not used)       |
| Auth         | Firebase Authentication             | User sign-in / sign-up _(planned)_             |
| Database     | Cloud Firestore                     | App data storage _(planned)_                   |
| File storage | Firebase Storage                    | Media and file uploads _(planned)_             |
| Client state | Zustand                             | Lightweight global state _(planned)_           |
| Server state | TanStack Query (React Query)        | Data fetching / caching _(planned)_            |
| Forms        | React Hook Form                     | Form state and handling _(planned)_            |
| Validation   | Zod                                 | Schema validation _(planned)_                  |
| HTTP         | Axios                               | External API calls when needed _(planned)_     |
| Linting      | ESLint (Expo flat config)           | Code quality rules                             |
| Formatting   | Prettier (+ Tailwind class sorting) | Consistent code style                          |

> Items marked _(planned)_ have their folders and placeholders ready, but no implementation yet.

## Folder Structure

Everything lives under `src/`, grouped by responsibility. This keeps the codebase modular and easy to navigate as the team grows.

```text
frontend/
├── assets/              # Static assets bundled into the app
│   ├── fonts/           # Font files
│   ├── icons/           # Icon artwork
│   ├── images/          # Images
│   ├── animations/      # Lottie / animation files
│   └── splash/          # Splash-screen art
│
├── src/
│   ├── app/             # App bootstrap & provider composition (startup wiring)
│   ├── navigation/      # Navigators (root/auth/main) + route types
│   ├── screens/         # Route-level screens, grouped by product area
│   ├── components/      # Reusable UI (common, ui, forms, cards, modals, layouts)
│   ├── features/        # Self-contained domain modules (auth, tasks, rooms, ...)
│   ├── services/        # External integrations (firebase, api, storage, notifications)
│   ├── hooks/           # Reusable React hooks
│   ├── store/           # Zustand client-state stores
│   ├── context/         # React context providers
│   ├── types/           # Shared TypeScript types
│   ├── constants/       # App-wide constants (routes, fonts, storage keys, colors)
│   ├── utils/           # Pure helpers (validators, formatters, helpers)
│   ├── theme/           # Design tokens (colors, spacing, typography, shadows, radii)
│   ├── config/          # Validated environment/runtime configuration
│   └── lib/             # Thin wrappers around third-party libraries
│
├── App.tsx              # App entry — renders the root navigation
├── global.css           # Tailwind directives for NativeWind
├── .env                 # Local secrets (git-ignored, never commit)
└── .env.example         # Safe template listing required env variable names
```

### How the layers fit together

- **`screens/`** are thin — they handle layout and presentation, and delegate real work.
- **`features/`** hold the domain logic for each area (auth, tasks, etc.), keeping business rules out of screens.
- **`services/`** talk to the outside world (Firebase, APIs). Nothing else should call those directly.
- **`components/`** are reusable and presentational; they don't own business logic.
- **`store/`** (Zustand) holds client state; **TanStack Query** will handle server state.
- **`theme/`** and **`constants/`** hold shared values so they're defined once and reused everywhere.

### Import conventions

- Each folder has an `index.ts` **barrel** so imports stay short, e.g. `import { PrimaryButton } from '../components'`.
- Empty barrels currently export `{}` as placeholders; real exports get added as features are built.
- Every empty folder has a `README.md` describing what belongs there.

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm start
```

Then open the **Expo Go** app on your phone (Android/iOS) and scan the QR code. Phone and computer must be on the same Wi-Fi. If the connection fails on a restricted network, use:

```bash
npx expo start --tunnel
```

## Everyday Commands

| Command                | What it does                            |
| ---------------------- | --------------------------------------- |
| `npm start`            | Start the Expo dev server               |
| `npm run android`      | Open on Android                         |
| `npm run ios`          | Open on iOS                             |
| `npm run web`          | Open in the browser                     |
| `npm run lint`         | Run ESLint                              |
| `npm run lint:fix`     | Auto-fix lint issues                    |
| `npm run format`       | Format all files with Prettier          |
| `npm run format:check` | Check formatting without changing files |
| `npm run typecheck`    | Run the TypeScript type checker         |

## Conventions for Contributors

- Write code in **TypeScript**; keep `strict` mode happy.
- Style with **NativeWind `className`** utilities, not inline `style` objects, where possible.
- Run `npm run lint` and `npm run typecheck` before opening a PR.
- Keep secrets in `.env` (git-ignored). Document any new variable in `.env.example`.
- Put new code in the right layer: screens stay thin, logic goes in `features/`, external calls go in `services/`.

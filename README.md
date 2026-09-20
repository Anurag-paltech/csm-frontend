# Warranty Claims — Frontend

Single-page application for submitting warranty claims, reviewing AI-generated
feedback, and tracking claim history, with an admin area for user/role
management.

> **Status:** project foundation only. Routing, auth, API client, and state
> management are wired up; screen UIs are stubbed and will be implemented from a
> UI mockup.

## Tech stack

| Concern            | Choice                                             |
| ------------------ | -------------------------------------------------- |
| Build tool         | [Vite](https://vite.dev)                           |
| UI library         | [React](https://react.dev) 19                      |
| Styling            | [Tailwind CSS](https://tailwindcss.com) v4         |
| Routing            | [React Router](https://reactrouter.com) 7          |
| Server state       | [TanStack Query](https://tanstack.com/query) 5     |
| Client/global state| React Context                                      |
| HTTP client        | [Axios](https://axios-http.com) (shared instance)  |
| Forms + validation | [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev) |

Language is **JavaScript (JSX)** — see [DEVELOPMENT.md](./docs/DEVELOPMENT.md#language)
for the rationale and the path to TypeScript if needed later.

## Prerequisites

- Node.js `>= 20`
- npm `>= 10`

## Setup

```bash
npm install
cp .env.example .env   # then edit if your backend isn't on localhost:8000
```

### Environment variables

| Variable              | Default | Purpose                                              |
| --------------------- | ------- | --------------------------------------------------- |
| `VITE_API_BASE_URL`   | `''`    | API base URL. Empty = root-relative (same origin as the app), which the BFF expects. |
| `VITE_DEV_API_PROXY`  | `http://localhost:8000` | Backend origin the dev server proxies BFF routes to (`/auth`, `/me`, `/claims`, `/admin`, `/health`). |
| `VITE_AUTH_BYPASS`    | _(unset)_ | Dev only — skip auth and run as a mock user. See [AUTH.md](./docs/AUTH.md#development-bypass). |

The backend is a **BFF**: it runs the OAuth flow, holds tokens server-side, and
the browser only gets cookies. The Vite dev server proxies backend routes so the
app shares the backend's origin (needed for cookies) — see [AUTH.md](./docs/AUTH.md).

## Common commands

```bash
npm run dev       # start the dev server (http://localhost:5173)
npm run build     # production build to dist/
npm run preview   # serve the production build locally
npm run lint      # run ESLint
```

## Project layout

```
src/
├── app/          # app composition: providers + router
├── components/   # shared, feature-agnostic UI (ui/, layout/, feedback/, pages/)
├── config/       # build-time config access (env)
├── features/     # one folder per feature (auth, srt, admin, ...)
├── lib/          # cross-cutting infrastructure (apiClient, queryClient, ...)
└── routes/       # route path constants + route guards
```

See [ARCHITECTURE.md](./docs/ARCHITECTURE.md) for the full picture.

## Documentation

- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) — folder structure and layering
- [AUTH.md](./docs/AUTH.md) — BFF model, cookies, CSRF, 401 refresh/retry, role guards
- [API.md](./docs/API.md) — API client conventions and feature API structure
- [DEVELOPMENT.md](./docs/DEVELOPMENT.md) — conventions and how to add a feature

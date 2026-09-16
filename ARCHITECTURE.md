# Architecture

## Goals

- **Feature-based** organization: everything a feature needs lives in one folder.
- **Clear separation** between UI, feature logic, API access, auth, routing, and
  state management.
- **No premature abstraction.** Shared code is extracted only once a second
  consumer exists.

## Layers

```
┌─────────────────────────────────────────────────────────────┐
│  app/            Composition root: providers + router        │
├─────────────────────────────────────────────────────────────┤
│  routes/         Path constants + <ProtectedRoute>/<RoleRoute>│
├─────────────────────────────────────────────────────────────┤
│  features/*      Feature slices (pages, components, hooks,    │
│                  api, schemas)                               │
├─────────────────────────────────────────────────────────────┤
│  components/     Shared, feature-agnostic UI                 │
├─────────────────────────────────────────────────────────────┤
│  lib/            Infrastructure: apiClient, queryClient,     │
│                  authStorage, apiError                       │
├─────────────────────────────────────────────────────────────┤
│  config/         env access                                  │
└─────────────────────────────────────────────────────────────┘
```

Dependencies point **downward only**. `lib/` and `components/` never import from
`features/`. Features never import another feature's internals — only its public
`index.js` (the auth feature is the one shared dependency: guards and layout use
`useAuth`/`ROLES`).

## Folder structure

```
src/
├── app/
│   ├── providers.jsx        # QueryClientProvider > AuthProvider > devtools
│   └── router.jsx           # createBrowserRouter route tree
│
├── assets/
│   └── csm-logo.png         # real image assets (not code)
│
├── components/
│   ├── ui/                  # Button, Input, Select, Textarea, Combobox,
│   │                        # FormField, Badge, Card, Pager, Spinner, ...
│   ├── layout/              # AppLayout, NavBar (desktop + mobile nav), PageHeader
│   ├── feedback/            # PlaceholderPanel (temporary, for unbuilt screens)
│   └── pages/                # NotFoundPage, ForbiddenPage, ServerErrorPage
│
├── config/
│   └── env.js               # the only reader of import.meta.env
│
├── hooks/
│   └── useDebouncedValue.js # cross-cutting hooks with no feature/domain home
│
├── features/
│   ├── auth/
│   │   ├── api/authApi.js              # me(), logout()
│   │   ├── context/AuthContext.js      # createContext only
│   │   ├── context/AuthProvider.jsx    # provider component
│   │   ├── hooks/useAuth.js
│   │   ├── pages/LoginPage.jsx         # public gate: "Sign in with Microsoft"
│   │   ├── roles.js
│   │   └── index.js                    # public surface
│   ├── srt/                 # SRT recommendation: query form, results,
│   │                        # selection, and history (route `/` and `/history`)
│   └── admin/                # admin console: user management
│
├── lib/
│   ├── apiClient.js         # shared Axios instance + interceptors
│   ├── apiError.js          # ApiError class + getErrorMessage()
│   ├── authStorage.js       # non-authoritative cached user snapshot
│   ├── format.js            # formatDate/formatDateTime/formatNumber
│   └── queryClient.js       # TanStack Query client + defaults
│
├── routes/
│   ├── paths.js             # in-app route path constants
│   ├── ProtectedRoute.jsx   # requires a session (else -> /login gate)
│   └── RoleRoute.jsx        # requires a role (else redirect to /403)
│
├── App.jsx
├── main.jsx
└── index.css                # @import "tailwindcss" + design tokens
```

## Feature anatomy

Each feature folder may contain:

| Subfolder / file | Responsibility                                                  |
| ---------------- | -------------------------------------------------------------- |
| `pages/`         | Route-level components (one per route).                        |
| `components/`    | Presentational components used only by this feature.           |
| `hooks/`         | TanStack Query hooks + feature-local logic. Query-key factory. |
| `api/`           | `<feature>Api` object — one method per backend endpoint.       |
| `schemas/`       | Zod schemas + default values for this feature's forms.         |
| `index.js`       | Re-exports the feature's public surface (pages, hooks).        |

Not every feature needs every subfolder. Create them when there's content.

## Routing

Defined in [src/app/router.jsx](./src/app/router.jsx) with `createBrowserRouter`.
Structure:

```
/login                                      public sign-in gate
<ProtectedRoute>                             resolves GET /me; else -> /login
  <AppLayout>                                sidebar + topbar chrome
    /                     -> SRT recommendation (query form / results / selection)
    /history              -> SRT recommendation history
    <RoleRoute admin>
      /admin              -> Admin console
/403                                         forbidden (logged in, wrong role)
*                                            not found
```

`/login` is a public page with a "Sign in with Microsoft" button (no credentials
form) that hands off to the BFF's `/auth/login`; see [AUTH.md](./AUTH.md).
`ProtectedRoute` renders a spinner while `/me` resolves, `<Navigate>`s to
`/login` on `unauthenticated`, and shows a retry screen on a server/network
error. Path strings live only in [src/routes/paths.js](./src/routes/paths.js).

`/` composes three views inside one feature (`features/srt`) rather than three
routes — query form, recommendation results, and the selected-codes summary —
switched with local state, plus an optional `?rec=<id>` to open a past
recommendation from History. See `SRT_RECOMMENDATION_API.md` for the API this
feature is built against.

## State management

| Kind of state                          | Where it lives                          |
| --------------------------------------- | --------------------------------------- |
| Server data (recommendations, users…)   | **TanStack Query** (`features/*/hooks`) |
| Auth session / current user / roles     | **React Context** (`features/auth`)     |
| Ephemeral UI state (form, toggles)      | Local component state / React Hook Form |

There is intentionally no Redux/Zustand/global store. If a genuine cross-feature
client-state need appears, add a dedicated context under `app/` or the owning
feature — don't reach for a store library by default.

### Why the split

TanStack Query already solves caching, deduping, background refetch, and
loading/error state for anything that comes from the API. Context is reserved
for the small amount of state that is truly global and not server-owned (the
session). Keeping these separate avoids duplicating server data into a store and
keeping it in sync by hand.

## Error handling

- Every rejected request from `apiClient` rejects with an `ApiError`
  (`lib/apiError.js`) — consistent `status`, `code`, `message`, `data`.
- `getErrorMessage(err)` yields a safe user-facing string.
- `401` → the interceptor runs one `POST /auth/refresh`, retries the request, and
  redirects to the BFF login if that fails (see [AUTH.md](./AUTH.md)).
- `403` → rejects as an `ApiError`; screens show an inline "not authorized" state.
- Query-level retries skip `4xx` (see `lib/queryClient.js`).

## Build & tooling

- **Vite** with `@vitejs/plugin-react` and `@tailwindcss/vite`.
- Path alias `@/` → `src/` (configured in `vite.config.js` and `jsconfig.json`).
- **Tailwind v4**: no `tailwind.config.js` / `postcss.config.js`; configuration
  (if needed) is CSS-first in `src/index.css`.
- **ESLint** flat config with `react-hooks` and `react-refresh` rules.

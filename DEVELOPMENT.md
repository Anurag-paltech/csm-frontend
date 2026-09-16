# Development Guide

## Language

The project is **JavaScript + JSX**, matching the requested stack (TypeScript was
not specified). To keep runtime safety where it matters most:

- All API payloads that enter a form are validated with **Zod** schemas.
- `jsconfig.json` enables editor IntelliSense and the `@/` path alias.
- JSDoc is used on non-obvious shapes.

**Migrating to TypeScript later** is mechanical and incremental: rename files to
`.ts`/`.tsx`, add `tsconfig.json` (mirror `jsconfig.json`), swap
`@vitejs/plugin-react` config as needed, and type modules feature-by-feature.
The folder structure and boundaries do not change.

## Conventions

### Naming

| Kind | Convention | Example |
| ---- | ---------- | ------- |
| Component file & export | `PascalCase.jsx` | `PageHeader.jsx` → `PageHeader` |
| Hook file & export | `useX.js` | `useAuth.js` → `useAuth` |
| API module | `<feature>Api.js` → `<feature>Api` | `srtApi.js` |
| Zod schema | `xSchema` (+ `xDefaultValues`) | `querySchema` |
| Query-key factory | `<feature>Keys` | `recommendationKeys` |
| Route path constants | `paths.*` in `routes/paths.js` | `paths.history` |
| Plain functions/vars | `camelCase` | `getErrorMessage` |
| Constants | `UPPER_SNAKE` / `ROLES.ADMIN` | `ROLES` |

### Imports

- Use the `@/` alias for anything outside the current folder:
  `import { Button } from '@/components/ui/Button'`.
- Import other features only via their `index.js` (`@/features/auth`), never deep
  paths.
- `lib/` and `components/` must not import from `features/`.

### Files

- One component per file. Co-locate a component's small helpers in the same file.
- Prefer named exports. (Route page components are named exports too; only
  `App.jsx` default-exports.)

## Components

### Where does it go?

| The component… | Put it in |
| -------------- | --------- |
| is generic and reusable (Button, Input, Card) | `src/components/ui/` |
| is app chrome (layout, nav) | `src/components/layout/` |
| is a full routed screen | `src/features/<feature>/pages/` |
| is used only by one feature | `src/features/<feature>/components/` |
| is used by 2+ features | promote to `src/components/` |

Don't pre-place things in `components/` "in case". Start feature-local, promote
on the second use.

### Guidelines

- **Presentational vs. container.** Keep data fetching in page components or
  hooks; pass plain props into presentational components. A page owns the query/
  mutation hooks and navigation; the components it renders take plain props and
  callbacks. (`features/srt` is the reference: `QueryForm` owns validation +
  the `useCreateRecommendation` mutation + `onSuccess`; `SrtRecommendationPage`
  owns the view state and hands each view its data and callbacks.)
- **Styling:** Tailwind utility classes inline. No CSS modules. Shared visual
  variants go through a component (see `Button` variants), not copy-pasted class
  strings.
- **State:** local `useState` for UI; TanStack Query for server data; Context
  only for the session. See [ARCHITECTURE.md](./ARCHITECTURE.md#state-management).
- **Accessibility:** label every input (`FormField` + `htmlFor`/`id`), keep
  `focus-visible` rings, use semantic elements.

## Forms

React Hook Form + Zod, always:

```jsx
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(querySchema),
  defaultValues: queryDefaultValues,
});
```

- Schema + defaults live in `features/<feature>/schemas/`.
- Render fields with `FormField` + `Input`; show `errors.<name>?.message`.
- The submit handler receives validated values; it calls a mutation hook and
  handles success/error (navigation, `getErrorMessage`).

## Adding a new feature

Example: a "Notifications" feature.

1. **Folder:** `src/features/notifications/` with the subfolders you need
   (`pages/`, `api/`, `hooks/`, `components/`, `schemas/`).
2. **API:** `api/notificationsApi.js` — `export const notificationsApi = { ... }`
   using `apiClient`, returning `response.data`.
3. **Hooks:** `hooks/useNotifications.js` — key factory `notificationKeys` +
   `useQuery`/`useMutation` wrappers.
4. **Page:** `pages/NotificationsPage.jsx` — uses `PageHeader` and the hooks.
5. **Public surface:** `index.js` — `export { NotificationsPage } from './pages/...'`.
6. **Route:** add a `paths` entry, then a route in `app/router.jsx` under
   `<ProtectedRoute>` / `<AppLayout>` (wrap in `<RoleRoute>` if restricted).
7. **Nav:** add a `NavLink` in `components/layout/NavBar.jsx` (`NavContent`, shared
   by the desktop and mobile nav).

## Adding a shared UI component

1. Create `src/components/ui/<Name>.jsx`, named export.
2. `forwardRef` if it's a form control used with RHF `register`.
3. Accept `className` and spread `...props` so callers can extend it.

## Quality

```bash
npm run lint      # ESLint (react-hooks, react-refresh)
npm run build     # type-free but catches import/bundler errors
```

- Keep `react-hooks/rules-of-hooks` and `exhaustive-deps` clean.
- No unused vars (uppercase-prefixed names are exempt, e.g. `ROLES`).
- Run `lint` and `build` before opening a PR.

## Git

- Not initialized yet. `git init` when ready; keep `.gitignore` as-is.
- Small, focused commits. Conventional-commit style is encouraged
  (`feat(srt): add recommendation results table`) but not enforced.

# Authentication & Authorization

## Model — BFF (Backend for Frontend)

The backend runs the entire OAuth flow (through Microsoft) and keeps the tokens
**server-side**. The browser only ever holds cookies. The frontend's whole job:

1. Send cookies on every request.
2. Send a CSRF header on writes.
3. React to `401` (refresh + retry) and `403` (show "not authorized").

The frontend **never sees or stores an access token.** Route guards and
role checks here are cosmetic — the backend enforces access on every request.

## The rules

| # | Situation | What the frontend does |
| - | --------- | ---------------------- |
| 1 | Every API call | `withCredentials: true` (Axios) so cookies are sent. Without it: always 401. |
| 2 | Log in | Public `/login` page in the app; its button **full-page navigates** to `GET /auth/login?return_to=<relative path>` (not XHR). The BFF bounces through Microsoft and returns to `return_to`. |
| 3 | Who am I | `GET /me` → `{ name, username, roles[] }`. 200 = logged in, 401 = not. Called on app load and after login. |
| 4 | Writes (POST/PUT/PATCH/DELETE) | Send header `X-CSRF-Token: <wc_csrf cookie>`. That cookie is JS-readable. |
| 5 | `401` from any call | `POST /auth/refresh` (with CSRF header) **once**, then retry the original request. If refresh also fails → full-page navigate to `/login?return_to=<current path>`. |
| 6 | `403` from any call | User is logged in but lacks the role. Show "not authorized". **Do not** redirect to login or retry. |
| 7 | Log out | `POST /auth/logout` (with CSRF header), then full-page navigate to `/login?signed_out=1`. |

## How it's implemented (Axios)

The stack uses Axios (not bare `fetch`), so the rules above live on the shared
instance in [`src/lib/apiClient.js`](./src/lib/apiClient.js).

### Instance config

```js
axios.create({
  baseURL: env.apiBaseUrl,          // '' → root-relative, same origin
  withCredentials: true,            // rule 1: send cookies
  xsrfCookieName: 'wc_csrf',        // rule 4: Axios reads this cookie…
  xsrfHeaderName: 'X-CSRF-Token',   // …and echoes it in this header
});
```

Axios attaches the CSRF header automatically whenever the `wc_csrf` cookie is
present. It also sends it on GET (harmless; the backend ignores it on safe
methods), so there is no manual header code.

### Response interceptor (rules 5 & 6)

```
response 401 && not a refresh call
  ├─ first attempt for this request → POST /auth/refresh (shared, deduped)
  │     ├─ ok  → retry the original request once
  │     └─ fail→ unauthorizedHandler() + redirectToLogin()
  └─ retry also 401 → unauthorizedHandler() + redirectToLogin()

any other error → reject as ApiError
```

- Concurrent 401s share **one** in-flight `refreshSession()` promise.
- The refresh request carries `_isRefresh: true` so its own failure can't
  recurse.
- `403` is **not** special-cased — it rejects as an `ApiError` with
  `err.isForbidden === true`; screens render an inline "not authorized" state
  and `RoleRoute` sends unmatched routes to `/403`.

### The sign-in gate & the two hops

There is a **public `/login` page in the app** — a branded screen with one
"Sign in with Microsoft" button, no credentials form. Sign-in is two hops:

```
/login  (SPA gate, user clicks)  →  /auth/login  (BFF → Microsoft → callback)  →  return_to
```

Two helpers in `apiClient.js`, both full-page navigations:

- **`redirectToLogin(returnTo?)`** → `/login?return_to=…`. Used by the 401
  interceptor and by logout. `returnTo` defaults to the current path+query and
  is validated to be a relative path (`/…`, not `//…`). **No-ops if already on
  `/login`** so the gate can resolve `GET /me` without a reload loop.
- **`beginOAuthLogin(returnTo?)`** → `/auth/login?return_to=…`. Called only by
  the `/login` button (via `useAuth().login`).

`ProtectedRoute` redirects with an in-app `<Navigate to="/login">` (no reload),
passing the attempted location in `state.from`; `LoginPage` reads `state.from`
or `?return_to=` and, once authenticated, `<Navigate>`s there.

Logout lands on `/login?signed_out=1`, which just changes the gate's message to
"You have been signed out."

> **SSO note:** `/auth/logout` clears only the app's cookies, not the Microsoft
> session. If the user then clicks "Sign in with Microsoft" and their IdP
> session is still alive, they're signed straight back in with no prompt. Killing
> the IdP session requires the BFF to redirect `/auth/logout` through the OIDC
> `end_session_endpoint` — a backend change, not a frontend one.

## Client state — `AuthProvider` + `useAuth()`

[`src/features/auth/context/AuthProvider.jsx`](./src/features/auth/context/AuthProvider.jsx)
holds the user snapshot and status.

| `status` | Meaning | UI |
| -------- | ------- | -- |
| `loading` | `GET /me` in flight | `<FullPageSpinner/>` |
| `authenticated` | `/me` returned a user | app renders |
| `unauthenticated` | `/me` → 401 (refresh failed) | `ProtectedRoute` redirects to `/login` |
| `error` | `/me` failed with network/5xx | `<ServerErrorPage onRetry={reload}/>` — no redirect loop |

`useAuth()` exposes:

```
user, status, isAuthenticated, isLoading, isAuthBypassed,
roles,
hasRole(role), hasAnyRole([roles]),
login(returnTo?),   // → beginOAuthLogin(returnTo)  (or mock user in bypass)
logout(),           // → POST /auth/logout, then → /login?signed_out=1
reload(),           // → re-fetch GET /me
```

The snapshot is also cached in `localStorage` (`lib/authStorage.js`) to hydrate
the UI on reload without a flash — **non-authoritative**, always revalidated by
`GET /me`.

## Authorization (roles)

`GET /me` → `roles` (`["admin"]`, `["user_business"]`, …). See
[`src/features/auth/roles.js`](./src/features/auth/roles.js):

- `admin` — everything.
- `user_business` — the business data.

### Guarding routes

`RoleRoute` is nested inside `ProtectedRoute` in `app/router.jsx`:

```jsx
{
  element: <RoleRoute roles={[ROLES.ADMIN]} />,
  children: [{ path: paths.admin.root, element: <AdminPage /> }],
}
```

Unmatched → redirect to `/403` ([`ForbiddenPage`](./src/components/pages/ForbiddenPage.jsx)).

### Guarding UI

`hasRole` to show/hide (e.g. the Admin link in `NavBar.jsx`).

### Adding another protected area

1. Add the role to `features/auth/roles.js` if new.
2. Add a `paths` entry.
3. Wrap the route(s) in `<RoleRoute roles={[ROLES.X]} />` under `<ProtectedRoute>`.
4. The backend must enforce the same rule — the guard is cosmetic.

## Development bypass

While no auth backend is reachable, run the app as a signed-in user.

```bash
# .env
VITE_AUTH_BYPASS=true
VITE_AUTH_BYPASS_ROLES=admin,user_business   # optional; this is the default
```

When enabled: `AuthProvider` starts `authenticated` with a mock user and skips
`GET /me`, refresh, and `logout`; `login()` resolves instantly; the response
interceptor won't redirect on 401. Route guards still run against
`VITE_AUTH_BYPASS_ROLES` (set it to `user_business` to see the `/admin` → `/403`
redirect). `useAuth().isAuthBypassed` is `true`; a `console.warn` fires on load.

**Cannot be enabled in a production build** — `env.authBypass` is
`import.meta.env.DEV && …`, which Vite compiles to `false` for `npm run build`.
The flag lives only in `.env` (gitignored).

## Dev origin / cookies

Cookies require a shared origin. The Vite dev server proxies the BFF's top-level
segments — `/auth`, `/me`, `/claims`, `/admin`, `/health` (regex in
`vite.config.js`, target `VITE_DEV_API_PROXY`, default `http://localhost:8000`) —
so the browser sees everything as `localhost:5173` and the session cookies stick.
Add new segments to the regex as the API grows.

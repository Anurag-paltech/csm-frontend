# API Client & Conventions

## The shared Axios instance

All HTTP goes through **`src/lib/apiClient.js`**. Never import `axios` directly
in feature code.

```js
import { apiClient } from '@/lib/apiClient';
```

The backend is a BFF (see [AUTH.md](./AUTH.md)). Instance config:

| Option | Value | Why |
| ------ | ----- | --- |
| `baseURL` | `env.apiBaseUrl` (`''` by default) | Root-relative, same origin — cookies just work. |
| `withCredentials` | `true` | Send the session cookies on every request. |
| `xsrfCookieName` / `xsrfHeaderName` | `wc_csrf` / `X-CSRF-Token` | Axios reads the JS-readable CSRF cookie and echoes it as a header. |

### Interceptors

- **Request** — placeholder for cross-cutting concerns (correlation id, locale).
  No auth header and no manual CSRF (instance config handles both).
- **Response** —
  - `401` → one shared `POST /auth/refresh`, then retry the request once; if
    refresh fails, `redirectToLogin()`. Full state machine in [AUTH.md](./AUTH.md).
  - `403` → **not** special-cased; rejects as `ApiError` (`err.isForbidden`).
    Show an inline "not authorized" state — never redirect to login.
  - any error → rejects with an [`ApiError`](#errors).

## Errors

Every rejection from `apiClient` is an `ApiError` (`src/lib/apiError.js`):

```js
class ApiError extends Error {
  status;  // number, 0 for network errors
  code;    // backend error code string | null
  data;    // raw response body | null
  isNetworkError; isUnauthorized; isForbidden; // getters
}
```

For display, use `getErrorMessage(err, fallback?)` — safe for any thrown value.

```js
import { getErrorMessage } from '@/lib/apiError';
// ...
catch (err) {
  setFormError(getErrorMessage(err, 'Could not get recommendations.'));
}
```

## Feature API modules

Each feature owns an `api/` folder. Convention:

- One file per feature area: `srtApi.js`, `lookupsApi.js`, `adminApi.js`, …
- Export a **single object** named `<feature>Api` with one method per endpoint.
- Each method: build the request, `await apiClient.<verb>(...)`, **return
  `response.data`** (callers never see the Axios envelope).
- **No** React, no caching, no toasts, no navigation — transport only.

```js
// src/features/srt/api/srtApi.js
import { apiClient } from '@/lib/apiClient';

export const srtApi = {
  async create(body) {
    const { data } = await apiClient.post('/srt/recommendations', body);
    return data;
  },
  async get(id) {
    const { data } = await apiClient.get(`/srt/recommendations/${id}`);
    return data;
  },
};
```

### Path conventions

- `baseURL` is `''`, so every path is **root-relative and absolute**
  (`/srt/recommendations`, not `srt/recommendations`).
- The BFF serves **everything at the origin root — there is no `/api` prefix.**

Endpoints present in the backend contract today:

| Method | Path | Feature |
| ------ | ---- | ------- |
| GET  | `/me` | auth |
| GET  | `/auth/login`, `/auth/callback` · POST `/auth/logout`, `/auth/refresh` | auth |
| GET  | `/lookups/truck-models`, `/lookups/dealer-codes`, `/lookups/causal-parts`, `/lookups/engine-makes`, `/lookups/engine-models` | srt (lookups) |
| POST | `/srt/recommendations` · GET `/srt/recommendations`, `/srt/recommendations/{id}` · PATCH `/srt/recommendations/{id}/selection` | srt |
| GET  | `/admin/users` (paged; `limit`/`offset`/`role`/`q`), `/admin/whoami` | admin |
| GET  | `/health`, `/health/db` | — |

Add the top-level segment to the dev proxy regex in `vite.config.js` whenever a
new one shows up in the contract — see `SRT_RECOMMENDATION_API.md` and
`BACKEND_REQUESTS.md` for the SRT contract's history and open items.

## Server state: TanStack Query hooks

Feature `hooks/` wrap the API module in query/mutation hooks. This is the only
layer components should call for server data.

### Query-key factory

Every feature defines a key factory next to its hooks so keys stay consistent
and invalidation is easy:

```js
export const recommendationKeys = {
  all: ['srt-recommendations'],
  detail: (id) => [...recommendationKeys.all, id],
};
```

### Query hook

```js
export function useRecommendation(id, options = {}) {
  return useQuery({
    queryKey: recommendationKeys.detail(id),
    queryFn: () => srtApi.get(id),
    enabled: id != null,
    ...options,
  });
}
```

Use `enabled: id != null` for detail hooks that depend on a param.

### Mutation hook

```js
export function useCreateRecommendation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: srtApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: historyKeys.all });
    },
  });
}
```

Cross-feature (or cross-concern) invalidation is fine — here, creating a
recommendation invalidates the separate `historyKeys` list so History picks it
up without a manual refetch.

### Client defaults

Set in `src/lib/queryClient.js`: `staleTime` 30s, no refetch on window focus,
retry skips `4xx`, mutations don't retry. Override per hook via `options`.

## Naming summary

| Thing | Pattern | Example |
| ----- | ------- | ------- |
| API module | `<feature>Api` object | `srtApi`, `lookupsApi` |
| API method | verb-ish, endpoint-shaped | `list`, `get`, `create`, `updateSelection` |
| Query hook | `use<Thing>` | `useRecommendation`, `useTruckModels` |
| Mutation hook | `use<Verb><Thing>` | `useCreateRecommendation`, `useUpdateSelection` |
| Key factory | `<feature>Keys` | `recommendationKeys`, `historyKeys` |

## Adding a new endpoint

1. Add a method to the feature's `api/<feature>Api.js`.
2. Add/extend the `hooks/` query or mutation hook and the key factory.
3. Export it from the feature `index.js` if used outside the feature.
4. Consume the hook in a page/component — never call `apiClient` from a component.

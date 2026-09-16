# Backend change requests

Gaps found while building the frontend against the live API. Grouped by area,
roughly prioritized. Nothing here is blocking a release — each item notes the FE
feature it unblocks or improves.

## Delivered ✅ (2026-09-09)

- **Engine make / model lookups** — `GET /lookups/engine-makes`,
  `GET /lookups/engine-models?make=`. Wired: manufacturer + model are now
  selects; the form still submits them as strings.
- **`repair_story` on `GET /srt/recommendations/{id}`** — "Edit query" from
  History now fully repopulates the form.
- **Date filtering on `GET /srt/recommendations`** — `created_after` /
  `created_before` (`YYYY-MM-DD`, inclusive). History has a from/to picker again.

## Lookups

### `division` filter on truck-models / engine-models — _unconfirmed_
The frontend now sends a `division` query param (the VIN's 3rd character, "K"
Kenworth / "P" Peterbilt) on `GET /lookups/truck-models` and
`GET /lookups/engine-models`, on the same speculative basis as `make` on
engine-models — sent whether or not the backend currently filters on it.
Confirm: is `division` a supported param on these two endpoints, and does it
expect the single letter ("K"/"P") or the full division name ("Kenworth"/
"Peterbilt")? Frontend currently sends the letter.

## Admin — Data Management

### Dealer write endpoints — _new; frontend is already built against this contract_
Admin → Data Management → Dealer is fully implemented client-side. **Listing
dealers reuses the existing `GET /lookups/dealer-codes`** (confirmed live,
and its items already carry the full record below, not just the code) — no
separate `GET /admin/dealers` needed. Still needed, same admin-only auth as
`/admin/users` (403 for non-admins):

- `POST /admin/dealers` — body `{ dealer_code, dealer_family_code, branch,
  branch_code, region }` → 201 with the created dealer (including the new
  `dealer_id`).
- `PUT /admin/dealers/{dealer_id}` — body `{ branch, branch_code, region }`
  **only**. `dealer_code` and `dealer_family_code` are fixed at creation —
  the UI locks those two fields on edit and never sends them here.

No delete — rows can only be added or edited once created.

Dealer item shape (confirmed live, via `GET /lookups/dealer-codes`):
```json
{
  "dealer_id": 1,
  "dealer_code": "D100",
  "dealer_family_code": "FAM-A",
  "branch": "Chicago",
  "branch_code": "CHI",
  "region": "Midwest"
}
```

Open question: is `dealer_family_code` required on create, or optional? The
frontend currently treats it as optional (blank allowed) since it wasn't
specified either way.

Also worth confirming: should adding/editing a dealer here invalidate or
otherwise affect `GET /lookups/dealer-codes` (the read-only list the SRT
query form's dealer dropdown uses)? The frontend already invalidates its own
cached copy of that lookup on any dealer create/update, but if the lookup
endpoint itself caches server-side, a newly added dealer might not show up
there until that cache expires.

### Campaign exclusions — _confirmed, frontend built against this contract_
Admin → Data Management → Campaign lists campaigns currently excluded from
recommendations (`use_for_rec: false`) and lets an admin flip that flag.
There's no create/delete — a campaign must already exist for either endpoint
to work. Admin-only (router-level) plus `csrf_protect` on the PUT.

- `GET /admin/campaigns?limit=&offset=&use_for_rec=&q=` — `Page` of
  `{ campaign_code, use_for_rec, updated_at }`, alphabetical. The frontend
  always passes `use_for_rec=false`; `q` matches `campaign_code`.
- `PUT /admin/campaigns/{campaign_code}` — body `{ use_for_rec }` → the
  updated row. 404 if the code doesn't exist — the frontend surfaces that as
  "No campaign with that code exists" on the "Add exclusion" form.

### Claim category exclusions — _confirmed live, frontend built against this contract_
Admin → Data Management → Claim Category is built the same way as Campaign
above: lists claim categories currently excluded from recommendations
(`use_for_rec: false`) and lets an admin flip that flag. No create/delete.

- `GET /admin/claim-categories?use_for_rec=&q=` — **returns a flat array**,
  not the `Page` envelope other list endpoints use:
  `[{ claim_category, use_for_rec, updated_at }, ...]`. No `limit`/`offset`
  support observed — the frontend paginates and (defensively) filters this
  client-side. Confirm whether `use_for_rec`/`q` are actually applied
  server-side, or whether the frontend should stop sending them.
- `PUT /admin/claim-categories/{claim_category}` — body `{ use_for_rec }` →
  the updated row. 404 if it doesn't exist.

Important: this "claim category" is a **different entity** from the SRT
query form's `claim_category` field (`truck`/`engine`, from
`GET /lookups/claim-categories`) — same name, unrelated concept.

Worth asking: does `GET /admin/campaigns` (above) also return a flat array
rather than a `Page` envelope? That was assumed, not confirmed — if it
matches this endpoint's shape, the frontend's campaign screen may need the
same client-side pagination fix as claim categories.

### Cross Ref — _confirmed live, frontend built against this contract_
Admin → Data Management → Cross Ref is a read-only history of SRT code
changes, with an Excel upload as the only way to add to it (no direct
add/edit/delete in the UI).

- `GET /lookups/srt-changes?limit=&offset=&q=` — `Page` of
  `{ prev_srt, new_srt, reason }`, most recently changed first. `q` matches
  either code or the reason text. Table columns: "Obsolete SRT" (`prev_srt`),
  "Replacement SRT" (`new_srt`), "Reason".
- `POST /admin/srt-cross-ref` — multipart upload, field name `file`, an
  Excel file with columns "Old SRT Code", "New SRT Code", optional "Reason".
  Returns `{ processed, updated, skipped_unchanged, created_old_code_stubs,
  created_new_code_stubs }`, shown to the admin as a summary after upload.
  422 (nothing written) if a required column is missing — the frontend shows
  the error message from that response, falling back to a generic one.

## SRT recommendations

### New outbound fields on `POST /srt/recommendations` — _heads up_
The frontend now also sends `causal_part_description` (the selected causal
part's description, from the causal-parts lookup) and `division_code` (the
VIN's 3rd character, e.g. "K"/"P") when present. Both are omitted from the
body if not available (e.g. no VIN entered yet). If the request model
rejects unknown fields, this will need a matching field added there —
flagging in case it 422s.

### 4. `standard_hours` as a number  — _nice to have_
It's currently a JSON string (`"1.5"`). Returning a real number removes `Number()`
coercion on every read/sum and the ambiguity of a numeric-looking string.

### 5. POST idempotency — _question_
Does resubmitting an identical `POST /srt/recommendations` body create a new
`recommendation_id` each time, or return the existing one? Affects whether an
accidental resubmit clutters History.

## Validation / errors

### 6. Flat field-error map on 422  — _nice to have_
Alongside the FastAPI `detail: [{ loc, msg }]` array, an
`errors: { "<field>": "<msg>" }` map keyed by request-body field names. The FE
currently derives the field from `loc[loc.length - 1]`; a flat map is less
brittle.

## Auth

### 7. `POST /auth/logout` should end the IdP session  — _P2_
Route it through the OIDC `end_session_endpoint`. Today it clears only the app
cookies, so if the Microsoft session is still alive, "Sign out" followed by
"Sign in" silently logs the user straight back in with no prompt.

## Deployment (infra, not an endpoint)

### 8. SPA must be same-origin with the BFF — _now confirmed blocking, not hypothetical_
The app calls `/me`, `/auth/*`, `/srt/*`, `/lookups/*`, `/admin/*` as
**root-relative** and relies on cookies. For Azure static hosting that needs a
reverse proxy (Front Door / Application Gateway) fronting both the static app and
the BFF under one hostname — **or** move the BFF under a common prefix like
`/api/*` and we'll repoint the client. Cross-origin fights the cookie + CSRF
model (`SameSite=None` cookies, CORS-with-credentials, and the JS-readable
`wc_csrf` cookie landing on the wrong origin).

Reproduced locally (2026-09-16) by pointing the Vite dev proxy at the deployed
backend: the Vite proxy keeps plain data calls (`/lookups/*`, `/srt/*`,
`GET /me`) looking same-origin to the browser, but **the OAuth round trip
breaks anyway** — `/auth/login` builds its Microsoft `redirect_uri` from the
backend's own hostname (it has no idea it's being proxied), so after signing
in, the browser lands back on the backend's real origin, not the dev proxy's.
Any cookies set at that point belong to the backend's origin too, invisible
to whatever origin the frontend is actually served from. This will hit in
real cross-origin deployment exactly the same way — the fix has to happen
before frontend/backend go live on separate hostnames, not after: either
the shared-origin reverse-proxy approach above, or (if that's not feasible)
the backend needs `SameSite=None; Secure` cookies, CORS with an explicit
`Access-Control-Allow-Origin` (not `*`) + `Access-Control-Allow-Credentials`,
and the OAuth callback needs to redirect back to the frontend's actual
deployed origin rather than its own.

---

Resolved already (no action): `claim_category` casing (lowercase, server
lower-cases anyway); `GET /me` role casing (frontend will follow the backend when
it switches `"Admin"` → `"admin"`).

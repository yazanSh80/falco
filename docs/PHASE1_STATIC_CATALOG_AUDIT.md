# P1-01 Static Catalog Audit

Date: 2026-05-05

## Scope

Audit static catalog ownership and catalog read paths before converting Phase 1 flows to backend-first.

## Sources Reviewed

- `src/data/services.ts`
- `src/state/DataContext.tsx`
- `src/api/client.ts`
- `src/pages/customer/CustomerLateFeatures.tsx`
- `src/pages/customer/CustomerLateWorks.tsx`
- `src/pages/customer/CustomerServiceDetail.tsx`
- `src/pages/customer/CustomerPriceList.tsx`
- `backend/app/models/service.py`
- `backend/app/api/services.py`
- `backend/seed_baseline.py`

## Static Catalog Inventory

`src/data/services.ts` defines:

- 6 static `Feature` rows: A/C Maintenance, Plumbing, Carpentry, Electricity, Alumetal, Furniture Cleaning.
- 16 static `Service` rows: `S1` through `S16`.
- Static services include demo/provider fields: `engineerId`, `engineerName`.
- Static services use frontend-only field names: `featureId`, `price`.

Static catalog status:

- Not the official catalog source.
- Keep as fallback/demo only.
- Contains legacy/out-of-scope categories for the approved platform direction.

## Backend Catalog Inventory

Backend has the official catalog model and read API:

- `Feature` model: display grouping.
- `Service` model: catalog entry.
- `/api/services/features`
- `/api/services/features/<feature_id>`
- `/api/services`
- `/api/services/<service_id>`
- `/api/services/price-list`

`backend/seed_baseline.py` defines backend baseline catalog:

- 7 backend features: Electrical, A/C, Low Current, Solar, Fiber, Smart Systems, Special Works.
- 7 backend services with canonical IDs such as `EL001`, `AC001`, `LC001`.
- Existing backend service fields already include `domain`, `service_kind`, `pricing_mode`, `active`, `is_visible`, and `is_core`.

## Frontend Read Path

`DataContext` imports static catalog directly:

- `staticFeatures` from `src/data/services.ts`
- `staticServices` from `src/data/services.ts`

Current behavior:

- Initial state is static catalog.
- If backend health is available, `fetchApiCatalog()` loads `/services/features` and `/services`.
- If backend catalog fetch fails or returns empty arrays, static catalog remains fallback.

Customer catalog pages read from `useData()`:

- Browse/list entry: `CustomerLateFeatures`
- Feature service list: `CustomerLateWorks`
- Service detail: `CustomerServiceDetail`
- Price list: `CustomerPriceList`

No audited customer catalog page imports `src/data/services.ts` directly.

## P1 Conversion Gaps

P1-02 browse/list:

- `DataContext` starts from static values before API loading completes.
- Need backend-first loading state for catalog reads, with static only if API is unavailable.
- Static feature IDs do not match backend baseline IDs, so fallback can route to a different catalog shape.

P1-03 service detail:

- Detail page relies on `services.find()` from context.
- Direct service URL can fail or show stale fallback if backend catalog has not loaded.
- Need direct backend service fetch by `service_id` or a backend-first context lookup.

P1-04 price list:

- Price list reads flattened context services.
- Backend already has `/services/price-list`; the page should use backend price-list as source of truth.

P1-05 service_id passing:

- Detail flow already passes `serviceId: service.id` to `addRequest()`.
- `DataContext.addRequest()` sends `service_id` to backend.
- Needs end-to-end verification after backend-first service IDs replace static `S*` IDs.

## Audit Decision

P1-01 passes.

Static catalog remains allowed only as fallback/demo data. The backend catalog API and models are sufficient for P1-02 through P1-05 without adding new domains or redesigning UI.

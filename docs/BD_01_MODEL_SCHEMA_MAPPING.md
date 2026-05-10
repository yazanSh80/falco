# BD-01 Model-to-Schema Mapping Audit

## Scope
Mapping between frozen catalog/request/payment models and the current schema/models.

## Sources
- backend/app/models/service.py
- backend/app/models/service_category.py
- backend/app/models/request.py
- backend/app/models/transaction.py
- backend/app/schemas.py
- backend/alembic/versions/fb56bee058c3_initial_schema.py
- DATABASE_SCHEMA.sql

## Catalog Model Mapping

| Frozen entity | Current table/model | Current fields | Mapping status | Gap notes |
| --- | --- | --- | --- | --- |
| Feature | features (Feature) | id, name, icon, description, active, created_at | Aligned | None |
| Service | services (Service) | id, feature_id, name, description, base_price, active, created_at, updated_at | Partial | Missing domain, service_kind, pricing_mode; no price visibility fields |
| ServiceCategory | service_categories (ServiceCategory) | id, name, slug, description, is_active, parent_id, metadata, created_at, updated_at | Optional | Exists but not linked to services; keep optional |
| Domain | n/a | n/a | Missing | Add domain field (enum/lookup) on services |
| ServiceKind | n/a | n/a | Missing | Add service_kind field (enum/lookup) on services |
| PricingMode | n/a | n/a | Missing | Add pricing_mode field (enum/lookup) on services |

## Request Model Mapping

| Frozen field | Current table/model | Current field | Mapping status | Gap notes |
| --- | --- | --- | --- | --- |
| request_type (book_service/inspection/project_special) | requests (Request) | request_intent | Partial | Field exists but nullable; enforced via API inference |
| urgency (quick/late) | requests (Request) | type | Aligned | Keep quick/late meaning; map to urgency in API |
| service_id | requests (Request) | service_id | Aligned | API enforces required for book_service |
| price_snapshot | requests (Request) | price_at_request (float) | Partial | Snapshot needs structured storage; currently only float |

## Payment Model Mapping

| Frozen field | Current table/model | Current field | Mapping status | Gap notes |
| --- | --- | --- | --- | --- |
| payment record | transactions (Transaction) | request_id, gross_amount, commission_rate, commission_amount, net_amount | Partial | Transactions are commission records, not payments |
| payment_status | n/a | n/a | Missing | New payment record status needed |
| payment_method | n/a | n/a | Missing | New payment record method needed |
| payment_direction | n/a | n/a | Missing | New payment direction needed |
| inspection_fee | n/a | n/a | Missing | Must be recorded with payment/request |
| manual_confirmation | n/a | n/a | Missing | Admin confirmation required in v1 |

## Compatibility Notes
- Keep requests.type as urgency (quick/late) and preserve existing behavior.
- Keep requests.request_intent nullable for legacy rows; infer when missing.
- Keep requests.price_at_request for now; expand later with price snapshot structure.
- Keep transactions table for commission reporting; add payments table separately.

## Gaps to Address in Later Tasks (No Implementation Here)
- Add service domain, service_kind, pricing_mode fields.
- Add price snapshot structure on requests.
- Add payments table with status/method/direction/confirmation.
- Define linkage between optional ServiceCategory and Service (if needed later).

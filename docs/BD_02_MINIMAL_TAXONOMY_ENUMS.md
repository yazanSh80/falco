# BD-02 Minimal Taxonomy / Metadata Values (Frozen)

## Scope
Minimal, closed value sets for catalog, requests, pricing, and urgency.
No new tables. No overengineering.

## Metadata Value Sets (v1)

### domain
- electrical
- ac
- low_current
- solar
- fiber
- smart
- special
- legacy

Domain display mapping:

- electrical: Electrical
- ac: AC
- low_current: Low Current, including cameras/networking basics for now
- fiber: Fiber
- smart: Smart Systems
- solar: Solar
- special: Special Works
- legacy: Legacy/demo/out-of-scope

### service_kind
- standard_service
- inspection
- consultation
- project_entry
- legacy_service

### pricing_mode
- fixed
- after_visit
- inspection_fee
- project_quote
- not_applicable

### complexity
- basic
- standard
- advanced
- project

### boolean metadata
- requires_visit: true / false
- is_core: true / false

### urgency
- quick
- late

### request_intent
- book_service
- inspection
- project_special

## Required v1 Payment Statuses (for future payment record only)
- pending
- confirmed
- rejected
- refunded

## Required v1 Payment Methods (for future payment record only)
- cash_on_service
- bank_transfer
- wallet_proof
- manual

## Defaults
- domain: electrical
- service_kind: standard_service
- pricing_mode: fixed
- complexity: standard
- requires_visit: true
- is_core: true
- urgency: late
- request_intent: book_service

## Notes
- These sets are closed for Phase 2.
- No additional values or hierarchy are permitted without explicit approval.
- `ServiceCategory` remains inactive for core catalog semantics.

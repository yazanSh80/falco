# Phase 2 Metadata Values

Status: finalized for additive implementation.

## Fields

`Service` metadata v1 uses these additive fields:

- `domain`
- `service_kind`
- `pricing_mode`
- `complexity`
- `requires_visit`
- `is_core`

## Values

### domain

- `electrical`
- `ac`
- `low_current`
- `fiber`
- `smart`
- `solar`
- `special`
- `legacy`

`low_current` covers cameras/networking basics for now. No separate cameras/networking domain is activated in Phase 2.

### service_kind

- `standard_service`
- `inspection`
- `consultation`
- `project_entry`
- `legacy_service`

### pricing_mode

- `fixed`
- `after_visit`
- `inspection_fee`
- `project_quote`
- `not_applicable`

### complexity

- `basic`
- `standard`
- `advanced`
- `project`

### boolean flags

- `requires_visit`: `true` / `false`
- `is_core`: `true` / `false`

## Defaults

- `domain`: `electrical`
- `service_kind`: `standard_service`
- `pricing_mode`: `fixed`
- `complexity`: `standard`
- `requires_visit`: `true`
- `is_core`: `true`

## Boundaries

- Additive only.
- No `ServiceCategory` activation.
- No new taxonomy tables.
- No rule engine.
- No AI matching.

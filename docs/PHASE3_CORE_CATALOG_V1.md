# Phase 3 Core Catalog v1

Status: frozen for curation.

## Core

These services form the public core catalog v1:

| Service ID | Name | Domain | Notes |
| --- | --- | --- | --- |
| EL001 | Electrical Repair Visit | electrical | Core Electrical |
| AC001 | A/C Maintenance Visit | ac | AC basic |
| LC001 | CCTV Wiring Check | low_current | Low Current basic, includes cameras/networking basics for now |

## Near-core

These entries remain active/visible candidates but are not core catalog v1:

| Service ID | Name | Domain |
| --- | --- | --- |
| FB001 | Fiber Termination | fiber |
| SM001 | Smart Switch Setup | smart |

## Project / Inspection Only

These entries are not fixed core service bookings:

| Service ID | Name | Domain | Intended handling |
| --- | --- | --- | --- |
| SO001 | Solar System Inspection | solar | Inspection / consultation intake |
| SP001 | Special Works Assessment | special | Project / special work intake |

## Legacy / Demo / Out-of-scope

Old demo catalog entries must not be deleted directly. They may be marked legacy, inactive, hidden, or non-core while preserving historical request references.

## Boundaries

- No direct deletion of old services.
- No fixed solar project services.
- No new domain expansion in Phase 3.
- `ServiceCategory` remains inactive.

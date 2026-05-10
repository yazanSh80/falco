# Phase 2 Service Metadata Mapping

Status: baseline services mapped.

| Service ID | Domain | Service kind | Pricing mode | Complexity | Requires visit | Core flag |
| --- | --- | --- | --- | --- | --- | --- |
| EL001 | electrical | standard_service | fixed | basic | true | true |
| AC001 | ac | standard_service | fixed | basic | true | true |
| LC001 | low_current | standard_service | after_visit | standard | true | true |
| SO001 | solar | inspection | inspection_fee | advanced | true | false |
| FB001 | fiber | standard_service | fixed | standard | true | false |
| SM001 | smart | standard_service | fixed | basic | true | false |
| SP001 | special | project_entry | project_quote | project | false | false |

## Notes

- This mapping is additive metadata only.
- Phase 3 finalized core/near-core/project-only catalog curation; current core flags match `seed_baseline.py`.
- `seed_baseline.py` updates existing baseline rows idempotently for these fields when rerun.

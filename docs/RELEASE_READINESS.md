# Release Readiness Minimum

This checklist is the minimum release gate for the current backend-first service platform. It avoids heavy DevOps scope and keeps staging/release work operational.

## Staging / Deployment Checklist

- Environment:
  - Set `FLASK_ENV=production` only when `SECRET_KEY`, `JWT_SECRET_KEY`, and `DATABASE_URL` are configured.
  - Set `CORS_ORIGINS` to the deployed frontend origin.
  - Keep `DEMO_MODE=false` outside local demos.
  - Keep admin demo whitelist empty outside local demos.
- Database:
  - Confirm MySQL connectivity with `scripts/mysql_smoke.ps1`.
  - Run Alembic migrations before routing traffic.
  - Confirm `alembic_version` exists and is on the intended head.
- Application checks:
  - Run `scripts/regression.ps1` before staging approval.
  - Confirm `/health` returns `ok`.
  - Confirm customer login, catalog read, request creation, admin triage, and payment-lite confirmation in staging.
- Deployment:
  - Build frontend with `npm run build`.
  - Build backend image or deploy backend package from the same revision.
  - Restart workers after migrations.
  - Verify logs for startup errors after deploy.
- Rollback:
  - Take a database backup before migration.
  - Keep the previous backend/frontend artifact available.
  - Roll back application first; restore database only if migration/data change requires it.

## Backup / Restore Minimum

- Take a timestamped MySQL backup before each release.
- Store backups outside the application server when possible.
- Verify one restore path in a non-production database before launch.
- Keep schema-only and full backups for the launch baseline.

## CI/CD Minimum

- CI must run frontend lint, frontend type-check, frontend build, backend tests, and Docker build smoke.
- Security scan is advisory at this stage unless it reports a critical exploitable production dependency.
- Deployment remains manual approval after CI passes.

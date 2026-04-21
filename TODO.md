# MySQL + Alembic Standardization TODO

## Approved Plan Implementation Steps

### Phase 1: Clean Slate (Remove Legacy)
- [x] Update backend/app/config.py: Set prod DB to Graduation MySQL, test DB to Graduation_test MySQL
- [x] Update backend/app/cli.py: Remove SQLite backup/restore commands
- [x] Edit backend/tests/conftest.py: Remove create_all/drop_all, use test DB
- [x] Delete legacy files: create_tables.py, init_database.py, seed.py, quick_seed.py
- [x] Edit seed_demo.py, reback_demo.py: Remove create_all

### Phase 2: Alembic Setup
- [ ] Create alembic.ini root config
- [x] Create backend/alembic/env.py with models metadata
- [x] Update backend/app/__init__.py: Register db CLI commands
- [ ] Create initial Alembic migration for current models
- [ ] Create/enhance ServiceCategory model (id, name, slug, desc, active, timestamps)

### Phase 3: Infrastructure & Docs
- [x] Update docker-compose.yml: Use Graduation DB, add test DB service/volumes
- [ ] Update QUICKSTART.md, README.md: Migration-first flow
- [ ] Update requirements.txt: Confirm Alembic deps
- [ ] Add migration for ServiceCategory + migrate existing Feature/Service

### Phase 4: Validation
- [ ] Test: flask db upgrade, pytest, docker-compose up
- [ ] Final search_files: No SQLite/create_all remnants
- [ ] attempt_completion

**Progress: 0/15 steps complete**


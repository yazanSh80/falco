# Changelog

All notable changes to FalcoElectrec will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- ESLint and Prettier configuration for consistent code style
- Error Boundary component for graceful error handling
- CI/CD pipeline with GitHub Actions
- Husky pre-commit hooks with lint-staged
- Environment variables validation with Zod
- Security headers for Flask backend
- CONTRIBUTING.md guide for contributors
- MIT License

### Changed
- Improved TypeScript types (replaced `any` with proper types)
- Enhanced README with badges and better documentation
- API versioning structure (`/api/v1/`)

### Fixed
- Various TypeScript type safety issues

### Security
- Added Flask-Talisman for security headers
- Improved CORS configuration
- Added rate limiting on authentication endpoints

---

## [0.1.0] - 2025-12-31

### Added
- Initial project setup with React 18 + TypeScript + Vite
- Flask backend with SQLAlchemy and JWT authentication
- Three user roles: Customer, Engineer, Admin
- Customer features:
  - Dashboard with request overview
  - Quick and scheduled service requests
  - Service browsing by category
  - Request tracking and management
  - Engineer reviews and ratings
  - Block list management
  - Financial transactions view
  - Notifications system
- Engineer features:
  - Dashboard with job statistics
  - Available requests browsing
  - Job acceptance and completion
  - Portfolio management
  - Subscription management
  - Earnings tracking
  - Block list management
- Admin features:
  - Platform analytics dashboard
  - Engineer verification workflow
  - User management
  - Reviews moderation
  - Financial overview
- PostgreSQL database support
- Docker Compose setup for development
- API documentation with Swagger/OpenAPI
- Commission calculation (0% ≤700 NIS, 5% >700 NIS)
- Subscription gating for engineers

### Technical Stack
- **Frontend**: React 18.2, TypeScript 5.3, Vite 5.0, TailwindCSS 3.4
- **Backend**: Flask 3.x, SQLAlchemy 2.x, Flask-JWT-Extended
- **Database**: MySQL 8.0 (Graduation/Graduation_test)
- **Infrastructure**: Docker, Docker Compose

---

## Version History

| Version | Date | Description |
|---------|------|-------------|
| 0.1.0 | 2025-12-31 | Initial release - UI prototype with backend |

---

[Unreleased]: https://github.com/yourusername/falcoelectrec/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/yourusername/falcoelectrec/releases/tag/v0.1.0

# FalcoElectrec 🦅⚡

[![CI/CD](https://github.com/yourusername/falcoelectrec/actions/workflows/ci.yml/badge.svg)](https://github.com/yourusername/falcoelectrec/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB.svg)](https://reactjs.org/)
[![Flask](https://img.shields.io/badge/Flask-3.x-000000.svg)](https://flask.palletsprojects.com/)
[![Code Style: Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://prettier.io/)

**Multi-role Electrical Services Platform**

> Connecting Palestinian homes with trusted electrical professionals

Team Lead: Ahmad SAQER (1210085)  
Partners: Yazan Sharif (1220906), Ismail Tarteer (1211243)  
Course: ENCS5200 — Introduction to Graduation Project

---

## 📋 Overview

FalcoElectrec is a comprehensive platform connecting customers with electrical service engineers in Palestine. The platform supports three user roles:

- **Customers**: Request electrical/home services, track progress, review engineers
- **Engineers**: Accept jobs, manage portfolio, earn income
- **Admins**: Approve engineers, manage users, view platform analytics

## 🛠️ Tech Stack

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- TailwindCSS (styling)
- React Router DOM (routing)
- Lucide React (icons)

### Backend
- Flask 3.x (Python)
- SQLAlchemy 2.x (ORM)
- Flask-JWT-Extended (authentication)
- MySQL (database)
- Flask-Migrate (migrations)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- MySQL 8.0+

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd falco

# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost:5173
# Backend:  http://localhost:5000
# API Docs: http://localhost:5000/api
```

### Option 2: Manual Setup

#### Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp ../.env.example .env
# Edit .env with your settings

# Initialize database
flask db upgrade

# Seed database
python seed.py

# Run development server
flask run --port 5000
```

#### Frontend Setup
```bash
# Install dependencies
npm install

# Set environment variables
echo "VITE_API_URL=http://localhost:5000/api" > .env

# Run development server
npm run dev
```

## 📁 Project Structure

```
falco/
├── src/                # React Frontend
│   ├── api/           # API client
│   ├── components/
│   ├── pages/
│   └── state/
│
├── backend/            # Flask API
│   ├── app/
│   │   ├── api/       # API blueprints
│   │   ├── models/    # Database models
│   │   └── utils/     # Helpers
│   ├── tests/
│   ├── seed.py
│   └── requirements.txt
│
├── docs/              # Documentation
│   ├── CURRENT_STATE.md
│   ├── ARCHITECTURE.md
│   └── figures/
│
├── docker-compose.yml
├── Makefile
└── .env.example
```

## 🔐 Demo Accounts

| Role | Email | Password | Notes |
|------|-------|----------|-------|
| Customer | customer@test.com | Pass123! | Standard user |
| Engineer | engineer@test.com | Pass123! | Active subscription |
| Engineer | expired@test.com | Pass123! | Expired subscription |
| Engineer | pending@test.com | Pass123! | Awaiting approval |
| Admin | admin@test.com | Pass123! | Full access |
| **Super Admin** | **ahmadsaqer818@gmail.com** | **saqer123** | **Team Lead Account** |
| Admin (Demo) | ahmadsaqer818@gmail.com | None | Passwordless - Demo Mode Only |

### 🔐 Demo Admin Access (Passwordless)

**⚠️ FOR DEMO/GRADUATION PURPOSES ONLY**

A passwordless admin login feature is available in demo mode:

**Email:** `ahmadsaqer818@gmail.com`

#### How to Use:
1. Go to the Login page
2. Look for **"Admin Quick Access (Demo)"** section below the regular login form
3. Click **"Enter Admin Panel"** button
4. No password required — instant access to admin dashboard

#### Key Features:
- ✅ No password verification required
- ✅ Auto-detects admin email on login form
- ✅ Shows hint: *"Admin Account Detected — password not required"*
- ✅ One-click access to `/admin/dashboard`
- ✅ Only available when `VITE_DEMO_MODE=true`

#### Configuration:
```env
# Enable/disable demo admin access (in .env)
VITE_DEMO_MODE=true   # Frontend: Show Admin Quick Access
DEMO_MODE=true         # Backend: Allow passwordless admin login
```

#### Security Notes:
- **This feature is hardcoded for the email:** `ahmadsaqer818@gmail.com`
- **Only enabled in development** (check `DEMO_MODE` environment variable)
- **Not intended for production** — remove or disable for deployment
- Whitelisted emails configured in `backend/app/config.py`


## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Services
- `GET /api/services/features` - List categories
- `GET /api/services` - List services
- `GET /api/services/:id` - Service details

### Requests
- `POST /api/requests` - Create request (customer)
- `GET /api/requests` - List requests
- `POST /api/requests/:id/accept` - Accept (engineer)
- `POST /api/requests/:id/complete` - Complete (engineer)
- `DELETE /api/requests/:id` - Cancel (customer)

### Admin
- `GET /api/admin/engineers/pending` - Pending approvals
- `POST /api/admin/engineers/:id/accept` - Approve engineer
- `POST /api/admin/engineers/:id/reject` - Reject engineer

See [API Documentation](docs/ARCHITECTURE.md) for full details.

## 💰 Commission Rules

- Transactions ≤ 700 NIS: **0% commission**
- Transactions > 700 NIS: **5% commission**

## 🧪 Testing

```bash
# Backend tests
cd backend
python -m pytest tests/ -v

# With coverage
python -m pytest tests/ --cov=app --cov-report=html
```

## 📦 Building for Production

```bash
# Build frontend
npm run build

# Build Docker images
docker-compose build
```

## 🗂️ Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Backend
FLASK_ENV=development
SECRET_KEY=your-secret-key
DATABASE_URL=mysql+pymysql://falco:falco_secret@localhost:3306/falcoelectrec
JWT_SECRET_KEY=your-jwt-secret

# Frontend
VITE_API_URL=http://localhost:5000/api
```

## 📄 License

This project is part of ENCS5200 coursework at Birzeit University.

---

## 📝 CHANGELOG

### Visual Overhaul & "WOW" Effects (Latest)

#### ✨ Premium Visual Effects Added
- **AttractionBackground**: Canvas-based particle system with mouse attraction for landing hero
- **AuthRingLayout**: Animated blob/ring background for login & signup pages
- **ElectricBorderCard**: SVG turbulence filter for electric border effect
- **PointerReactiveCard**: 3D tilt card that responds to mouse position with spotlight

#### 🎨 UI Improvements
- Login page completely redesigned with dark glass-morphism theme
- Signup page multi-step form with dark theme and gold accents
- Footer updated with Demo & Credits links
- New utility classes: `.glass-card`, `.page-overlay`

#### 🔐 Auth & Demo Fixes
- Demo admin account seeded: `ahmadsaqer818@gmail.com` / `saqer123` (super admin)
- Role selection now required at signup (step 0)
- Login no longer asks for role (backend determines it)
- JWT persistence improved with proper localStorage handling

#### 📄 New Pages
- `/demo` — Effects showcase page with toggle controls
- `/credits` — Attribution page for CC BY-NC-SA licensed effects
- `/register` — Alias for `/signup`

#### 🛠️ Technical Additions
- `src/utils/effects.ts` — Safe effects preference detection (reduced-motion, mobile, coarse pointer)
- `useEffectsPreference()` hook for components
- Debounce and throttle utilities

#### 🙏 Credits & Attribution
Visual effects inspired by [threejs-components](https://github.com/klevron/threejs-components) by Kevin Levron, licensed under CC BY-NC-SA 4.0.

---

*FalcoElectrec — Connecting homes with trusted electrical professionals* 🦅


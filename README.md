# Zooby — Hyperlocal Pet Care Platform

Zooby connects pet parents with verified groomers, vets, walkers, sitters, trainers, mobile care vans, and rescue/adoption partners.

---

## Monorepo Structure

```
Zooby-main/
├── frontend/   React + Vite + TailwindCSS (port 3000)
├── backend/    Express + TypeScript + MongoDB (port 5000)
├── docs/       Architecture, API contracts, decisions, requirements
├── .gitignore
└── README.md
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 6+ running locally (or a MongoDB Atlas connection string)

### Frontend

```bash
cd frontend
npm install
cp .env.example .env        # add GEMINI_API_KEY if using AI features
npm run dev                  # http://localhost:3000
```

### Backend

```bash
cd backend
npm install
cp .env.example .env        # fill in JWT_SECRET and DATABASE_URL
npm run dev                  # http://localhost:5000
```

Backend health check: `GET http://localhost:5000/health`

---

## Environment Variables

### `frontend/.env`
| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Google Gemini AI key (AI Studio injects automatically) |
| `APP_URL` | Hosted app URL (AI Studio injects automatically) |
| `VITE_API_URL` | Backend API base URL (default: `http://localhost:5000/api/v1`) |

### `backend/.env`
| Variable | Description |
|---|---|
| `PORT` | Server port (default: `5000`) |
| `NODE_ENV` | `development` or `production` |
| `DATABASE_URL` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT signing — change in production |
| `JWT_EXPIRES_IN` | Token expiry (default: `7d`) |
| `CORS_ORIGIN` | Allowed frontend origin (default: `http://localhost:3000`) |

---

## User Roles

| Role | Portal | Description |
|---|---|---|
| `PET_PARENT` | `/` `/dashboard` | Books services, manages pets |
| `PROVIDER` | `/provider` | Accepts bookings, manages earnings |
| `RESCUE_PARTNER` | `/rescue` | Posts animals, reviews adoption applications |
| `VAN_WORKER` | `/van` | Completes mobile service jobs |
| `ADMIN` | `/admin` | Platform management, verification |

---

## API

Base URL: `http://localhost:5000/api/v1`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register new user |
| POST | `/auth/login` | Public | Login, returns JWT |
| GET | `/auth/me` | Required | Current user profile |
| GET | `/users/profile` | Required | Get profile |
| PUT | `/users/profile` | Required | Update profile |
| GET | `/pets` | PET_PARENT | List own pets |
| POST | `/pets` | PET_PARENT | Add pet |
| PUT | `/pets/:petId` | Owner/Admin | Update pet |
| DELETE | `/pets/:petId` | Owner/Admin | Delete pet |
| GET | `/pets/:petId/health-events` | Owner/Admin | List health events |
| POST | `/pets/:petId/health-events` | Owner/Admin | Add health event |
| GET | `/providers` | Public | Search providers |
| POST | `/providers` | PROVIDER | Create provider profile |
| GET | `/bookings` | Required | List bookings (role-scoped) |
| POST | `/bookings` | PET_PARENT | Create booking |
| PUT | `/bookings/:id/status` | Provider/Van/Admin | Update status |
| DELETE | `/bookings/:id` | Owner/Admin | Cancel booking |

Full API specification: [`docs/API_CONTRACT.md`](./docs/API_CONTRACT.md)

---

## Tech Stack

**Frontend**
- React 19, TypeScript, Vite, TailwindCSS v4
- Google Gemini AI (`@google/genai`)
- Recharts, Lucide React, Motion

**Backend**
- Node.js, Express 4, TypeScript
- MongoDB (native driver, no ORM)
- JWT (`jsonwebtoken`), bcrypt, Helmet, CORS, express-rate-limit

---

## Documentation

| File | Contents |
|---|---|
| [`docs/CONTEXT.md`](./docs/CONTEXT.md) | Project overview, tech choices |
| [`docs/REQUIREMENTS.md`](./docs/REQUIREMENTS.md) | 37 backend requirements |
| [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) | System design, data flows |
| [`docs/DATABASE.md`](./docs/DATABASE.md) | MongoDB schema for all collections |
| [`docs/API_CONTRACT.md`](./docs/API_CONTRACT.md) | Full REST API specification |
| [`docs/BUSINESS_RULES.md`](./docs/BUSINESS_RULES.md) | 100 business rules |
| [`docs/SECURITY.md`](./docs/SECURITY.md) | Auth, authorization, security checklist |
| [`docs/DECISIONS.md`](./docs/DECISIONS.md) | Architecture decision log |
| [`docs/TODO.md`](./docs/TODO.md) | Implementation roadmap |
| [`docs/MEMORY.md`](./docs/MEMORY.md) | Current implementation state |
| [`docs/CHANGELOG.md`](./docs/CHANGELOG.md) | Change history |

---

## Development Status

| Module | Status |
|---|---|
| Infrastructure & config | ✅ Complete |
| Authentication (register/login/JWT) | ✅ Complete |
| User profiles | ✅ Complete |
| Pet management | ✅ Complete |
| Health events | ✅ Complete |
| Service provider search & CRUD | ✅ Complete |
| Bookings | ✅ Complete |
| Van jobs | 🔲 Pending |
| Adoption animals & applications | 🔲 Pending |
| Notifications | 🔲 Pending |
| Payments (mock gateway) | 🔲 Pending |
| Admin portal APIs | 🔲 Pending |

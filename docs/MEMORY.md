# PROJECT MEMORY

## Current State
- Monorepo restructure: complete
- Backend implementation: Phase 5 complete (Auth, Users, Pets, Health Events, Providers, Bookings)
- Frontend: unchanged (original AI Studio React app)
- Next: continue backend implementation (Van Jobs, Adoption, Payments, Notifications, Admin)

## Project Root
`C:\Users\sabih\Downloads\Zooby-main\`

## Structure
```
Zooby-main/              ← monorepo root
├── frontend/            ← React + Vite + TailwindCSS (port 3000)
│   ├── src/
│   │   ├── App.tsx
│   │   ├── types.ts
│   │   ├── main.tsx
│   │   ├── index.css
│   │   ├── components/
│   │   ├── context/     ← AuthContext (currently localStorage-based)
│   │   └── data/        ← mock data (to be replaced by API calls)
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── package.json     ← name: zooby-frontend
│   ├── metadata.json    ← AI Studio config
│   └── .env.example     ← GEMINI_API_KEY, APP_URL, VITE_API_URL
│
├── backend/             ← Express + TypeScript + MongoDB (port 5000)
│   ├── src/
│   │   ├── server.ts
│   │   ├── app.ts
│   │   ├── config/      ← env.ts, database.ts
│   │   ├── constants/   ← roles.ts (UserRole enum)
│   │   ├── controllers/ ← Auth, User, Pet, HealthEvent, Provider, Booking
│   │   ├── middlewares/ ← auth.ts (requireAuth/requireRole), errorHandler.ts
│   │   ├── models/      ← User, Pet, HealthEvent, ServiceProvider, Booking
│   │   ├── repositories/← UserRepository, PetRepository, HealthEventRepository,
│   │   │                   ServiceProviderRepository, BookingRepository
│   │   ├── routes/      ← index.ts, auth, users, pets, healthEvents, providers, bookings
│   │   ├── services/    ← AuthService, UserService, PetService, HealthEventService,
│   │   │                   ServiceProviderService, BookingService
│   │   └── utils/       ← errors.ts, response.ts, jwt.ts, hash.ts, generators.ts
│   ├── package.json     ← name: zooby-backend
│   ├── tsconfig.json
│   ├── .env             ← active dev config (not committed)
│   └── .env.example
│
├── docs/                ← 11 documentation files
│   ├── MEMORY.md        ← this file
│   ├── CONTEXT.md
│   ├── REQUIREMENTS.md
│   ├── ARCHITECTURE.md
│   ├── API_CONTRACT.md
│   ├── DATABASE.md
│   ├── DECISIONS.md
│   ├── BUSINESS_RULES.md
│   ├── SECURITY.md
│   ├── CHANGELOG.md
│   └── TODO.md
│
├── .gitignore           ← root-level OS/editor ignores
└── README.md            ← monorepo getting-started guide
```

## Completed Backend Modules
- ✅ Infrastructure (Express, MongoDB, env, error handling)
- ✅ JWT authentication (register, login, me, logout)
- ✅ User profile (get, update)
- ✅ Pet CRUD with ownership authorization
- ✅ Health Events CRUD (scoped to pet owner)
- ✅ Service Provider search + CRUD
- ✅ Bookings (create, status update, cancel, role-based access)
- ✅ Role-based middleware (requireAuth, requireRole)
- ✅ Object-level authorization throughout

## Backend APIs Live
All under `/api/v1`:
- POST /auth/register, POST /auth/login, GET /auth/me, POST /auth/logout
- GET|PUT /users/profile
- GET|POST /pets, GET|PUT|DELETE /pets/:petId
- GET|POST /pets/:petId/health-events, PUT|DELETE /health-events/:eventId
- GET|POST|PUT /providers, GET /providers/:providerId
- GET|POST /bookings, GET /bookings/:bookingId, PUT /bookings/:bookingId/status, DELETE /bookings/:bookingId

## Pending Backend Modules
- [ ] Van Jobs (model, repo, service, controller, routes)
- [ ] Adoption Animals + Applications
- [ ] Notifications
- [ ] Payments (mock gateway)
- [ ] Provider Payouts
- [ ] Admin portal APIs (user mgmt, provider verification, dashboard stats)

## Important Decisions
- MongoDB (no Mongoose — native driver with manual collection access)
- JWT in `Authorization: Bearer <token>` header
- bcrypt cost factor 10
- Booking refs format: ZB-XXXXXX
- New providers default to status: Pending (admin must verify)
- All entity IDs generated via `backend/src/utils/generators.ts`
- Repository → Service → Controller layering throughout

## Constraints
- Frontend still uses localStorage + mock data — not yet wired to backend APIs
- PowerShell execution policy blocks npm/npx — install dependencies manually:
  - `cd frontend && npm install`
  - `cd backend && npm install`
- Backend requires MongoDB running locally on port 27017 (or set DATABASE_URL in .env)
- CORS origin defaults to `http://localhost:3000` (matches frontend dev port)

## How to Run
```
# Frontend
cd frontend
npm install
npm run dev        # http://localhost:3000

# Backend
cd backend
npm install
npm run dev        # http://localhost:5000
```

## Known Issues
- None blocking. PowerShell execution policy prevents running npm scripts from
  within the Kiro terminal — run them manually in a standard terminal.

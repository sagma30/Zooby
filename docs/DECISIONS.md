# ARCHITECTURE DECISION LOG

## DEC-001
**Decision:** Use MongoDB instead of PostgreSQL
**Why:** 
- Flexible schema suits varied entity types (pets, providers, bookings, health events)
- Frontend already uses JSON data structures that map directly to MongoDB documents
- Easy horizontal scaling for future growth
- Native geospatial queries for location-based services
- Simpler to prototype and iterate quickly

**Alternatives Considered:**
- PostgreSQL: More mature, ACID compliance, strong consistency
- MySQL: Popular but less flexible schema

**Impact:** 
- Faster initial development
- Trade-off: Less rigid data integrity constraints
- Need careful application-level validation

**Date:** 2026-08-23

---

## DEC-002
**Decision:** Use JWT for authentication instead of session-based auth
**Why:**
- Stateless design enables horizontal scaling
- No server-side session storage needed
- Works seamlessly with mobile apps and PWAs
- Industry standard with wide library support
- Can store user role and claims in token

**Alternatives Considered:**
- Session-based auth with Redis
- OAuth2 only

**Impact:**
- Simpler infrastructure (no session store)
- Token expiration needs careful handling
- Refresh token mechanism needed for long-term sessions

**Date:** 2026-08-23

---

## DEC-003
**Decision:** Use Express.js for backend framework
**Why:**
- Mature and widely adopted
- Extensive middleware ecosystem
- Unopinionated and flexible
- Excellent TypeScript support
- Team familiarity
- Large community for problem-solving

**Alternatives Considered:**
- NestJS: More opinionated, steeper learning curve
- Fastify: Faster but smaller ecosystem
- Koa: Minimalist but requires more setup

**Impact:**
- Fast development velocity
- Need to establish own conventions
- Manual dependency injection

**Date:** 2026-08-23

---

## DEC-004
**Decision:** Use Repository Pattern for data access
**Why:**
- Abstracts database operations from business logic
- Makes code more testable (can mock repositories)
- Easier to switch databases if needed
- Centralizes query logic
- Clear separation of concerns

**Alternatives Considered:**
- Direct database calls from services
- Active Record pattern
- ORM like Mongoose with models

**Impact:**
- Extra layer adds boilerplate
- Cleaner service layer
- Better testability

**Date:** 2026-08-23

---

## DEC-005
**Decision:** Use soft deletion for critical entities
**Why:**
- Preserve audit trail
- Financial compliance requirements
- Ability to restore accidentally deleted data
- Maintain referential integrity for historical records

**Impact:**
- Queries must filter `isDeleted: false`
- Slightly more storage usage
- Better data safety

**Date:** 2026-08-23

---

## DEC-006
**Decision:** API versioning using /api/v1 prefix
**Why:**
- Allows future API changes without breaking existing clients
- Industry best practice
- Clear API contract
- Frontend already expects this structure

**Alternatives Considered:**
- Header-based versioning
- No versioning

**Impact:**
- Slight URL verbosity
- Future-proof API design

**Date:** 2026-08-23

---

## DEC-007
**Decision:** Role-based authorization at route middleware level
**Why:**
- Centralized authorization logic
- Fails fast before hitting business logic
- Easy to audit permissions
- Consistent across all routes

**Alternatives Considered:**
- Permission-based (more granular)
- Service-level authorization only

**Impact:**
- Simpler initial implementation
- May need to extend to permission-based for fine-grained control

**Date:** 2026-08-23

---

## DEC-008
**Decision:** Use bcrypt for password hashing (cost factor 10)
**Why:**
- Industry standard
- Resistant to rainbow table attacks
- Automatic salting
- Cost factor 10 balances security and performance

**Alternatives Considered:**
- Argon2: More modern but less widely adopted
- PBKDF2: Older standard

**Impact:**
- Secure password storage
- ~100ms hashing time on registration/login

**Date:** 2026-08-23

---

## DEC-009
**Decision:** Generate unique booking references (ZB-XXXXXX format)
**Why:**
- User-friendly booking identification
- Easier customer support
- Frontend already expects this format
- Short and memorable

**Impact:**
- Need unique generation logic
- Consider collision handling

**Date:** 2026-08-23

---

## DEC-010
**Decision:** Deferred real-time features to Phase 2
**Why:**
- Focus on core CRUD operations first
- Real-time tracking needs WebSocket/SSE infrastructure
- Can use polling initially
- Simplifies MVP

**Impact:**
- Initial van tracking less real-time
- Reduced initial complexity
- Can add later without breaking changes

**Date:** 2026-08-23

---

## DEC-011
**Decision:** Use Cloudinary or S3 for image storage (not implemented yet)
**Why:**
- Don't store large files in MongoDB
- CDN delivery for fast loading
- Image transformation capabilities
- Scalable and reliable

**Impact:**
- External service dependency
- Need API keys and configuration
- Better performance than local storage

**Date:** 2026-08-23

---

## DEC-012
**Decision:** Payment gateway integration deferred with mock implementation first
**Why:**
- Requires production credentials and compliance
- Can prototype payment flow with mock gateway
- Focus on core business logic first
- Payment flow tested before integration

**Impact:**
- MVP can demo full flow
- Production requires actual gateway setup
- Need clear separation of mock and real implementations

**Date:** 2026-08-23

---

## DEC-013
**Decision:** Pagination default: 20 items per page
**Why:**
- Balance between data transfer and UX
- Matches common industry practice
- Frontend can override with query params

**Impact:**
- Consistent API behavior
- Reduced server load

**Date:** 2026-08-23

---

## DEC-014
**Decision:** Notification system without real-time push (Phase 1)
**Why:**
- Simpler implementation for MVP
- Users can poll notifications endpoint
- Real-time push (FCM, WebSocket) added in Phase 2

**Impact:**
- Slight delay in notification visibility
- Reduced infrastructure complexity initially

**Date:** 2026-08-23

---

## DEC-015
**Decision:** Use TypeScript for backend
**Why:**
- Type safety reduces bugs
- Better IDE support
- Consistent with frontend
- Self-documenting code
- Easier refactoring

**Alternatives Considered:**
- JavaScript only

**Impact:**
- Slightly longer development time
- Better code quality
- Fewer runtime errors

**Date:** 2026-08-23

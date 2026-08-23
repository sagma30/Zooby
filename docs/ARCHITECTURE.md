# SYSTEM ARCHITECTURE

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                          │
│  React + TypeScript + Vite + TailwindCSS                        │
│  (Pet Parent, Provider, Rescue, Van Worker, Admin Portals)     │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTPS/REST
┌─────────────────────────────────────────────────────────────────┐
│                        API GATEWAY LAYER                        │
│  Express.js REST API + JWT Auth Middleware                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND SERVICES                            │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Auth       │  │   Booking    │  │   Payment    │         │
│  │   Service    │  │   Service    │  │   Service    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Pet        │  │   Van        │  │   Adoption   │         │
│  │   Service    │  │   Service    │  │   Service    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Provider   │  │   Notification│  │   Admin      │         │
│  │   Service    │  │   Service    │  │   Service    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    DATA ACCESS LAYER                             │
│  Repository Pattern (Abstracts MongoDB Operations)              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                              │
│  MongoDB (Users, Pets, Bookings, Payments, etc.)                │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   EXTERNAL INTEGRATIONS                          │
│  Payment Gateway | Cloud Storage | Email/SMS | Google Maps      │
└─────────────────────────────────────────────────────────────────┘
```

## Layer Responsibilities

### Frontend Layer
- User interface rendering
- Client-side validation
- State management
- API consumption
- User interaction handling

### API Gateway Layer
- Route definitions
- Request validation
- Authentication verification
- Authorization checks
- Response formatting
- Error handling
- Rate limiting

### Backend Services Layer
- Business logic implementation
- Business rule enforcement
- Data transformation
- Transaction coordination
- Cross-entity operations

### Data Access Layer (Repository)
- Database queries
- CRUD operations
- Query optimization
- Data persistence
- Database-specific logic isolation

### Database Layer
- Data storage
- Indexing
- Data integrity constraints
- Backup and recovery

## Data Flow Examples

### User Authentication Flow
```
Frontend → POST /api/v1/auth/login
    ↓
API Gateway (Validate request)
    ↓
Auth Service (Verify credentials, generate JWT)
    ↓
User Repository (Query database)
    ↓
MongoDB (Fetch user document)
    ↓
Response: { token, user } → Frontend
```

### Booking Creation Flow
```
Frontend → POST /api/v1/bookings
    ↓
API Gateway (Auth middleware, validate JWT)
    ↓
Booking Service (Business logic, availability check)
    ↓
Booking Repository (Create booking document)
    ↓
MongoDB (Insert booking)
    ↓
Notification Service (Send confirmation)
    ↓
Van Service (If mobile service, create van job)
    ↓
Response: { booking } → Frontend
```

### Payment Processing Flow
```
Frontend → POST /api/v1/payments/process
    ↓
API Gateway (Auth + validation)
    ↓
Payment Service (Integrate with gateway)
    ↓
External Payment Gateway API
    ↓
Payment Repository (Store transaction)
    ↓
Booking Service (Update booking payment status)
    ↓
Notification Service (Send receipt)
    ↓
Response: { payment, receipt } → Frontend
```

## Security Architecture

### Authentication
- JWT token-based authentication
- Tokens stored in httpOnly cookies (for web) or localStorage (for PWA)
- Token expiration: 7 days
- Refresh token mechanism (optional enhancement)

### Authorization
- Role-based access control (RBAC)
- Middleware checks user role before controller execution
- Object-level permissions (e.g., user can only access their own pets)
- Admin override capabilities

### Data Security
- Passwords hashed with bcrypt (cost factor: 10)
- Sensitive data encrypted at rest
- HTTPS only in production
- Input sanitization and validation
- SQL/NoSQL injection prevention
- XSS protection

## Scalability Considerations

### Horizontal Scaling
- Stateless API design (JWT instead of sessions)
- Load balancer ready
- Database connection pooling

### Caching Strategy
- In-memory caching for frequently accessed data (service providers, categories)
- Redis integration (future enhancement)

### Database Optimization
- Proper indexing on frequently queried fields
- Pagination for large result sets
- Aggregation pipelines for analytics

## Deployment Architecture

### Development Environment
- Local MongoDB instance
- Node.js development server
- Environment variables from .env

### Production Environment (Future)
- MongoDB Atlas (cloud database)
- Container deployment (Docker)
- Cloud hosting (AWS/GCP/Azure)
- CDN for static assets
- Load balancer
- SSL/TLS certificates

## Technology Decisions

### Why MongoDB?
- Flexible schema for varied entity types (pets, providers, bookings)
- Easy horizontal scaling
- Native JSON support matches frontend data structures
- Rich query capabilities
- Geospatial queries for location-based services

### Why Express.js?
- Mature and widely adopted
- Extensive middleware ecosystem
- Simple and unopinionated
- Excellent TypeScript support
- Easy to test

### Why JWT?
- Stateless authentication
- Scalable across multiple servers
- Can store user role and claims
- Industry standard
- Easy frontend integration

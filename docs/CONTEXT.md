# PROJECT CONTEXT

**Project Name:** Zooby

**Purpose:** Hyperlocal pet-care platform connecting pet parents with verified providers, veterinary services, rescue partners, and mobile care vans.

**Target Users:**
- Pet Parents (Primary customers)
- Service Providers (Vets, groomers, trainers, sitters)
- Rescue Partners (Animal shelters & rescue organizations)
- Van Workers (Mobile service delivery personnel)
- Platform Administrators

**Core Modules:**
- Authentication & Authorization (5 roles)
- Pet Management & Health Records
- Service Discovery & Booking
- Mobile Van Fleet Management
- Adoption & Rescue Integration
- Payment & Financial Transactions
- Notifications & Updates
- User Management & Profiles

**Technology Stack:**

**Frontend (Existing):**
- React 19 + TypeScript
- Vite build system
- TailwindCSS for styling
- Local state management + localStorage
- Google Gemini AI integration

**Backend (To Be Implemented):**
- Node.js + Express + TypeScript
- MongoDB (NoSQL for flexible document storage)
- JWT authentication
- RESTful API architecture
- Cloudinary or S3 for file storage

**Database:** MongoDB Atlas

**Authentication Strategy:** JWT token-based authentication with role-based access control

**Authorization Strategy:** 
- Role-based permissions (RBAC)
- Resource ownership validation
- Object-level authorization for multi-entity operations

**Important Integrations:**
- Google Gemini AI (already configured)
- Payment Gateway (UPI, Cards, Net Banking, Wallets)
- SMS/Email notifications
- Google Maps API (for van tracking)
- Cloud storage (pet photos, documents)

**Current Implementation Status:** 
- Frontend: 100% complete with mock data
- Backend: Not started
- Database: Not configured
- Deployment: Not configured

**Current Development Phase:** Backend development - Phase 1 (Foundation)

**Important Constraints:**
- Must maintain compatibility with existing frontend
- Must preserve existing API expectations from frontend components
- Must support mobile-first responsive design
- Must handle real-time van tracking
- Must support secure payment processing
- Must maintain data privacy and GDPR compliance

# BACKEND REQUIREMENTS

## Authentication & User Management

**REQ-001**
- Description: Users can register with email/phone and password
- Source: Frontend AuthContext.tsx, UnifiedSignInView
- Priority: High
- Backend Impact: User model, registration API, password hashing
- Status: Pending

**REQ-002**
- Description: Users can login with email/phone and password
- Source: Frontend AuthContext.tsx
- Priority: High
- Backend Impact: Login API, JWT generation, session management
- Status: Pending

**REQ-003**
- Description: Support for 5 distinct user roles (PET_PARENT, PROVIDER, RESCUE_PARTNER, VAN_WORKER, ADMIN)
- Source: Frontend types.ts, routing logic in App.tsx
- Priority: High
- Backend Impact: Role-based authorization middleware, role validation
- Status: Pending

**REQ-004**
- Description: Google OAuth authentication support
- Source: Frontend AuthContext loginWithGoogle()
- Priority: Medium
- Backend Impact: OAuth integration, Google API setup
- Status: Pending

**REQ-005**
- Description: User profile management (view, update)
- Source: Frontend UserSettingsView, AuthContext updateUserProfile
- Priority: High
- Backend Impact: User profile update API, validation
- Status: Pending

## Pet Management

**REQ-006**
- Description: Pet parents can add/edit/view their pets
- Source: Frontend AddPetModal, PetProfileView, mockData INITIAL_PETS
- Priority: High
- Backend Impact: Pet model, CRUD APIs
- Status: Pending

**REQ-007**
- Description: Track pet health events (vaccinations, vet visits, medications)
- Source: Frontend AddHealthEventModal, Pet.healthEvents
- Priority: High
- Backend Impact: HealthEvent model, CRUD APIs, reminders
- Status: Pending

**REQ-008**
- Description: Store pet care records from service sessions
- Source: Frontend Pet.careRecords, van job completion
- Priority: High
- Backend Impact: CareRecord model, service completion flow
- Status: Pending

**REQ-009**
- Description: Track pet live location status
- Source: Frontend Pet.liveLocation
- Priority: Low
- Backend Impact: Location tracking API (future enhancement)
- Status: Deferred

## Service Discovery & Booking

**REQ-010**
- Description: Browse service providers by category
- Source: Frontend ServicesDiscoveryView, SERVICE_PROVIDERS
- Priority: High
- Backend Impact: Provider model, search/filter APIs
- Status: Pending

**REQ-011**
- Description: Create bookings for services
- Source: Frontend BookingModal, handleConfirmBooking
- Priority: High
- Backend Impact: Booking model, booking creation API
- Status: Pending

**REQ-012**
- Description: View booking history and status
- Source: Frontend HistoryView, INITIAL_BOOKINGS
- Priority: High
- Backend Impact: Booking retrieval APIs, status tracking
- Status: Pending

**REQ-013**
- Description: Support mobile van service bookings
- Source: Frontend Booking.isMobileService, van job assignment
- Priority: High
- Backend Impact: Van job creation, assignment logic
- Status: Pending

## Mobile Van Management

**REQ-014**
- Description: Van workers can view assigned jobs
- Source: Frontend VanWorkerPortal, INITIAL_VAN_JOBS
- Priority: High
- Backend Impact: VanJob model, van worker job APIs
- Status: Pending

**REQ-015**
- Description: Van workers can update job status
- Source: Frontend van job status transitions
- Priority: High
- Backend Impact: Job status update API, workflow validation
- Status: Pending

**REQ-016**
- Description: Real-time van tracking for customers
- Source: Frontend booking ETA, van tracking UI
- Priority: Medium
- Backend Impact: Location update API, real-time updates (WebSocket/SSE)
- Status: Pending

## Adoption & Rescue

**REQ-017**
- Description: Rescue partners can post adoption animals
- Source: Frontend RescuePartnerPortal, INITIAL_ADOPTION_ANIMALS
- Priority: High
- Backend Impact: AdoptionAnimal model, CRUD APIs
- Status: Pending

**REQ-018**
- Description: Pet parents can submit adoption applications
- Source: Frontend PetParentAdoptionView, handleSubmitAdoptionApplication
- Priority: High
- Backend Impact: AdoptionApplication model, application APIs
- Status: Pending

**REQ-019**
- Description: Rescue partners can review/approve/decline applications
- Source: Frontend rescue partner application management
- Priority: High
- Backend Impact: Application workflow APIs, status management
- Status: Pending

## Payments & Financials

**REQ-020**
- Description: Process payments for bookings
- Source: Frontend PaymentGatewayModal, PaymentRecord
- Priority: High
- Backend Impact: Payment integration, payment model, transaction APIs
- Status: Pending

**REQ-021**
- Description: Support multiple payment methods (UPI, card, net banking, wallet, pay later)
- Source: Frontend PaymentMethodType
- Priority: High
- Backend Impact: Multi-gateway integration, payment method validation
- Status: Pending

**REQ-022**
- Description: Process refunds
- Source: Frontend handleRequestRefund, RefundStatus
- Priority: High
- Backend Impact: Refund API, refund workflow
- Status: Pending

**REQ-023**
- Description: Provider payout management
- Source: Frontend ProviderEarningsView, ProviderPayoutRecord
- Priority: Medium
- Backend Impact: Payout calculation, payout request APIs
- Status: Pending

**REQ-024**
- Description: Generate payment receipts/invoices
- Source: Frontend ReceiptModal, invoiceNumber
- Priority: Medium
- Backend Impact: Receipt generation, invoice PDF creation
- Status: Pending

## Admin Portal

**REQ-025**
- Description: Admin can view all users with details
- Source: Frontend AdminUsersListView, AdminUserDetailView
- Priority: High
- Backend Impact: Admin user management APIs, detailed user queries
- Status: Pending

**REQ-026**
- Description: Admin can suspend/activate users
- Source: Frontend AdminUser.status
- Priority: High
- Backend Impact: User status management API
- Status: Pending

**REQ-027**
- Description: Admin can verify providers
- Source: Frontend ProviderVerification, provider approval flow
- Priority: High
- Backend Impact: Provider verification API, verification workflow
- Status: Pending

**REQ-028**
- Description: Admin dashboard with platform analytics
- Source: Frontend AdminDashboardView
- Priority: Medium
- Backend Impact: Analytics aggregation APIs
- Status: Pending

**REQ-029**
- Description: Admin can view and manage all bookings
- Source: Frontend admin booking management
- Priority: High
- Backend Impact: Admin booking query APIs
- Status: Pending

**REQ-030**
- Description: Admin can view payment records
- Source: Frontend AdminPaymentsView
- Priority: High
- Backend Impact: Admin payment query APIs
- Status: Pending

## Notifications & Updates

**REQ-031**
- Description: System notifications for users (booking confirmations, status updates, reminders)
- Source: Frontend NotificationUpdate, updates state
- Priority: High
- Backend Impact: Notification model, notification creation APIs
- Status: Pending

**REQ-032**
- Description: Mark notifications as read
- Source: Frontend handleMarkAllRead
- Priority: Medium
- Backend Impact: Notification update API
- Status: Pending

**REQ-033**
- Description: Agenda/upcoming events tracking
- Source: Frontend AgendaItem, INITIAL_AGENDA
- Priority: Medium
- Backend Impact: Agenda generation from bookings/health events
- Status: Pending

## Provider Portal

**REQ-034**
- Description: Providers can register and create business profiles
- Source: Frontend ProviderRegisterView
- Priority: High
- Backend Impact: Provider onboarding flow, verification pending status
- Status: Pending

**REQ-035**
- Description: Providers can view their bookings
- Source: Frontend ProviderPortal
- Priority: High
- Backend Impact: Provider booking query APIs
- Status: Pending

**REQ-036**
- Description: Providers can update booking status
- Source: Frontend provider booking management
- Priority: High
- Backend Impact: Provider booking update APIs
- Status: Pending

**REQ-037**
- Description: Providers can view earnings and request payouts
- Source: Frontend ProviderEarningsView
- Priority: Medium
- Backend Impact: Earnings calculation, payout request flow
- Status: Pending

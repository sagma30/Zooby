# BUSINESS RULES

## Authentication & Authorization

**BR-001:** Users must provide a valid email and password to register

**BR-002:** Email addresses must be unique across all users

**BR-003:** Passwords must be at least 6 characters long

**BR-004:** User accounts start with "Active" status by default

**BR-005:** Only users with matching passwords can log in

**BR-006:** Suspended users cannot log in

**BR-007:** JWT tokens expire after 7 days

---

## Role-Based Access

**BR-008:** PET_PARENT can only access their own pets and bookings

**BR-009:** PROVIDER can only access bookings for their services

**BR-010:** RESCUE_PARTNER can only manage animals from their shelter

**BR-011:** VAN_WORKER can only access jobs assigned to them

**BR-012:** ADMIN can access all resources across the platform

**BR-013:** Users cannot change their own role (only admin can)

**BR-014:** Provider accounts start with "Pending" status until admin verifies them

**BR-015:** Only verified providers appear in public service discovery

---

## Pet Management

**BR-016:** Only PET_PARENT role can create pets

**BR-017:** Users can only view/edit/delete their own pets

**BR-018:** Pet names must be at least 2 characters

**BR-019:** Pet species must be Dog, Cat, or Other

**BR-020:** Deleting a pet soft-deletes it (preserves history)

**BR-021:** Pet health events belong to the pet and its owner

**BR-022:** Upcoming health events with reminders trigger notifications

---

## Booking Management

**BR-023:** Only PET_PARENT can create bookings

**BR-024:** Users can only book for their own pets

**BR-025:** Booking date must not be in the past

**BR-026:** Each booking must have a valid provider

**BR-027:** Each booking generates a unique booking reference (ZB-XXXXXX)

**BR-028:** Booking status transitions must follow valid workflow:
- Pending → Confirmed
- Confirmed → Assigned (for mobile services)
- Assigned → On the Way → Arrived → In Progress → Completed
- Any status → Cancelled

**BR-029:** Cancelled bookings cannot transition to other statuses

**BR-030:** Completed bookings create care records automatically

**BR-031:** Mobile service bookings automatically create van jobs

**BR-032:** Only the booking owner, assigned provider/van worker, or admin can view booking details

**BR-033:** Only providers, van workers, or admin can update booking status

**BR-034:** Booking price must be greater than zero

---

## Van Job Management

**BR-035:** Van jobs are automatically created when a mobile service booking is confirmed

**BR-036:** Only assigned van workers can update job status and location

**BR-037:** Van job status transitions:
- Assigned → On the Way → Arrived → Service Started → Service Completed
- Any status → Cancelled

**BR-038:** Van jobs are ordered by sequence number for worker's daily route

**BR-039:** Updating van job status updates the linked booking status

**BR-040:** Customers can track van location for their booking

---

## Adoption & Rescue

**BR-041:** Only RESCUE_PARTNER can post adoption animals

**BR-042:** Rescue partners can only manage animals from their own shelter

**BR-043:** Animals must have status: Available, Pending, or Adopted

**BR-044:** Only available animals appear in public adoption listings

**BR-045:** Only PET_PARENT can submit adoption applications

**BR-046:** Users can submit multiple applications for different animals

**BR-047:** Only the shelter that posted the animal can review applications

**BR-048:** Application status transitions:
- Submitted → Under Review → Approved or Declined

**BR-049:** Approving an application changes the animal status to "Pending" or "Adopted"

**BR-050:** Application status changes trigger notifications to the applicant

---

## Payment & Financial

**BR-051:** Payments can only be processed for confirmed bookings

**BR-052:** Payment amount must match booking price

**BR-053:** Each payment generates a unique transaction ID and invoice number

**BR-054:** Payment methods: UPI, Card, Net Banking, Wallet, Pay Later

**BR-055:** Successful payments update booking paymentStatus to "Paid"

**BR-056:** Failed payments set paymentStatus to "Failed"

**BR-057:** Refunds can only be requested for paid bookings

**BR-058:** Refund requests set refundStatus to "Requested" (requires admin approval)

**BR-059:** Refunded payments update booking paymentStatus to "Refunded"

**BR-060:** Platform fee is deducted from provider payout

**BR-061:** Provider payout = booking price - platform fee - taxes

**BR-062:** Providers can only request payout for completed and paid bookings

**BR-063:** Payout requests require admin approval

**BR-064:** Payment records are immutable (no updates after creation, only status changes)

---

## Provider Management

**BR-065:** New providers start with "Pending" verification status

**BR-066:** Only verified providers can receive bookings

**BR-067:** Providers can only view bookings for their own services

**BR-068:** Providers can update their profile but not verification status

**BR-069:** Only admin can verify providers

**BR-070:** Provider ratings are calculated from completed bookings (future enhancement)

---

## Notification Management

**BR-071:** System creates notifications for:
- Booking confirmations
- Booking status changes
- Van arrival notifications
- Adoption application updates
- Health event reminders
- Payment confirmations
- Refund updates

**BR-072:** Users can only view their own notifications

**BR-073:** Notifications are unread by default

**BR-074:** Marking notification as read updates readAt timestamp

---

## Admin Management

**BR-075:** Admin can view all users, bookings, payments

**BR-076:** Admin can suspend or activate user accounts

**BR-077:** Admin can verify or reject providers

**BR-078:** Admin can approve or decline refund requests

**BR-079:** Admin can approve or decline payout requests

**BR-080:** Admin actions are logged for audit trail

---

## Data Validation

**BR-081:** All required fields must be present before saving

**BR-082:** Email addresses must be in valid format

**BR-083:** Phone numbers should follow valid format (optional enforcement)

**BR-084:** Dates must be valid ISO date strings

**BR-085:** Enum fields must match defined enum values

**BR-086:** Numeric fields (price, amount) must be positive numbers

**BR-087:** All text inputs are sanitized to prevent XSS

**BR-088:** All database queries are parameterized to prevent injection

---

## Data Privacy & Security

**BR-089:** Passwords are never stored in plain text (bcrypt hash only)

**BR-090:** Passwords are never returned in API responses

**BR-091:** JWT secret is never exposed to clients

**BR-092:** Payment gateway credentials are stored securely

**BR-093:** User data is only accessible to authorized roles

**BR-094:** Deleted records are soft-deleted for audit purposes

**BR-095:** Personal data access requires authentication

---

## Service Level Rules

**BR-096:** Service providers must define available days and time slots

**BR-097:** Mobile services have additional doorstep fee

**BR-098:** Services can be filtered by category, city, and availability

**BR-099:** Service discovery is public (no authentication required)

**BR-100:** Booking a service requires authentication

# API CONTRACT

Base URL: `/api/v1`

## Authentication Endpoints

### POST /auth/register
Register a new user account

**Auth:** Public

**Request:**
```json
{
  "name": "Aisha Sharma",
  "email": "aisha@zooby.care",
  "phone": "+91 98220 11223",
  "password": "parent123",
  "role": "PET_PARENT",
  "businessName": "Optional - for PROVIDER/RESCUE_PARTNER",
  "serviceCategory": "Optional - for PROVIDER"
}
```

**Response:** 201 Created
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "userId": "usr-parent-123",
      "name": "Aisha Sharma",
      "email": "aisha@zooby.care",
      "role": "PET_PARENT",
      "...": "other user fields"
    }
  }
}
```

**Validation:**
- name: required, min 2 chars
- email: required, valid email format, unique
- password: required, min 6 chars
- role: required, valid UserRole enum

**Errors:**
- 400: Validation failed
- 409: Email already exists

---

### POST /auth/login
Authenticate user and get JWT token

**Auth:** Public

**Request:**
```json
{
  "emailOrPhone": "aisha@zooby.care",
  "password": "parent123"
}
```

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": {
      "userId": "usr-parent-123",
      "name": "Aisha Sharma",
      "email": "aisha@zooby.care",
      "role": "PET_PARENT",
      "...": "other fields"
    }
  }
}
```

**Errors:**
- 400: Invalid credentials
- 401: Incorrect password
- 403: Account suspended

---

### GET /auth/me
Get current authenticated user profile

**Auth:** Required (Bearer token)

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "user": { ...user profile }
  }
}
```

**Errors:**
- 401: Unauthorized (invalid/missing token)

---

### POST /auth/logout
Logout user (client-side token removal mainly)

**Auth:** Required

**Response:** 200 OK
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## User Endpoints

### GET /users/profile
Get current user's full profile

**Auth:** Required

**Response:** 200 OK
```json
{
  "success": true,
  "data": { ...user profile }
}
```

---

### PUT /users/profile
Update current user's profile

**Auth:** Required

**Request:**
```json
{
  "name": "Updated Name",
  "phone": "+91 98220 11223",
  "location": "Gangapur Road, Nashik",
  "bio": "Pet parent bio"
}
```

**Response:** 200 OK
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": { ...updated user }
}
```

**Validation:**
- Cannot change email, userId, role
- name: min 2 chars

---

## Pet Endpoints

### GET /pets
Get all pets for current user

**Auth:** Required (PET_PARENT role)

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "pets": [ ...array of pet objects ]
  }
}
```

---

### POST /pets
Add a new pet

**Auth:** Required (PET_PARENT role)

**Request:**
```json
{
  "name": "Bruno",
  "species": "Dog",
  "breed": "Golden Retriever",
  "age": "3 Years",
  "weight": "32 kg",
  "gender": "Male",
  "photoUrl": "https://...",
  "bloodGroup": "DEA 1.1 Positive",
  "allergies": "None",
  "currentMedications": "Heartworm Preventative"
}
```

**Response:** 201 Created
```json
{
  "success": true,
  "message": "Pet added successfully",
  "data": {
    "pet": { ...pet object with petId }
  }
}
```

**Validation:**
- name: required, min 2 chars
- species: required, valid enum
- breed: required

---

### GET /pets/:petId
Get specific pet details

**Auth:** Required (Owner or ADMIN)

**Response:** 200 OK

---

### PUT /pets/:petId
Update pet profile

**Auth:** Required (Owner or ADMIN)

**Request:** Same as POST /pets

**Response:** 200 OK

**Authorization:** User must own the pet

---

### DELETE /pets/:petId
Delete a pet (soft delete)

**Auth:** Required (Owner or ADMIN)

**Response:** 200 OK

---

## Health Event Endpoints

### GET /pets/:petId/health-events
Get health events for a specific pet

**Auth:** Required (Owner or ADMIN)

**Query Params:**
- eventType: filter by type (optional)
- upcoming: boolean (optional)

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "events": [ ...health event objects ]
  }
}
```

---

### POST /pets/:petId/health-events
Add a new health event

**Auth:** Required (Owner or ADMIN)

**Request:**
```json
{
  "eventType": "vaccination",
  "eventTitle": "DHPP Annual Booster",
  "date": "2026-08-01",
  "administeredBy": "Dr. Rohan Kulkarni",
  "notes": "Annual booster completed",
  "reminderEnabled": true,
  "reminderDate": "2027-08-01"
}
```

**Response:** 201 Created

**Validation:**
- eventType: required, valid enum
- eventTitle: required
- date: required, valid date

---

### PUT /health-events/:eventId
Update health event

**Auth:** Required (Owner or ADMIN)

**Response:** 200 OK

---

### DELETE /health-events/:eventId
Delete health event

**Auth:** Required (Owner or ADMIN)

**Response:** 200 OK

---

## Service Provider Endpoints

### GET /providers
Get list of service providers

**Auth:** Public (for discovery)

**Query Params:**
- category: filter by service category
- city: filter by city
- search: search by name/title/area
- page: pagination (default: 1)
- limit: items per page (default: 20)

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "providers": [ ...provider objects ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

---

### GET /providers/:providerId
Get specific provider details

**Auth:** Public

**Response:** 200 OK

---

### POST /providers (Provider Registration)
Create provider profile (during signup)

**Auth:** Required (PROVIDER role)

**Request:**
```json
{
  "name": "Nashik Paws & Vet Clinic",
  "category": "vet_consult",
  "title": "Clinical Diagnostics & Vaccinations",
  "city": "Nashik",
  "area": "College Road",
  "address": "123 College Road, Nashik",
  "priceNumber": 650,
  "bio": "BVSc certified...",
  "availableDays": ["Today", "Tomorrow"],
  "slots": ["10:00 AM", "11:30 AM"],
  "certifications": ["BVSc", "MVC"]
}
```

**Response:** 201 Created

**Note:** Status will be "Pending" until admin verifies

---

### PUT /providers/:providerId
Update provider profile

**Auth:** Required (PROVIDER - own profile, or ADMIN)

**Response:** 200 OK

---

## Booking Endpoints

### GET /bookings
Get bookings for current user

**Auth:** Required

**Query Params:**
- status: filter by status
- petId: filter by pet
- startDate, endDate: date range filter
- page, limit: pagination

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "bookings": [ ...booking objects ],
    "pagination": { ... }
  }
}
```

**Authorization:**
- PET_PARENT: see own bookings
- PROVIDER: see bookings for their services
- VAN_WORKER: see assigned van jobs
- ADMIN: see all bookings

---

### GET /bookings/:bookingId
Get specific booking details

**Auth:** Required (Owner, Provider, Van Worker, or ADMIN)

**Response:** 200 OK

---

### POST /bookings
Create a new booking

**Auth:** Required (PET_PARENT role)

**Request:**
```json
{
  "petId": "pet-bruno-123",
  "providerId": "prov-1-123",
  "serviceCategory": "mobile_grooming",
  "serviceTitle": "Doorstep Hydrobath Spa",
  "date": "2026-08-25",
  "timeSlot": "10:00 AM",
  "location": "Rowhouse #4, Silver Palm Enclave",
  "price": 1199,
  "isMobileService": true,
  "notes": "Use hypoallergenic shampoo"
}
```

**Response:** 201 Created
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "booking": { ...booking with bookingId and bookingRef }
  }
}
```

**Business Logic:**
- Generate unique bookingRef (ZB-XXXXXX)
- Set status to "Confirmed"
- If isMobileService: create van job assignment
- Create notification for user and provider

---

### PUT /bookings/:bookingId/status
Update booking status

**Auth:** Required (Provider, Van Worker, or ADMIN)

**Request:**
```json
{
  "status": "Completed"
}
```

**Response:** 200 OK

**Validation:**
- Status transitions must be valid
- Create care record when status = "Completed"

---

### DELETE /bookings/:bookingId (Cancel)
Cancel a booking

**Auth:** Required (Owner or ADMIN)

**Response:** 200 OK

**Business Logic:**
- Set status to "Cancelled"
- If payment made, initiate refund

---

## Van Job Endpoints

### GET /van-jobs
Get van jobs for current van worker

**Auth:** Required (VAN_WORKER or ADMIN)

**Query Params:**
- status: filter by status
- date: filter by scheduled date

**Response:** 200 OK

---

### GET /van-jobs/:jobId
Get specific van job details

**Auth:** Required (Van Worker, Customer, or ADMIN)

**Response:** 200 OK

---

### PUT /van-jobs/:jobId/status
Update van job status

**Auth:** Required (VAN_WORKER or ADMIN)

**Request:**
```json
{
  "status": "On the Way",
  "latitude": 19.9975,
  "longitude": 73.7898,
  "currentLocation": "Near College Road Circle"
}
```

**Response:** 200 OK

**Business Logic:**
- Update booking status accordingly
- Send notification to customer
- Update ETA

---

### PUT /van-jobs/:jobId/location
Update van current location (real-time tracking)

**Auth:** Required (VAN_WORKER)

**Request:**
```json
{
  "latitude": 19.9975,
  "longitude": 73.7898
}
```

**Response:** 200 OK

---

## Adoption Endpoints

### GET /adoption/animals
Get available adoption animals

**Auth:** Public

**Query Params:**
- species: filter by species
- location: filter by location
- shelterId: filter by shelter
- status: filter by status (default: Available)

**Response:** 200 OK

---

### GET /adoption/animals/:animalId
Get specific animal details

**Auth:** Public

**Response:** 200 OK

---

### POST /adoption/animals
Post new adoption animal

**Auth:** Required (RESCUE_PARTNER or ADMIN)

**Request:**
```json
{
  "name": "Bella",
  "species": "Puppy",
  "breed": "Indie Desi Pup",
  "age": "4 Months",
  "gender": "Female",
  "location": "Nashik",
  "description": "Playful and affectionate...",
  "photoUrl": "https://...",
  "vaccinated": true,
  "neutered": false,
  "healthStatus": "Dewormed & vaccinated",
  "adoptionFee": 0
}
```

**Response:** 201 Created

---

### PUT /adoption/animals/:animalId
Update animal profile

**Auth:** Required (RESCUE_PARTNER - own shelter, or ADMIN)

**Response:** 200 OK

---

### GET /adoption/applications
Get adoption applications

**Auth:** Required

**Authorization:**
- PET_PARENT: see own applications
- RESCUE_PARTNER: see applications for their animals
- ADMIN: see all applications

**Response:** 200 OK

---

### POST /adoption/applications
Submit adoption application

**Auth:** Required (PET_PARENT)

**Request:**
```json
{
  "animalId": "adopt-1-123",
  "applicantName": "Aisha Sharma",
  "applicantEmail": "aisha@zooby.care",
  "applicantPhone": "+91 98220 11223",
  "applicantAddress": "Rowhouse #4...",
  "housingType": "Own house with fenced garden",
  "hasOtherPets": "Yes, 1 dog and 1 cat",
  "experienceNotes": "Experienced pet owner..."
}
```

**Response:** 201 Created

---

### PUT /adoption/applications/:applicationId/status
Update application status

**Auth:** Required (RESCUE_PARTNER - for their shelter, or ADMIN)

**Request:**
```json
{
  "status": "Approved",
  "partnerNotes": "Great home environment"
}
```

**Response:** 200 OK

**Business Logic:**
- If status = "Approved": update animal status to "Pending" or "Adopted"
- Send notification to applicant

---

## Payment Endpoints

### POST /payments/process
Process a payment for booking

**Auth:** Required

**Request:**
```json
{
  "bookingId": "bk-101-123",
  "amount": 1199,
  "paymentMethod": "upi",
  "paymentMethodDetails": {
    "brandOrApp": "Google Pay",
    "upiId": "aisha@okaxis"
  }
}
```

**Response:** 200 OK
```json
{
  "success": true,
  "message": "Payment processed successfully",
  "data": {
    "payment": {
      "paymentId": "pay-123-456",
      "transactionId": "txn-789-012",
      "invoiceNumber": "INV-ZB-123456",
      "paymentStatus": "Successful",
      "...": "other payment fields"
    }
  }
}
```

**Business Logic:**
- Integrate with payment gateway
- Update booking paymentStatus
- Generate invoice
- Send receipt notification

---

### GET /payments/:paymentId
Get payment details

**Auth:** Required (Owner, Provider, or ADMIN)

**Response:** 200 OK

---

### POST /payments/:paymentId/refund
Request a refund

**Auth:** Required (Owner or ADMIN)

**Request:**
```json
{
  "reason": "Service not delivered"
}
```

**Response:** 200 OK

**Business Logic:**
- Set refundStatus to "Requested"
- Admin approval required for refund processing

---

### GET /payments/user
Get payment history for current user

**Auth:** Required

**Response:** 200 OK

---

## Provider Payout Endpoints

### GET /payouts
Get payout requests

**Auth:** Required (PROVIDER or ADMIN)

**Authorization:**
- PROVIDER: see own payouts
- ADMIN: see all payouts

**Response:** 200 OK

---

### POST /payouts/request
Request a payout

**Auth:** Required (PROVIDER)

**Request:**
```json
{
  "amount": 5000,
  "bankName": "HDFC Bank",
  "accountLast4": "1234"
}
```

**Response:** 201 Created

**Business Logic:**
- Calculate provider earnings from completed bookings
- Verify sufficient balance
- Set status to "Pending"

---

### PUT /payouts/:payoutId/process
Process payout (admin action)

**Auth:** Required (ADMIN)

**Request:**
```json
{
  "status": "Completed",
  "referenceNumber": "REF123456"
}
```

**Response:** 200 OK

---

## Notification Endpoints

### GET /notifications
Get notifications for current user

**Auth:** Required

**Query Params:**
- read: filter by read status (optional)
- type: filter by notification type (optional)
- limit: items to fetch (default: 50)

**Response:** 200 OK

---

### PUT /notifications/:notificationId/read
Mark notification as read

**Auth:** Required (Owner)

**Response:** 200 OK

---

### PUT /notifications/mark-all-read
Mark all notifications as read

**Auth:** Required

**Response:** 200 OK

---

## Admin Endpoints

### GET /admin/users
Get all users (with filters)

**Auth:** Required (ADMIN)

**Query Params:**
- role: filter by role
- status: filter by status
- search: search by name/email
- page, limit: pagination

**Response:** 200 OK

---

### GET /admin/users/:userId
Get detailed user profile

**Auth:** Required (ADMIN)

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "user": { ...user profile },
    "pets": [ ...user's pets ],
    "recentBookings": [ ...bookings ],
    "activityTimeline": [ ...activity logs ]
  }
}
```

---

### PUT /admin/users/:userId/status
Update user account status

**Auth:** Required (ADMIN)

**Request:**
```json
{
  "status": "Suspended",
  "reason": "Policy violation"
}
```

**Response:** 200 OK

---

### GET /admin/providers/pending
Get providers pending verification

**Auth:** Required (ADMIN)

**Response:** 200 OK

---

### PUT /admin/providers/:providerId/verify
Verify a provider

**Auth:** Required (ADMIN)

**Request:**
```json
{
  "isVerified": true,
  "notes": "Documents verified"
}
```

**Response:** 200 OK

**Business Logic:**
- Set provider.isVerified = true
- Set provider.status = "Active"
- Send notification to provider

---

### GET /admin/dashboard/stats
Get platform analytics

**Auth:** Required (ADMIN)

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "totalUsers": 1234,
    "totalPets": 890,
    "totalBookings": 567,
    "totalRevenue": 123456,
    "recentBookings": [ ... ],
    "recentUsers": [ ... ]
  }
}
```

---

## Error Response Format

All errors follow this structure:

```json
{
  "success": false,
  "message": "User-friendly error message",
  "code": "ERROR_CODE",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### Error Codes
- `VALIDATION_ERROR` - 400
- `UNAUTHORIZED` - 401
- `FORBIDDEN` - 403
- `NOT_FOUND` - 404
- `CONFLICT` - 409
- `INTERNAL_SERVER_ERROR` - 500

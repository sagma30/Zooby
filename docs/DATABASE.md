# DATABASE SCHEMA

## Collections Overview

- `users` - All user accounts (5 roles)
- `pets` - Pet profiles owned by pet parents
- `health_events` - Pet health records (vaccinations, vet visits, medications)
- `care_records` - Service session records
- `service_providers` - Provider profiles and business information
- `bookings` - Service booking records
- `van_jobs` - Mobile van service assignments
- `adoption_animals` - Animals available for adoption
- `adoption_applications` - Adoption requests from pet parents
- `payments` - Payment transaction records
- `payouts` - Provider payout requests and records
- `notifications` - User notifications and updates

---

## Collection Schemas

### users
```javascript
{
  _id: ObjectId,
  userId: String (unique, indexed), // usr-parent-123, usr-provider-456
  name: String (required),
  email: String (unique, indexed, required),
  phone: String (indexed),
  passwordHash: String (required),
  avatarUrl: String,
  location: String,
  role: String (enum: PET_PARENT, PROVIDER, RESCUE_PARTNER, VAN_WORKER, ADMIN),
  status: String (enum: Active, Suspended, New), // default: Active
  
  // Role-specific fields
  businessName: String, // for PROVIDER, RESCUE_PARTNER
  serviceCategory: String, // for PROVIDER (vet_consult, grooming, etc.)
  isVerified: Boolean, // for PROVIDER, RESCUE_PARTNER
  verificationDocuments: [String], // URLs to verification docs
  rating: Number,
  reviewCount: Number,
  assignedVanId: String, // for VAN_WORKER
  assignedVanPlate: String, // for VAN_WORKER
  
  bio: String,
  emergencyContact: String,
  
  createdAt: Date,
  updatedAt: Date,
  lastLoginAt: Date,
  joinedDate: String
}

Indexes:
- userId (unique)
- email (unique)
- phone
- role
- status
```

### pets
```javascript
{
  _id: ObjectId,
  petId: String (unique, indexed), // pet-bruno-123
  ownerId: String (indexed, ref: users.userId),
  name: String (required),
  species: String (enum: Dog, Cat, Other),
  breed: String,
  age: String,
  weight: String,
  gender: String (enum: Male, Female),
  photoUrl: String,
  
  bloodGroup: String,
  allergies: String,
  currentMedications: String,
  specialRequirements: String,
  servicePreferences: [String],
  
  microchipId: String,
  diet: String,
  
  vaccinationStatus: String,
  healthStatusText: String,
  isAttentionNeeded: Boolean (default: false),
  
  liveLocation: {
    city: String,
    state: String,
    status: String,
    battery: Number,
    lastUpdated: Date,
    latitude: Number,
    longitude: Number,
    mapImage: String
  },
  
  createdAt: Date,
  updatedAt: Date
}

Indexes:
- petId (unique)
- ownerId
- species
```

### health_events
```javascript
{
  _id: ObjectId,
  eventId: String (unique, indexed), // event-b1-123
  petId: String (indexed, ref: pets.petId),
  ownerId: String (indexed, ref: users.userId),
  
  eventType: String (enum: vaccination, medication, vet_visit, routine_checkup, surgery, allergy, treatment, grooming, other),
  eventTitle: String (required),
  date: Date (indexed),
  administeredBy: String,
  notes: String,
  
  reminderEnabled: Boolean (default: false),
  reminderDate: Date,
  isUpcoming: Boolean (default: false),
  statusBadge: String,
  
  attachments: [String], // URLs to documents, reports, images
  
  createdAt: Date,
  updatedAt: Date
}

Indexes:
- eventId (unique)
- petId
- ownerId
- date
- eventType
- isUpcoming
```

### care_records
```javascript
{
  _id: ObjectId,
  recordId: String (unique, indexed),
  petId: String (indexed, ref: pets.petId),
  ownerId: String (indexed, ref: users.userId),
  bookingId: String (indexed, ref: bookings.bookingId),
  
  date: Date (indexed),
  serviceTitle: String,
  serviceCategory: String,
  providerOrVanName: String,
  providerId: String (ref: users.userId or service_providers.providerId),
  
  notes: String,
  vitals: {
    weight: String,
    temperature: String,
    coatCondition: String,
    behaviorNote: String
  },
  
  verifiedBadge: Boolean (default: false),
  attachments: [String],
  
  createdAt: Date,
  updatedAt: Date
}

Indexes:
- recordId (unique)
- petId
- ownerId
- bookingId
- date
```

### service_providers
```javascript
{
  _id: ObjectId,
  providerId: String (unique, indexed), // prov-1-123
  userId: String (indexed, ref: users.userId), // Link to user account
  
  name: String (required),
  category: String (enum: grooming, walking, sitting, vet_consult, training, mobile_grooming, mobile_vet, adoption),
  title: String,
  
  rating: Number (default: 0),
  reviewCount: Number (default: 0),
  priceFormatted: String,
  priceNumber: Number,
  
  city: String (indexed),
  area: String,
  address: String,
  latitude: Number,
  longitude: Number,
  
  image: String,
  images: [String],
  
  isVerified: Boolean (default: false),
  isMobileVanEligible: Boolean (default: false),
  badge: String,
  bio: String,
  
  availableDays: [String],
  slots: [String],
  
  certifications: [String],
  experience: String,
  
  status: String (enum: Active, Pending, Suspended), // default: Pending
  
  createdAt: Date,
  updatedAt: Date
}

Indexes:
- providerId (unique)
- userId
- category
- city
- isVerified
- status
```

### bookings
```javascript
{
  _id: ObjectId,
  bookingId: String (unique, indexed), // bk-101-123
  bookingRef: String (unique, indexed), // ZB-992144
  
  userId: String (indexed, ref: users.userId),
  petId: String (indexed, ref: pets.petId),
  petName: String,
  petPhoto: String,
  petSpecies: String,
  petBreed: String,
  
  serviceCategory: String,
  serviceTitle: String,
  providerId: String (indexed, ref: service_providers.providerId),
  providerName: String,
  
  vanWorkerId: String (indexed, ref: users.userId),
  vanWorkerName: String,
  
  date: Date (indexed),
  timeSlot: String,
  location: String,
  customerAddress: String,
  
  price: Number (required),
  baseFare: Number,
  doorstepFee: Number,
  discount: Number,
  taxes: Number,
  platformFee: Number,
  
  status: String (enum: Pending, Confirmed, Assigned, On the Way, Arrived, In Progress, Completed, Cancelled), // default: Pending
  
  paymentId: String (ref: payments.paymentId),
  transactionId: String,
  paymentMethod: String,
  paymentStatus: String (enum: Pending, Paid, Pay Later, Refunded, Failed), // default: Pending
  refundStatus: String,
  
  notes: String,
  specialInstructions: String,
  
  isMobileService: Boolean (default: false),
  etaMinutes: Number,
  
  createdAt: Date (indexed),
  updatedAt: Date,
  completedAt: Date
}

Indexes:
- bookingId (unique)
- bookingRef (unique)
- userId
- petId
- providerId
- vanWorkerId
- date
- status
- paymentStatus
- createdAt
```

### van_jobs
```javascript
{
  _id: ObjectId,
  jobId: String (unique, indexed), // vjob-1-123
  bookingId: String (indexed, ref: bookings.bookingId),
  
  vanWorkerId: String (indexed, ref: users.userId),
  vanNumber: String,
  
  customerName: String,
  customerPhone: String,
  customerAddress: String,
  
  petName: String,
  petSpecies: String,
  petBreed: String,
  petPhoto: String,
  
  handlingNotes: String,
  serviceTitle: String,
  scheduledTime: Date (indexed),
  
  status: String (enum: Assigned, On the Way, Arrived, Service Started, Service Completed, Cancelled), // default: Assigned
  sequenceOrder: Number,
  
  latitude: Number,
  longitude: Number,
  currentLocation: String,
  
  completedAt: Date,
  amount: Number,
  paymentStatus: String,
  
  createdAt: Date,
  updatedAt: Date
}

Indexes:
- jobId (unique)
- bookingId
- vanWorkerId
- scheduledTime
- status
- sequenceOrder
```

### adoption_animals
```javascript
{
  _id: ObjectId,
  animalId: String (unique, indexed), // adopt-1-123
  
  name: String (required),
  species: String (enum: Dog, Cat, Puppy, Kitten),
  breed: String,
  age: String,
  gender: String (enum: Male, Female),
  
  location: String (indexed),
  description: String,
  photoUrl: String,
  images: [String],
  
  shelterName: String,
  shelterId: String (indexed, ref: users.userId),
  
  vaccinated: Boolean (default: false),
  neutered: Boolean (default: false),
  healthStatus: String,
  
  status: String (enum: Available, Pending, Adopted), // default: Available
  
  adoptionFee: Number (default: 0),
  feeDescription: String,
  
  postedDate: Date (indexed),
  
  createdAt: Date,
  updatedAt: Date
}

Indexes:
- animalId (unique)
- shelterId
- species
- location
- status
- postedDate
```

### adoption_applications
```javascript
{
  _id: ObjectId,
  applicationId: String (unique, indexed), // app-101-123
  
  animalId: String (indexed, ref: adoption_animals.animalId),
  animalName: String,
  animalPhoto: String,
  
  shelterId: String (indexed, ref: users.userId),
  
  applicantId: String (indexed, ref: users.userId),
  applicantName: String,
  applicantEmail: String,
  applicantPhone: String,
  applicantAddress: String,
  
  housingType: String,
  hasOtherPets: String,
  experienceNotes: String,
  
  submittedDate: Date (indexed),
  status: String (enum: Submitted, Under Review, Approved, Declined), // default: Submitted
  
  partnerNotes: String,
  
  feeAmount: Number,
  paymentId: String (ref: payments.paymentId),
  paymentStatus: String,
  
  createdAt: Date,
  updatedAt: Date
}

Indexes:
- applicationId (unique)
- animalId
- shelterId
- applicantId
- status
- submittedDate
```

### payments
```javascript
{
  _id: ObjectId,
  paymentId: String (unique, indexed), // pay-123-456
  transactionId: String (unique, indexed),
  invoiceNumber: String (unique, indexed),
  
  userId: String (indexed, ref: users.userId),
  userName: String,
  userEmail: String,
  userPhone: String,
  
  providerId: String (indexed, ref: service_providers.providerId),
  providerName: String,
  
  bookingId: String (indexed, ref: bookings.bookingId),
  bookingRef: String,
  
  serviceId: String,
  serviceTitle: String,
  serviceCategory: String,
  
  petId: String,
  petName: String,
  
  amount: Number (required),
  baseFare: Number,
  doorstepFee: Number,
  discount: Number,
  couponCode: String,
  taxes: Number,
  platformFee: Number,
  providerPayout: Number,
  
  paymentMethod: String (enum: upi, card, netbanking, wallet, pay_later),
  paymentMethodDetails: {
    brandOrApp: String,
    maskedAccount: String
  },
  
  paymentStatus: String (enum: Pending, Processing, Successful, Failed, Cancelled, Refunded, Partially Refunded), // default: Pending
  
  refundStatus: String (enum: None, Requested, Processing, Refunded, Failed), // default: None
  refundAmount: Number,
  refundReason: String,
  refundDate: Date,
  
  gatewayResponse: Object, // Store raw gateway response
  failureReason: String,
  
  isAdoptionPayment: Boolean (default: false),
  adoptionAnimalId: String,
  
  createdAt: Date (indexed),
  paidAt: Date,
  updatedAt: Date
}

Indexes:
- paymentId (unique)
- transactionId (unique)
- invoiceNumber (unique)
- userId
- providerId
- bookingId
- paymentStatus
- refundStatus
- createdAt
```

### payouts
```javascript
{
  _id: ObjectId,
  payoutId: String (unique, indexed),
  
  providerId: String (indexed, ref: users.userId),
  providerName: String,
  
  amount: Number (required),
  status: String (enum: Pending, Processing, Completed, Failed), // default: Pending
  
  requestedAt: Date (indexed),
  processedAt: Date,
  
  bankName: String,
  accountLast4: String,
  referenceNumber: String,
  
  paymentIds: [String], // List of payment IDs included in this payout
  
  notes: String,
  
  createdAt: Date,
  updatedAt: Date
}

Indexes:
- payoutId (unique)
- providerId
- status
- requestedAt
```

### notifications
```javascript
{
  _id: ObjectId,
  notificationId: String (unique, indexed), // up-123-456
  
  userId: String (indexed, ref: users.userId),
  
  text: String (required),
  type: String (enum: booking, health, reminder, adoption, van, payment, system),
  
  read: Boolean (default: false),
  
  relatedEntityType: String, // booking, pet, payment, etc.
  relatedEntityId: String,
  
  actionUrl: String,
  
  createdAt: Date (indexed),
  readAt: Date
}

Indexes:
- notificationId (unique)
- userId
- read
- type
- createdAt
```

---

## Important Queries

### User Queries
- Find user by email or phone
- Find users by role
- Find active/suspended users

### Pet Queries
- Find pets by owner
- Find pets with upcoming health reminders

### Booking Queries
- Find bookings by user
- Find bookings by provider
- Find bookings by status
- Find bookings by date range
- Find mobile service bookings

### Van Job Queries
- Find jobs by van worker
- Find jobs by status
- Find jobs by scheduled time (today, upcoming)

### Payment Queries
- Find payments by user
- Find payments by provider
- Find failed/refunded payments
- Calculate provider earnings

### Adoption Queries
- Find available animals
- Find applications by shelter
- Find applications by applicant

### Notification Queries
- Find unread notifications by user
- Find notifications by type

---

## Soft Deletion Strategy

For critical data preservation, use soft deletion:
- Add `deletedAt: Date` field
- Add `isDeleted: Boolean (default: false)` field
- Queries should filter `isDeleted: false` by default
- Admin can permanently delete if needed

Collections requiring soft deletion:
- users (for audit trail)
- pets (for care record history)
- bookings (for financial records)
- payments (for financial compliance)

---

## Audit Requirements

For compliance and security:
- All create/update operations should log `createdAt` and `updatedAt`
- Payment transactions must be immutable (no updates after creation)
- User authentication attempts should be logged
- Admin actions should be logged separately

# SECURITY

## Authentication

### Password Security
- **Hashing:** bcrypt with cost factor 10
- **Minimum Length:** 6 characters (consider increasing to 8 in production)
- **Storage:** Never store plain text passwords
- **Transmission:** Only over HTTPS in production

### JWT Tokens
- **Algorithm:** HS256 (HMAC with SHA-256)
- **Payload:** userId, email, role, iat (issued at), exp (expiration)
- **Expiration:** 7 days (configurable via env)
- **Secret:** Strong random string stored in environment variable
- **Storage:** 
  - Client: localStorage or httpOnly cookies
  - Server: Never stored (stateless)

### Session Management
- **Stateless:** JWT-based, no server-side sessions
- **Logout:** Client-side token removal
- **Token Refresh:** Consider implementing refresh tokens for better security

---

## Authorization

### Role-Based Access Control (RBAC)
- **Roles:** PET_PARENT, PROVIDER, RESCUE_PARTNER, VAN_WORKER, ADMIN
- **Middleware:** `requireAuth` and `requireRole` middleware
- **Enforcement:** All protected routes check authentication and authorization

### Resource Ownership
- **Object-Level Authorization:** Users can only access their own resources
- **Validation:** 
  - Pet owner can only access their pets
  - Booking owner can only view/cancel their bookings
  - Provider can only access bookings for their services
  - Rescue partner can only manage their shelter's animals

### Permission Matrix

| Resource | PET_PARENT | PROVIDER | RESCUE_PARTNER | VAN_WORKER | ADMIN |
|----------|------------|----------|----------------|------------|-------|
| Own Profile | RW | RW | RW | RW | RW |
| Others' Profiles | - | - | - | - | R |
| Pets | RW (own) | - | - | - | RW (all) |
| Bookings | RW (own) | R (assigned) | - | R (assigned) | RW (all) |
| Providers | R (public) | RW (own) | - | - | RW (all) |
| Van Jobs | - | - | - | RW (assigned) | RW (all) |
| Adoption Animals | R (public) | - | RW (own shelter) | - | RW (all) |
| Applications | RW (own) | - | R (own shelter) | - | RW (all) |
| Payments | R (own) | R (own) | - | - | RW (all) |
| Payouts | - | RW (own) | - | - | RW (all) |

R = Read, W = Write (Create, Update, Delete)

---

## Input Validation

### Request Validation
- **Schema Validation:** Validate all incoming requests against defined schemas
- **Type Checking:** Ensure correct data types
- **Required Fields:** Enforce required field presence
- **Length Limits:** Enforce min/max lengths for strings
- **Format Validation:** Email, phone, URL, date formats
- **Enum Validation:** Ensure enum values are valid

### Sanitization
- **HTML Escaping:** Escape HTML in text inputs to prevent XSS
- **SQL/NoSQL Injection:** Use parameterized queries (MongoDB prevents most injection by default)
- **File Upload:** Validate file types, sizes, and sanitize filenames

---

## API Security

### Rate Limiting
- **Implementation:** Rate limit middleware (express-rate-limit)
- **Limits:**
  - Authentication endpoints: 5 requests per 15 minutes per IP
  - General API: 100 requests per 15 minutes per user
  - Payment endpoints: 10 requests per minute per user

### CORS (Cross-Origin Resource Sharing)
- **Configuration:** Allow only trusted frontend domains
- **Development:** Allow localhost for local development
- **Production:** Restrict to production frontend domain

### HTTP Security Headers (Helmet.js)
- **X-Frame-Options:** Prevent clickjacking
- **X-Content-Type-Options:** Prevent MIME sniffing
- **Strict-Transport-Security:** Force HTTPS
- **Content-Security-Policy:** Prevent XSS attacks

### HTTPS Only
- **Development:** HTTP acceptable
- **Production:** Enforce HTTPS
- **Redirect:** Auto-redirect HTTP to HTTPS

---

## Data Security

### Sensitive Data Handling
- **Never Expose:**
  - Password hashes
  - JWT secrets
  - Database credentials
  - API keys
  - Payment gateway secrets

- **Response Filtering:** Remove sensitive fields before sending responses

```javascript
// Example: User response
{
  userId: "usr-123",
  name: "Aisha",
  email: "aisha@zooby.care",
  // passwordHash: NEVER INCLUDED
}
```

### Environment Variables
- **Storage:** .env file (never committed to git)
- **Access:** process.env.VARIABLE_NAME
- **Required Variables:**
  - DATABASE_URL
  - JWT_SECRET
  - PORT
  - NODE_ENV
  - PAYMENT_GATEWAY_KEY (when implemented)
  - CLOUD_STORAGE_KEY (when implemented)

### Database Security
- **Connection:** Use connection strings with authentication
- **Credentials:** Store in environment variables
- **Access Control:** Database user with minimal required permissions
- **Encryption at Rest:** Enable in MongoDB Atlas
- **Backups:** Regular automated backups

---

## File Upload Security

### Validation
- **File Types:** Restrict to allowed types (images: jpg, png, pdf for documents)
- **File Size:** Maximum 5MB for images, 10MB for documents
- **Filename Sanitization:** Remove special characters, generate unique filenames

### Storage
- **Location:** Cloud storage (Cloudinary/S3), not local filesystem
- **Access:** Public URLs for profile images, private/signed URLs for sensitive documents
- **Virus Scanning:** Consider implementing in production

---

## Payment Security

### PCI Compliance
- **Never Store:** Credit card numbers, CVV codes
- **Tokenization:** Use payment gateway tokenization
- **Gateway:** Let gateway handle card data
- **Backend:** Only store payment status and transaction references

### Transaction Security
- **HTTPS Only:** All payment communication over HTTPS
- **Idempotency:** Prevent duplicate payments with idempotency keys
- **Verification:** Verify payment callback signatures from gateway
- **Amount Validation:** Verify payment amount matches booking price

---

## Error Handling

### Information Disclosure Prevention
- **Generic Errors:** Don't expose internal errors to clients
- **Stack Traces:** Never send stack traces in production
- **Database Errors:** Sanitize database error messages

### Error Logging
- **Server-Side:** Log detailed errors server-side for debugging
- **Sensitive Data:** Don't log passwords, tokens, or payment details
- **Error Monitoring:** Consider Sentry or similar service

---

## Audit & Logging

### Activity Logging
- **Authentication:** Log all login attempts (success and failure)
- **Admin Actions:** Log all admin operations (user suspension, provider verification)
- **Financial Transactions:** Log all payment and refund operations
- **Data Changes:** Log critical data modifications

### Log Storage
- **Retention:** Keep logs for at least 90 days
- **Access:** Restricted to admins only
- **Format:** Structured JSON logs with timestamps

---

## Security Best Practices

### Code Security
- **Dependencies:** Regularly update dependencies to patch vulnerabilities
- **Audit:** Run `npm audit` regularly
- **Code Review:** Review security-critical code changes
- **Static Analysis:** Use ESLint security plugins

### Deployment Security
- **Environment Separation:** Separate dev, staging, production environments
- **Secret Management:** Use secret management services (AWS Secrets Manager, etc.)
- **Access Control:** Limit production access to essential personnel
- **Monitoring:** Monitor for suspicious activity

### Incident Response
- **Plan:** Have an incident response plan
- **Backup:** Regular database backups
- **Recovery:** Test backup restoration procedures
- **Communication:** Define communication protocol for security incidents

---

## Compliance Considerations

### GDPR (Future Enhancement)
- **Data Access:** Users can request their data
- **Data Deletion:** Users can request data deletion
- **Consent:** Explicit consent for data processing
- **Privacy Policy:** Clear privacy policy

### Data Retention
- **Active Data:** Retained as long as account is active
- **Soft Deletion:** 30-day retention before permanent deletion
- **Financial Records:** 7 years retention for compliance

---

## Security Checklist

### Before Deployment
- [ ] All environment variables configured
- [ ] JWT secret is strong and random
- [ ] HTTPS enforced
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Helmet.js security headers active
- [ ] Error messages sanitized
- [ ] Database connection secured
- [ ] No secrets in code
- [ ] No console.logs in production
- [ ] Dependencies up to date
- [ ] npm audit clean
- [ ] Backup strategy in place
- [ ] Monitoring and logging enabled

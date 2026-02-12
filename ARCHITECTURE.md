# 1. High Level Design
- Multi-tenant ready modular platform with separate `backend` and `frontend` workspaces.
- Backend follows Controller -> Service -> Repository -> Mongo Model boundaries.
- Security-first API with cookie-based JWT auth, refresh flow, RBAC (`admin`, `security`, `user`), rate limiting, helmet, and validation.
- Real-time updates via Socket.IO for slot/booking state transitions.
- Background workflows use Trigger.dev webhook dispatch and periodic expiry worker.
- Payment lifecycle uses Stripe Payment Intents at checkout/exit stage.

# 2. Database Schema
## Collections
- `ParkingUser`: name, email(unique), passwordHash, role, isActive.
- `ParkingRefreshToken`: userId, tokenId(unique), expiresAt, revokedAt.
- `ParkingVehicle`: userId, plateNumber(unique), make, model, color, vehicleType.
- `ParkingSlot`: code(unique), zone, level, lotName, vehicleType, status, activeBookingId, hourlyRate, overtimeMultiplier, penaltyPerHour.
- `ParkingBooking`: userId, vehicleId, slotId, startsAt, endsAt, expectedDurationMinutes, status, qrToken, qrImageDataUrl, checkInAt, checkOutAt, amount, overtimeMinutes, penaltyAmount, paymentStatus, stripePaymentIntentId.
- `ParkingLedger`: bookingId, userId, slotId, baseAmount, overtimeAmount, penaltyAmount, totalAmount, paymentReference, paidAt, durationMinutes, bookedMinutes.
- `ParkingSubscription`: userId, vehicleId, planName, monthlyAmount, startsAt, endsAt, status.
- `ParkingNotification`: userId, title, message, category, isRead, bookingId.

# 3. API Contracts
## Auth
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/verify-email`
- `POST /api/v1/auth/resend-verification`
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password`
- `GET /api/v1/auth/me`

## Vehicles
- `GET /api/v1/vehicles`
- `POST /api/v1/vehicles`

## Slots
- `GET /api/v1/slots?status=&vehicleType=&page=&limit=`
- `POST /api/v1/slots` (admin)

## Bookings
- `POST /api/v1/bookings` (user/admin)
- `GET /api/v1/bookings/me` (user/admin)
- `POST /api/v1/bookings/scan` (security/admin)

## Subscriptions
- `POST /api/v1/subscriptions` (user/admin)
- `GET /api/v1/subscriptions/me` (user/admin)

## Notifications
- `GET /api/v1/notifications`
- `PATCH /api/v1/notifications/:notificationId/read`

## Analytics
- `GET /api/v1/analytics/admin` (admin)

# 4. Backend Folder Structure
- `backend/src/config`: environment and DB setup.
- `backend/src/core`: middleware, RBAC, response utils, auth typing.
- `backend/src/db/models`: Mongoose schemas.
- `backend/src/modules/*`: feature modules (`auth`, `bookings`, `slots`, `vehicles`, `subscriptions`, `notifications`, `analytics`, `payments`, `realtime`, `billing`).
- `backend/src/server.ts`: bootstrapping, middleware stack, API mount.

# 5. Backend Implementation
- Cookie JWT + refresh tokens with revocation persisted in Mongo.
- Email verification token flow with verify/resend endpoints and login gating until verified.
- Strict Zod validation for all write operations.
- Atomic booking reserve through Mongo transaction and `findOneAndUpdate` lock on slot status.
- QR tokens signed with HMAC secret; entry/exit workflow enforces finite-state transitions.
- Billing computes base/overtime/penalty and persists immutable ledger records.
- Stripe payment intent generated on exit for bill settlement.
- Expiry worker emits reminder notifications and Trigger.dev events.
- Socket.IO broadcasts slot/booking transitions.

# 6. Frontend Folder Structure
- `frontend/src/api`: HTTP client abstraction.
- `frontend/src/app`: query client + auth state context.
- `frontend/src/features/*`: domain-specific API + hooks.
- `frontend/src/components`: layout + shared UI.
- `frontend/src/pages`: role-specific screens.
- `frontend/src/routes`: router and route guards.

# 7. Frontend Implementation
- React + TypeScript strict mode.
- React Router v7 guarded routes with RBAC by role.
- TanStack Query for all server state.
- React Hook Form for all forms.
- Tailwind-based responsive dashboard UI.
- Notification navbar with unread count.
- Socket.IO realtime invalidation for slots/bookings.
- Booking flow includes QR generation display and security scan page.

# 8. Realtime Design
- Client joins room `user:<userId>` after auth bootstrap.
- Events:
  - `parking:slot` -> slot status changes globally.
  - `parking:booking` -> user-specific booking state changes.
- Backend emits on booking create, entry, exit.
- Frontend invalidates related queries for strong eventual consistency.

# 9. Deployment Notes
- Run MongoDB as managed replica set for transactions.
- Deploy backend behind reverse proxy with TLS and sticky sessions for Socket.IO.
- Use Redis adapter for Socket.IO when horizontally scaling backend instances.
- Store JWT secrets, Stripe keys, mail credentials, and QR secret in secret manager.
- Configure Stripe webhook endpoint for payment status reconciliation.
- Use production SMTP provider (SES/SendGrid) for reliable notifications.

# 10. Future Scalability Ideas
- Add parking-lot partitioning and tenant isolation for multi-property operations.
- Introduce event bus (Kafka/NATS) for async billing, notifications, and analytics pipelines.
- Add idempotency keys for booking/payment APIs.
- Implement dynamic pricing by peak windows and occupancy.
- Add OCR/ANPR camera integration for automatic vehicle recognition.
- Build materialized analytics store for near real-time BI dashboards.

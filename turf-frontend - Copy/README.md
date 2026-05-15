# GroundFlow Turf Frontend

Angular frontend for your Turf Management microservices through the API Gateway on `http://localhost:8080`.

## Included features

- Login and register for `CUSTOMER` and `OWNER`
- Role-based pages for customer, owner, and admin
- Turf listing filtered by location
- Customer booking history and cancellation
- Owner turf listing, add, and delete
- Admin user view and turf catalog view
- Slot selection before booking
- Payment page with payment options
- Home page with local images, FAQ page, and Contact Us page
- Booking confirmation page with booking ID

## Backend routes used

- `POST /auth/register`
- `POST /auth/login`
- `GET /customers`
- `GET /turfs`
- `GET /turfs/{id}`
- `GET /turfs/owner`
- `POST /turfs/add`
- `DELETE /turfs/delete/{id}`
- `GET /slots/{turfId}`
- `POST /bookings/create/{turfId}`
- `GET /bookings/my`
- `GET /bookings/owner`
- `GET /bookings/all`
- `DELETE /bookings/cancel/{id}`
- `POST /payments/orders/{bookingId}`
- `POST /payments/verify/{paymentId}`
- `GET /payments/history`

## Run locally

```powershell
npm install
npm start
```

## Notes

- Dev proxy is already configured for `/auth`, `/customers`, `/turfs`, `/slots`, `/bookings`, and `/payments`.
- Import `Turf-Management-Gateway.postman_collection.json` into Postman for API testing.
- Frontend talks to the API Gateway only; it does not connect directly to MySQL.

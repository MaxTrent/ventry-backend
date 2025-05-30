# Ventry(Vehicle + Inventory) Backend

A Node.js/Express TypeScript application for a car dealership, managing cars, categories, customers, managers, and purchases.

## Features
- **Customer Signup & OTP Verification**
- **Car Management** 
- **Category Management**
- **Manager Management**
- **Purchase Processing**
- **Authentication**
- **Testing**

## Setup
1. **Clone Repository**:
   ```bash
   git clone <repository-url>
   cd ventry-backend
   ```
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment**:
   Create a `.env` file using `.env.sample` as a template:

4. **Seed Superadmin User**:
   Run the seeding script to create a superadmin user for administrative tasks:
   ```bash
   npx ts-node src/scripts/seed-superadmin.ts
   ```
   - Ensure MongoDB is running (`MONGODB_URI`).
   - The script creates a superadmin user (e.g., email: `superadmin@example.com`, password: `password123`).
   - Verify in MongoDB:
     ```bash
     mongo
     use ventry
     db.managers.find({ role: 'superadmin' })
     ```
   - Use these credentials to log in via `POST /api/auth/login` and obtain a JWT for superadmin endpoints.
5. **Run Application**:
   ```bash
   npm start
   ```
6. **Run Tests**:
   ```bash
   npm test
   ```

## API Endpoints
| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| **Auth** | | | |
| POST | `/api/auth/login` | Log in and receive JWT | None |
| **Cars** | | | |
| GET | `/api/cars` | Query cars with pagination and filters | None |
| POST | `/api/cars` | Create a car | JWT (superadmin, manager) |
| PUT | `/api/cars/:id` | Update a car | JWT (superadmin, manager) |
| DELETE | `/api/cars/:id` | Delete a car | JWT (superadmin, manager) |
| **Categories** | | | |
| POST | `/api/categories` | Create a category | JWT (superadmin, manager) |
| GET | `/api/categories` | Query categories with pagination | None |
| GET | `/api/categories/:id` | Get category by ID | None |
| PUT | `/api/categories/:id` | Update category | JWT (superadmin, manager) |
| DELETE | `/api/categories/:id` | Delete category | JWT (superadmin, manager) |
| **Customers** | | | |
| POST | `/api/customers/signup` | Register a customer and send OTP | None |
| POST | `/api/customers/verify-otp` | Verify OTP and issue JWT | None |
| **Managers** | | | |
| GET | `/api/managers` | Query managers with pagination | JWT (superadmin) |
| POST | `/api/managers` | Create a manager | JWT (superadmin) |
| PUT | `/api/managers/:id` | Update a manager | JWT (superadmin) |
| DELETE | `/api/managers/:id` | Delete a manager | JWT (superadmin) |
| **Purchases** | | | |
| POST | `/api/purchases` | Initiate a car purchase | JWT (customer) |
| GET | `/api/purchases/callback?reference=<reference>` | Verify payment via Paystack callback | None |
| POST | `/api/purchases/webhook` | Handle Paystack webhook events | None (Paystack signature) |

## Testing
- **Unit Tests**: Located in `src/tests/*.test.ts`. Uses Jest and MongoDB Memory Server.
- **Postman**: Import `postman_collection.json` for all APIs.
- **Webhook Testing**: Use `ngrok http 3000` for `http://localhost:3000/api/purchases/webhook`.

## Webhooks
- **Purpose**: Handle Paystack events (`charge.success`, `charge.failed`).
- **Setup**:
  1. Install ngrok:
     ```bash
     ngrok http 3000
     ```
  2. Copy the ngrok URL (e.g., `https://abcd1234.ngrok.io`).
  3. Set webhook URL in Paystack Dashboard: `https://<ngrok-id>.ngrok.io/api/purchases/webhook`.
  4. Enable `charge.success` and `charge.failed` events.
  5. Test via Paystack’s webhook simulator or Postman:
     - Use `POST /api/purchases/webhook` in `ventry_backend.postman_collection.json`.
     - Compute `x-paystack-signature` with `PAYSTACK_SECRET_KEY` and payload.
- **Test Case**: In `src/tests/purchase.test.ts` for `charge.success`.





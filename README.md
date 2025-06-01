# Ventry(Vehicle + Inventory) Backend

A Node.js/Express TypeScript application for a car dealership, managing cars, categories, customers, managers, and purchases.

## Features
- **Customer Signup**
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
   Create `.env`using `.env.sample` as reference
  
4. **Seed Superadmin User**:
   Run the seeding script to create a superadmin user:
   ```bash
   npm run seed
   ```
   
   - Creates a superadmin user
 
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
| POST | `/api/auth/logout` | Revoke JWT | JWT (customer, manager, superadmin) |
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
  - Set `baseUrl` to `http://localhost:<PORT>}`.
  - Set `superadmin_password` to the `.env` `SUPERADMIN_PASSWORD`.
- **Webhook Testing**: Use `ngrok http <PORT>` for `http://localhost:<PORT>/api/purchases/webhook`.

## Webhooks
- **Purpose**: Handle Paystack events (`charge.success`, `charge.failed`).
- **Setup**:
  1. Install ngrok:
     ```bash
     ngrok http <PORT>
     ```
  2. Copy the ngrok URL.
  3. Set webhook URL in Paystack Dashboard
  4. Enable `charge.success` and `charge.failed` events.
  5. Test via Paystack’s webhook simulator or Postman:
     - Use `POST /api/purchases/webhook` in `ventry_backend.postman_collection.json`.
     - Compute `x-paystack-signature` with `PAYSTACK_SECRET_KEY` and payload:
       ```javascript
       const crypto = require('crypto');
       const secret = process.env.PAYSTACK_SECRET_KEY;
       const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(payload)).digest('hex');
       ```
- **Test Case**: In `src/tests/purchase.test.ts` for `charge.success`.

## Email Notifications
- **Purchase Confirmation**: Sent via SendGrid after payment verification.
- **OTP Emails**: Sent during customer signup.

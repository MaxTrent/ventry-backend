# Ventry(Vehicle + Inventory) Backend

A Node.js/Express TypeScript application for a car dealership, managing cars, categories, customers, managers, and purchases.

## Features
- **Customer Signup & OTP Verification(Check Spam for otp)**
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
   Create `.env`using `.env.sample` as template
   

4. **Seed Superadmin User**:
   ```bash
   npm run seed
   ```
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
- **Postman**: Import `postman_collection.json`.
  - Set `baseUrl` to `https://ventry-backend-jjs7.onrender.com`
  - Set `superadmin_password` to `.env` `SUPERADMIN_PASSWORD`.
  - Update `jwt_token`, `category_id`, `car_id`, `manager_id`, `reference`, `paystack_signature`.
- **Webhook Testing**:
  1. **Install ngrok**:
     ```bash
     brew install ngrok
     ngrok authtoken <your_auth_token> 
     ```
  2. **Start ngrok**:
     ```bash
     ngrok http <PORT>
     ```
     - Copy URL (e.g., `https://abcd1234.ngrok.io`).
     - Open `http://127.0.0.1:4040`.
  3. **Configure Paystack**:
     - Dashboard > Settings > API Keys & Webhooks.
     - Set Webhook URL
  4. **Test Webhook**:
     - **Purchase Simulation**:
       - Use Postman to initiate a purchase and complete test payment.
       
  5. **Run Locally (without Docker)**:
   ```bash
   npm run dev
   ```
  6. **Run with Docker**:
   - Install Docker
   - Start Docker Desktop.
   - Run:
     ```bash
     docker-compose up --build
     ```

## Email Notifications
- **Purchase Confirmation**: Sent after payment verification.
- **OTP Emails**: Sent during customer signup.

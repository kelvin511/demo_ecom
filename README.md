# 🛒 Storefront Pre-Release Cart API Validation Project

> **Project Goal:** Before a storefront release, determine whether the commerce cart endpoint (`POST /api/cart/items`) reliably rejects invalid quantities without changing the cart state.  
> **Target Audience:** Storefront Release Engineers, QA Test Leads, and Backend API Developers.

---

## 📋 Project Overview

| Attribute | Details |
| :--- | :--- |
| **Purpose** | Check whether a cart API rejects invalid quantities and preserves cart state integrity. |
| **Target Audience** | Storefront Release Team, QA Engineers, E-Commerce Platform Engineers. |
| **Starting Materials** | Local commerce backend running in Docker Desktop, synthetic product catalog, and a resettable cart. |
| **Apps Used** | **Visual Studio Code**, **Docker Desktop**, and **Postman**. |
| **Verification Artifacts** | Saved Postman Collection with response examples (`postman/cart-api-validation.postman_collection.json`) and concise pass/fail report (`FINDINGS.md`). |

---

## 🏗️ Architecture & Components

```
demo_ecom/
├── .vscode/
│   ├── launch.json                              # Local debug & runner configurations
│   ├── tasks.json                               # Docker build, test runner & cart reset tasks
│   └── settings.json                            # Workspace format & tab preferences
├── docker-compose.yml                           # Docker Desktop composition service
├── Dockerfile                                   # Production-ready Alpine Node.js container
├── .dockerignore                                # Context exclusion definitions
├── package.json                                 # Manifest and script commands
├── .env.example                                 # Environment configuration template
├── README.md                                    # Project documentation
├── FINDINGS.md                                  # Concise Pass/Fail Findings Report
├── src/
│   ├── server.js                                # Express API, logging, healthcheck & UI dashboard
│   ├── data/
│   │   └── products.json                        # Synthetic catalog with realistic stock quantities
│   ├── services/
│   │   ├── catalogService.js                    # Product lookup and inventory validation
│   │   └── cartService.js                       # Resettable cart store with defensive validation
│   └── routes/
│       ├── products.js                          # GET /api/products, GET /api/products/:id
│       └── cart.js                              # GET /api/cart, POST /api/cart/items, POST /api/cart/reset
├── postman/
│   ├── cart-api-validation.postman_collection.json  # Postman v2.1.0 collection with saved response examples
│   └── cart-api-validation.postman_environment.json # Postman environment configuration
└── scripts/
    └── test-runner.js                           # Automated test runner script for the 4 quantity cases
```

---

## 🚀 Quickstart Guide

### Option 1: Running in Docker Desktop (Recommended)

1. **Build and start the container:**
   ```bash
   docker compose up --build -d
   ```
2. **Verify container status:**
   ```bash
   docker ps --filter "name=demo-ecom-backend"
   ```
3. **Open the interactive dashboard:**
   Visit [http://localhost:5000](http://localhost:5000) in your browser.
4. **Stop the container when done:**
   ```bash
   docker compose down
   ```

### Option 2: Running Locally via Node.js

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Start the server:**
   ```bash
   npm start
   ```

---

## 🧪 Testing the 4 Invalid Quantity Cases

Run the automated validation script against the running Docker backend:

```bash
npm test
```

### The Four Tested Quantity Cases:

1. **Case 1: Negative Quantity (`-1`)**
   - Payload: `{"productId": "prod_101", "quantity": -1}`
   - Result: `HTTP 400 Bad Request` (`NegativeQuantity`)
   - Cart Verification: Cart remains at 0 items (unchanged).

2. **Case 2: Zero Quantity (`0`)**
   - Payload: `{"productId": "prod_101", "quantity": 0}`
   - Result: `HTTP 400 Bad Request` (`ZeroQuantity`)
   - Cart Verification: Cart remains at 0 items (unchanged).

3. **Case 3: Non-Numeric & Non-Integer Types (`"invalid_qty"`, `1.5`)**
   - Payloads: `{"productId": "prod_101", "quantity": "invalid_qty"}` and `{"productId": "prod_101", "quantity": 1.5}`
   - Result: `HTTP 400 Bad Request` (`InvalidQuantityType` / `NonIntegerQuantity`)
   - Cart Verification: Cart remains at 0 items (unchanged).

4. **Case 4: Exceeding Available Stock Inventory (`9999`)**
   - Payload: `{"productId": "prod_101", "quantity": 9999}` (Product stock is 15)
   - Result: `HTTP 422 Unprocessable Entity` (`InsufficientStock`)
   - Cart Verification: Cart remains at 0 items (unchanged).

5. **Positive Control: Valid Quantity (`2`)**
   - Payload: `{"productId": "prod_101", "quantity": 2}`
   - Result: `HTTP 200 OK`
   - Cart Verification: Cart successfully updates to 2 items ($399.98).

---

## 📬 Postman Collection & Saved Response Examples

The project includes an exported Postman Collection compliant with Schema v2.1.0:

- **Collection File:** `postman/cart-api-validation.postman_collection.json`
- **Environment File:** `postman/cart-api-validation.postman_environment.json`

### Key Features of the Collection:
- **Embedded Response Examples:** Every request in the collection contains pre-saved response examples with headers, HTTP status codes, and JSON bodies.
- **Automated Assertions:** Postman tests verify status codes, exact error types, and follow-up cart integrity queries.
- **Postman Runner Compatible:** You can run the entire collection in Postman's Collection Runner or via Newman.

### How to Import and Run in Postman:
1. Open **Postman**.
2. Click **Import** (top left).
3. Select `postman/cart-api-validation.postman_collection.json` and `postman/cart-api-validation.postman_environment.json`.
4. Select the **Local Commerce Environment** in the environment dropdown.
5. Click **Run Collection** to execute all verification steps.

---

## 📊 Summary of Findings

See [FINDINGS.md](file:///d:/mercur/oding/demo_ecom/FINDINGS.md) for the complete pass/fail decision matrix.

**Release Conclusion:** **GO / APPROVED**  
The cart API reliably halts all invalid quantity attempts and preserves session cart integrity.

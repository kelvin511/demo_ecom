# Mercor AI Training Trajectory: Step-by-Step Recording Guide

**Task Title:** Check whether a cart API rejects invalid quantities  
**Target Duration:** ~8–12 minutes  
**Apps Required (3 Apps):**
1. **Visual Studio Code** (Code inspection, project structure, findings documentation)
2. **Docker Desktop** (Container monitoring, health status, logs)
3. **Postman** (API testing, collection execution, response examples verification)

---

## 🎬 Pre-Recording Setup (Starting Materials State)

Before clicking **Record** on your screen capture software:
1. **Ensure Docker Desktop is open** with `demo-ecom-backend` running on port `5000:5000`.
2. **Open Visual Studio Code** with folder `D:\mercur\oding\demo_ecom`.
3. **Open Postman** with `cart-api-validation.postman_collection.json` and `cart-api-validation.postman_environment.json` ready on your desktop or imported.
4. **Ensure the Cart is empty / reset:**
   ```bash
   node -e "fetch('http://localhost:5000/api/cart/reset', { method: 'POST' })"
   ```

---

## 📽️ Recording Walkthrough & Screen Actions

### Act 1: Context & Starting Materials (VS Code & Docker Desktop) — ~2 mins
1. **In VS Code:**
   - Briefly show the project structure:
     - Point out `src/data/products.json` (mention synthetic catalog with limited stock items like `prod_101` with 15 units).
     - Open `src/routes/cart.js` and `src/services/cartService.js`: highlight the defensive validation logic checking for negative numbers, zero, non-numeric types, and stock overflow before modifying the cart.
   - Mention the storefront pre-release goal: *"Before our storefront release, we need to determine whether the cart endpoint reliably rejects invalid quantities without altering cart contents."*
2. **Switch to Docker Desktop (App 2):**
   - Bring Docker Desktop into view.
   - Show the running container `demo-ecom-backend` (port `5000:5000`).
   - Click on the container to display the live logs, showing `Commerce Backend running on http://localhost:5000` and health checks passing.

---

### Act 2: API Testing & Verification (Postman) — ~5 mins
3. **Switch to Postman (App 3):**
   - Show the imported collection: **Cart API - Invalid Quantity Rejection & Cart Integrity**.
   - Show the selected environment: **Local Commerce Environment** (`baseUrl = http://localhost:5000`).
   - **Step 1: Baseline Check**
     - Run `01. Pre-Check - Service Health Check` &rarr; observe `200 OK` (`healthy`).
     - Run `03. Setup - Reset Cart to Baseline State` &rarr; observe `200 OK` (`items: []`, `totalItems: 0`).
   - **Step 2: Case 1 — Negative Quantity**
     - Open `04. Case 1 - Reject Negative Quantity (-1)`.
     - Show request body: `{"productId": "prod_101", "quantity": -1}`.
     - Click **Send** &rarr; observe `400 Bad Request`, `error: "NegativeQuantity"`.
     - Click on **Examples** in Postman to show the saved response example.
     - Send `05. Verify Cart Unchanged after Case 1` &rarr; show cart still has `0` items.
   - **Step 3: Case 2 — Zero Quantity**
     - Open `06. Case 2 - Reject Zero Quantity (0)`.
     - Show request body: `{"productId": "prod_101", "quantity": 0}`.
     - Click **Send** &rarr; observe `400 Bad Request`, `error: "ZeroQuantity"`.
     - Send `07. Verify Cart Unchanged after Case 2` &rarr; show cart remains empty.
   - **Step 4: Case 3 — Non-Numeric / Invalid Type**
     - Open `08. Case 3 - Reject Non-Numeric or Invalid Type`.
     - Show body: `{"productId": "prod_101", "quantity": "invalid_qty_string"}`.
     - Click **Send** &rarr; observe `400 Bad Request`, `error: "InvalidQuantityType"`.
     - Send `09. Verify Cart Unchanged after Case 3` &rarr; show cart remains empty.
   - **Step 5: Case 4 — Exceeding Stock Limit**
     - Open `10. Case 4 - Reject Exceeding Stock Limit (9999)`.
     - Show body: `{"productId": "prod_101", "quantity": 9999}` (product stock is only 15).
     - Click **Send** &rarr; observe `422 Unprocessable Entity`, `error: "InsufficientStock"`.
     - Send `11. Verify Cart Unchanged after Case 4` &rarr; show cart remains empty.
   - **Step 6: Positive Control**
     - Open `12. Positive Control - Accept Valid Quantity (2)`.
     - Click **Send** &rarr; observe `200 OK`, cart now updates to 2 items ($399.98).
   - **Step 7: Postman Collection Runner**
     - Click on the collection name &rarr; Click **Run Collection**.
     - Execute the full collection &rarr; show all test assertions turn **GREEN (Passed)**.

---

### Act 3: Final Analysis & Release Decision (VS Code) — ~2 mins
4. **Switch back to VS Code (App 1):**
   - Open `FINDINGS.md`.
   - Walk through the **Findings Matrix**:
     - Case 1: Negative Qty &rarr; PASS (HTTP 400, Cart unchanged)
     - Case 2: Zero Qty &rarr; PASS (HTTP 400, Cart unchanged)
     - Case 3: Invalid Type &rarr; PASS (HTTP 400, Cart unchanged)
     - Case 4: Stock Overflow &rarr; PASS (HTTP 422, Cart unchanged)
   - State the final decision: *"The cart API reliably rejects all invalid quantities without altering cart state. The recommendation for the storefront release is GO / APPROVED."*
   - Stop recording.

---

## 📌 Form Answers Cheat Sheet (for Mercor Submission)

- **What are you trying to accomplish?**  
  *Before a storefront release, determine whether the cart endpoint (`POST /api/cart/items`) reliably rejects invalid quantities without altering cart contents or corrupting state.*
- **Who will use the result?**  
  *The storefront release team, QA engineers, and backend API developers.*
- **Starting materials:**  
  *Using existing material: A local commerce backend running in Docker Desktop with a synthetic product catalog and a resettable cart.*
- **Apps selected (3 apps):**  
  *Visual Studio Code, Docker Desktop, Postman.*
- **What will you actually create, analyze or decide?**  
  *Analyze whether the cart API endpoint reliably rejects 4 invalid quantity cases (negative, zero, non-numeric, inventory overflow) while preserving cart state integrity, and decide if the endpoint is safe for storefront release.*
- **How will you verify the result?**  
  *A saved Postman collection with response examples, automated test assertions, and a concise pass/fail finding report documenting the four quantity cases.*

# Mercor AI Training Trajectory: 25–30 Minute Master Recording Guide

**Task Title:** Check whether a cart API rejects invalid quantities  
**Target Duration:** 20 to 35 minutes (Recommended pace: ~26–30 minutes)  
**Apps Required (3 Apps):**
1. **Visual Studio Code** (Code inspection, project setup, Newman CLI execution, report authoring)
2. **Docker Desktop** (Container monitoring, port forwarding verification, live container logs)
3. **Postman** (API testing, environment management, individual case inspection, collection runner)

---

## ⏱️ Timeline & Stage Breakdown Overview

```
[00:00 - 05:00] Phase 1: Visual Studio Code — Starting Materials & Architecture Walkthrough
[05:00 - 09:00] Phase 2: Docker Desktop — Container Health, Port Mapping & Live Logging
[09:00 - 21:00] Phase 3: Postman — Interactive Testing of 4 Cases, Edge Scenarios & Collection Runner
[21:00 - 26:00] Phase 4: VS Code & Terminal — Newman CLI Automation & Cross-App Log Spike Verification
[26:00 - 30:00] Phase 5: Visual Studio Code — Findings Matrix Analysis & Storefront Go/No-Go Decision
```

---

## 🎬 Minute-by-Minute Recording Script & Action Plan

---

### Phase 1: Visual Studio Code — Starting Materials & Architecture Walkthrough (00:00 – 05:00)
* **Goal:** Establish context, explain starting materials, show the codebase, and introduce the problem statement.
* **App Active:** Visual Studio Code (`D:\mercur\oding\demo_ecom`)

1. **[00:00 - 01:30] Introduction & Objective:**
   - *Spoken:* "Hello, in this session we are conducting a pre-release verification for our storefront e-commerce platform. Specifically, our objective is to determine whether the cart endpoint reliably rejects invalid quantities without altering cart contents or corrupting customer session state."
   - *Screen Action:* Open `README.md` and scroll through the **Project Goal** and **Architecture** section.
2. **[01:30 - 03:00] Inspecting Synthetic Products & Business Constraints:**
   - *Spoken:* "Let's first inspect our starting materials. We have a local commerce backend seeded with synthetic products in `src/data/products.json`."
   - *Screen Action:* Open `src/data/products.json`. Point out product `prod_101` ("Wireless Noise-Canceling Headphones", Price: $199.99, Stock: 15).
   - *Spoken:* "Notice that `prod_101` has a finite inventory limit of 15 units. This will be critical when evaluating our fourth test case: stock overflow rejection."
3. **[03:00 - 05:00] Inspecting the Cart Service & Defensive Validation Logic:**
   - *Screen Action:* Open `src/routes/cart.js` and `src/services/cartService.js`.
   - *Spoken:* "Here in `cartService.js`, let's examine the `addItem` logic. Notice the order of defensive checks:
     1. It checks if the quantity is present and numeric.
     2. It asserts `Number.isInteger(quantity)` to reject floats.
     3. It checks for negative values (`quantity < 0`).
     4. It checks for zero (`quantity === 0`), enforcing that item removal must go through explicit DELETE operations.
     5. It validates product inventory against available stock.
     Crucially, if any check fails, it immediately returns an HTTP error code (400 or 422) without modifying the cart in-memory map."

---

### Phase 2: Docker Desktop — Container Health, Port Mapping & Live Logging (05:00 – 09:00)
* **Goal:** Demonstrate containerized deployment in Docker Desktop, verify container health, and inspect logging infrastructure.
* **App Active:** Docker Desktop (Switching from VS Code)

1. **[05:00 - 06:30] Verifying Container Lifecycle in Docker Desktop:**
   - *Screen Action:* Switch window to **Docker Desktop**. Navigate to the **Containers** view.
   - *Spoken:* "Our backend is running containerized via Docker Desktop. Here in the container list, we can see `demo-ecom-backend`."
   - *Screen Action:* Point out the container status (`Running`, `healthy`), uptime, and port mapping (`0.0.0.0:5000->5000/tcp`).
2. **[06:30 - 07:45] Inspecting Dockerfile & Healthcheck Strategy:**
   - *Screen Action:* Switch briefly to VS Code to display `Dockerfile` and `docker-compose.yml`, then back to Docker Desktop.
   - *Spoken:* "Notice our Dockerfile uses a lightweight Alpine Node.js base with a built-in healthcheck probing `http://localhost:5000/api/health` every 15 seconds. Docker Desktop reports this container as healthy."
3. **[07:45 - 09:00] Live Log Monitoring:**
   - *Screen Action:* In Docker Desktop, click on `demo-ecom-backend` to view the **Logs** tab.
   - *Spoken:* "We have live request logging active. Each incoming request logs the timestamp, method, URL, status code, and execution time in milliseconds. We will observe these logs update dynamically as we execute our test suite in Postman."

---

### Phase 3: Postman — Interactive Testing of 4 Cases & Edge Scenarios (09:00 – 21:00)
* **Goal:** Execute the core QA verification using Postman. Test every invalid quantity case, verify error payloads, inspect saved examples, and confirm cart state preservation.
* **App Active:** Postman

1. **[09:00 - 10:30] Environment Setup & Pre-Flight Checks:**
   - *Screen Action:* Switch window to **Postman**.
   - *Screen Action:* Select **Local Commerce Environment** in the top-right environment picker. Click the eye icon to show `baseUrl: http://localhost:5000` and `targetProductId: prod_101`.
   - *Screen Action:* Send `01. Pre-Check - Service Health Check`. Point out `200 OK` and status `healthy`.
   - *Screen Action:* Send `03. Setup - Reset Cart to Baseline State`. Point out `totalItems: 0` and `items: []`.
2. **[10:30 - 12:30] Case 1: Negative Quantity (`-1`):**
   - *Screen Action:* Open `04. Case 1 - Reject Negative Quantity (-1)`.
   - *Screen Action:* Point out request body: `{"productId": "prod_101", "quantity": -1}`. Click **Send**.
   - *Spoken:* "We receive an HTTP `400 Bad Request` with error code `NegativeQuantity`. Now, let's verify cart immutability."
   - *Screen Action:* Send `05. Verify Cart Unchanged after Case 1`. Point out `totalItems: 0`.
   - *Screen Action:* Click on **Examples** in Postman and show the saved response example (`400 Bad Request`).
3. **[12:30 - 14:30] Case 2: Zero Quantity (`0`):**
   - *Screen Action:* Open `06. Case 2 - Reject Zero Quantity (0)`.
   - *Screen Action:* Point out request body: `{"productId": "prod_101", "quantity": 0}`. Click **Send**.
   - *Spoken:* "The API returns HTTP `400 Bad Request` with error `ZeroQuantity`. Quantity must be at least 1. If a client intends to remove an item, it must invoke `DELETE /api/cart/items/:id`."
   - *Screen Action:* Send `07. Verify Cart Unchanged after Case 2`. Point out cart is still empty.
4. **[14:30 - 16:30] Case 3: Non-Numeric & Non-Integer Types (`"invalid_qty"`, `1.5`):**
   - *Screen Action:* Open `08. Case 3 - Reject Non-Numeric or Invalid Type`.
   - *Screen Action:* Point out body: `{"productId": "prod_101", "quantity": "invalid_qty_string"}`. Click **Send**.
   - *Spoken:* "The endpoint rejects the payload with HTTP `400 Bad Request` (`InvalidQuantityType`). The backend also rejects fractional numbers like 1.5, because physical goods cannot be purchased in fractional quantities."
   - *Screen Action:* Send `09. Verify Cart Unchanged after Case 3`. Confirm cart is empty.
5. **[16:30 - 18:30] Case 4: Stock Overflow Exceeding Inventory (`9999`):**
   - *Screen Action:* Open `10. Case 4 - Reject Exceeding Stock Limit (9999)`.
   - *Spoken:* "Recall from our synthetic catalog that `prod_101` has only 15 units in stock. Here we attempt to request 9999 units."
   - *Screen Action:* Click **Send**.
   - *Spoken:* "The backend responds with HTTP `422 Unprocessable Entity` and error `InsufficientStock`. Notice the detailed breakdown in the response body indicating `availableStock: 15` and `maximumAddable: 15`."
   - *Screen Action:* Send `11. Verify Cart Unchanged after Case 4`. Cart remains at 0 items.
6. **[18:30 - 20:00] Real-World Edge Scenarios: Populated Cart State Preservation:**
   - *Screen Action:* Send `12. Positive Control - Accept Valid Quantity (2)`.
   - *Spoken:* "Now we populate the cart with 2 units of headphones ($399.98). Now let's test what happens when an invalid request is made against a cart that already has items."
   - *Screen Action:* Send `13. Case 1B - Reject Negative Quantity on Populated Cart` (`quantity: -5`). Observe `400 Bad Request`.
   - *Screen Action:* Send `14. Verify Populated Cart Unchanged`. Point out the 2 existing items are intact!
   - *Screen Action:* Send `15. Case 4B - Reject Overflow on Existing Cart Quantity` (`quantity: 14`). Since 2 + 14 = 16 > 15, observe `422 Unprocessable Entity` (`maximumAddable: 13`).
   - *Screen Action:* Send `16. Verify Populated Cart Unchanged`.
7. **[20:00 - 21:00] Postman Collection Runner:**
   - *Screen Action:* Click on the Collection name &rarr; Click **Run Collection**.
   - *Screen Action:* Click **Run Cart API - Invalid Quantity Rejection & Cart Integrity**.
   - *Spoken:* "We see all 17 requests and 34 test assertions execute and pass with 100% success."

---

### Phase 4: VS Code & Terminal — Newman CLI Automation & Cross-App Verification (21:00 – 26:00)
* **Goal:** Bridge Postman and CI/CD automation using Newman CLI, and verify server-side logs in Docker Desktop.
* **Apps Active:** Visual Studio Code & Docker Desktop

1. **[21:00 - 23:00] Running Automated Test Suite via Newman in VS Code:**
   - *Screen Action:* Switch to **Visual Studio Code**. Open the integrated terminal.
   - *Screen Action:* Run:
     ```bash
     npm run test:newman
     ```
   - *Spoken:* "To demonstrate CI/CD repeatability, we can run the entire Postman collection headlessly using Newman CLI. Notice the formatted output displaying all 17 requests, execution timings, and 34 passing assertions."
2. **[23:00 - 24:30] Running the Native Node Test Runner:**
   - *Screen Action:* Run:
     ```bash
     npm test
     ```
   - *Spoken:* "We also maintain a zero-dependency automated test runner in `scripts/test-runner.js`. Running `npm test` validates all four quantity cases and logs pass/fail findings with cart state snapshots."
3. **[24:30 - 26:00] Cross-App Verification in Docker Desktop:**
   - *Screen Action:* Switch to **Docker Desktop** and view the **Logs** tab of `demo-ecom-backend`.
   - *Spoken:* "Switching back to Docker Desktop, we can observe the burst of incoming HTTP requests: the 400s, 422s, and 200s logged with sub-5 millisecond response times. This confirms the containerized backend responded reliably under test load."

---

### Phase 5: Visual Studio Code — Findings Matrix Analysis & Storefront Go/No-Go Decision (26:00 – 30:00)
* **Goal:** Synthesize the results, review the formal findings report, and deliver the final pre-release sign-off.
* **App Active:** Visual Studio Code

1. **[26:00 - 28:00] Reviewing the Findings Matrix:**
   - *Screen Action:* In VS Code, open `FINDINGS.md` and toggle **Markdown Preview** (`Ctrl+Shift+V` or click preview icon).
   - *Spoken:* "Now we synthesize our findings in `FINDINGS.md`. Let's walk through our Findings Matrix:
     - Case 1 (Negative Quantity): Rejected with 400 Bad Request, cart mutated: No.
     - Case 2 (Zero Quantity): Rejected with 400 Bad Request, cart mutated: No.
     - Case 3 (Invalid Type / Non-numeric): Rejected with 400 Bad Request, cart mutated: No.
     - Case 4 (Stock Overflow): Rejected with 422 Unprocessable Entity, cart mutated: No.
     - Populated Cart Edge Cases: Both negative adjustments and cumulative stock overflows were safely rejected with existing cart balances 100% intact."
2. **[28:00 - 30:00] Pre-Release Sign-Off & Conclusion:**
   - *Screen Action:* Scroll to **Section 4: Pre-Release Recommendation**.
   - *Spoken:* "Based on our comprehensive verification across Visual Studio Code, Docker Desktop, and Postman, the cart endpoint demonstrates strict boundary validation and state immutability. Our recommendation for the storefront release is **APPROVED / GO FOR RELEASE**."
   - *Screen Action:* Send final cleanup reset via terminal:
     ```bash
     npm run cart:reset
     ```
   - *Spoken:* "Our cart has been returned to baseline, test artifacts are saved, and the verification is complete. Thank you."
   - *End of Recording.*

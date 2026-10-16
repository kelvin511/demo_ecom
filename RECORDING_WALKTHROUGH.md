# Mercor AI Training Trajectory: 25–30 Minute Master Recording Guide

**Task Title:** Check whether a cart API rejects invalid quantities  
**Target Duration:** 20 to 35 minutes (Recommended pace: ~26–30 minutes)  
**Apps Selected:**
- **Primary 2-App Mode:** **Visual Studio Code** & **Docker Desktop** *(Full testing done via in-editor HTTP client & Newman CLI in VS Code)*
- **Optional 3-App Mode:** If you can add **Postman** as the 3rd app in Mercor form to fulfill the 3-app default.

---

## 🧭 Which Mode Should You Use?

### Mode A: 2-App Recording (VS Code + Docker Desktop Only)
*Use this if your Mercor form is locked with only `Visual Studio Code` and `Docker Desktop`.*
- **No external Postman app required.**
- Execute API requests directly in VS Code using **`tests/cart-validation.http`** (with clickable "Send Request" buttons) or the **VS Code Postman extension**.
- Run the Postman collection via the **Newman CLI** (`npm run test:newman`) directly in the VS Code terminal.
- The Postman collection file (`postman/cart-api-validation.postman_collection.json`) remains saved in the repo with all response examples.

### Mode B: 3-App Recording (VS Code + Docker Desktop + Postman)
*Use this if you can edit your Mercor form to add Postman as the 3rd app.*
- Open standalone Postman, import the collection, and run requests/collection runner visually in Postman.

---

## ⏱️ Timeline & Stage Breakdown (2-App Mode: VS Code + Docker Desktop)

```
[00:00 - 05:00] Phase 1: Visual Studio Code — Starting Materials & Architecture Walkthrough (5 mins)
[05:00 - 09:00] Phase 2: Docker Desktop — Container Health, Port Mapping & Live Logging (4 mins)
[09:00 - 20:00] Phase 3: Visual Studio Code — In-Editor HTTP Testing & Cart State Verification (11 mins)
[20:00 - 25:00] Phase 4: VS Code & Docker Desktop — Newman CLI Automation & Live Log Spikes (5 mins)
[25:00 - 30:00] Phase 5: Visual Studio Code — Findings Matrix Analysis & Storefront Go/No-Go Decision (5 mins)
```

---

## 🎬 Minute-by-Minute Recording Script (2-App Mode)

---

### Phase 1: Visual Studio Code — Starting Materials & Architecture Walkthrough (00:00 – 05:00)
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
   - *Spoken:* "We have live request logging active. Each incoming request logs the timestamp, method, URL, status code, and execution time in milliseconds. We will observe these logs update dynamically as we execute our test suite."

---

### Phase 3: Visual Studio Code — In-Editor HTTP Testing & Cart State Verification (09:00 – 20:00)
* **Goal:** Execute the core QA verification using in-editor HTTP requests right inside VS Code.
* **App Active:** Visual Studio Code

1. **[09:00 - 10:30] Opening `tests/cart-validation.http` & Pre-Flight Checks:**
   - *Screen Action:* In VS Code, open `tests/cart-validation.http`.
   - *Spoken:* "To test our cart endpoint directly in our development environment, we have configured `tests/cart-validation.http`. Let's run our pre-flight checks."
   - *Screen Action:* Click **Send Request** above `01. Pre-Check: Service Health Check`. Point out the split-screen response pane showing `HTTP/1.1 200 OK` and `"status": "healthy"`.
   - *Screen Action:* Click **Send Request** above `03. Setup: Reset Cart to Pristine Baseline`. Observe `totalItems: 0` and empty `items: []`.
2. **[10:30 - 12:30] Case 1: Negative Quantity (`-1`):**
   - *Screen Action:* Scroll to `CASE 1: REJECT NEGATIVE QUANTITY (-1)`. Point out body: `{"productId": "prod_101", "quantity": -1}`.
   - *Screen Action:* Click **Send Request**.
   - *Spoken:* "The server immediately rejects the request with HTTP `400 Bad Request` and error code `NegativeQuantity`. Now, let's verify cart state immutability."
   - *Screen Action:* Click **Send Request** above `05. Verify Cart Unchanged`. Observe that `items` is still empty and `totalItems: 0`.
3. **[12:30 - 14:30] Case 2: Zero Quantity (`0`):**
   - *Screen Action:* Scroll to `CASE 2: REJECT ZERO QUANTITY (0)`.
   - *Screen Action:* Click **Send Request**.
   - *Spoken:* "The response is HTTP `400 Bad Request` with error `ZeroQuantity`. The API enforces that quantity must be >= 1. To remove items, clients must invoke DELETE."
   - *Screen Action:* Click **Send Request** above `06. Verify Cart Unchanged`. Confirm cart remains empty.
4. **[14:30 - 16:30] Case 3: Non-Numeric & Fractional Types (`"invalid_qty"`, `1.5`):**
   - *Screen Action:* Scroll to `CASE 3: REJECT NON-NUMERIC & FRACTIONAL TYPES`.
   - *Screen Action:* Click **Send Request** for string payload. Observe `400 Bad Request` (`InvalidQuantityType`).
   - *Screen Action:* Click **Send Request** for fractional payload (`1.5`). Observe `400 Bad Request` (`NonIntegerQuantity`).
   - *Screen Action:* Click **Send Request** above `08. Verify Cart Unchanged`. Confirm cart remains empty.
5. **[16:30 - 18:30] Case 4: Stock Overflow Exceeding Available Inventory (`9999`):**
   - *Screen Action:* Scroll to `CASE 4: REJECT QUANTITY EXCEEDING AVAILABLE STOCK`.
   - *Spoken:* "Product `prod_101` has only 15 units available in stock. Here we submit `quantity: 9999`."
   - *Screen Action:* Click **Send Request**.
   - *Spoken:* "The server responds with HTTP `422 Unprocessable Entity` and error `InsufficientStock`. The response includes metadata indicating `availableStock: 15` and `maximumAddable: 15`."
   - *Screen Action:* Click **Send Request** above `09. Verify Cart Unchanged`. Confirm cart remains at 0 items.
6. **[18:30 - 20:00] Real-World Edge Scenarios: Populated Cart State Preservation:**
   - *Screen Action:* Scroll to `POSITIVE CONTROL: POPULATE CART WITH VALID QUANTITY (2)`.
   - *Screen Action:* Click **Send Request**. Observe `200 OK`, cart now has 2 items ($399.98).
   - *Screen Action:* Scroll to `CASE 1B: REJECT NEGATIVE QUANTITY ON POPULATED CART` (`quantity: -5`). Click **Send Request**. Observe `400 Bad Request`.
   - *Screen Action:* Click **Send Request** above `11. Verify Populated Cart Intact`. Point out that the 2 items and $399.98 total are preserved!
   - *Screen Action:* Scroll to `CASE 4B: REJECT STOCK OVERFLOW ON EXISTING QUANTITY` (`quantity: 14`). Click **Send Request**. Observe `422 Unprocessable Entity`.
   - *Screen Action:* Click **Send Request** above `12. Verify Populated Cart Intact`.

---

### Phase 4: VS Code Terminal & Docker Desktop — Newman CLI & Log Spikes (20:00 – 25:00)
* **Goal:** Run the saved Postman collection headlessly via Newman CLI in the terminal, and observe request logs in Docker Desktop.
* **Apps Active:** Visual Studio Code & Docker Desktop

1. **[20:00 - 22:30] Executing the Saved Postman Collection via Newman CLI:**
   - *Screen Action:* Open VS Code integrated terminal (`Ctrl+\``).
   - *Screen Action:* Run:
     ```bash
     npm run test:newman
     ```
   - *Spoken:* "Our verification deliverable includes a saved Postman collection. We can execute this exact collection headlessly in our terminal using Newman CLI. Notice all 17 requests execute in sequence, evaluating 34 assertions with 0 failures."
2. **[22:30 - 23:45] Running the Automated Native Test Runner:**
   - *Screen Action:* Run:
     ```bash
     npm test
     ```
   - *Spoken:* "We also execute our native runner in `scripts/test-runner.js`, which confirms all 17 test conditions pass and logs individual pass/fail records."
3. **[23:45 - 25:00] Cross-App Verification in Docker Desktop:**
   - *Screen Action:* Switch to **Docker Desktop** and view the **Logs** tab of `demo-ecom-backend`.
   - *Spoken:* "Switching back to Docker Desktop, we can observe the burst of incoming HTTP requests: the 400s, 422s, and 200s logged with sub-5 millisecond response times. This confirms the containerized backend handled the validation workload smoothly."

---

### Phase 5: Visual Studio Code — Findings Matrix Analysis & Storefront Decision (25:00 – 30:00)
* **Goal:** Synthesize the results, review the formal findings report, and deliver the final pre-release sign-off.
* **App Active:** Visual Studio Code

1. **[25:00 - 27:30] Reviewing the Findings Matrix in `FINDINGS.md`:**
   - *Screen Action:* Switch back to VS Code. Open `FINDINGS.md` and toggle **Markdown Preview** (`Ctrl+Shift+V`).
   - *Spoken:* "Now we synthesize our findings in `FINDINGS.md`. Let's walk through our Findings Matrix:
     - Case 1 (Negative Quantity): Rejected with 400 Bad Request, cart mutated: No.
     - Case 2 (Zero Quantity): Rejected with 400 Bad Request, cart mutated: No.
     - Case 3 (Invalid Type / Non-numeric): Rejected with 400 Bad Request, cart mutated: No.
     - Case 4 (Stock Overflow): Rejected with 422 Unprocessable Entity, cart mutated: No.
     - Populated Cart Edge Cases: Both negative adjustments and cumulative stock overflows were safely rejected with existing cart balances 100% intact."
2. **[27:30 - 30:00] Pre-Release Sign-Off & Conclusion:**
   - *Screen Action:* Scroll to **Section 4: Pre-Release Recommendation**.
   - *Spoken:* "Based on our comprehensive verification across Visual Studio Code and Docker Desktop, the cart endpoint demonstrates strict boundary validation and state immutability. Our recommendation for the storefront release is **APPROVED / GO FOR RELEASE**."
   - *Screen Action:* In the terminal, send the final cart reset:
     ```bash
     npm run cart:reset
     ```
   - *Spoken:* "Our cart has been returned to baseline, test artifacts are saved, and the verification is complete. Thank you."
   - *End of Recording.*

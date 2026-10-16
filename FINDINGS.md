# Storefront Pre-Release Verification: Cart API Quantity Rejection Report

**Date of Execution:** October 16, 2026  
**Audience:** Storefront Release Team, QA Engineering, Backend Engineering  
**Objective:** Verify that `POST /api/cart/items` reliably rejects invalid item quantities without mutating cart state or compromising data integrity.  
**Target Environment:** Local Commerce Backend (`demo-ecom-backend`) running in Docker Desktop on `http://localhost:5000`.

---

## 1. Executive Summary

| Metric | Result |
| :--- | :--- |
| **Release Decision** | 🟢 **PASS / GO FOR STOREFRONT RELEASE** |
| **Endpoint Under Test** | `POST /api/cart/items` |
| **Test Cases Evaluated** | 4 Invalid Quantity Scenarios + 1 Positive Control |
| **Cart Integrity Preserved** | 100% (Cart strictly unchanged across all invalid requests) |
| **Validation Mechanism** | Strict payload type checking, integer enforcement, boundary checking, inventory threshold matching |
| **Postman Collection** | `postman/cart-api-validation.postman_collection.json` (Includes saved response examples) |

---

## 2. Findings Matrix for Four Quantity Cases

The table below summarizes the four invalid quantity scenarios evaluated against the commerce backend cart endpoint:

| Case # | Scenario Description | Tested Payload | Expected HTTP Status | Actual HTTP Status | Error Code Returned | Cart Mutated? | Result |
| :---: | :--- | :--- | :---: | :---: | :--- | :---: | :---: |
| **1** | **Negative Quantity** | `{"productId": "prod_101", "quantity": -1}` | `400 Bad Request` | `400 Bad Request` | `NegativeQuantity` | **No** (0 items) | 🟢 **PASS** |
| **2** | **Zero Quantity** | `{"productId": "prod_101", "quantity": 0}` | `400 Bad Request` | `400 Bad Request` | `ZeroQuantity` | **No** (0 items) | 🟢 **PASS** |
| **3** | **Non-Numeric / Invalid Type** | `{"productId": "prod_101", "quantity": "invalid"}` & `1.5` | `400 Bad Request` | `400 Bad Request` | `InvalidQuantityType` / `NonIntegerQuantity` | **No** (0 items) | 🟢 **PASS** |
| **4** | **Exceeding Stock Inventory** | `{"productId": "prod_101", "quantity": 9999}` (Stock: 15) | `422 Unprocessable Entity` | `422 Unprocessable Entity` | `InsufficientStock` | **No** (0 items) | 🟢 **PASS** |
| *Ctrl* | *Positive Control (Valid Qty)* | `{"productId": "prod_101", "quantity": 2}` | `200 OK` | `200 OK` | `null` (Success) | *Yes* (2 items added) | 🟢 **PASS** |

---

## 3. Detailed Case Analysis

### Case 1: Negative Quantity Rejection
* **Input Payload:** `{"productId": "prod_101", "quantity": -1}`
* **Server Response:**
  ```json
  {
    "success": false,
    "error": "NegativeQuantity",
    "message": "Quantity cannot be negative. Received -1.",
    "received": {
      "productId": "prod_101",
      "quantity": -1
    }
  }
  ```
* **Cart State Verification:** `GET /api/cart` returned `totalItems: 0`, `items: []`. The negative quantity was completely rejected without decreasing or corrupting the cart state.
* **Finding:** **PASS**.

### Case 2: Zero Quantity Rejection
* **Input Payload:** `{"productId": "prod_101", "quantity": 0}`
* **Server Response:**
  ```json
  {
    "success": false,
    "error": "ZeroQuantity",
    "message": "Quantity must be at least 1. To remove an item from the cart, use DELETE /api/cart/items/:productId.",
    "received": {
      "productId": "prod_101",
      "quantity": 0
    }
  }
  ```
* **Cart State Verification:** `GET /api/cart` confirmed `totalItems: 0`. The backend correctly enforces that zero is not an item addition/update; item removal must be an explicit operation.
* **Finding:** **PASS**.

### Case 3: Non-Numeric and Fractional Types Rejection
* **Input Payload A (String):** `{"productId": "prod_101", "quantity": "invalid_qty"}`
  * Response: HTTP 400 Bad Request (`InvalidQuantityType`)
* **Input Payload B (Fractional Float):** `{"productId": "prod_101", "quantity": 1.5}`
  * Response: HTTP 400 Bad Request (`NonIntegerQuantity`)
* **Cart State Verification:** `GET /api/cart` confirmed `totalItems: 0`. Non-integer types and string payloads fail immediate schema parsing and validation.
* **Finding:** **PASS**.

### Case 4: Inventory Limit Exceeded
* **Product Under Test:** `prod_101` (Wireless Noise-Canceling Headphones, available inventory = 15 units)
* **Input Payload:** `{"productId": "prod_101", "quantity": 9999}`
* **Server Response:**
  ```json
  {
    "success": false,
    "error": "InsufficientStock",
    "message": "Requested quantity (9999) plus existing cart quantity (0) exceeds available inventory for \"Wireless Noise-Canceling Headphones\". Only 15 available.",
    "details": {
      "productId": "prod_101",
      "productName": "Wireless Noise-Canceling Headphones",
      "availableStock": 15,
      "currentCartQuantity": 0,
      "requestedAddition": 9999,
      "maximumAddable": 15
    }
  }
  ```
* **Cart State Verification:** `GET /api/cart` confirmed `totalItems: 0`. Cart state remained empty.
* **Finding:** **PASS**.

---

## 4. Pre-Release Recommendation

> **Recommendation: APPROVED FOR STOREFRONT RELEASE**  
> The cart endpoint (`POST /api/cart/items`) demonstrates strict defensive validation across all invalid numeric and type boundaries. Faulty storefront inputs or malicious payloads are halted at the boundary layer without corrupting session carts or degrading backend stability.

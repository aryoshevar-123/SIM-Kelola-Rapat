# Test Log: Authentication Module
**Date:** 25 June 2026
**Environment:** Localhost (Development)
**Database:** PostgreSQL
**Tools:** Postman

---

## Summary
| Cases | Passed | Failed | Percentage of Success |
| :---: | :---: | :---: | :---: |
| 9 | 9 | 0 | 100% |

---

## Test Case Execution Log

### 1. Feature: Account Registration (`POST /api/auth/register`)

#### **TC-01: Registration Success (Happy Path)**
* **Description:** Ensure new user successfully registered with encrypted password and get payload without password.
* **Payload Request:**
```json
{
    "name": "Budi Raharjo",
    "email": "budi.raharjo@company.com",
    "password": "PasswordSuper123"
}
```
* **Expected Result:** HTTP Status 201 Created, returning the newly created user object without the password field.
* **Actual Result:** As Expected. User saved to DB with encrypted password hash.
* **Status:** PASSED

#### **TC-02: Failed - Empty Input Validation (Negative Path)**
* **Description:** Ensures the registration is rejected if any mandatory field is missing or blank.

* **Request Body (JSON):** 
```json
{
    "name": "Budi", 
    "email": "budi@co.com", 
    "password": ""
}
```

* **Expected Result:** HTTP Status 400 Bad Request, message: "Name, email, and password are required"

* **Actual Result:** As Expected.

* **Status:** PASSED

#### TC-03: Failed - Invalid Email Format (Negative Path)
* **Description:** Validates that the email regex pattern rejects poorly structured email addresses.

* **Payload Request:** 
```json
{
    "name": "Andi", 
    "email": "andi_wrong_format", 
    "password": "123"
}
```

* **Expected Result:** HTTP Status 400 Bad Request, message: "Invalid email format"

* **Actual Result:** As Expected.

* **Status:** PASSED

#### **TC-04: Failed - Email Already Registered (Negative Path)**
* **Description:** Guarantees database data integrity by enforcing the UNIQUE email constraint.

* **Request Body (JSON):** Same payload as TC-01

* **Expected Result:** HTTP Status 400 Bad Request, message: "Email already registered"

* **Actual Result:** As Expected.

* **Status:** PASSED

### 2. Feature: User Login (`POST /api/auth/login`)

#### **TC-05: Successful Login & Cookie Injection (Happy Path)**
* **Description:** Verifies that a JWT token is generated and securely injected into an HTTP-Only Cookie upon correct credentials.

* **Request Body (JSON):** Using admin account.

```json
{
  "email": "admin12@gmail.com",
  "password": "admin123"
}
```
* **Expected Result:** HTTP Status 200 OK, token cookie appears in Postman’s Cookie storage, response returns user profile.

* **Actual Result:** As Expected. Cookie properties validated (Secure: False (Localhost), HTTP-Only: True, SameSite: Strict).

* **Status:** PASSED

#### **TC-06: Failed - Email Not Found (Negative Path)**
* **Request Body (JSON):** 
```json
{"email": "anonymous@co.com", "password": "123"}
```
* **Expected Result:** HTTP Status 400 Bad Request, message: "Invalid email or password"

* **Status:** PASSED

#### **TC-07: Failed - Incorrect Password (Negative Path)**
* **Request Body (JSON):**
```json
{"email": "admin12@gmail.com", "password": "WrongPassword"}
```
* **Expected Result:** HTTP Status 400 Bad Request, message: "Invalid email or password"

* **Status:** PASSED

#### **TC-08: Failed - Pending/Inactive Account (Negative Path)**
* **Description:** Tests if a user whose is_active flag is set to false in the database is blocked from logging in.
* **Request Body (JSON):** 
```json
{
    "email": "budi.raharjo@company.com", 
    "password": "PasswordSuper123"
}
```

* **Expected Result:** HTTP Status 403 Forbidden, message: "Your account is pending activation. Please contact the Admin."

* **Status:** PASSED

### 3. Feature: User Logout (`POST /api/auth/logout`)
#### **TC-09: Successful Logout & Cookie Clearing**
* **Description:** Ensures the token cookie is cleared from the client's storage without leaving conflicting maxAge headers hanging.

* **Expected Result:** HTTP Status 200 OK, token cookie becomes undefined or empty inside Postman.

* **Actual Result:** As Expected. Cookie was instantly discarded by the client.

* **Status:** PASSED

## Notes
* The implementation of object destructuring `{ maxAge, ...clearOptions }` on `res.clearCookie` successfully solved the sticky cookie issue previously encountered during local testing rounds.
* All automatic assertions script configured in the Postman Tests tab passed seamlessly without any asynchronous racing bugs.

# Test Log: User Module
**Date:** 25 June 2026
**Environment:** Localhost (Development)
**Database:** PostgreSQL
**Tools:** Postman

---

## Summary
| Cases | Passed | Failed | Percentage of Success |
| :---: | :---: | :---: | :---: |
| 15 | 14 | 1 | 93.33% |

---

## Test Case Execution Log

### 1. Feature: Get All Users (`GET /api/users/`) 

#### **TC-10: Successfully Get All Users (Happy Path)**

* **Expected Result:** HTTP Status 200 OK, returning all user data without password.

* **Actual Result:** As Expected.

* **Status:** PASSED

### 2. Feature: Get User Details (`GET /api/users/:id`)

#### **TC-11: Successfully Get User's Details (Happy Path)**

* **Expected Result:** HTTP Status 200 OK, returning specific user data without password.

* **Actual Result:** As Expected.

* **Status:** PASSED

#### **TC-12: Failed - User Not Found (Negative Path)**

* **Expected Result:** HTTP Status 404 Not Found, message: "User not found."

* **Actual Result:** As Expected.

* **Status:** PASSED

### 3. Feature: Create User By Admin (`POST /api/users/`)

#### **TC-13: Successfully Create New User (Happy Path)**

* **Description:** Creates new authenticated user via admin role without user registration.

* **Request Body:**
```json
{
  "name": "Aris Setiawan",
  "email": "aris.setiawan@company.com",
  "password": "PasswordAdminCreated123",
  "role": "operator",
  "division_id": 7 
}
```

* **Expected Result:** HTTP Status 201 User Created, returning new user data without password.

* **Actual Result:** As Expected.

* **Status:** PASSED

#### **TC-14: Failed - Unregistered Division (Negative Path)**

* **Description:** Ensures user created with registered division to prevent error during Get All User or Get User Details after user was created.

* **Request Body:**
```json
{
  "name": "Unregistered Division User",
  "email": "no.division@company.com",
  "password": "Password123",
  "role": "user",
  "division_id": 9999
}
```

* **Expected Result:** HTTP Status 400 Error in Foreign Key division, message: "Division does not exist."

* **Actual Result:** As Expected.

* **Status:** PASSED

#### **TC-15 : Failed - Empty Input Validation (Negative Path)**

* **Description:** Ensures the registration is rejected if any mandatory field is missing or blank.

* **Request Body:**
```json
{
  "name": "Invalid User",
  "email": "",
  "password": ""
}
```

* **Expected Result:** HTTP Status 400 Bad Request, message: "Name, email, and password are required"

* **Actual Result:** As Expected.

* **Status:** PASSED

#### **TC-16 : Failed - Invalid Email Format (Negative Path)**

* **Description:** Validates that the email regex pattern rejects poorly structured email addresses.

```json
{
  "name": "Invalid Email",
  "email": "Definitely_Not_Email",
  "password": "123456",
  "role": "user",
  "division_id": 7 
}
```

* **Expected Result:** HTTP Status 400 Bad Request, message: "Invalid email format"

* **Actual Result:** HTTP Status 201 created, successfully created user without error.

* **Mitigation Date:** 26 June 2026

* **New Result:** HTTP Status 400 Bad Request, message: "Invalid email format."

* **Status:** MITIGATED

#### **TC-17: Failed - Email Already Registered (Negative Path)**
* **Description:** Guarantees database data integrity by enforcing the UNIQUE email constraint.

* **Request Body (JSON):** Same payload as TC-13

* **Expected Result:** HTTP Status 400 Bad Request, message: "Email already registered"

* **Actual Result:** As Expected.

* **Status:** PASSED

### 4. Feature: Update User (`PUT /api/users/`)

#### **TC-18: Successfully Update User Data (Happy Path)**

* **Request Body:**
```json
{
  "name": "Aris Setiawan",
  "role": "operator",
  "division_id": 8,
  "is_active": true
}
```

* **Expected Result:** HTTP Status 200, returning correct updated data.

* **Actual Result:** As Expected.

* **Status:** PASSED

#### **TC-19: Failed - Unregistered User (Negative Path)**

* **Description:** Verifies that updating a user profile with a non-existent or unregistered User Id is blocked by the system.

* **Expected Result:** HTTP Status 404 Not Found, message: "User not found"

* **Actual Result:** As Expected. Server successfully intercepted the invalid ID and denied the operation.

* **Status:** PASSED

#### **TC-20: Failed - Empty Input Validation (Negative Path)**

* **Description:** Ensures update profile is rejected if any mandatory field is missing or blank.

* **Request Body:**
```json
{
  "name": "Invalid User",
  "role": "user"
}
```

* **Expected Result:** HTTP Status 400 Bad Request, "message":"Name, role, and activation status are required."

* **Actual Result:** As Expected. Server successfully denied the operation.

* **Status:** PASSED

#### **TC-21: Failed - Unregistered Division (Negative Path)**
* **Request Body:**
```json
{
  "name": "Unregistered Division User",
  "role": "user",
  "division_id": 9999,
  "is_active": true
}
```

* **Expected Result:** HTTP Status 400 Bad Request, message: "Division does not exist."

* **Actual Result:** As Expected.

* **Status:** PASSED

### 5. Feature: Delete User (`DELETE /api/users/:id`)

#### **TC-22: Successfully Deleted User From Database (Happy Path)**

* **Description:** Ensures user deleted successfully and no remaining data lingers in database.

* **Expected Result:** HTTP 200 OK, returning deleted user data and removing data from database.

* **Actual Result:** As Expected.

* **Status:** PASSED

#### **TC-23: Failed - User Still Active (Negative Path)**

* **Description:** Ensures user status must be inactive before user data is deleted.

* **Expected Result:** HTTP Status 400 Bad Request, message:"Cannot delete active user."

* **Actual Result:** As Expected.

* **Status:** PASSED

#### **TC-24: Failed - User Not Found (Negative Path)**

* **Description:** Verifies that deleting a user profile with a non-existent or unregistered User Id is blocked by the system.

* **Expected Result:** HTTP Status 404 Not Found, message: "User not Found."

* **Actual Result:** As Expected. Server successfully denied the operation.

* **Status:** PASSED

# Test Log: Authentication Module Vulnerability
**Date:** 26 June 2026
**Environment:** Localhost (Development)
**Database:** PostgreSQL
**Tools:** Postman

---

## Summary
| Cases | Passed | Failed | Percentage of Success |
| :---: | :---: | :---: | :---: |
| 5 | 3 | 2 | 60% |

---

## Test Case Execution Log

### 1. Feature: Authentication Validation

#### **TC-25: Failed - Password Type Pollution (Server Crash Test)**
* **Description:** Verifies if the server can gracefully handle non-string types (e.g., Objects/Arrays) injected into the password field without crashing the Node.js runtime.
* **Request Body (JSON):**
  ```json
  {
    "name": "Crash Test",
    "email": "crash.test@company.com",
    "password": { "$id": 1, "attack": "object_injection" }
  }
  ```
* **Expected Result:** HTTP Status 400 Bad Request or 500 Internal Server Error with a clean JSON response (Server MUST NOT crash).

* **Actual Result:** HTTP Status 500 Internal Server Error with a clean JSON response and server does not crash.

* **Status:** PASSED

#### **TC-26: Failed - Priviledge Escalation via Role Injection**

* **Description:** Ensures an unauthenticated user cannot register themselves directly with an 'admin' or 'operator' role via public registration endpoint.

* **Request Body (JSON):**
```json
{
  "name": "Attacker",
  "email": "attacker@company.com",
  "password": "Password123",
  "role": "admin"
}
```
* **Expected Result:** The system should either reject the request or force-override the role to 'user', ignoring the injected payload.

* **Actual Result:** User registered successfully.

* **Status:** FAILED

#### **TC-27: Failed - Space Character Exploit During Login (Bypass Email Sanitization)**
* **Description:** Login using email with unexpected space at the end (Non-breaking space or character with unrecognized unicode).

* **Request Body:**
```json
{
  "email": "budi.raharjo@company.com ", 
  "password": "PasswordSuper123"
}
```
* **Expected Result:** The system should reject the request.

* **Actual Result:** HTTP Status 201 OK, user successfully login.

* **Status:** FAILED

#### **TC-28: Failed - Malformed Cookie Injection (Tamper Test)**

* **Description:** Verifies that the authentication middleware handles corrupted or altered cookie token strings gracefully without breaking the server process.
* **Headers applied:** `Cookie: token=illegal_characters_and_broken_jwt_signature_$$$`
* **Expected Result:** HTTP Status `401 Unauthorized`, message: `"Not authorized, token failed"`. Node.js process remains stable.
* **Status:** PASSED

#### **TC-29: Success - Automated Replay Logout Bombardment (Denial of Service Test)**
* **Description:** Simulates a heavy replay attack by triggering 50 consecutive logout requests using Postman Runner to check for memory leaks or unhandled transaction drops.
* **Expected Result:** All subsequent iterations handle the empty cookie deletion safely without hanging the event loop.
* **Status:** PASSED

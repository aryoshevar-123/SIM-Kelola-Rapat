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
    "password": "PasswordSuper123",
    "role": "user",
    "division_id": 1
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
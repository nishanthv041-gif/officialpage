# Security Specification (`security_spec.md`)

## 1. Data Invariants

1. **Default-Deny Catch-All**: No unlisted collection or document may be read or written (`match /{document=**} { allow read, write: if false; }`).
2. **Path Variable Hardening**: Every single-document ID (`configId`, `itemId`, `admissionId`, `messageId`, `adminUid`) must match `^[a-zA-Z0-9_\-]+$` and be `<= 128` characters.
3. **Admin Verification**: Admin privileges (`isAdmin()`) require `request.auth != null`, `request.auth.token.email_verified == true`, and either existence of `/admins/$(request.auth.uid)` or matching the bootstrapped runtime owner email (`nishanthv041@gmail.com`).
4. **PII Isolation (`admissions` & `contact_messages`)**:
   - `admissions` contains student and parent PII (`phone`, `email`, `address`, `dob`). Neither `get` nor `list` is allowed to the general public or arbitrary signed-in users. Only `resource.data.applicantUid == request.auth.uid` or `isAdmin()` may read/list.
   - `contact_messages` contains sender PII (`name`, `email`, `phone`). Only `resource.data.senderUid == request.auth.uid` or `isAdmin()` may read/list.
5. **Strict Key & Size Bounds**: Every create and update validates `isValid[Entity](incoming())` first, checking exact keys (`hasAll` + `hasOnly`), string length bounds, enum sets, and server timestamps (`request.time`).
6. **Terminal State & Action-Based Updates**:
   - `admissions`: Initial status on `create` must be `'pending'`. Only `isAdmin()` can transition status to `'accepted'` or `'rejected'`. Once terminal (`'accepted'` or `'rejected'`), non-admins cannot modify the document, and even admin status transitions must use action-based `affectedKeys().hasOnly(['status', 'updatedAt'])`.

## 2. The "Dirty Dozen" Adversarial Payloads

1. **Shadow Field Injection on Admission (`isVerified: true`)**:
   `{ "applicationId": "SRT-2026-1001", "applicantUid": "u1", ..., "isVerified": true }` -> Rejected by `hasOnly()`.
2. **Identity Spoofing on Admission Creation**:
   `applicantUid: "other_user_uid"` when `request.auth.uid == "attacker_uid"` -> Rejected by `data.applicantUid == request.auth.uid`.
3. **Self-Approved Admission (`status: "accepted"` on Create)**:
   Applicant sets `status: "accepted"` during `create` -> Rejected by `incoming().status == 'pending'`.
4. **Unverified Email Admin Spoof**:
   Attacker signs in with unverified `nishanthv041@gmail.com` (`email_verified: false`) -> Rejected by `request.auth.token.email_verified == true`.
5. **1.5KB Document ID Poisoning**:
   Path `/admissions/<1500_char_string>` -> Rejected by `isValidId(admissionId)`.
6. **Value Poisoning on Admission Status Update**:
   Admin updates `status` to `"hacked_status"` or 1MB string -> Rejected by `isValidAdmissionApplication(incoming())`.
7. **PII Blanket Scrape on `/admissions`**:
   Authenticated user queries `collection(db, 'admissions')` without `where('applicantUid', '==', uid)` -> Rejected by `allow list: if isSignedIn() && (resource.data.applicantUid == request.auth.uid || isAdmin())`.
8. **Immutable Field Mutation (`createdAt` or `applicantUid` changed on update)**:
   Update attempts to alter `createdAt` or `applicantUid` -> Rejected by `incoming().createdAt == existing().createdAt && incoming().applicantUid == existing().applicantUid`.
9. **Client Timestamp Forgery**:
   Payload supplies past/future `createdAt` instead of `serverTimestamp()` (`request.time`) -> Rejected by `incoming().createdAt == request.time`.
10. **Public Site Config Defacement**:
    Non-admin authenticated user attempts `update` on `/site_config/main` -> Rejected by `isAdmin()`.
11. **Contact Message Phone Overflow**:
    Payload sends 50,000-character `message` or `phone` string -> Rejected by `.size() <= 2000` and `.size() <= 20`.
12. **Self-Assigned Admin Privilege Escalation**:
    Regular user attempts `setDoc(doc(db, 'admins', uid), { role: 'super_admin' })` -> Rejected by `isBootstrappedSuperAdmin()`.

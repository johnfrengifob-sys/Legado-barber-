# Security Specification: Legado Barber Club

## 1. Data Invariants
- Admin email (`legadobarber2026@gmail.com`) or authenticated admin roles manage system-wide settings, sales, expenses, and inventory.
- Public client access allows:
  - Reading active barbers and services to book appointments.
  - Creating new appointments with valid client phone and name (booking state initialized to 'pendiente').
  - Validating attendance (reading/creating/updating client loyalty profile by phone/id) with ratings within 1 to 10 and max string bounds.
- Barbers panel (PIN 2346 / Auth) can read assigned appointments and mark service status.
- Admin panel (PIN 3546 / Google Auth `legadobarber2026@gmail.com`) can read and write all collections (barbers, clients, appointments, sales, expenses, inventory, promotions).
- String and collection boundaries:
  - All document IDs must be validated (`isValidId`).
  - Strict key checks and length limits on inputs prevent denial of wallet attacks.

## 2. The "Dirty Dozen" Payloads (Must Return PERMISSION_DENIED)
1. **Unauthenticated Sale Injection**: Attacker tries to create a fake sale with 0 commission.
2. **Expense Alteration**: Non-admin attempts to modify expense records.
3. **Ghost Fields in Client Record**: Attacker injects `isAdmin: true` into a client registration.
4. **Junk ID Poisoning**: Attacker sends a 5KB path variable document ID.
5. **Rating Out of Bounds**: Attacker submits a rating of `99` on a 1-10 scale.
6. **Appointment Overwrite**: Unauthenticated user deletes an existing client appointment.
7. **Negative Inventory Attack**: Attacker writes negative stock value to bypass inventory checks.
8. **Negative Total in Sales**: Attacker injects a sale with `total: -50000`.
9. **Fake Email Admin Claim**: Client tries to claim admin role without verified email token.
10. **Arbitrary Collection Write**: Attacker attempts to write into `/unknown_collection`.
11. **Barber Deletion by Public**: Attacker tries to delete a barber profile without admin rights.
12. **Promotion Spam**: Unauthenticated user injects a mass broadcast message.

## 3. Test Runner Definition
Unit tests asserting that each Dirty Dozen payload is rejected by Firestore security rules.

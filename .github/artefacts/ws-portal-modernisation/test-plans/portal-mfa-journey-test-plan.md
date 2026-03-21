## Test Plan: Add MFA step to portal login journey

**Story reference:** [portal-mfa-journey.md](../stories/portal-mfa-journey.md)
**Epic reference:** auth-hardening
**Test plan author:** Copilot
**Date:** 2026-03-21

---

## AC Coverage

| AC | Description | Unit | Integration | E2E | Manual | Gap type | Risk |
|----|-------------|------|-------------|-----|--------|----------|------|
| AC1 | OTP issued and screen advances after valid credentials | 2 tests | 1 test | — | — | — | 🟢 |
| AC2 | Correct OTP within expiry creates session | 2 tests | 1 test | — | — | — | 🟢 |
| AC3 | Incorrect OTP increments counter; lockout at 3 | 3 tests | 1 test | — | — | — | 🟢 |
| AC4 | OTP expires after 5 minutes | 1 test | — | — | — | — | 🟢 |
| AC5 | Resend invalidates previous code, resets timer | 2 tests | 1 test | — | — | — | 🟢 |

---

## Coverage gaps

| Gap | AC | Gap type | Reason | Handling |
|-----|----|----------|--------|---------|
| None | — | — | — | — |

---

## Test Data Strategy

- OTP generation seeded via injectable clock and CSPRNG stub in unit tests
- Integration tests use test notification service stub that captures issued codes
- Lockout state reset between tests via test-only API endpoint

---

## Unit Tests

### AC1 — OTP issued on valid credentials

**T-AC1-1** `authService.verifyCredentials` returns `{ status: 'mfa_required', otpToken }` when credentials are valid
**T-AC1-2** `otpService.issue` calls notification service with correct customer mobile number

### AC2 — Session created on correct OTP

**T-AC2-1** `otpService.verify` returns `true` for matching unexpired code
**T-AC2-2** `sessionService.create` is called exactly once after successful OTP verification

### AC3 — Incorrect OTP handling + lockout

**T-AC3-1** `otpService.verify` returns `false` for non-matching code
**T-AC3-2** Attempt counter increments on each failed verification
**T-AC3-3** Account lock triggered and `AccountLockedException` thrown at attempt count === 3

### AC4 — OTP expiry

**T-AC4-1** `otpService.verify` returns `expired` when current time > issuedAt + 5 minutes (using injected clock)

### AC5 — Resend flow

**T-AC5-1** `otpService.resend` marks previous OTP as invalidated before issuing new one
**T-AC5-2** `otpService.verify` returns `invalid` for old code after resend

---

## Integration Tests

**IT-1** Full credential → OTP issue → correct OTP → session created (happy path)
**IT-2** Credential → OTP issue → 3 wrong codes → lockout response returned
**IT-3** Credential → OTP issue → resend → old code rejected, new code accepted

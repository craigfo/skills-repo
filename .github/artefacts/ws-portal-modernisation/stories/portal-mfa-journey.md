## Story: Add MFA step to portal login journey

**Epic reference:** [ws-portal-modernisation/epics/auth-hardening.md](../epics/auth-hardening.md)
**Discovery reference:** [discovery.md](../discovery.md)
**Benefit-metric reference:** [benefit-metric.md](../benefit-metric.md)

## User Story

As a **portal customer**,
I want to **verify my identity with a one-time code after entering my password**,
So that **my account is protected even if my password is compromised**.

## Benefit Linkage

**Metric moved:** Account takeover rate (Tier 1 — Security)
**How:** Completing this story adds a second authentication factor, reducing successful credential-stuffing attacks which are the primary driver of account takeover incidents.

## Architecture Constraints

- ADR-011: MFA codes must be delivered via the existing notification service — no direct SMS gateway integration from this layer.
- Guardrail: session tokens must be issued only after MFA step completes — partial auth state must not be stored in the session cookie.
- Pattern library: use `<OtpInput>` component from the design system, not a raw `<input>` element.

## Dependencies

- **Upstream:** Notification service team must have deployed OTP endpoint to staging before coding starts.
- **Downstream:** Story `portal-mfa-bypass-admin` depends on this story's auth flow being DoD-complete.

## Acceptance Criteria

**AC1:** Given a customer has entered a valid username and password, When the credentials are verified, Then a 6-digit OTP is sent to their registered mobile number and the login page advances to the OTP entry screen.

**AC2:** Given the OTP entry screen is displayed, When the customer enters the correct 6-digit code within 5 minutes, Then the session is created and the customer is redirected to the portal dashboard.

**AC3:** Given the OTP entry screen is displayed, When the customer enters an incorrect code, Then an error message is shown and the attempt is counted; after 3 failed attempts the account is temporarily locked and the customer is redirected to the account recovery flow.

**AC4:** Given the OTP entry screen is displayed, When 5 minutes have elapsed since the OTP was issued, Then the OTP is expired, the code entry is disabled, and a "Resend code" button is shown.

**AC5:** Given a customer requests a new OTP via the "Resend code" button, When the request is made, Then a new code is issued, the expiry timer resets, and the previous code is invalidated.

<!-- Add more ACs as needed. There is no maximum. -->

## Out of Scope

- Authenticator app (TOTP) integration — separate story `portal-mfa-totp`.
- Email OTP fallback — deferred to Release 2.
- MFA for API/service accounts — separate workstream.

## NFRs

- **Performance:** OTP delivery must occur within 10 seconds of login credential verification in 99th percentile.
- **Security:** OTP codes must be single-use, minimum 6 digits, cryptographically random. Attempt counter must be server-side only.
- **Accessibility:** OTP entry screen must meet WCAG 2.1 AA; autocomplete="one-time-code" must be set on the input.
- **Audit:** All MFA events (code issued, code used, code expired, lockout triggered) must be logged with customer ID, timestamp, and IP address.

## Complexity Rating

**Rating:** 2
**Scope stability:** Stable

## Definition of Ready Pre-check

- [x] ACs are testable without ambiguity
- [x] Out of scope is declared (not "N/A")
- [x] Benefit linkage is written (not a technical dependency description)
- [x] Complexity rated
- [x] No dependency on an incomplete upstream story
- [x] NFRs identified (or explicitly "None")
- [ ] Human oversight level confirmed from parent epic

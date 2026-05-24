# SecureGate

SecureGate is a secure authentication system built with Next.js 14, Prisma, PostgreSQL, and NextAuth/Auth.js.  
The project focuses heavily on defensive programming, authentication security, and production-minded engineering practices.

## Live Demo

https://securegate-os6z.vercel.app/

## GitHub Repository

https://github.com/MrUD1234/Securegate

---

# Features

- User Registration
- Secure Login & Logout
- Email Verification
- Forgot Password Flow
- Password Reset Flow
- Protected Dashboard Routes
- Rate Limiting & Account Lockouts
- Password Hashing with bcrypt
- Session Protection
- Email Normalization
- Security Headers (HSTS, X-Frame-Options, etc.)
- Token Validation & Expiry Checks

---

# Tech Stack

- Next.js 14
- React 18
- Prisma ORM
- PostgreSQL (Neon)
- NextAuth/Auth.js v5
- Zod Validation
- Upstash Redis
- Nodemailer API
- TypeScript

---

# Security Measures

The project was built with secure-by-default principles and defensive programming in mind.

Implemented security protections include:

- bcrypt password hashing
- Generic authentication error messages
- Session invalidation after password changes
- Rate limiting and account lockouts
- Protected route middleware
- Email verification enforcement
- Token validation and expiration checks
- HTTP security headers
- Environment variable protection
- Timing attack mitigation

---

# Engineering Principles Applied

## Gall’s Law

The system was intentionally built incrementally:
1. Basic authentication flow
2. Session handling
3. Email verification
4. Password reset
5. Security hardening
6. Rate limiting
7. Production audit & fixes

This helped reduce complexity and improve stability.

## Murphy’s Law

The system was designed assuming failures and attacks would happen:
- invalid tokens
- repeated login attempts
- malformed input
- expired sessions
- unverified users
- brute-force attacks

Defensive checks and fail-safe handling were implemented throughout the application.

---

# Local Setup

## Clone Repository

```bash
git clone <repo-url>
cd securegate
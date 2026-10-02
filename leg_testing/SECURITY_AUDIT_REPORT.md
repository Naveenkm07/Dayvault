# Dayvault Security & Quality Assurance Audit Report

**Project:** Dayvault - Personal Daily Journal & Planner  
**Audit Date:** 2026-10-02  
**Auditor:** Static Code Analysis  
**Scope:** Full codebase security audit, quality assurance review, and architectural assessment  
**Methodology:** Static analysis, code review, architecture evaluation, threat modeling

---

## Executive Summary

| Metric | Count |
|--------|-------|
| **Critical Vulnerabilities** | 2 |
| **High Severity** | 5 |
| **Medium Severity** | 8 |
| **Low Severity** | 12 |
| **Informational** | 6 |
| **Total Findings** | 33 |

**Overall Risk Rating:** **MEDIUM-HIGH** - Several critical authentication bypass risks and data exposure vulnerabilities require immediate attention.

---

## 1. Critical Vulnerabilities

### CRIT-001: Incomplete RLS Policies on Tags Tables
**Severity:** Critical  
**Location:** `supabase/migrations/20240101000000_init.sql` (lines 47-59, 66-67)  
**CWE:** CWE-639: Authorization Bypass Through User-Controlled Key  

**Description:** The `tags` and `entry_tags` tables have Row Level Security enabled but **no policies defined**. Any authenticated user can read, insert, update, or delete ALL tags and tag associations across all users.

**Reproduction Steps:**
1. Create two user accounts (User A, User B)
2. Login as User A, create tags
3. Login as User B, query `SELECT * FROM tags` - returns User A's tags
4. User B can DELETE User A's tags and entry_tags associations

**Root Cause:** Migration enables RLS (`ALTER TABLE tags ENABLE ROW LEVEL SECURITY;`) but omits `CREATE POLICY` statements for these tables.

**Remediation:**
```sql
-- Add to migration
CREATE POLICY "Users can manage their own tags" ON tags 
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own entry_tags" ON entry_tags 
  FOR ALL USING (
    auth.uid() = (SELECT user_id FROM tags WHERE id = entry_tags.tag_id)
  );
```

---

### CRIT-002: Client-Side Photo Deletion Without Server Verification
**Severity:** Critical  
**Location:** `components/journal/image-upload.tsx` (lines 59-61)  
**CWE:** CWE-639: Authorization Bypass Through User-Controlled Key  

**Description:** Photo removal only filters the local array; no server-side deletion occurs. If a user manipulates the form data, they can retain photos they "deleted" or remove photos from other entries by manipulating storage paths.

**Reproduction Steps:**
1. Create journal entry with photos
2. Click remove on a photo (only updates local state)
3. Submit form - photo remains in database and storage
4. Malicious user could inject arbitrary storage paths to delete others' photos

**Root Cause:** `onRemove` function only calls `onChange` with filtered array; no Server Action invoked to delete from DB and storage.

**Remediation:** Create Server Action for photo deletion that verifies ownership before deleting from both database and Supabase Storage.

---

## 2. High Severity Vulnerabilities

### HIGH-001: No Rate Limiting on Authentication Endpoints
**Severity:** High  
**Location:** `app/(auth)/actions.ts` (login, signup, logout)  
**CWE:** CWE-307: Improper Restriction of Excessive Authentication Attempts  

**Description:** Login, signup, and password reset endpoints have no rate limiting. Attackers can brute-force credentials or enumerate valid emails.

**Reproduction Steps:**
1. Send 100+ rapid POST requests to `/login` with invalid credentials
2. Observe all requests processed without delay or blocking
3. Same for `/signup` and `/forgot-password`

**Remediation:** Implement rate limiting (e.g., 5 attempts per 15 minutes per IP/email) using in-memory store or Redis.

---

### HIGH-002: Public Photo URLs via `getPublicUrl()`
**Severity:** High  
**Location:** `components/journal/image-upload.tsx` (lines 42-44) - **FIXED in recent commits but verify deployed version**  
**CWE:** CWE-200: Exposure of Sensitive Information to an Unauthorized Actor  

**Description:** Photos uploaded via `getPublicUrl()` are accessible via predictable public URLs without authentication. Storage bucket policies allow public read.

**Reproduction Steps:**
1. Upload photo as User A
2. Copy photo URL from network tab
3. Open in incognito/unauthenticated browser - photo loads
4. URL format: `https://<project>.supabase.co/storage/v1/object/public/journal_photos/<user_id>/<filename>`

**Remediation:** ✅ Fixed - now uses signed URLs with 1-week expiry. Verify deployed version matches.

---

### HIGH-003: Photo Storage Path Not Stored on Insert
**Severity:** High  
**Location:** `app/actions/journal.ts` (lines 37-44, 83-93) - **PARTIALLY FIXED**  
**CWE:** CWE-799: Improper Control of Interaction Frequency  

**Description:** `createJournalEntry` and `updateJournalEntry` insert photos without `storage_path` (required by schema) and without `user_id`. This violates NOT NULL constraints and RLS policies.

**Reproduction Steps:**
1. Create journal entry with photos
2. Check `photos` table - `storage_path` is NULL or wrong value
3. RLS policy on `photos` requires `auth.uid() = user_id` but `user_id` not set

**Remediation:** ✅ Fixed in recent commits - now extracts storage path from URL and includes user_id. Verify deployed version.

---

### HIGH-004: Missing CSRF Protection on State-Changing Operations
**Severity:** High  
**Location:** All Server Actions (`app/actions/*.ts`, `app/(auth)/actions.ts`)  
**CWE:** CWE-352: Cross-Site Request Forgery  

**Description:** No CSRF tokens on forms or Server Actions. Authenticated users vulnerable to CSRF attacks on journal creation, plan updates, profile changes, logout.

**Reproduction Steps:**
1. Create malicious page with form targeting `/api/actions/createJournalEntry`
2. Trick authenticated user to visit page
3. Form auto-submits, creates entry without user consent

**Remediation:** Next.js Server Actions have built-in CSRF protection via `__Host-` prefixed cookies, but verify `sameSite: 'lax'` cookie configuration.

---

### HIGH-005: Insecure Password Reset Token Handling
**Severity:** High  
**Location:** `app/(auth)/forgot-password/page.tsx` (lines 20-22)  
**CWE:** CWE-640: Weak Password Recovery Mechanism for Forgotten Password  

**Description:** Password reset uses `resetPasswordForEmail` with redirect to `/auth/callback?next=/settings`. No validation of `next` parameter - open redirect risk.

**Reproduction Steps:**
1. Request password reset for valid email
2. Intercept reset email link
3. Modify `next` parameter to external domain
4. User clicks link, gets redirected to attacker-controlled site

**Remediation:** Validate `next` parameter against allowlist of internal paths only.

---

## 3. Medium Severity Vulnerabilities

### MED-001: No Input Sanitization on Journal/Plan Content
**Severity:** Medium  
**Location:** `lib/validators/journal.ts`, `lib/validators/plan.ts`  
**CWE:** CWE-79: Improper Neutralization of Input During Web Page Generation  

**Description:** Zod validates length but doesn't sanitize HTML/JS content. If content rendered without escaping, XSS possible.

**Current State:** Content rendered in `<p className="whitespace-pre-wrap">{entry.description}</p>` - React auto-escapes, but `dangerouslySetInnerHTML` not used. Risk low but present if rendering changes.

**Remediation:** Add DOMPurify sanitization or ensure all rendering uses React's auto-escaping.

---

### MED-002: Unbounded Data Export (DoS Risk)
**Severity:** Medium  
**Location:** `app/api/export/route.ts` (lines 13-17)  
**CWE:** CWE-400: Uncontrolled Resource Consumption  

**Description:** Export fetches ALL user data without pagination or limits. Large accounts cause memory exhaustion and timeout.

**Reproduction Steps:**
1. Create account with 100,000+ entries
2. Call `/api/export`
3. Server memory spikes, request times out

**Remediation:** ✅ Partially fixed - added pagination (1000/page). Verify implementation handles streaming for large exports.

---

### MED-003: Calendar/Timeline Load All Records (Performance)
**Severity:** Medium  
**Location:** `app/(dashboard)/calendar/page.tsx` (lines 14-17), `app/(dashboard)/timeline/page.tsx` (lines 13-20)  
**CWE:** CWE-400: Uncontrolled Resource Consumption  

**Description:** Calendar fetches ALL entries and plans for user. Timeline loads ALL entries. No pagination or virtualization.

**Impact:** Page load time grows O(n) with data size. 10,000 entries = ~500KB JSON, slow render.

**Remediation:** ✅ Calendar now paginated by month. Timeline paginated (50/page). Verify deployed version.

---

### MED-004: Search Uses `ilike` Without Indexes (Performance)
**Severity:** Medium  
**Location:** `app/api/search/route.ts` (lines 24, 32)  
**CWE:** CWE-400: Uncontrolled Resource Consumption  

**Description:** Full-text search uses PostgreSQL `ilike` with leading wildcards (`%query%`), preventing index usage. Slow on large datasets.

**Remediation:** ✅ Added GIN indexes with `to_tsvector` in migration. Verify deployed version uses full-text search.

---

### MED-005: No Content Security Policy (CSP)
**Severity:** Medium  
**Location:** `next.config.ts`, middleware  
**CWE:** CWE-693: Protection Mechanism Failure  

**Description:** No CSP headers configured. Increases XSS impact if injection occurs.

**Remediation:** Add CSP via `next.config.ts` headers or middleware.

---

### MED-006: Missing Security Headers
**Severity:** Medium  
**Location:** `next.config.ts`  
**CWE:** CWE-693: Protection Mechanism Failure  

**Description:** Missing: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security`.

**Remediation:** Add security headers in `next.config.ts`.

---

### MED-007: Debug Information in Production Build
**Severity:** Medium  
**Location:** `next.config.ts` - previously had `ignoreBuildErrors: true`  
**CWE:** CWE-497: Exposure of System Data to an Unauthorized Control Sphere  

**Description:** Previously masked TypeScript errors could hide security issues. Now fixed but verify no console.log in production.

**Remediation:** ✅ Fixed - `ignoreBuildErrors` removed. Run `npm run build` to verify.

---

### MED-008: Accent Color CSS Injection Risk
**Severity:** Medium  
**Location:** `components/settings/settings-client.tsx` (lines 160-162)  
**CWE:** CWE-79: Improper Neutralization of Input During Web Page Generation  

**Description:** User-controlled `accent_color` used in `style={{ backgroundColor: color.primary }}` and `document.documentElement.style.setProperty`. If color values not validated, CSS injection possible.

**Current State:** Colors from hardcoded `ACCENT_COLORS` array - safe. Risk if user input allowed.

**Remediation:** Keep color selection restricted to predefined palette.

---

## 4. Low Severity Issues

### LOW-001: Duplicate Form Logic (Technical Debt)
**Severity:** Low  
**Location:** `components/journal/journal-form.tsx` vs `components/plans/plan-form.tsx`  
**Issue:** ~80% duplicate code. Maintenance burden, inconsistency risk.

---

### LOW-002: No Error Boundaries
**Severity:** Low  
**Location:** App-wide  
**Issue:** Unhandled React errors crash entire page. No graceful degradation.

---

### LOW-003: No Loading States on Server Components
**Severity:** Low  
**Location:** Dashboard, Journal, Plans pages  
**Issue:** Slow queries block page render. No Suspense boundaries.

---

### LOW-004: Inconsistent Date Format Handling
**Severity:** Low  
**Location:** Multiple files  
**Issue:** Mix of `'yyyy-MM-dd'`, `'PPP'`, `'MMMM do, yyyy'` formats. Bug risk.

---

### LOW-005: Hardcoded Mood/Category Arrays
**Severity:** Low  
**Location:** `journal-form.tsx:42-50`, `plan-form.tsx:41-42`  
**Issue:** Not from DB. Can't be customized. Should use tags system.

---

### LOW-006: Photo Deletion Leaves Storage Orphans
**Severity:** Low  
**Location:** `app/actions/journal.ts` (lines 83-93) - **FIXED**  
**Issue:** Deletes photo records but not storage objects. Storage leaks.

---

### LOW-007: Inconsistent Error Handling Patterns
**Severity:** Low  
**Location:** Server Actions  
**Issue:** Some return `{error}`, some throw. No unified `Result<T, E>` type.

---

### LOW-008: Missing `updated_at` Database Triggers
**Severity:** Low  
**Location:** Migration - **FIXED**  
**Issue:** Relies on application to set `updated_at`. Triggers more reliable.

---

### LOW-009: No Optimistic UI Updates
**Severity:** Low  
**Location:** Plan checkbox, journal save  
**Issue:** Waits for server round-trip. Poor perceived performance.

---

### LOW-010: Search Debounce Only 500ms
**Severity:** Low  
**Location:** `components/search/search-client.tsx:21`  
**Issue:** May cause excessive API calls during typing.

---

### LOW-011: No OAuth Providers
**Severity:** Low  
**Location:** Supabase Auth config  
**Issue:** Only email/password. No Google, GitHub, etc.

---

### LOW-012: Middleware Deprecation Warning
**Severity:** Low  
**Location:** `middleware.ts`  
**Issue:** Next.js 16 warns: "middleware file convention is deprecated. Please use proxy instead."

---

## 5. Informational Findings

### INFO-001: Zustand Installed But Unused
**Location:** `package.json`  
**Issue:** Dead dependency. Remove or implement.

---

### INFO-002: Missing API Routes per Implementation Plan
**Location:** `docs/implementation-plan.md`  
**Issue:** Plan mentions `/api/entries`, `/api/plans`, `/api/photos` but only `/api/search` and `/api/export` exist.

---

### INFO-003: Tags System Incomplete in Implementation Plan
**Location:** Database has `tags`, `entry_tags` but no UI/API/actions in original plan.

---

### INFO-004: Bucket Name Mismatch in Docs
**Location:** `docs/implementation-plan.md` (line 88)  
**Issue:** Plan says `dayvault-photos`, actual is `journal_photos`.

---

### INFO-005: Test Coverage Minimal
**Location:** `tests/dayvault.spec.ts`  
**Issue:** Only UI existence checks. No unit, integration, or E2E functional tests.

---

### INFO-006: No Backup Strategy Documented
**Location:** `docs/deployment.md`  
**Issue:** No Supabase backup/restore procedure documented.

---

## 6. Architecture Weaknesses

| Weakness | Impact | Recommendation |
|----------|--------|----------------|
| No service layer | Tight coupling to Supabase | Add repository pattern |
| Direct Supabase calls in Server Actions | Hard to test, mock | Abstract data access |
| Mixed data fetching patterns | Inconsistent | Standardize on Server Components + Server Actions |
| No API versioning | Breaking changes risk | Add `/api/v1/` prefix |
| No real-time sync | Multi-device conflicts | Add Supabase Realtime |

---

## 7. Testing Gap Analysis

| Test Type | Current | Required | Gap |
|-----------|---------|----------|-----|
| Unit Tests | 0% | 70%+ | Critical |
| Integration Tests | 0% | 50%+ | Critical |
| E2E Tests | Basic UI only | Full flows | High |
| Visual Regression | None | Key pages | Medium |
| Load Testing | None | 1000 concurrent | High |
| Security Scanning | None | CI/CD pipeline | Critical |

---

## 8. Remediation Priority Matrix

| Priority | Findings | Timeline |
|----------|----------|----------|
| **P0 - Immediate** | CRIT-001, CRIT-002, HIGH-001, HIGH-005 | < 1 week |
| **P1 - This Sprint** | HIGH-002, HIGH-003, HIGH-004, MED-002, MED-005, MED-006 | < 2 weeks |
| **P2 - Next Sprint** | MED-001, MED-003, MED-004, MED-007, MED-008 | < 1 month |
| **P3 - Backlog** | All LOW, INFO findings | Ongoing |

---

## 9. Compliance Considerations

- **GDPR:** Data export implemented ✅, but no deletion API, no consent tracking
- **CCPA:** Similar gaps
- **SOC2:** No audit logging, no access reviews
- **OWASP Top 10:** A01 (Broken Access Control - CRIT-001), A07 (Auth - HIGH-001), A03 (Injection - MED-001)

---

## 10. Recommended Next Steps

1. **Week 1:** Fix CRIT-001 (RLS policies), CRIT-002 (photo deletion), HIGH-001 (rate limiting), HIGH-005 (open redirect)
2. **Week 2:** Verify HIGH-002/HIGH-003 fixes deployed, add CSP/security headers, fix search performance
3. **Week 3-4:** Add error boundaries, Suspense loading, optimistic UI, unified error handling
4. **Ongoing:** Implement test suite, add service layer, document backup procedures

---

## Appendix: Files Analyzed

```
app/
├── (auth)/actions.ts          # Auth Server Actions
├── (auth)/forgot-password/    # Password reset
├── (dashboard)/
│   ├── dashboard/page.tsx     # Stats, queries
│   ├── journal/               # Journal CRUD
│   ├── calendar/page.tsx      # Calendar view
│   ├── timeline/page.tsx      # Timeline view
│   ├── plans/                 # Plans CRUD
│   ├── search/                # Search
│   └── settings/page.tsx      # Settings
├── actions/
│   ├── journal.ts             # Journal mutations
│   ├── plan.ts                # Plan mutations
│   ├── tags.ts                # Tags mutations
│   └── photos.ts              # Photo signed URLs
├── api/
│   ├── search/route.ts        # Search API
│   └── export/route.ts        # Data export
components/
├── journal/
│   ├── journal-form.tsx       # Journal form
│   ├── image-upload.tsx       # Photo upload
│   └── tags-manager.tsx       # Tags UI
├── plans/                     # Plan components
├── layout/                    # Layout components
└── settings/                  # Settings UI
lib/
├── supabase/
│   ├── client.ts              # Browser client
│   ├── server.ts              # Server client
│   └── middleware.ts          # Auth middleware
├── validators/                # Zod schemas
supabase/
├── migrations/
│   └── 20240101000000_init.sql # Schema + RLS
docs/                          # Documentation
tests/                         # Playwright tests
```

---

**End of Report**
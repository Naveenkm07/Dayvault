# Dayvault Test Plan

## 1. Testing Objectives
- Verify security controls prevent unauthorized access
- Validate data integrity across all user operations
- Confirm performance meets acceptable thresholds
- Ensure UX flows work correctly end-to-end

## 2. Test Environment
- **OS:** Windows/Linux/macOS
- **Node:** 18+
- **Database:** Supabase (PostgreSQL)
- **Browser:** Chrome, Firefox, Safari (latest)
- **Viewport:** Mobile (375px), Tablet (768px), Desktop (1440px)

## 3. Test Categories

### 3.1 Authentication & Authorization Tests

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| AUTH-001 | Access `/dashboard` without login | Redirect to `/login` |
| AUTH-002 | Access `/journal` without login | Redirect to `/login` |
| AUTH-003 | Login with valid credentials | Redirect to `/dashboard` |
| AUTH-004 | Login with invalid credentials | Error message, no redirect |
| AUTH-005 | Login rate limiting (6 attempts) | 6th attempt blocked for 15 min |
| AUTH-006 | Signup with valid data | Account created, redirect to dashboard |
| AUTH-007 | Signup rate limiting (4 attempts) | 4th attempt blocked for 15 min |
| AUTH-008 | Password reset with valid email | Email sent, redirect to callback |
| AUTH-009 | Password reset rate limiting (3/hr) | 3rd attempt blocked for 1 hour |
| AUTH-010 | Password reset open redirect test | External `next` parameter rejected |
| AUTH-011 | Logout clears session | Redirect to `/login`, session invalid |
| AUTH-012 | JWT token refresh on navigation | Seamless session continuation |
| AUTH-013 | RLS: User A cannot read User B's entries | 404 or empty result |
| AUTH-014 | RLS: User A cannot read User B's plans | 404 or empty result |
| AUTH-015 | RLS: User A cannot read User B's photos | 404 or empty result |
| AUTH-015 | RLS: User A cannot read User B's tags | **FAIL - No policies** |
| AUTH-016 | RLS: User A cannot read User B's entry_tags | **FAIL - No policies** |

### 3.2 Journal CRUD Tests

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| JRNL-001 | Create entry with title only | Entry created, appears in list |
| JRNL-002 | Create entry with all fields | All fields saved correctly |
| JRNL-003 | Create entry with photos | Photos uploaded, signed URLs work |
| JRNL-004 | Create entry with tags | Tags associated, filterable |
| JRNL-005 | Edit entry - update title | Title updated, timestamp updated |
| JRNL-006 | Edit entry - add/remove photos | Photos synced, old deleted from storage |
| JRNL-007 | Edit entry - add/remove tags | Tags synced correctly |
| JRNL-008 | Delete entry | Entry + photos + tags deleted |
| JRNL-009 | View entry detail | Shows title, content, photos, tags |
| JRNL-010 | List entries - pagination | Loads 20/page, infinite scroll |
| JRNL-011 | Date picker - past dates only | Future dates disabled |
| JRNL-012 | Mood selection | Saves correctly |
| JRNL-013 | Location field | Saves correctly |

### 3.3 Plan CRUD Tests

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| PLAN-001 | Create plan with all fields | Plan created, appears in list |
| PLAN-002 | Create plan - priority levels | High/Medium/Low badges correct |
| PLAN-003 | Create plan - categories | Category displayed |
| PLAN-004 | Toggle completion | Optimistic update, toast shown |
| PLAN-005 | Edit plan | All fields editable |
| PLAN-006 | Delete plan | Plan removed, toast shown |
| PLAN-007 | Plans grouped by date | Correct grouping, sorted |
| PLAN-008 | Completed plans styled | Strikethrough, opacity |

### 3.4 Photo Upload Tests

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| PHOTO-001 | Upload valid image (<5MB) | Upload succeeds, preview shows |
| PHOTO-002 | Upload invalid file type | Rejected, error toast |
| PHOTO-003 | Upload >5MB file | Rejected, error toast |
| PHOTO-004 | Multiple photos | All upload, all preview |
| PHOTO-005 | Remove photo before save | Removed from form state |
| PHOTO-006 | Remove photo after save | Deleted from DB and storage |
| PHOTO-007 | Signed URL expiry | URL works for 7 days, then 403 |
| PHOTO-008 | Unauthenticated URL access | 403 Forbidden |
| PHOTO-009 | Cross-user URL access | 403 Forbidden |

### 3.5 Search Tests

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| SRCH-001 | Search by entry title | Returns matching entries |
| SRCH-002 | Search by entry description | Returns matching entries |
| SRCH-003 | Search by plan title | Returns matching plans |
| SRCH-004 | Search by plan description | Returns matching plans |
| SRCH-005 | Search pagination | 20 results/page, page nav |
| SRCH-006 | Search results sorted | Newest first |
| SRCH-007 | Empty query | Returns empty, no error |
| SRCH-008 | Special characters in query | Escaped, no SQL injection |
| SRCH-009 | Debounce (500ms) | No excessive API calls |

### 3.6 Calendar Tests

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| CAL-001 | Month navigation | Prev/Next month works |
| CAL-002 | Entry indicators | Underline on entry dates |
| CAL-003 | Plan indicators | Primary color on plan dates |
| CAL-004 | Date selection | Shows entries/plans for date |
| CAL-005 | Month query pagination | Only fetches current month |

### 3.7 Timeline Tests

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| TL-001 | Year grouping | Entries grouped by year |
| TL-002 | Month grouping | Entries grouped by month |
| TL-003 | Pagination | 50 entries/page |
| TL-004 | Navigate pages | Prev/Next links work |
| TL-005 | Entry link | Click opens detail |

### 3.8 Settings Tests

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| SET-001 | Update display name | Saved, shown in UI |
| SET-002 | Change theme (light/dark/system) | Persists, applies immediately |
| SET-003 | Change accent color | CSS variables updated |
| SET-004 | Export data | JSON downloaded with all data |
| SET-005 | Export pagination | Large exports split into pages |

### 3.9 Tags Tests

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| TAG-001 | Create tag | Tag appears in list |
| TAG-002 | Tag color picker | Color saved, shown on tag |
| TAG-003 | Attach tag to entry | Tag shown on entry |
| TAG-004 | Detach tag from entry | Tag removed from entry |
| TAG-005 | Delete tag | Tag removed, associations cleaned |
| TAG-006 | RLS on tags | **FAIL - No policies** |

### 3.10 UX/UI Tests

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| UX-001 | Responsive layout | Works on mobile/tablet/desktop |
| UX-002 | Dark mode toggle | Switches correctly |
| UX-003 | Theme persistence | Survives refresh |
| UX-004 | Accent color preview | Immediate feedback |
| UX-005 | Toast notifications | Success/error shown |
| UX-006 | Loading states | Skeletons/spinners on async |
| UX-007 | Error boundaries | Graceful error display |
| UX-008 | Keyboard navigation | Tab order logical |
| UX-009 | Focus management | Modal traps focus |
| UX-010 | Screen reader labels | ARIA labels present |

### 3.11 Performance Tests

| Test ID | Scenario | Threshold |
|---------|----------|-----------|
| PERF-001 | Dashboard load (100 entries) | < 2s |
| PERF-002 | Journal list (500 entries) | < 3s |
| PERF-003 | Calendar month view | < 1s |
| PERF-004 | Timeline (1000 entries) | < 3s |
| PERF-005 | Search query | < 500ms |
| PERF-006 | Photo upload (2MB) | < 5s |
| PERF-007 | Data export (1000 entries) | < 10s |
| PERF-008 | Concurrent users (100) | No errors |

### 3.12 Stress/Load Tests

| Test ID | Scenario | Expected |
|---------|----------|----------|
| LOAD-001 | 100 concurrent dashboard loads | All succeed, <3s avg |
| LOAD-002 | 50 concurrent photo uploads | All succeed, no timeouts |
| LOAD-003 | 200 concurrent search queries | All succeed, <1s avg |
| LOAD-004 | Rapid auth attempts | Rate limited correctly |

---

## 4. Penetration Testing Checklist

### OWASP Top 10 Coverage

| Category | Tests |
|----------|-------|
| **A01: Broken Access Control** | AUTH-013 through AUTH-016, TAG-006 |
| **A02: Cryptographic Failures** | Verify HTTPS, secure cookies, password hashing |
| **A03: Injection** | SRCH-008, all form inputs |
| **A04: Insecure Design** | Rate limiting, password reset flow |
| **A05: Security Misconfiguration** | Security headers, CSP, debug info |
| **A06: Vulnerable Components** | `npm audit`, dependency scanning |
| **A07: Auth Failures** | AUTH-005, AUTH-007, AUTH-009 |
| **A08: Software Integrity** | Build verification, supply chain |
| **A09: Logging Failures** | Auth events, errors, access logs |
| **A10: SSRF** | Photo upload URL validation |

---

## 5. Test Data Requirements

- **Test Users:** 5 accounts with varying data volumes
  - User A: Empty (new user)
  - User B: 10 entries, 5 plans, 3 photos
  - User C: 100 entries, 50 plans, 20 photos, 10 tags
  - User D: 1000 entries, 500 plans, 100 photos
  - User E: Malformed data (for negative testing)

- **Test Files:** 
  - Valid: JPEG (100KB, 2MB, 5MB), PNG (500KB), WebP (300KB)
  - Invalid: PDF, EXE, SVG with scripts, 10MB JPEG

---

## 6. Automation Strategy

### CI/CD Pipeline Tests
```yaml
# Run on every PR
- Unit tests (Vitest/Jest)
- Lint (ESLint)
- Type check (tsc --noEmit)
- Build verification

# Run on merge to main
- E2E tests (Playwright)
- Visual regression (Chromatic)
- Dependency audit (npm audit)

# Scheduled weekly
- Load testing (k6)
- Penetration scan (OWASP ZAP)
- Dependency updates
```

---

## 7. Bug Triage Process

1. **Critical/High:** Fix immediately, deploy hotfix
2. **Medium:** Fix in current sprint
3. **Low/Info:** Add to backlog, fix during refactoring

---

## 8. Sign-off Criteria

- [ ] All Critical/High findings resolved
- [ ] All AUTH tests pass
- [ ] All JRNL/PLAN/PHOTO tests pass
- [ ] Performance thresholds met
- [ ] Security headers present
- [ ] CSP configured
- [ ] Rate limiting enforced
- [ ] RLS policies complete (tags, entry_tags)
- [ ] Documentation updated
# Vulnerability Reproduction Guide

## CRIT-001: Incomplete RLS Policies on Tags Tables

### Prerequisites
- Two user accounts (User A, User B)
- Supabase dashboard access

### Steps to Reproduce
1. Login as User A
2. Create a tag: `INSERT INTO tags (user_id, name, color) VALUES (auth.uid(), 'Test Tag', '#ff0000');`
3. Verify tag exists: `SELECT * FROM tags WHERE user_id = auth.uid();`
4. Login as User B (different browser/incognito)
5. Run: `SELECT * FROM tags;`
6. **Expected:** Only User B's tags
7. **Actual:** Returns User A's tags too
8. Bonus: As User B, run `DELETE FROM tags WHERE id = '<user-a-tag-id>';` - succeeds!

### Root Cause
Migration enables RLS but no `CREATE POLICY` for `tags` or `entry_tags`.

### Fix Verification
After adding policies:
```sql
CREATE POLICY "Users can manage their own tags" ON tags FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own entry_tags" ON entry_tags FOR ALL USING (auth.uid() = (SELECT user_id FROM tags WHERE id = entry_tags.tag_id));
```
Re-run steps - User B should see only their tags, DELETE should fail.

---

## CRIT-002: Client-Side Photo Deletion Without Server Verification

### Prerequisites
- Authenticated user with journal entry containing photos

### Steps to Reproduce
1. Create journal entry with 2 photos
2. Open browser DevTools → Network tab
3. Click "X" remove button on first photo
4. Observe: No network request to server
4. Submit form (save entry)
5. Check database: `SELECT * FROM photos WHERE entry_id = '<entry-id>';`
6. **Expected:** 1 photo record
7. **Actual:** 2 photo records (removed photo still there)
8. Check storage: Photo file still exists in Supabase Storage

### Root Cause
`onRemove` in `image-upload.tsx` only filters local state array, no Server Action called.

### Fix Verification
Create Server Action `deletePhoto(storagePath)` that:
1. Verifies ownership
2. Deletes from `photos` table
3. Deletes from Supabase Storage
4. Call from `onRemove` via `onChange` + Server Action

---

## HIGH-001: No Rate Limiting on Authentication Endpoints

### Prerequisites
- Network tool (curl, Postman, or custom script)

### Steps to Reproduce - Login Brute Force
```bash
for i in {1..20}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "email=test@example.com&password=wrong$i" \
    -w "\nHTTP %{http_code}\n" -s -o /dev/null
done
```
**Expected:** After 5 attempts, rate limited (429)
**Actual:** All 20 return 200/302, no rate limiting

### Steps to Reproduce - Signup Enumeration
```bash
for i in {1..20}; do
  curl -X POST http://localhost:3000/api/auth/signup \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "email=victim$i@example.com&password=password123&name=Test" \
    -w "\nHTTP %{http_code}\n" -s -o /dev/null
done
```
**Expected:** Rate limited after 3 attempts
**Actual:** All succeed (or reveal which emails exist via error messages)

### Fix Verification
Implement rate limiter, re-run - should get 429 after threshold.

---

## HIGH-005: Insecure Password Reset Open Redirect

### Prerequisites
- Valid user account with email access

### Steps to Reproduce
1. Request password reset for your email
2. Check email for reset link
3. Link format: `https://app.com/auth/callback?next=/settings&code=...`
3. Modify `next` parameter: `https://app.com/auth/callback?next=https://evil.com/phishing&code=...`
4. Click modified link
5. **Expected:** Redirect to `/settings` only
6. **Actual:** Redirects to `evil.com`

### Fix Verification
Validate `next` against allowlist: `['/settings', '/dashboard', '/journal', '/plans']`

---

## HIGH-002: Public Photo URLs (Verify Fix)

### Prerequisites
- User with uploaded photos

### Steps to Reproduce
1. Upload photo as User A
2. Open photo in browser (get URL from `<img src>`)
3. Copy full photo URL
4. Open in incognito/unauthenticated browser
5. **Expected (Fixed):** 403 Forbidden or signed URL expired
6. **Actual (Vulnerable):** Photo loads publicly

### Fix Verification
- Photo URLs should be signed (contain `signedUrl` parameter)
- Unsigned URLs return 403
- Signed URLs expire after 7 days

---

## MED-002: Unbounded Data Export DoS

### Prerequisites
- User with large dataset (create via script: 50,000+ entries)

### Steps to Reproduce
1. Create 50,000 journal entries via script
2. Call export: `GET /api/export`
3. Monitor server memory
4. **Expected:** Streamed response, controlled memory
5. **Actual (Vulnerable):** Memory spikes, request times out

### Fix Verification
- Export supports `?page=1` parameter
- Each page ≤ 1000 records
- Response streamed, not buffered

---

## MED-005/006: Missing Security Headers & CSP

### Steps to Reproduce
1. Open site in browser
2. DevTools → Network → Select main document
3. Check Response Headers for:
   - `Content-Security-Policy` - **Missing**
   - `X-Frame-Options` - **Missing**
   - `X-Content-Type-Options: nosniff` - **Missing**
   - `Referrer-Policy` - **Missing**
   - `Permissions-Policy` - **Missing**
   - `Strict-Transport-Security` - **Missing**

### Fix Verification
All headers present with secure values.

---

## LOW-006: Photo Deletion Leaves Storage Orphans

### Steps to Reproduce
1. Create entry with photo
2. Note storage path from `photos` table
3. Delete entry via UI
3. Check `photos` table - record deleted ✅
4. Check Supabase Storage - file still exists ❌
5. **Expected:** Storage object also deleted

### Fix Verification
Server Action calls `supabase.storage.from('journal_photos').remove([storagePath])` before DB delete.

---

## TAG-006: RLS on Tags (Same as CRIT-001)

### Steps to Reproduce
Same as CRIT-001 but focused on tag operations:
1. User A creates tags
2. User B lists tags → sees User A's tags
3. User B attaches User A's tag to their entry
4. User B deletes User A's tag
5. All succeed due to missing policies

---

## Quick Test Commands

```bash
# Run all security checks
npm run lint          # ESLint
npm run build         # TypeScript + build
npm audit             # Dependency vulnerabilities

# Manual API tests
curl -X POST localhost:3000/api/auth/login -d "email=test&pass=wrong"
curl -X POST localhost:3000/api/auth/signup -d "email=test&pass=123&name=x"
curl "localhost:3000/api/search?q=test"
curl "localhost:3000/api/export"

# Database RLS test (run as different users in Supabase SQL editor)
SET ROLE authenticated;
SET request.jwt.claims.sub = 'user-a-uuid';
SELECT * FROM tags;  -- Should only show user-a's tags
```

---

## Automation Checklist

- [ ] Add to CI: `npm run lint && npm run build`
- [ ] Add to CI: `npm audit --audit-level=high`
- [ ] Add Playwright E2E for AUTH-001 through AUTH-016
- [ ] Add k6 load test for PERF-001 through PERF-008
- [ ] Schedule weekly OWASP ZAP scan
- [ ] Add dependabot for dependency updates
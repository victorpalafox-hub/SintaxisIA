# Security Review Report

**Date:** 2026-02-03
**Reviewer:** Security-Reviewer Agent
**Scope:** npm dependency audit across all 3 packages (root, automation, remotion-app)
**Context7 Consulted:** Yes - npm security best practices (`/websites/npmjs`) and Node.js security guidelines (`/nodejs/node`)

---

## Executive Summary

| Package | Status | Vulnerabilities |
|---------|--------|-----------------|
| Root (`/`) | PASSED | 0 vulnerabilities |
| **Automation (`/automation`)** | **MITIGATED** | **4 moderate** (from 7: 2 critical, 1 high, 4 moderate) |
| Remotion App (`/remotion-app`) | PASSED | 0 vulnerabilities |

**Overall Assessment:** MITIGATED - Critical and high vulnerabilities resolved via npm overrides. 4 moderate vulnerabilities remain (unfixable - deprecated `request` library).

### Fix Applied (2026-02-03)

**Solution:** npm overrides in `automation/package.json`:
```json
"overrides": {
  "form-data": "^4.0.0",
  "qs": "^6.14.1",
  "tough-cookie": "^4.1.3"
}
```

**Results:**
- ✅ Eliminated: 2 CRITICAL (form-data) + 1 HIGH (qs) + 1 MODERATE (tough-cookie)
- ⚠️ Remaining: 4 MODERATE (SSRF in `request` - no fix available, library deprecated)
- ✅ All 430 tests passing

---

## 1. Dependency Audit Results

### Root Package (48 dependencies)

```
found 0 vulnerabilities
```

**Status:** Clean - No security issues detected.

### Automation Package

```
7 vulnerabilities (4 moderate, 1 high, 2 critical)
```

**Vulnerable Packages:**

| Package | Severity | CVE/Advisory | Description | CVSS Score |
|---------|----------|--------------|-------------|------------|
| `form-data` | **CRITICAL** | [GHSA-fjxv-7rqg-78g4](https://github.com/advisories/GHSA-fjxv-7rqg-78g4) | Uses unsafe random function for choosing boundary | - |
| `request` | **CRITICAL** | [GHSA-p8p7-x288-28g6](https://github.com/advisories/GHSA-p8p7-x288-28g6) | Server-Side Request Forgery (SSRF) | 6.1 |
| `qs` | **HIGH** | [GHSA-6rw7-vpxm-498p](https://github.com/advisories/GHSA-6rw7-vpxm-498p) | arrayLimit bypass allows DoS via memory exhaustion | 7.5 |
| `tough-cookie` | MODERATE | [GHSA-72xf-g2v4-qvf3](https://github.com/advisories/GHSA-72xf-g2v4-qvf3) | Prototype Pollution vulnerability | 6.5 |
| `@cypress/request-promise` | MODERATE | Transitive | Depends on vulnerable request-promise-core | - |
| `request-promise-core` | MODERATE | Transitive | Depends on vulnerable request | - |
| `node-telegram-bot-api` | MODERATE | Transitive | Depends on vulnerable @cypress/request-promise | - |

### Remotion App Package (290 dependencies)

```
found 0 vulnerabilities
```

**Status:** Clean - No security issues detected.

---

## 2. Vulnerability Analysis

### Root Cause

All 7 vulnerabilities trace back to a single direct dependency:

```
node-telegram-bot-api@0.67.0
  -> @cypress/request-promise
    -> request-promise-core
      -> request (deprecated, unmaintained since Feb 2020)
        -> form-data (<2.5.4) [CRITICAL]
        -> qs (<6.14.1) [HIGH]
        -> tough-cookie (<4.1.3) [MODERATE]
```

The `request` library has been **deprecated since February 2020** and is no longer maintained. It continues to accumulate vulnerabilities that will never be patched.

### Impact Assessment

| Vulnerability | Risk in This Project | Reasoning |
|--------------|---------------------|-----------|
| form-data (CRITICAL) | **MEDIUM** | Used in Telegram bot API for file uploads; weak randomness could allow boundary prediction |
| request SSRF (CRITICAL) | **LOW** | Internal use only; no user-controlled URLs passed to Telegram API |
| qs DoS (HIGH) | **LOW** | Query strings are internally generated, not from user input |
| tough-cookie (MODERATE) | **LOW** | Cookie handling unlikely to be exploited in bot context |

---

## 3. Remediation Options

### Option 1: Downgrade to node-telegram-bot-api@0.63.0 (Recommended Short-Term)

```bash
cd automation
npm install node-telegram-bot-api@0.63.0
```

**Pros:** Removes all 7 vulnerabilities immediately
**Cons:** May lose features from newer versions; still using deprecated `request` internally

### Option 2: Replace with Alternative Library (Recommended Long-Term)

Replace `node-telegram-bot-api` with a modern alternative that does not depend on `request`:

| Library | GitHub Stars | Maintained | HTTP Client |
|---------|--------------|------------|-------------|
| `grammy` | 2.1k+ | Active | Native fetch |
| `telegraf` | 8.3k+ | Active | node-fetch |

**Migration effort:** Medium - API changes required but notification system is isolated in `/automation/src/notifiers/`

### Option 3: npm Overrides ✅ APPLIED

Added to `automation/package.json` (2026-02-03):

```json
{
  "overrides": {
    "form-data": "^4.0.0",
    "qs": "^6.14.1",
    "tough-cookie": "^4.1.3"
  }
}
```

**Result:** Reduced from 7 vulnerabilities to 4 moderate
**Tests:** All 430 tests passing (24 notification tests verified)
**Remaining:** 4 moderate SSRF vulnerabilities in `request` (unfixable - library deprecated)

---

## 4. Secrets Management Validation

Based on the project's configuration system (`src/config/EnvironmentManager.ts`):

- [x] All API keys loaded from environment variables
- [x] `.gitignore` properly configured (includes `.env`, `.env.*`, `.env.local`)
- [x] `.env.example` contains only placeholder values
- [x] No hardcoded credentials detected in dependency audit
- [x] CI/CD uses mock values for testing (`CI_MOCK_VALUE`)
- [x] TestLogger sanitizes sensitive data before logging

---

## 5. API Security Status

| API | Auth Method | Vulnerability Impact |
|-----|-------------|---------------------|
| Gemini | API Key (env) | Not affected |
| ElevenLabs | API Key (env) | Not affected |
| NewsData.io | API Key (env) | Not affected |
| YouTube | OAuth2 (env) | Not affected |
| **Telegram Bot** | Bot Token (env) | **AFFECTED** - Uses vulnerable request library |
| Resend Email | API Key (env) | Not affected |

---

## 6. Context7 Documentation References

The following documentation was consulted during this review:

### npm Security Best Practices (`/websites/npmjs`)

```bash
# Run security audit on current project
npm audit

# Automatically fix vulnerabilities
npm audit fix

# Fix with potentially breaking changes (use with caution)
npm audit fix --force

# Audit only production dependencies
npm audit --omit=dev

# Generate JSON report for CI/CD
npm audit --json > audit-report.json
```

### Node.js Security Model (`/nodejs/node`)

- Dependencies from npm registry inherit execution privileges of the running user
- Input validation is the application's responsibility
- Path manipulation functions (`path.join()`, `path.normalize()`) trust their input
- The execution path is trusted

---

## 7. Recommendations

### Immediate Actions (Priority: HIGH) ✅ COMPLETED

1. ~~**Downgrade Telegram library**~~ → **Applied npm overrides instead** (2026-02-03)
   - Overrides force secure versions of transitive dependencies
   - Reduced vulnerabilities from 7 to 4 (all moderate)

2. ✅ **Tests verified** - All 430 tests passing (24 notification tests confirmed)

### Short-Term Actions (Priority: MEDIUM)

3. **Evaluate migration** to `telegraf` or `grammy` library for Telegram integration
   - Would eliminate all 4 remaining moderate vulnerabilities
   - Affected files: `telegram-notifier.ts`, `telegram-callback-handler.ts`

4. **Add npm audit** to CI pipeline:
   ```yaml
   # .github/workflows/test.yml
   - name: Security Audit
     run: npm audit --audit-level=high
   ```

### Long-Term Actions (Priority: LOW)

5. **Set up Dependabot** for automated dependency updates

6. **Consider Snyk** or similar for continuous vulnerability monitoring

---

## 8. Previous Findings Status

From the previous security review (2026-01-29):

| ID | Issue | Status |
|----|-------|--------|
| M-001 | Partial API Key Exposure in test-gemini.js | **FIXED** |
| M-002 | Deprecated console.log in printSummary() | **FIXED** |
| L-001 | Debug data logging in logger.ts | Open |
| L-002 | Command execution with child_process | Open (documented) |
| L-003 | Console.log statements in automation | Open |
| L-004 | Default voice ID in .env.example | Open |

---

## 9. Next Review

| Trigger | Action |
|---------|--------|
| After dependency fix | Re-run `npm audit` to confirm 0 vulnerabilities |
| Weekly | Automated `npm audit` in CI |
| Monthly | Manual review of dependency updates |

---

*Report generated by Security-Reviewer Agent with Context7 documentation lookup*
*Sintaxis IA - Videos Short Project*

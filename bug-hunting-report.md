---
report_type: bug-hunting
generated: 2026-03-28T19:00:00Z
version: 2026-03-28
status: success
agent: bug-hunter
files_processed: 47
issues_found: 24
critical_count: 3
high_count: 6
medium_count: 10
low_count: 5
modifications_made: false
---

# Bug Hunting Report

**Generated**: 2026-03-28
**Project**: Togyzqumalaq Digital
**Files Analyzed**: 47 (TypeScript/TSX source files, config, migrations)
**Total Issues Found**: 24
**Status**: WARNING - Critical issues require immediate attention

---

## Executive Summary

The codebase is well-structured with clean TypeScript, proper immutable patterns in the game engine, Zod validation schemas, and a solid build (passes `next build` and all 14 unit tests). However, three critical security issues were found: **exposed API keys in `.env.local`**, a **hardcoded Supabase URL in `next.config.ts`**, and the **`SUPABASE_SERVICE_ROLE_KEY` set to the same value as the anon key** (a likely misconfiguration that could expose admin privileges). The game engine has logic bugs around tuzdyk capture accounting, the FEN parser has a type-safety issue, and server actions lack input validation with the Zod schemas that already exist but are never called.

### Key Metrics
- **Critical Issues**: 3
- **High Priority Issues**: 6
- **Medium Priority Issues**: 10
- **Low Priority Issues**: 5
- **Files Scanned**: 47
- **Modifications Made**: No
- **Changes Logged**: No

### Highlights
- Build passes (Next.js 16.2.1, TypeScript strict mode)
- 14/14 unit tests pass (game engine)
- 1 test suite fails due to missing `@playwright/test` dev dependency (not a code bug)
- No `console.log`, `TODO`, `FIXME`, or `any` type usages found in source
- No `dangerouslySetInnerHTML` or XSS vectors found

---

## Critical Issues (Priority 1)

### Issue #1: Exposed API Keys in .env.local

- **File**: `.env.local:1-5`
- **Category**: Security - Credential Exposure
- **Description**: The `.env.local` file contains real API keys that are present on disk. While `.gitignore` correctly excludes this file, the `SUPABASE_SERVICE_ROLE_KEY` is identical to the `NEXT_PUBLIC_SUPABASE_ANON_KEY`. If this is intentional for a hackathon, it is still dangerous because the service role key bypasses Row Level Security. If they were accidentally set to the same value, the real service role key may be exposed elsewhere, or RLS bypassing is silently broken.
- **Impact**: If `.env.local` is committed or the service role key is the anon key, either RLS policies can be bypassed by any client, or server-side admin operations will fail silently.
- **Fix**:
  1. Ensure `SUPABASE_SERVICE_ROLE_KEY` is the actual service role key from the Supabase dashboard (not the anon key).
  2. Rotate the `DEEPSEEK_OCR_API_KEY` if it has been exposed in any git history.
  3. Add `.env.example` with placeholder values for onboarding.

```
# .env.local (CURRENT - both keys are the same JWT)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...  # SAME as anon key!
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

### Issue #2: Hardcoded Supabase URL in next.config.ts

- **File**: `next.config.ts:11`
- **Category**: Security - Hardcoded Configuration
- **Description**: The `rewrites` configuration hardcodes the full Supabase URL (`https://a1-supabase-mmanassov89-mmanassov89.dedicatedapp.alem.ai`) directly in the source code rather than reading from an environment variable. This embeds infrastructure details in version-controlled code.
- **Impact**: URL is visible to anyone with repo access. Cannot be changed per environment (dev/staging/prod) without code changes.
- **Fix**: Reference `process.env.NEXT_PUBLIC_SUPABASE_URL` instead.

```typescript
// CURRENT
destination: "https://a1-supabase-mmanassov89-mmanassov89.dedicatedapp.alem.ai/:path*",

// FIXED
destination: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/:path*`,
```

### Issue #3: Auth Server Actions Bypass Zod Validation

- **File**: `src/actions/auth.ts:6-49`
- **Category**: Security - Missing Input Validation
- **Description**: The `serverLogin` and `serverRegister` server actions accept raw `email` and `password` strings directly without validating them against the Zod schemas (`loginSchema`, `registerSchema`) defined in `src/schemas/auth.ts`. Server actions are callable directly from the client, meaning a crafted request could send arbitrary data that bypasses the client-side Mantine form validation.
- **Impact**: Malformed input (e.g., extremely long strings, special characters) reaches the Supabase Auth API unvalidated. Could cause unexpected behavior or be used for abuse.
- **Fix**: Parse inputs through Zod schemas before calling the Supabase API.

```typescript
// CURRENT
export async function serverLogin(email: string, password: string) {
  // No validation - goes directly to Supabase

// FIXED
export async function serverLogin(email: string, password: string) {
  const parsed = loginSchema.safeParse({ email, password });
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };
  // ...proceed with validated data
```

---

## High Priority Issues (Priority 2)

### Issue #4: Game Engine Tuzdyk Capture Double-Counting

- **File**: `src/lib/game-engine/engine.ts:194-210`
- **Category**: Logic Bug
- **Description**: In `processCaptures()`, when a tuzdyk is created (line 199-201), the code first sets the pit to a tuzdyk marker, then immediately calls `emptyPit()` and sets `captured = stonesInLastPit`. Later, `collectTuzdykStones()` also tries to empty tuzdyk positions and `calculateTuzdykCapture()` attributes those emptied stones to the capturing side. Since the pit was already emptied in `processCaptures()`, the `collectTuzdykStones` call is harmless for the newly-created tuzdyk. However, the flow is fragile: if sowing deposits stones on an *existing* tuzdyk in the same move, those stones get captured by `collectTuzdykStones` but are *also* accounted for in `calculateTuzdykCapture`. The `calculateTuzdykCapture` function compares `boardAfterCapture` vs `boardAfterTuzdyk` and attributes the difference -- but this difference includes both the newly-created tuzdyk (already counted in `captured`) and ongoing tuzdyk collection. The score addition on line 106-107 adds `captured` for the moving side and `tuzdykCapture` for both sides, which should be correct for ongoing tuzdyks but may double-count for the move where the tuzdyk is created.
- **Impact**: Score could be inflated by the stone count of a newly-created tuzdyk (3 stones counted twice). This breaks the 162-stone invariant over time.
- **Fix**: In `processCaptures()`, when a tuzdyk is created, the pit should be emptied and `captured` set, but the tuzdyk position should not be re-processed by `collectTuzdykStones` in the same move. Add a guard or separate the new tuzdyk from ongoing tuzdyk collection.

### Issue #5: Server Actions Missing Zod Validation Across All Actions

- **File**: `src/actions/games.ts`, `src/actions/upload.ts`, `src/actions/ocr.ts`
- **Category**: Security - Missing Input Validation
- **Description**: Despite having comprehensive Zod schemas in `src/schemas/game.ts` and `src/schemas/ocr.ts`, none of the server actions (`createGame`, `saveMoves`, `searchGames`, `uploadScoresheet`, `triggerOCR`) actually call these schemas. All inputs are used directly without server-side validation.
- **Impact**: Malicious or malformed data can reach the database and external APIs.
- **Fix**: Add `schema.parse()` or `schema.safeParse()` at the beginning of each server action.

### Issue #6: FEN Parser Unsafe Type Cast for Invalid Side

- **File**: `src/lib/game-engine/fen.ts:66`
- **Category**: Logic Bug - Runtime Crash Risk
- **Description**: When the FEN side character is neither "S" nor "N", the code does `null as never`, which means `side` becomes `null` at runtime, but TypeScript thinks it's `Side`. The guard on line 67 (`if (!side) return null`) catches this, but the intermediate `null as never` is a type-safety violation that could cause issues if the code is refactored.
- **Impact**: Currently works due to the null check, but the `as never` cast is an anti-pattern that masks the real type. Future refactors could remove the guard.
- **Fix**: Use explicit handling.

```typescript
// CURRENT
const side: Side = sideStr === "S" ? "south" : sideStr === "N" ? "north" : null as never;
if (!side) return null;

// FIXED
if (sideStr !== "S" && sideStr !== "N") return null;
const side: Side = sideStr === "S" ? "south" : "north";
```

### Issue #7: Game Engine Mutation of ReadonlyMap via Type Cast

- **File**: `src/lib/game-engine/engine.ts:195-196`
- **Category**: Type Safety Violation
- **Description**: The `processCaptures` function declares `board` as `PieceMap` (which is `ReadonlyMap<number, PitState>`), but then casts it to a mutable `Map` to call `.set()`. This breaks the immutability contract of the type system.
- **Impact**: Violates the `ReadonlyMap` contract. Could cause subtle bugs if the same map reference is used elsewhere.
- **Fix**: Use `new Map(board)` before calling `.set()`, or use the existing `setPit` helper from `board.ts`.

```typescript
// CURRENT (line 195-196)
board = new Map(board);
(board as Map<number, PitState>).set(lastPos, { ... });

// The new Map is created first, so this is actually safe at runtime,
// but the cast to mutable Map is unnecessary since `new Map()` already returns Map.
// Fix: type the local variable properly
let mutableBoard = new Map(board);
mutableBoard.set(lastPos, { ... });
```

### Issue #8: Login Does Not Set Auth Cookies

- **File**: `src/actions/auth.ts:6-22`
- **Category**: Logic Bug - Authentication
- **Description**: The `serverLogin` function calls the Supabase auth endpoint directly via `fetch()` but never stores the returned tokens (access_token, refresh_token) in cookies. After login, the server-side `createServerSupabase()` reads cookies for auth, but no cookies were set. The client is redirected to `/manual` via `window.location.href` but the user will not actually be authenticated on subsequent requests.
- **Impact**: Login always "succeeds" (shows green notification) but the user is not actually authenticated. All subsequent server actions that call `supabase.auth.getUser()` will return `null`.
- **Fix**: Either use the Supabase SSR auth flow (`signInWithPassword` via the server Supabase client which handles cookies), or manually set the auth cookies from the response tokens.

### Issue #9: Search Games SQL Injection via .or() String Interpolation

- **File**: `src/actions/games.ts:115`
- **Category**: Security - SQL Injection
- **Description**: The `searchGames` function uses string interpolation inside `.or()`:
  ```typescript
  .or(`white_player_id.eq.${user.id},black_player_id.eq.${user.id},created_by.eq.${user.id}`)
  ```
  While `user.id` comes from the authenticated session (relatively safe), this pattern is dangerous because it builds filter expressions via string concatenation. If any of these values contained special PostgREST filter syntax, it could manipulate the query.
- **Impact**: Low risk with `user.id` from auth, but sets a dangerous precedent. If this pattern is copied for user-supplied values (like `query.tournament` on line 120), it becomes exploitable.
- **Fix**: Use the Supabase filter builder methods instead of string interpolation.

---

## Medium Priority Issues (Priority 3)

### Issue #10: ProfilePage Creates Supabase Client Outside Component Lifecycle

- **File**: `src/app/(dashboard)/profile/page.tsx:16`
- **Category**: React Anti-Pattern - Potential Memory Leak
- **Description**: `const supabase = createClient()` is called at the component body level (not inside a `useMemo` or `useRef`). This creates a new Supabase client on every render, including new WebSocket connections for Realtime.
- **Impact**: Multiple Supabase client instances created on re-renders, potentially causing memory leaks with dangling WebSocket connections.
- **Fix**: Wrap in `useMemo` or create a singleton pattern.

```typescript
// FIXED
const supabase = useMemo(() => createClient(), []);
```

### Issue #11: useEffect Missing Dependency in ProfilePage

- **File**: `src/app/(dashboard)/profile/page.tsx:43`
- **Category**: React Bug - Stale Closure
- **Description**: The `useEffect` on line 21 has an empty dependency array `[]` but calls `form.setValues` inside. The ESLint rule `react-hooks/exhaustive-deps` would flag `supabase` and `form` as missing dependencies. While intentionally loading only once is likely the goal, the `form` reference from `useForm` is stable, so this is acceptable but should be documented.
- **Impact**: Minor; the effect runs once which is likely intended. But the linter warning indicates potential staleness.
- **Fix**: Add a comment explaining the intentional empty deps, or pass `form.setValues` as a dependency (it is stable from `useForm`).

### Issue #12: BatchUpload processAll Uses Stale State Closure

- **File**: `src/components/ocr/batch-upload.tsx:34-56`
- **Category**: React Bug - Stale Closure
- **Description**: The `processAll` function captures `jobs` from the closure at call time (line 34 reads `jobs.length`, line 35 reads `jobs[i].status`). However, inside the for-loop, `setJobs` is called with functional updates. The problem is that `jobs[i].file` on line 45 reads from the *stale* `jobs` array, not the updated state. If the user adds more files while processing is in progress, or retries a job, the indices will be misaligned.
- **Impact**: File references could point to wrong files if the jobs array is modified during processing.
- **Fix**: Use a ref to track the current jobs array, or process from a snapshot taken at the start.

### Issue #13: Board Auto-Play Timer Does Not Stop at End

- **File**: `src/components/board/board-controls.tsx:34-43`
- **Category**: Logic Bug
- **Description**: The auto-play `setInterval` calls `onNext()` every 1000ms. The effect to stop playing (line 45-47) checks `currentIndex >= totalMoves`, but `onNext` is called from the interval *before* the state updates, so there's a race condition. The `onNext` callback inside the interval may call `setCurrentIndex` beyond bounds before the stop-effect fires.
- **Impact**: Auto-play might call `onNext()` one extra time after reaching the last move, causing the index to be clamped by `Math.min` in the parent but still firing an unnecessary state update.
- **Fix**: Check bounds inside the `onNext` callback or move the stop check into the interval callback itself.

### Issue #14: AltchaWidget Stale ref in Cleanup Function

- **File**: `src/components/ui/altcha-widget.tsx:22-23`
- **Category**: React Bug - Stale Ref
- **Description**: The `useEffect` cleanup function references `ref.current` directly. By the time cleanup runs, `ref.current` may be `null` because the component has unmounted. The optional chaining (`ref.current?.removeEventListener`) prevents a crash, but the event listener may not be properly removed if `ref.current` changed between effect setup and cleanup.
- **Impact**: Potential memory leak from unremoved event listener.
- **Fix**: Capture the ref value in a local variable at the start of the effect.

```typescript
useEffect(() => {
  const el = ref.current;
  if (!el) return;
  const handleVerify = (e: Event) => { ... };
  el.addEventListener("statechange", handleVerify);
  return () => el.removeEventListener("statechange", handleVerify);
}, [onVerify]);
```

### Issue #15: MoveList Uses motion.tr (Non-Standard HTML Element)

- **File**: `src/components/game/move-list.tsx:38`
- **Category**: Rendering Bug
- **Description**: `<motion.tr>` wraps a table row with Framer Motion, but this may cause hydration mismatches or DOM nesting warnings because `<AnimatePresence>` wraps `<motion.tr>` elements inside `<Table.Tbody>`. Some browsers may not correctly handle motion wrappers on `<tr>` elements, and Mantine's `<Table.Td>` children inside `<motion.tr>` (not `<Table.Tr>`) may break Mantine's table styling.
- **Impact**: Potential hydration mismatch warnings in development, inconsistent animation behavior across browsers.
- **Fix**: Either animate the row contents instead of the `<tr>` itself, or use `<Table.Tr>` with `component={motion.tr}` if Mantine supports it.

### Issue #16: Archive Page Search Fires on Every Keystroke

- **File**: `src/app/(dashboard)/archive/page.tsx:26-36`
- **Category**: Performance
- **Description**: The `useEffect` that triggers `searchGames` runs every time `query` changes, which happens on every keystroke in the search input. There is no debounce, so every character typed triggers a server action call to query Supabase.
- **Impact**: Excessive server requests during typing. Could cause rate limiting, unnecessary load, and flickering results.
- **Fix**: Add a debounce (300-500ms) before triggering the search.

### Issue #17: Game Engine - No Bounds Checking on fromIndex

- **File**: `src/lib/game-engine/engine.ts:52-69`
- **Category**: Edge Case - Missing Validation
- **Description**: The `executeMove` function validates that the pit is not empty and belongs to the current side, but does not check if `fromIndex` is within the valid range (0-17). A value of -1, 18, or any out-of-range number would pass the side check (e.g., `positionSide(-1)` returns `"south"` because `-1 < 9`) and then `stonesAt` would return 0 (because `Map.get(-1)` returns `undefined`), causing an "empty pit" error. While not exploitable, it is an incomplete validation.
- **Impact**: Confusing error messages for invalid inputs. `positionSide(-1)` returning "south" is technically wrong.
- **Fix**: Add bounds check: `if (fromIndex < 0 || fromIndex >= BOARD_SIZE) return { ..., error: "Invalid pit index" }`.

### Issue #18: FEN parseFen Does Not Validate Negative Scores

- **File**: `src/lib/game-engine/fen.ts:62-64`
- **Category**: Edge Case
- **Description**: `parseFen` uses `parseInt` for scores and checks `isNaN`, but does not check for negative scores. A FEN like `9,9,9,9,9,9,9,9,9/9,9,9,9,9,9,9,9,9 -5 5 S 1` would parse successfully with `scoreSouth = -5`. The `validateFen` function does check for negatives, but `parseFen` alone does not reject them.
- **Impact**: Code that calls `parseFen` without `validateFen` could receive negative scores.
- **Fix**: Add `if (scoreSouth < 0 || scoreNorth < 0) return null;` in `parseFen`.

### Issue #19: Missing Error Boundary for Game Replay Page

- **File**: `src/app/(dashboard)/game/[id]/page.tsx`
- **Category**: UX - Missing Error Handling
- **Description**: The game replay page has error state handling via `useState`, but there is no React Error Boundary wrapping it. If `buildReplay` throws (e.g., due to corrupted move data from the database), the entire page crashes with a white screen.
- **Impact**: Unhandled runtime errors crash the page without recovery.
- **Fix**: Add an `error.tsx` boundary file in the `game/[id]` route directory, or wrap the component in an Error Boundary.

---

## Low Priority Issues (Priority 4)

### Issue #20: Unused Import - Score in board.ts

- **File**: `src/lib/game-engine/board.ts:8`
- **Category**: Dead Code - Unused Import
- **Description**: The `Score` type is imported from `./types` but never used in the file.
- **Impact**: No runtime impact; increases bundle analysis noise.
- **Fix**: Remove `Score` from the import statement.

### Issue #21: Unused Import - Side in board.ts

- **File**: `src/lib/game-engine/board.ts:9`
- **Category**: Dead Code - Unused Import
- **Description**: The `Side` type is imported but only used indirectly through `positionSide`. Since `positionSide` returns `Side`, TypeScript can infer it without the explicit import.
- **Impact**: No runtime impact.
- **Fix**: Remove from import if not directly referenced in type annotations. (Note: it IS used in the `nonEmptyPositions` function signature on line 77, so this is actually used. Marking as informational.)

### Issue #22: Pit Component Unused index Prop

- **File**: `src/components/board/pit.tsx:7,17`
- **Category**: Dead Code - Unused Prop
- **Description**: The `PitProps` interface defines an `index` property, and the `Pit` component receives it in the destructured props, but `index` is never used within the component body (it is destructured but not referenced).
- **Impact**: Unnecessary prop passed through the component tree.
- **Fix**: Remove `index` from the destructured props (keep in interface if needed for external reference, or remove entirely).

### Issue #23: E2E Test File Runs Under Vitest Instead of Playwright

- **File**: `tests/e2e/upload-flow.test.ts`
- **Category**: Configuration
- **Description**: The vitest config includes `tests/**/*.test.ts` which matches the e2e test file. This file imports from `@playwright/test` which is not a dev dependency, causing a vitest suite failure. E2E tests should be excluded from vitest or `@playwright/test` should be added as a dev dependency.
- **Impact**: Test runner reports a failure that is not a real test failure. CI would show red.
- **Fix**: Either exclude `tests/e2e/**` from vitest config or add `@playwright/test` as a dev dependency and create a separate playwright config.

```typescript
// vitest.config.ts - FIXED
test: {
  include: ["tests/**/*.test.ts"],
  exclude: ["tests/e2e/**"],
},
```

### Issue #24: Missing .env.example File

- **File**: Project root (missing file)
- **Category**: Developer Experience
- **Description**: There is no `.env.example` file documenting the required environment variables. New developers must guess which env vars are needed.
- **Impact**: Slower onboarding, risk of running with missing config.
- **Fix**: Create `.env.example` with placeholder values.

---

## Code Cleanup Required

### Debug Code to Remove
| File | Line | Type | Code Snippet |
|------|------|------|--------------|
| (none found) | - | - | No console.log/debug statements found |

### Dead Code to Remove
| File | Lines | Type | Description |
|------|-------|------|-----------|
| `src/lib/game-engine/board.ts` | 8 | Unused Import | `Score` type imported but unused |
| `src/components/board/pit.tsx` | 7,17 | Unused Prop | `index` prop declared but never used in component |

### Duplicate Code Blocks
| Files | Lines | Description | Refactor Suggestion |
|-------|-------|-------------|-------------------|
| `games.ts:43-61`, `upload/page.tsx:68-81` | Multiple | FEN replay logic duplicated | Extract to `replayMoves(moves)` utility function |
| `manual/page.tsx:28-31`, `validation.ts:38-46` | Multiple | Valid pit number calculation duplicated | Reuse `validPitNumbers` from `validation.ts` |

---

## Validation Results

### Build

**Command**: `NEXT_PUBLIC_SUPABASE_URL=... npx next build`

**Status**: PASSED

**Output**:
```
Compiled successfully in 5.4s
Running TypeScript ... Finished TypeScript in 4.6s
Generating static pages (9/9)
```

**Exit Code**: 0

### Unit Tests

**Command**: `npx vitest run`

**Status**: PARTIAL (1 suite fails due to missing dependency, 14/14 tests pass)

**Output**:
```
tests/unit/game-engine.test.ts (14 tests) 9ms - PASS
tests/e2e/upload-flow.test.ts - FAIL (Cannot find @playwright/test)
```

**Exit Code**: 1

### Overall Status

**Validation**: PARTIAL - Build passes, unit tests pass, e2e test config issue

---

## Metrics Summary
- **Security Vulnerabilities**: 5 (credentials exposure, missing validation, SQL pattern)
- **Performance Issues**: 2 (search debounce, Supabase client recreation)
- **Logic Bugs**: 4 (tuzdyk capture, auth cookies, FEN parser, auto-play)
- **Type Safety Issues**: 2 (ReadonlyMap mutation, `null as never` cast)
- **Dead Code Lines**: ~3 (unused imports/props)
- **Debug Statements**: 0
- **Test Coverage**: Low (14 tests cover game engine only; no tests for actions, components, OCR)
- **Technical Debt Score**: Medium

---

## Task List

### Critical Tasks (Fix Immediately)
- [ ] **[CRITICAL-1]** Verify and rotate `SUPABASE_SERVICE_ROLE_KEY` - must not equal anon key
- [ ] **[CRITICAL-2]** Move hardcoded Supabase URL in `next.config.ts` to env variable
- [ ] **[CRITICAL-3]** Add Zod validation to `serverLogin` and `serverRegister` server actions

### High Priority Tasks (Fix Before Deployment)
- [ ] **[HIGH-1]** Fix auth flow: `serverLogin` must set auth cookies for SSR to work
- [ ] **[HIGH-2]** Add Zod validation to all server actions (`createGame`, `saveMoves`, `searchGames`, `uploadScoresheet`, `triggerOCR`)
- [ ] **[HIGH-3]** Audit tuzdyk capture logic for double-counting in `processCaptures`
- [ ] **[HIGH-4]** Fix FEN parser `null as never` cast to proper early return
- [ ] **[HIGH-5]** Fix ReadonlyMap mutation cast in `processCaptures`
- [ ] **[HIGH-6]** Replace `.or()` string interpolation in `searchGames` with builder methods

### Medium Priority Tasks (Schedule for Sprint)
- [ ] **[MEDIUM-1]** Add debounce to archive page search input
- [ ] **[MEDIUM-2]** Fix stale ref in AltchaWidget cleanup
- [ ] **[MEDIUM-3]** Fix stale closure in BatchUpload `processAll`
- [ ] **[MEDIUM-4]** Memoize Supabase client creation in ProfilePage
- [ ] **[MEDIUM-5]** Add bounds checking for `fromIndex` in `executeMove`
- [ ] **[MEDIUM-6]** Add negative score check in `parseFen`
- [ ] **[MEDIUM-7]** Add Error Boundary for game replay page
- [ ] **[MEDIUM-8]** Fix `motion.tr` usage in MoveList (potential hydration issues)
- [ ] **[MEDIUM-9]** Fix auto-play timer race condition in BoardControls
- [ ] **[MEDIUM-10]** Add `useEffect` dependency comment or fix in ProfilePage

### Low Priority Tasks (Backlog)
- [ ] **[LOW-1]** Remove unused `Score` import from `board.ts`
- [ ] **[LOW-2]** Remove unused `index` prop from `Pit` component
- [ ] **[LOW-3]** Exclude `tests/e2e/**` from vitest config (or add `@playwright/test` devDep)
- [ ] **[LOW-4]** Create `.env.example` with placeholder values
- [ ] **[LOW-5]** Extract duplicate FEN replay logic into shared utility

---

## Recommendations

1. **Immediate Actions**:
   - Verify the `SUPABASE_SERVICE_ROLE_KEY` is correct and not equal to the anon key
   - Move the hardcoded Supabase URL to an environment variable
   - Wire up Zod schemas to all server actions (the schemas already exist)
   - Fix the auth flow so login actually sets session cookies

2. **Short-term Improvements**:
   - Add integration tests for server actions
   - Add component tests for the board and OCR flow
   - Add debouncing to search inputs
   - Fix React hook issues (stale closures, missing deps)

3. **Long-term Refactoring**:
   - Extract duplicate FEN replay logic into a shared utility
   - Add comprehensive game engine tests for tuzdyk edge cases
   - Consider using Supabase's built-in auth helpers (`signInWithPassword`) instead of raw fetch
   - Add rate limiting middleware for all server actions

4. **Testing Gaps**:
   - No tests for server actions (auth, games, OCR, upload)
   - No tests for React components
   - No tests for OCR parsing edge cases
   - Game engine tuzdyk tests are minimal (only checks initial state)
   - Missing tests for FEN edge cases (negative values, overflow, malformed strings)

5. **Documentation Needs**:
   - Add `.env.example` for environment variable documentation
   - Document the Supabase schema (no migration files found)

---

## Next Steps

### Immediate Actions (Required)

1. **Fix Critical Security Issues** (Priority 1)
   - Rotate credentials if they have been in git history
   - Verify service role key is correct
   - Add server-side validation

2. **Fix Authentication Flow** (Priority 2)
   - Login must set cookies for server-side auth to function

### Recommended Actions (Optional)

- Schedule high-priority bugs for current sprint
- Add comprehensive test coverage (currently only game engine)
- Plan code cleanup sprint for deduplication

### Follow-Up

- Re-run bug scan after fixes
- Monitor for regression
- Add CI pipeline with lint + type-check + test gates

---

## File-by-File Summary

<details>
<summary>Click to expand detailed file analysis</summary>

### High-Risk Files
1. `src/actions/auth.ts` - CRITICAL: no validation, broken auth flow (no cookies set)
2. `src/actions/games.ts` - HIGH: no validation, SQL pattern risk in `.or()`
3. `src/lib/game-engine/engine.ts` - HIGH: tuzdyk double-counting, ReadonlyMap mutation
4. `next.config.ts` - CRITICAL: hardcoded infrastructure URL
5. `.env.local` - CRITICAL: service role key = anon key

### Clean Files
- `src/schemas/auth.ts` - Well-defined Zod schemas
- `src/schemas/game.ts` - Comprehensive validation rules
- `src/schemas/ocr.ts` - Proper file and move validation
- `src/lib/game-engine/types.ts` - Clean type definitions
- `src/lib/game-engine/pos.ts` - Clean utility functions
- `src/lib/game-engine/piece.ts` - Clean piece helpers
- `src/lib/game-engine/board.ts` - Clean board operations (minor unused import)
- `src/components/ui/skip-link.tsx` - Good accessibility pattern
- `src/components/ui/language-switch.tsx` - Clean i18n switch
- `src/components/board/pit.tsx` - Clean component (minor unused prop)
- `src/components/game/fen-display.tsx` - Clean FEN display with copy/download

</details>

---

## Artifacts

- Bug Report: `bug-hunting-report.md` (this file)

---

*Report generated by bug-hunter agent*
*No modifications were made to the codebase*

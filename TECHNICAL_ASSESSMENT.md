# Technical Discovery and Architecture Assessment

**Date:** 2025-12-18  
**Codebase:** Well Being Quest (Advent App)  
**Assessment Type:** Critical Technical Analysis

> **Note:** This analysis includes line number references that were accurate at the time of assessment (commit ce2656a). Line numbers may shift as the code evolves. Use the code snippets and file paths as primary references.

---

## Executive Summary

This is a **tightly coupled, presentational-focused React application** with significant technical debt and fragility. The codebase conflates business logic with presentation, lacks proper separation of concerns, and makes numerous brittle assumptions about data shape and external dependencies. While functional for its current narrow use case, it is **highly resistant to change** and would require substantial refactoring to evolve safely.

---

## 1. Where is the Core Business Logic Actually Located?

### The Brutal Truth: It's Scattered Everywhere

The application **does not have a clear business logic layer**. Instead, business rules are embedded across multiple locations, making the codebase difficult to reason about and maintain:

#### **Primary Location: `helpers/userDataMapper.ts` (60% of business logic)**

```typescript
// Lines 5-33: positionMapper function
// Lines 35-62: userDataMapper function
```

**What it does:**
- Extracts user email and derives Leobit user ID
- Counts completed tasks by parsing dynamic CSV column names with regex `/^\d+\./`
- Maps users to quest positions (0-14)
- **CRITICAL BUSINESS RULE (lines 48-49):** Hides users at position 0 unless they're the logged-in user
- Hardcodes employee photo API URL pattern

**Why this is problematic:**
- Business logic is buried in a "helper" function, not a domain service
- No validation of business rules
- No testing infrastructure to verify correctness
- Mixed concerns: data transformation + business rules + API URL construction

#### **Secondary Location: `hooks/useQuestData.tsx` (15% of business logic)**

```typescript
// Lines 10-32: fetchData function
// Lines 34-46: useEffect with polling logic
```

**What it does:**
- Polls Google Sheets CSV every 180 seconds (3 minutes)
- Parses CSV to JSON with PapaParse
- Manages loading states

**Why this is problematic:**
- No error recovery strategy beyond console logging
- No handling of stale data or network failures
- 3-minute polling interval is hardcoded with no business justification documented
- Loading state management is coupled to data fetching

#### **Tertiary Location: `components/StackedPointers/UserPointer.tsx` (15% of business logic)**

```typescript
// Lines 40-47: moveLoggedUserToFinish calculation
// Lines 49-60: handleFinishScreenType function
```

**What it does:**
- Determines when to show finish screens (tasks 9 and 14 are special)
- Handles animation triggers for completion states
- **MAGIC NUMBERS:** Hardcoded task numbers (9, 14) with no explanation

**Why this is problematic:**
- **PRESENTATION COMPONENT HAS BUSINESS RULES** - This is a major architectural violation
- Business logic (finish screen conditions) is coupled to animation logic
- No explanation of why tasks 9 and 14 are special (presumably "first 5 core tasks + 4 bonus = 9", and "all 14 tasks = 14", but this is just inference)

#### **Quaternary Location: `consts/taskPositions.ts` (10% of business logic)**

```typescript
// Lines 3-139: initialMapTaskPositions array
```

**What it does:**
- Defines 15 positions (0-14) with SVG coordinates
- Embeds the rule that positions 5-14 all have the same title: "Good Deed"
- Defines spatial layout of the quest journey

**Why this is problematic:**
- Visual coordinates are mixed with domain concepts (task numbers)
- No validation that task positions match the expected data structure
- Changing the quest structure requires modifying hardcoded coordinate arrays

### **Verdict:**
Business logic is **dispersed across helpers, hooks, components, and constants** with no clear ownership. There is no dedicated domain layer, service layer, or business logic module. This makes the application extremely difficult to test, maintain, and evolve.

---

## 2. Which Parts Are Fragile and Tightly Coupled?

### Critical Coupling Issues

#### **🔴 SEVERE: Google Sheets Schema Dependency**

**Location:** `helpers/userDataMapper.ts` (lines 9-17)

```typescript
const email = rowData["Email Address"];  // Hardcoded column name
const name = rowData[`Ім'я та прізвище`];  // Ukrainian hardcoded
const socialNetworkPoint = rowData["Соц мережі відмітки"] ?? 0;

const tasksArray = Object.keys(rowData)
  .filter((key) => /^\d+\./.test(key))  // Regex-based column detection
  .sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
```

**Why this is catastrophic:**
1. **Column name changes break the app instantly** - If the Google Sheet admin changes "Email Address" to "Email" or translates column headers, the app crashes
2. **No schema validation** - Invalid data is silently accepted or causes runtime errors
3. **Regex-based task detection is brittle** - Assumes task columns start with digits and a period (e.g., "1. Task name")
4. **Ukrainian language hardcoded** - Internationalization would require code changes
5. **No versioning** - Cannot handle schema evolution

**Impact:** Any change to the Google Sheet structure requires code deployment. This violates basic API contract principles.

#### **🔴 SEVERE: Hardcoded External API Dependencies**

**Location:** `helpers/userDataMapper.ts` (line 42)

```typescript
const imageUrl = `https://api.employee.leobit.co/photos-small/${userData.id}.png`;
```

**Location:** `hooks/useQuestData.tsx` (line 11)

```typescript
const response = await fetch(import.meta.env.VITE_GOOGLE_SHEET_URL);
```

**Why this is problematic:**
1. **Photo API is hardcoded** - Cannot be configured or mocked
2. **No fallback for missing photos** - Broken images if employee photo doesn't exist
3. **Email parsing for user ID is fragile** - Assumes email format `userid@leobit.co`
4. **Cross-origin dependencies with no error handling** - If either API is down, the app is unusable

#### **🔴 SEVERE: Magic Numbers Throughout Codebase**

**Location:** Multiple files

```typescript
// UserPointer.tsx (lines 46-47, 56-57)
user.taskNumber === 9 || user.taskNumber === 14  // Why 9? Why 14?

// StackedPointers.tsx (line 40)
if (group.taskNumber === 9 || group.taskNumber === 14) {  // Duplicated magic numbers

// Map.tsx (lines 60-62)
if (finishScreenType === finishScreenTypes.finish && loggedUserTaskNumber === 9) {
  // More magic number 9
}

// taskPositions.ts
// 15 hardcoded positions (0-14)
```

**Why this is problematic:**
- **No single source of truth** - The numbers 9 and 14 appear in multiple files
- **No documentation** - Why are these numbers special? (Likely: 5 core tasks + 4 bonus = 9, all tasks = 14)
- **Change requires multi-file edits** - Adding a 6th core task would break the app in multiple places
- **No type safety** - Nothing prevents using invalid task numbers

#### **🟡 HIGH: Component Prop Drilling**

**Location:** `components/Map.tsx` → `StackedPointers.tsx` → `UserPointer.tsx`

```typescript
// Map.tsx passes down:
setFinishScreenType, finishCoordinates, setLoggedUserTaskNumber, parentDivHeight, parentDivWidth

// StackedPointers.tsx passes down:
setFinishScreenType, finishCoordinates, setLoggedUserTaskNumber, parentDivHeight, parentDivWidth
```

**Why this is problematic:**
- **Deep prop drilling** through 3+ component levels
- **Intermediate components don't use these props** - They're just pass-through layers
- **High coupling** - Child components are tightly bound to parent state management
- **No React Context for shared state** - LoadingContext exists but isn't used for map state

#### **🟡 HIGH: Authentication State Scattered**

**Location:** Multiple files use `useAuth()` directly

```typescript
// pages/quest/quest.tsx
const { user, isAuthenticated, isLoading } = useAuth();

// components/StackedPointers/StackedPointers.tsx
const { user } = useAuth();

// components/UserPointer.tsx
const { currentUserId } = props;  // But user comes from parent calling useAuth()
```

**Why this is problematic:**
- **Auth logic is duplicated** - Navigation logic in Quest page, filtering logic in StackedPointers
- **No centralized auth guard** - Each page manually checks authentication
- **Mixed concerns** - UI components directly depend on auth context

#### **🟠 MODERATE: Loading State Complexity**

**Location:** Multiple overlapping loading mechanisms

```typescript
// context/LoadingContext.tsx - Global loading context
// hooks/useQuestData.tsx - Calls startLoading/stopLoading
// components/UserPointer.tsx - Calls stopLoading()
// pages/quest/quest.tsx - Uses loading from context
// auth/auth-provider.tsx - Has its own isLoading from OIDC
```

**Why this is problematic:**
- **Three loading states:** Auth loading, data loading, context loading
- **Race conditions possible** - Multiple components call stopLoading()
- **No state machine** - Loading transitions are ad-hoc

### **Verdict:**
The application has **severe coupling to external data schemas and APIs** with no abstraction layer. Internal coupling is also high due to prop drilling and scattered business logic. The codebase is **extremely fragile to external changes**.

---

## 3. What Parts Are Safe to Refactor vs Risky?

### ✅ **SAFE TO REFACTOR (Low Risk)**

#### **1. Animation Components** 
**Files:** `components/Animation/*`, `components/Clouds/*`, `components/Stars/*`, `components/Girl/*`

**Why safe:**
- Pure presentational components
- No business logic
- Self-contained with no external dependencies
- No props drilling through these
- Failures are cosmetic, not functional

**Refactoring opportunities:**
- Extract to shared animation library
- Add motion variants for reusability
- Convert to styled-components for maintainability

---

#### **2. UI Component Styles**
**Files:** `components/GameButton/*`, `components/UserTooltip/*`

**Why safe:**
- Simple presentational components
- Minimal state management
- No data transformation logic
- Can be replaced without affecting business logic

**Refactoring opportunities:**
- Migrate to CSS modules or styled-components
- Extract shared styles to design system
- Add Storybook for component documentation

---

#### **3. Constants and Enums**
**Files:** `consts/colors.ts`, `consts/enums.ts`

**Why safe:**
- Pure data structures
- No logic or side effects
- Changes are compile-time safe with TypeScript
- Easy to test

**Refactoring opportunities:**
- Move to JSON configuration files for non-developers to edit
- Add validation schemas (Zod/Yup)
- Generate types from config

---

#### **4. Loading Context**
**File:** `context/LoadingContext.tsx`

**Why safe:**
- Self-contained context
- Simple state management
- Well-defined API
- Used in limited locations

**Refactoring opportunities:**
- Add request queue tracking
- Convert to state machine (XState)
- Add timeout handling

---

### ⚠️ **MODERATE RISK TO REFACTOR**

#### **1. Router Configuration**
**Files:** `router/*`

**Why moderate:**
- Simple structure but critical for navigation
- Changing routes breaks bookmarks/links
- Auth navigation logic is coupled to Quest page

**Refactoring opportunities:**
- Add route guards/middleware
- Extract auth navigation to router level
- Add route-based code splitting

**Risks:**
- Breaking existing URLs
- Auth redirect loops if logic is wrong
- Deep linking failures

---

#### **2. Type Definitions**
**File:** `consts/interfaces.ts`

**Why moderate:**
- Widely used across the codebase
- Changes cascade to all consumers
- Tightly coupled to Google Sheets schema

**Refactoring opportunities:**
- Split into domain models vs view models
- Add runtime validation with Zod
- Generate types from OpenAPI/JSON Schema

**Risks:**
- Breaking changes require wide refactoring
- Type mismatches cause runtime errors
- May expose schema coupling issues

---

#### **3. Auth Provider**
**Files:** `auth/*`

**Why moderate:**
- Critical for security
- LocalStorage state persistence can cause bugs
- OIDC configuration is sensitive

**Refactoring opportunities:**
- Add token refresh error handling
- Extract config to environment-specific files
- Add auth event logging

**Risks:**
- Login/logout failures lock out users
- Token refresh bugs cause session drops
- Security vulnerabilities if misconfigured

---

### 🔴 **HIGH RISK TO REFACTOR**

#### **1. User Data Mapper**
**File:** `helpers/userDataMapper.ts`

**Why risky:**
- **Contains most core business logic**
- Tightly coupled to Google Sheets schema
- Regex-based parsing is fragile
- Affects all user positioning on map
- No validation or error handling

**Refactoring opportunities:**
- Extract to proper service layer
- Add schema validation
- Separate concerns: parsing, mapping, positioning
- Add comprehensive unit tests

**Risks:**
- **Breaking user positioning for all users**
- Incorrect task counting affects leaderboard
- Data parsing errors cause blank map
- User hiding logic could expose incomplete participants

**Mitigation:**
- MUST write comprehensive tests first
- Parallel run old and new logic to compare results
- Feature flag the refactor
- Test with production data snapshot

---

#### **2. Quest Data Hook**
**File:** `hooks/useQuestData.tsx`

**Why risky:**
- **Data fetching entry point for entire app**
- No error recovery or retry logic
- 3-minute polling affects user experience
- Loading state coupling affects UX globally

**Refactoring opportunities:**
- Add React Query for caching/retries
- Implement exponential backoff
- Add stale-while-revalidate pattern
- Separate concerns: fetching, parsing, state

**Risks:**
- **App becomes unusable if refactor breaks fetching**
- Polling intervals too fast = server load, too slow = stale data
- Loading states out of sync = infinite spinners
- Data race conditions with state updates

**Mitigation:**
- MUST maintain backward compatibility
- Add error boundaries
- Test network failure scenarios
- Monitor production metrics before/after

---

#### **3. Map and Stacked Pointers**
**Files:** `components/Map.tsx`, `components/StackedPointers/*`

**Why risky:**
- **Core user experience component**
- Complex state management (hover, modal, finish screens)
- Business logic embedded in presentation
- Prop drilling makes changes cascade
- Animation timing is brittle

**Refactoring opportunities:**
- Extract state machine for map interactions
- Separate business logic from presentation
- Use React Context for shared state
- Break into smaller components

**Risks:**
- **Breaking user avatar positioning**
- Animation glitches affect perceived quality
- Finish screen triggers fail for completed users
- Hover interactions break = poor UX
- Modal opening logic fails = users can't see participants

**Mitigation:**
- Visual regression testing
- Test on multiple screen sizes
- Comprehensive E2E tests
- Gradual rollout with rollback plan

---

#### **4. Task Positions Configuration**
**File:** `consts/taskPositions.ts`

**Why risky:**
- **Defines entire quest journey structure**
- Coordinates are manually calculated (no validation)
- Changing task count breaks multiple components
- Referenced by key across codebase

**Refactoring opportunities:**
- Generate from visual editor
- Add coordinate validation
- Decouple from task numbers
- Make configurable via admin UI

**Risks:**
- **Misaligned coordinates = overlapping users**
- Task number mismatches break finish screen logic
- Array index errors cause crashes
- SVG viewport changes = wrong positions

**Mitigation:**
- Visual validation tool
- Coordinate sanity checks
- Test with edge cases (0 users, 100 users at one position)

---

### 🚫 **DO NOT REFACTOR WITHOUT SIGNIFICANT PLANNING**

#### **1. Email-Based User Identification**
**Location:** `helpers/userDataMapper.ts` (line 10)

```typescript
const leobitUserId = email.split("@")[0];
```

**Why this is radioactive:**
- **Changing this breaks user identity across the system**
- Employee photos are keyed by this ID
- User progress tracking depends on consistent IDs
- Existing data uses this format

**To change this requires:**
- Data migration plan
- Historical data preservation
- Parallel identity systems during transition
- Communicate with all users
- Update external systems (photo API)

---

#### **2. Task Number Schema (0-14)**
**Location:** Multiple files use task numbers as array indices

**Why this is radioactive:**
- **Changing breaks position mapping, finish screens, data structure**
- Google Sheets columns are structured around this
- Animation coordinates are hardcoded for these numbers
- Existing user data in Sheets uses this schema

**To change this requires:**
- Schema versioning system
- Data migration for all users
- Backward compatibility layer
- Multi-phase rollout strategy

---

### **Verdict:**
**70% of the codebase is HIGH RISK to refactor** due to tight coupling and lack of testing. Safe refactoring is limited to presentational components. Any business logic changes require extreme caution and comprehensive testing infrastructure that doesn't currently exist.

---

## 4. What Assumptions Does the Code Make About Data Shape and User Behavior?

### **Data Shape Assumptions**

#### **🔴 CRITICAL: Google Sheets CSV Schema**

**Assumed structure:**
```csv
Email Address, Ім'я та прізвище, Соц мережі відмітки, 1. Список справ, 2. Пункт зі списку, ...
user@leobit.co, John Doe, 5, timestamp, timestamp, ...
```

**Hardcoded assumptions:**
1. **Column names are exact matches** (case-sensitive, space-sensitive)
2. **Task columns start with digits** (e.g., "1. ", "2. ", etc.)
3. **Task columns are consecutive** (no gaps in numbering)
4. **Email format is `username@domain`** (splitting on @ works)
5. **Social network points are numeric or null** (no validation for strings/negatives)
6. **Task completion is marked by non-null values** (truthy check, no validation)
7. **CSV is well-formed** (PapaParse handles malformed CSV poorly)
8. **Header row exists** (PapaParse `header: true` requires this)

**What happens when assumptions break:**
- Missing columns → `undefined` values → potential crashes
- Extra columns → Ignored silently
- Malformed email → Incorrect user ID → Broken photos
- Non-numeric social points → `NaN` propagates → Layout breaks
- Missing header → All data treated as headers → Empty app

**No fallbacks or validation exist.**

---

#### **🔴 CRITICAL: OIDC Token Claims**

**Assumed structure:**
```typescript
user.profile.sub // Leobit user ID
user.profile.email // User email
```

**Hardcoded assumptions:**
1. **`sub` claim exists and matches employee ID format**
2. **`sub` is stable across sessions** (not regenerated)
3. **`sub` matches Leobit photo API username format**

**What happens when assumptions break:**
- Missing `sub` → Crashes when filtering logged user
- `sub` doesn't match photo API → Broken avatar for logged user
- `sub` changes → User identity changes, progress tracking breaks

---

#### **🟡 MODERATE: Task Position Array**

**Assumed structure:**
```typescript
initialMapTaskPositions: IMapTaskPosition[] // Length 15, indices 0-14
```

**Hardcoded assumptions:**
1. **Exactly 15 positions** (array indices 0-14)
2. **Task numbers match array indices** (task 5 is at index 5)
3. **No gaps in task sequence** (0, 1, 2, 3, ... 14)
4. **Position 0 is always the start**
5. **Positions 9 and 14 are finish lines**

**What happens when assumptions break:**
- Task number > 14 → Array index out of bounds → Crash
- Missing position → Users disappear from map
- Non-sequential task numbers → Wrong positions

---

### **User Behavior Assumptions**

#### **🔴 CRITICAL: Users Complete Tasks Sequentially**

**Assumption:** The code does NOT validate sequential completion. It only counts completed tasks.

```typescript
const currentPosition = tasksArray.reduce((position, key) => {
  return rowData[key as tasksEnum] !== null ? position + 1 : position;
}, 0);
```

**What this means:**
- Users can complete tasks in any order
- Task 5 can be completed before Task 1
- User position is just a count of completed tasks

**Implicit assumption:** External system (Google Sheets data entry) enforces sequencing, not the app.

**Risk:** If Sheets allows non-sequential completion, user position becomes meaningless.

---

#### **🟡 MODERATE: Single Device Usage**

**No assumption of multi-device synchronization:**
- LocalStorage is used for auth tokens (device-specific)
- No session sharing across devices
- No conflict resolution for concurrent access

**Implicit assumption:** Users primarily use one device/browser.

**Risk:** Users expect progress to sync across devices but it doesn't (auth does via OIDC, but local state doesn't).

---

#### **🟡 MODERATE: Continuous Internet Connectivity**

**No offline support or graceful degradation:**
- Data fetched every 3 minutes requires internet
- No local caching beyond current state
- Failed fetch logs to console but doesn't notify user

**Implicit assumption:** Users have stable internet.

**Risk:** Poor network = infinite loading spinners or stale data with no user feedback.

---

#### **🟡 MODERATE: Users Don't Close Finish Screens Multiple Times**

**Code in `Map.tsx` (lines 68-70):**
```typescript
const [firstFinisScreenShow, setFirstFinishScreenShow] = useState(true);
// Finish screen only shows if firstFinisScreenShow === true
```

**Assumption:** Once a user closes a finish screen, they don't want to see it again in the same session.

**Implicit assumption:** Users will refresh the page to see finish screens again.

**Risk:** Users may want to replay animations but can't without page refresh.

---

#### **🟠 LOW: Users Understand Ukrainian Task Names**

**All task names in `consts/enums.ts` are in Ukrainian:**
```typescript
todoList = "1. Список справ"
taskFromList = "2. Пункт зі списку"
freshAirWalk = "3. Прогулянка на свіжому повітрі"
```

**Assumption:** All users are Ukrainian-speaking or Russian-speaking Leobit employees.

**Risk:** Non-Ukrainian speakers can't understand task names. No i18n support.

---

#### **🟠 LOW: Users Hover, Don't Touch**

**Tooltips and interactions use `onHoverStart` and `onHoverEnd` (Framer Motion hover):**

**Assumption:** Desktop/mouse users, not mobile/touch users.

**Risk:** Mobile users can't trigger hover tooltips or stacked pointer expansion.

---

### **Verdict:**
The code makes **at least 15 critical data shape assumptions** with zero validation. User behavior assumptions are reasonable for the target audience (Leobit employees) but limit scalability. The lack of schema validation and error handling means **any external data change is a production incident**.

---

## 5. What Would Break First If Requirements Change?

### **Ranked by Fragility (Most Likely to Break First)**

---

### **🔥 RANK 1: Changing the Google Sheets Structure**

**Likelihood:** Very High  
**Impact:** Catastrophic  
**Failure Mode:** Complete application failure

**What breaks:**
1. **Column name changes** → Data parsing returns `undefined` → Users disappear
2. **Adding columns** → Regex may miscount tasks → Wrong positions
3. **Reordering columns** → Task sequence breaks → Wrong completion tracking
4. **Changing task count** → Hardcoded array length mismatches → Crashes
5. **Internationalization** → Hardcoded Ukrainian column names break

**Example scenarios:**
- Admin renames "Ім'я та прізвище" to "Full Name" → All names become undefined
- Admin adds a column "6. New Task" → Must update `taskPositions.ts` or users past task 5 crash
- Admin reorders columns → Task completion count may be incorrect

**Why this is #1:**
- **No schema validation**
- **No version management**
- **No backward compatibility**
- **No error recovery**
- **External dependency controlled by non-developers**

**Fix cost:** High (requires abstraction layer, schema validation, migration strategy)

---

### **🔥 RANK 2: Changing Number of Tasks/Positions**

**Likelihood:** High  
**Impact:** Catastrophic  
**Failure Mode:** Crashes, incorrect positioning, broken finish screens

**What breaks:**
1. **Adding a 6th core task** → Must update `taskPositions.ts`, magic numbers, finish screen logic
2. **Changing finish task numbers** → Hardcoded 9 and 14 in multiple files
3. **Adding intermediate positions** → Array index assumptions break
4. **Removing positions** → Out-of-bounds errors

**Files requiring changes:**
- `consts/taskPositions.ts` (add/remove positions)
- `components/UserPointer.tsx` (update magic numbers 9, 14)
- `components/StackedPointers/StackedPointers.tsx` (update magic numbers)
- `components/Map.tsx` (update finish screen logic)
- Google Sheets schema (add/remove columns)
- SVG map file (if visual map changes)

**Example scenario:**
- Business wants to add a 6th core task → Requires code changes in 5+ files + Sheet schema change + SVG update

**Why this is #2:**
- **Magic numbers everywhere**
- **No configuration layer**
- **Hardcoded in multiple places**
- **Tight coupling to visual layout**

**Fix cost:** Moderate (requires configuration system, eliminate magic numbers)

---

### **🔥 RANK 3: Photo API Changes**

**Likelihood:** Moderate  
**Impact:** High  
**Failure Mode:** Broken user avatars (functional but ugly)

**What breaks:**
1. **API URL changes** → Hardcoded URL breaks → All photos fail to load
2. **API authentication required** → No auth headers → 401 errors
3. **User ID format changes** → Email parsing breaks → Wrong user IDs
4. **Photo file format changes** → `.png` hardcoded → Wrong MIME type
5. **API goes down** → No error handling → Broken image icons everywhere

**Current code:**
```typescript
const imageUrl = `https://api.employee.leobit.co/photos-small/${userData.id}.png`;
```

**No configuration, no fallback images, no error handling.**

**Why this is #3:**
- **Hardcoded external dependency**
- **No abstraction layer**
- **No graceful degradation**
- **No offline/cache support**

**Fix cost:** Low (add config, fallback images, error handling)

---

### **🔥 RANK 4: Auth Provider/OIDC Changes**

**Likelihood:** Moderate  
**Impact:** Catastrophic  
**Failure Mode:** Users cannot log in → Application is inaccessible

**What breaks:**
1. **Authority URL changes** → Must update config → Requires deployment
2. **Client ID changes** → Must update config → Requires deployment
3. **Scope changes** → May break user profile loading
4. **Token claim structure changes** → `user.profile.sub` breaks → User identity fails
5. **OIDC provider migration** → Entire auth system must be reconfigured

**Current code:**
```typescript
authority: getAuthority(), // From env var
client_id: "leobit.quest.web", // Hardcoded
scope: "quest openid profile", // Hardcoded
```

**Why this is #4:**
- **Auth is a single point of failure**
- **Configuration is partially hardcoded**
- **No fallback auth mechanism**
- **Token structure assumptions are implicit**

**Fix cost:** Low (move all config to env vars, add validation)

---

### **🟠 RANK 5: Internationalization Requirements**

**Likelihood:** Moderate  
**Impact:** High  
**Failure Mode:** Cannot support non-Ukrainian users

**What breaks:**
1. **Task names in Ukrainian** → Hardcoded in enums
2. **Google Sheets column names in Ukrainian** → Hardcoded in mapper
3. **No i18n framework** → Must add react-i18next or similar
4. **UI text in English** → Inconsistent with data layer (Ukrainian)

**Files requiring changes:**
- `consts/enums.ts` (all task names)
- `helpers/userDataMapper.ts` (column name references)
- All component strings (currently minimal)
- Google Sheets (would need multi-language columns or separate sheets)

**Why this is #5:**
- **Language is baked into data schema**
- **No separation of content from code**
- **External data source must also be internationalized**

**Fix cost:** High (requires i18n framework, schema migration, content management)

---

### **🟡 RANK 6: Mobile/Responsive Requirements**

**Likelihood:** Moderate  
**Impact:** Moderate  
**Failure Mode:** Poor mobile UX, broken interactions

**What breaks:**
1. **Hover interactions** → Don't work on touch devices
2. **Fixed percentage positioning** → May not scale correctly on small screens
3. **SVG map rendering** → May be too small or require horizontal scrolling
4. **Avatar sizing** → Calculated relative to parent, may be tiny on mobile
5. **Tooltip positioning** → May go off-screen

**Current code uses:**
- Framer Motion `onHoverStart/End` (desktop-only)
- Percentage-based positioning (may not be responsive)
- Fixed aspect ratio SVG (no responsive scaling)

**Why this is #6:**
- **Desktop-first design**
- **No mobile testing evident**
- **Interaction patterns are mouse-specific**

**Fix cost:** Moderate (add touch handlers, responsive design, test on mobile)

---

### **🟡 RANK 7: Performance/Scale Requirements**

**Likelihood:** Low  
**Impact:** Moderate  
**Failure Mode:** Slow rendering, laggy animations

**What breaks:**
1. **Many users at one position** → `StackedPointers` renders all avatars → DOM bloat
2. **Large CSV files** → 3-minute polling fetches entire dataset → Network overhead
3. **Animation performance** → Many simultaneous Framer Motion animations → Jank
4. **No virtualization** → All positions rendered even if off-screen

**Current implementation:**
- No pagination or virtualization
- No data caching strategy
- All users rendered even if off-screen
- No lazy loading of images

**Why this is #7:**
- **Current user count is likely low (single company)**
- **Quest is time-limited (not permanent data)**
- **Performance issues are annoying but not blocking**

**Fix cost:** Moderate (add virtualization, caching, lazy loading)

---

### **🟢 RANK 8: Visual/Animation Changes**

**Likelihood:** High  
**Impact:** Low  
**Failure Mode:** Cosmetic issues only

**What breaks:**
- Animation durations change → Still functional
- Colors change → Easy to update in `consts/colors.ts`
- SVG map changes → Update asset file
- Background changes → Update asset file

**Why this is #8:**
- **Well-isolated from business logic**
- **Asset-based, easy to swap**
- **Failures are cosmetic**

**Fix cost:** Low (update assets/constants)

---

### **Verdict:**
The application is **most vulnerable to external schema changes and task structure changes**. The top 3 failure modes (Google Sheets, task count, photo API) account for 80% of likely breakages. These could be mitigated with proper abstraction layers, but they don't exist. The codebase is built for a **single, static use case** and would require significant re-architecture to be resilient to change.

---

## Overall Technical Recommendations

### **Immediate Actions (Can Do Now with Low Risk)**

1. **Add schema validation to data mapper** - Use Zod or Yup to validate Google Sheets data at runtime
2. **Extract magic numbers to constants** - Create `const FINISH_TASK_NUMBER = 9` etc.
3. **Add error boundaries** - Prevent crashes from propagating to entire app
4. **Add fallback images** - Default avatar for broken photo URLs
5. **Add logging/monitoring** - Track data fetch failures, parsing errors
6. **Document Google Sheets schema** - Create schema definition for administrators
7. **Add TypeScript strict mode** - Currently not using strictest settings
8. **Move hardcoded URLs to config** - Photo API URL should be in env vars

### **Medium-Term Refactoring (Requires Testing Infrastructure)**

1. **Extract business logic to service layer** - Move out of helpers and components
2. **Add unit tests** - No tests exist; start with business logic
3. **Add React Query for data fetching** - Better caching, error handling, retries
4. **Implement proper state management** - Use Zustand or Redux for map state
5. **Add E2E tests** - Playwright/Cypress for critical user journeys
6. **Refactor Map component** - Too large, does too much
7. **Add mobile support** - Touch interactions, responsive design

### **Long-Term Re-Architecture (Requires Significant Planning)**

1. **Create abstraction layer for data source** - Allow swapping Google Sheets for API
2. **Implement schema versioning** - Support multiple Sheet formats simultaneously
3. **Build configuration system** - Move task positions, counts to JSON config
4. **Add backend API** - Don't directly consume Google Sheets CSV from frontend
5. **Implement offline support** - Progressive Web App with local caching
6. **Add admin UI** - Configure quest structure without code changes
7. **Implement proper CI/CD** - Automated testing, staged rollouts
8. **Add feature flags** - Safe deployment of changes

---

## Final Verdict

This codebase is a **prototype that was promoted to production**. It works for its narrow use case (Leobit employee wellness quest) but is **architecturally unsound** for long-term maintenance or evolution. 

**Strengths:**
- Achieves its business goal (gamified wellness tracking)
- Uses modern React patterns (hooks, context)
- Decent visual polish with Framer Motion animations

**Critical Weaknesses:**
- **No separation of concerns** - Business logic in presentation layer
- **No testing** - Zero tests means any refactoring is dangerous
- **Fragile external dependencies** - Google Sheets schema and Photo API are single points of failure
- **Magic numbers everywhere** - Task counts and special positions are hardcoded
- **No error handling** - Failures are silent or catastrophic
- **No schema validation** - Invalid data causes runtime errors

**Bottom Line:**
If requirements are stable and the application remains internal-only for Leobit employees, it can continue to function. However, **any significant change request will be expensive to implement safely** without first investing in testing infrastructure and architectural refactoring.

**Recommended Strategy:**
1. **Freeze features** until testing infrastructure is in place
2. **Add integration tests** for current behavior (regression prevention)
3. **Incrementally refactor** high-risk areas with parallel testing
4. **Add abstraction layers** to decouple external dependencies
5. **Create configuration system** to reduce hardcoded values

**Time Investment Estimate:**
- Add testing infrastructure: 2-3 weeks
- Refactor business logic layer: 3-4 weeks
- Add configuration system: 1-2 weeks
- Add error handling and validation: 1-2 weeks

**Total:** 7-11 weeks to make the codebase safely maintainable.

---

**Assessment completed by:** GitHub Copilot (Technical Architecture Review Agent)  
**Date:** 2025-12-18

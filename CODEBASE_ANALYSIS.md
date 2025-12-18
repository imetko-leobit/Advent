# High-Level Codebase Analysis and Application Overview

## 1. Application Type and Business Domain

**Application Name:** Well Being Quest (Advent App)

**Business Domain:** Employee wellness and engagement

**Purpose:** An interactive gamified wellness tracking application designed to encourage employees to complete wellness tasks and track their progress on a visual quest map.

**Target Users:** Leobit company employees (internal enterprise application)

**Key Characteristics:**
- Gamified wellness challenge/quest system
- Progress visualization through an interactive SVG map
- Social engagement through user avatar positioning and social network points
- Task-based progression system (5 main wellness tasks + 9 additional "good deed" tasks)

## 2. Main Entry Points

### Frontend Application (Single Entry Point)
- **Primary Entry:** `/src/main.tsx`
  - Initializes React application
  - Sets up authentication provider (OIDC)
  - Configures loading state context
  - Mounts the application to DOM

### Routes
- `/` - Root path (redirects to `/quest`)
- `/login` - Authentication page
- `/quest` - Main quest/game page (primary application interface)

### Data Sources
- **External Data:** Google Sheets CSV export (fetched via `VITE_GOOGLE_SHEET_URL`)
- **Authentication:** OIDC authentication server (`VITE_APP_AUTH_AUTHORITY`)
- **User Avatars:** Leobit employee photo API (`https://api.employee.leobit.co/photos-small/{id}.png`)

## 3. Core Technologies, Frameworks, and Libraries

### Frontend Stack
- **Framework:** React 18.2.0 with TypeScript 5.2.2
- **Build Tool:** Vite 5.0.8 (modern fast build tool with HMR)
- **Routing:** React Router DOM 6.22.0

### UI and Visualization
- **UI Component Library:** PrimeReact 10.3.3 (buttons, panels, progress spinners)
- **Animations:** Framer Motion 11.0.3 (smooth transitions and animations)
- **Graphics:** SVG-based interactive map visualization

### Authentication and Security
- **Authentication:** OpenID Connect (OIDC)
  - `oidc-client-ts` 3.0.0
  - `react-oidc-context` 3.0.0
  - Client ID: `leobit.quest.web`
  - Scopes: `quest openid profile`

### Data Processing
- **CSV Parsing:** PapaCSV 5.4.1 (for Google Sheets data)
- **Smooth Scrolling:** React Scroll 1.9.0

### Development Tools
- **Linting:** ESLint 8.55.0 with TypeScript and React plugins
- **Code Formatting:** Prettier
- **CI/CD:** GitLab CI (.gitlab-ci.yml)

## 4. High-Level Architecture Overview

### Architecture Pattern
**Single Page Application (SPA)** with component-based architecture

### Major Layers and Components

#### 1. **Entry Layer** (`/src/main.tsx`)
- Application initialization
- Global providers setup (Auth, Loading state)

#### 2. **Routing Layer** (`/src/router/`)
- Route definitions and navigation
- Path management through `PathsEnum`
- Protected routes with authentication checks

#### 3. **Page Layer** (`/src/pages/`)
- **Login Page:** Handles OIDC authentication flow, redirect after login
- **Quest Page:** Main application interface, displays the wellness quest map

#### 4. **Authentication Layer** (`/src/auth/`)
- OIDC configuration and provider wrapper
- Automatic silent token renewal
- User profile loading and management
- LocalStorage-based state persistence

#### 5. **Data Management Layer**
- **Hooks** (`/src/hooks/`):
  - `useQuestData`: Fetches and parses CSV data from Google Sheets every 3 minutes
- **Context** (`/src/context/`):
  - `LoadingContext`: Global loading state management
- **Helpers** (`/src/helpers/`):
  - `userDataMapper`: Maps CSV data to user positions on the quest map
  - Position and layout calculations for UI elements

#### 6. **Component Layer** (`/src/components/`)
Modular UI components:
- **Map.tsx:** Main interactive SVG map container
- **Step:** Individual quest step visualization
- **StackedPointers:** Displays multiple user avatars at the same position
- **PointersModal:** Modal for viewing users at a specific location
- **UserTooltip:** Shows user details on hover
- **GameButton:** Scroll navigation to map
- **FinishScreen:** Completion/achievement screens (finish/dzen states)
- **Animation:** Visual effects (Stars, Clouds, Girl character)

#### 7. **Constants and Types** (`/src/consts/`)
- Type definitions (interfaces)
- Enumerations (tasks, data keys, storage keys)
- Task position coordinates on the map
- SVG step configurations
- Color schemes

#### 8. **Assets** (`/src/assets/`)
- SVG graphics for map, backgrounds, pointers, animations
- Static visual resources organized by type

### Data Flow
1. **User authenticates** via OIDC → Token stored in localStorage
2. **Quest page loads** → Fetches CSV data from Google Sheets
3. **Data processing** → CSV parsed → Mapped to user positions based on completed tasks
4. **Visualization** → Users positioned on SVG map as avatars
5. **Real-time updates** → Data refreshed every 3 minutes
6. **Interaction** → Users can view other participants, see completion screens

### Component Communication
- **Props drilling** for component hierarchy
- **React Context** for global state (loading, authentication)
- **Hooks** for data fetching and reusable logic
- **OIDC context** for authentication state

## 5. Main Problem the Application Solves

### Primary Problem
**Lack of engagement and visibility in employee wellness initiatives.** Traditional wellness programs often suffer from low participation and lack of motivation.

### How It Solves It
1. **Gamification:** Transforms wellness tasks into an interactive quest/journey
2. **Visual Progress:** Users see their progress and others' progress on an engaging map
3. **Social Accountability:** User avatars visible to others encourage participation
4. **Real-time Tracking:** Live updates from Google Sheets enable dynamic progress tracking
5. **Achievement Recognition:** Finish screens celebrate task completion
6. **Convenience:** No data entry in the app - uses Google Sheets as backend
7. **Low-barrier Entry:** Simple, visual interface reduces friction for participation

### Task Structure
- **5 core wellness tasks:** To-do list, task completion, fresh air walk, gratitude list, good deed
- **9 additional positions:** Extended "good deed" tasks for continued engagement
- **Social media integration:** Points for social network mentions/shares
- **Family participation:** Option to participate with kids

## 6. Assumptions and Areas Requiring Further Investigation

### Assumptions
1. **Data Source:** Assumes Google Sheets is maintained externally with specific column structure
2. **User Identification:** Uses email prefix (before @) as Leobit user ID for avatar retrieval
3. **Single Company Deployment:** Hardcoded to Leobit company infrastructure (photo API, OIDC client)
4. **CSV Structure:** Expects specific columns in Ukrainian language with predefined task naming
5. **Network Reliability:** No offline support; requires internet connectivity
6. **Avatar Availability:** Assumes all employee photos exist in the photo API
7. **Browser Compatibility:** Modern browser with SVG and ES6+ support required

### Unclear Areas Requiring Investigation

#### 1. **Google Sheets Integration**
- What is the exact schema/structure of the Google Sheets document?
- Who maintains and updates the task completion data?
- Is there a manual approval process for task completion?
- How are new users added to the sheet?

#### 2. **Authentication Details**
- What OIDC provider is being used? (Keycloak, Auth0, Azure AD?)
- What are the user registration/provisioning flows?
- Are there admin roles or is everyone equal?

#### 3. **Task Completion Mechanism**
- How do users mark tasks as completed?
- Is it self-reported in Google Sheets?
- Is there verification or approval workflow?
- What triggers the timestamp/completion flag?

#### 4. **Social Network Points**
- How are social network points calculated and awarded?
- What constitutes a valid social media mention?
- Is there moderation of social posts?

#### 5. **Quest Duration and Lifecycle**
- Is this a time-limited challenge (e.g., December Advent)?
- What happens when users complete all tasks?
- Is the data reset periodically?
- Historical data retention policy?

#### 6. **Scalability and Performance**
- Current number of active users?
- Performance with large user counts?
- SVG rendering performance with many stacked avatars?
- Polling every 3 minutes - does this create issues?

#### 7. **Error Handling and Edge Cases**
- What happens if Google Sheets URL is unreachable?
- How are malformed CSV records handled?
- What if user photos don't exist?
- Handling of duplicate email addresses?

#### 8. **Internationalization**
- Why is task data in Ukrainian but UI title in English?
- Is there a plan for multi-language support?
- Is this used only in Ukraine offices?

#### 9. **Mobile Responsiveness**
- How does the SVG map render on mobile devices?
- Touch interaction support?
- Mobile-specific optimizations?

#### 10. **Monitoring and Analytics**
- Are there analytics on user engagement?
- Error logging and monitoring setup?
- Usage metrics tracked?

#### 11. **Deployment and Environment**
- Production URL and hosting platform?
- Environment management (dev, staging, prod)?
- CI/CD pipeline details from GitLab?
- Rollback procedures?

#### 12. **Testing Strategy**
- No test files found in repository
- Testing approach for complex SVG interactions?
- E2E testing strategy?
- Manual QA process?

---

**Document Created:** 2025-12-18  
**Codebase Version:** Analyzed from commit 2ad4adb  
**Total Source Files:** 85 (33 TypeScript/TSX files)

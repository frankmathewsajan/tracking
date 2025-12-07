# Copilot Instructions for this repo

## Architecture & Stack
- Next.js 16 app router with React 19; client components dominate dashboards; styling via Tailwind (v4 config) plus framer-motion/lucide-react for UI.
- Firebase client SDK in `firebase.ts` (auth, Google provider, Firestore) and server-side Admin SDK in `lib/firebaseAdmin.ts` (initializes with `FIREBASE_PRIVATE_KEY` newline replacement).
- App-wide auth context in `providers/AuthProvider.tsx` wraps `RootLayout`; use `useAuth()` for `user`/`loading` in client components.

## Auth, Sessions, Routing
- Sign-in flow: `components/common/login.tsx` uses Google popup → `user.getIdToken()` → POST `/api/auth/session` to create httpOnly `session` cookie and bootstrap user doc with default `role: member` and `clubIds: []`.
- Auth guard: `middleware.ts` runs on `/dashboard/**` and `/a/**`; reads `session` cookie, calls `/api/auth/check-role` (verifies session cookie server-side) and redirects to role-specific dashboards (`/dashboard/sa`, `/dashboard/c`, `/dashboard/m`). Missing/invalid session redirects home.
- Logout via `DashboardNavbar` uses Firebase `signOut` then client redirect; session cookie cleared on next request.

## Firestore Data Model (implicit)
- `users` docs keyed by UID: `{ email, name, photoURL, role, clubIds: [{ clubId, department }], createdAt }`; role updated when admins are accepted.
- `clubs` docs: `{ name, departments: string[], adminIds: string[] (emails), memberIds: string[] (UIDs), createdAt }`.
- `tempUser` collection holds applications: `{ userId, email, name, clubId, department, role, appliedAt }`.
- `progress` collection stores tasks: `{ clubId, userId, title, description, status (0-100), dueDate, createdAt, givenBy: 'club' | 'self' }`.

## API Route Patterns (Next.js app router)
- Every API handler grabs `session` cookie, verifies with `authAdmin.verifySessionCookie(session, true)`; return 401 if missing/invalid.
- Authorization checks match collection fields: super admin endpoints ensure `users.role === 'super_admin'`; admin endpoints check `decodedToken.email` is in `club.adminIds`; member endpoints confirm `club.memberIds` or user clubIds contain the club.
- Requests expect JSON bodies with strict required fields (e.g., `give-task` requires all task fields; `create-department` requires `clubId` and `department`). Respond with 400 on missing, 403 on forbidden, 404 on missing doc, 500 on catch.
- Accept/reject flows: `/api/user/clubs/apply` writes to `tempUser`; `/api/admin/members/get-applicants` lists by `clubId`; `/api/admin/members/accept` moves applicant into `clubs.memberIds` (and optionally `adminIds`), updates user role/clubIds, then deletes `tempUser` doc.
- Tasks: admins assign via `/api/admin/tasks/give-task`; members add personal tasks via `/api/user/tasks/add-task`; members update status via `/api/user/tasks/update-progress` (must own task, status 0–100).

## Frontend Patterns
- Pages under `/dashboard/{sa,c,m}` are client components that fetch corresponding API routes (e.g., super admin uses `/api/superadmin/clubs/*`, admins fetch `/api/admin/clubs/get-my-clubs`, members fetch `/api/user/clubs/get-all-clubs`). Keep fetches client-side and rely on middleware for gating.
- Dashboard cards assume Firestore timestamps shape `{ _seconds, _nanoseconds }`; when introducing new date fields keep this shape or normalize before rendering.
- Admin checks in UI often rely on email matching `adminIds`; member identity uses UID.

## Environment & Tooling
- Required env vars: `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID`, `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`, `FIREBASE_PRIVATE_KEY` (with escaped newlines), `FIREBASE_ADMIN_CLIENT_EMAIL`.
- Scripts: `npm run dev` (Next dev), `npm run build`, `npm run start`, `npm run lint` (eslint-config-next). No custom test suite.

## When extending the project
- New API handlers should follow existing auth/authorization template (session cookie → verify → role/ownership check → typed 4xx). Reuse Admin SDK from `lib/firebaseAdmin` to avoid duplicate initialization.
- Preserve role-based redirects in middleware; if adding new protected routes include them in `matcher` and route them to the correct dashboard prefix.
- When adding Firestore fields, update both client renderers and acceptance/mutation routes to keep `clubIds`, `adminIds`, and `memberIds` in sync.
- Keep client data fetching resilient: handle 401/403 by redirecting or showing errors, and consider re-fetch after mutations like create/modify/delete club.

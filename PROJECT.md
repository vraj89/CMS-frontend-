# Prelytix CMS — Enterprise Multi-Role Content Management & Client Approval Workflow Platform

Prelytix CMS is a production-style agency content operations platform that takes a client engagement from onboarding all the way to publishing. Six roles — Marketing, Admin, Task Manager, Content Writer, Video Editor and Client — collaborate inside one workspace with strict role-based access control, so work only moves forward when the right person signs off on it.

Every deliverable follows the same pipeline: **Marketing onboards the client → Admin verifies the account → Admin creates the project → Task Manager allocates production work → Writers and Editors submit content and media → the Client approves or requests a revision → revisions are versioned and resolved → milestones are tracked as payments → every action lands in an immutable audit trail.** The stack is deliberately small — React + Vite on the front, Express + JWT on the back, and 11 CSV files as the durable datastore — so the whole system can be deployed, demoed and explained end to end in five minutes.

| Repo | Contents |
| --- | --- |
| `CMS-frontend-` | React + Vite client (this folder's `frontend/`) |
| `CMS-backend-` | Express API + CSV datastore (this folder's `backend/`) |

---

## Tech stack

| Layer | Technology | Why |
| --- | --- | --- |
| Frontend | React 18 + Vite | Fast dev server, tiny production bundle |
| Routing | React Router DOM v6 | Nested role-guarded routes |
| Styling | Tailwind CSS 3 | Utility-first SaaS design system, no component library |
| State | Context API (`AuthContext`) | Auth only — Redux is unnecessary for this scope |
| HTTP | Axios + interceptors | JWT attach, global 401 handling |
| Charts | Recharts | Task-status bar chart on the dashboard |
| Icons / toasts | Lucide React, react-hot-toast | Consistent iconography and feedback |
| Backend | Node.js + Express 4 | Simple, deployable REST API |
| Auth | jsonwebtoken + bcryptjs | 7-day JWT, hashed passwords |
| Datastore | CSV via `csv-parse` / `csv-stringify` | No database server; files are the source of truth |
| Hosting | Vercel (frontend) · Render (backend) | Static SPA + Node web service |

---

## Feature set

- **6-role RBAC** enforced on both sides: menu filtering on the client, `roleMiddleware` on every API mutation.
- **Client onboarding** by Marketing with an Admin verification gate before any project can be created.
- **Project delivery tracking** with a derived progress bar (approved tasks + content + media).
- **Task allocation board** (Pending / In Progress / Submitted) with notifications to the assignee.
- **Versioned content and media** — editing a body or asset URL publishes a new version, revision resolution bumps the version again.
- **Client review portal** — preview copy, images and video, then Approve or Request Revision with a comment.
- **Milestone payments** with collected/outstanding totals and mark-as-paid.
- **In-app notifications** with unread indicators in the header bell and sidebar.
- **Admin audit log** recording user, action, entity and timestamp for every mutation.
- **Role-aware dashboard** — four KPI cards, task-status chart, recent activity, recent notifications.

---

## Project structure

```
prelytix-cms/
├── backend/
│   ├── data/                     # 11 seeded CSV tables
│   ├── src/
│   │   ├── db/{csvStore.js,seed.js}
│   │   ├── middleware/{auth.js,role.js}
│   │   ├── routes/               # auth, users, clients, projects, tasks, content,
│   │   │                         # media, approvals, revisions, payments,
│   │   │                         # notifications, auditLogs, dashboard
│   │   ├── utils/{audit.js,notify.js}
│   │   └── server.js
│   ├── server.js                 # root entry (node server.js)
│   ├── package.json · .env.example · render.yaml
└── frontend/
    ├── src/
    │   ├── api/axios.js
    │   ├── context/AuthContext.jsx
    │   ├── components/           # Layout, Sidebar, Header, StatCard, Badge, Modal,
    │   │                         # ProtectedRoute, EmptyState, Skeleton
    │   ├── pages/                # Login, Dashboard, Clients, Projects, ProjectDetail,
    │   │                         # Tasks, Content, Media, Review, Payments,
    │   │                         # Notifications, AuditLogs
    │   ├── utils/format.js
    │   ├── App.jsx · main.jsx · index.css
    ├── tailwind.config.js · vite.config.js · vercel.json
    └── package.json · .env.example
```

---

## Local setup

**Backend** (terminal 1):

```bash
cd backend
npm install
cp .env.example .env      # optional — sane defaults are built in
npm run dev               # http://localhost:5000
```

The 11 CSV files in `backend/data/` are created and seeded automatically on first boot. Check the API with `curl http://localhost:5000/api/health`.

**Frontend** (terminal 2):

```bash
cd frontend
npm install
cp .env.example .env      # VITE_API_URL=http://localhost:5000/api
npm run dev               # http://localhost:5173
```

> On Windows PowerShell use `Copy-Item .env.example .env`.

---

## Demo credentials

All accounts use the password **`password123`**. The login screen also has six quick-login chips that sign you in with one click.

| Email | Role | Name |
| --- | --- | --- |
| `marketing@prelytix.com` | Marketing | Riya Shah |
| `admin@prelytix.com` | Admin | Piyush Suthar |
| `manager@prelytix.com` | Task Manager | Kalpesh Jadav |
| `writer@prelytix.com` | Content Writer | Vraj Vaghela |
| `video@prelytix.com` | Video Editor | Aarav Patel |
| `client@acme.com` | Client | John Doe (Acme Corp) |

Seeded data includes 2 clients (1 active, 1 pending), 1 in-progress project, 2 tasks, 1 draft + 1 revision-requested content item, 1 submitted video, 1 pending approval, 1 open revision, 2 payments, 2 notifications and 3 audit entries.

---

## 🎬 5-Minute Demo Flow

Follow these nine steps exactly — each one is API-verified.

1. **Login as `marketing@prelytix.com`** → dashboard shows *Clients Onboarded*.
2. Go to **Clients → Add client** → create **Beta Industries** → status `pending_verification`.
3. **Logout → login as `admin@prelytix.com`** → Clients → **Verify** Beta Industries → status becomes `active`, audit entry written.
4. Admin → **Projects → New project** for Beta Industries (status `onboarding`) → set it to `in_progress`.
5. **Logout → login as `manager@prelytix.com`** → open **Acme Website Redesign** → **Add task** → assign to `writer@prelytix.com`.
6. **Logout → login as `writer@prelytix.com`** → **Tasks** board shows the task → **Create** → save the draft → **Submit** → client is notified.
7. **Logout → login as `client@acme.com`** → **Client Review** → open the item → **Approve** with a comment (or **Request revision**).
8. If revision: **logout → login as the creator** → resolve it from the Content/Media page → version becomes **v2**.
9. **Logout → login as `admin@prelytix.com`** → **Payments → Mark paid** → **Audit Logs** lists every action above with user names and timestamps.

Screenshots of the login screen, admin dashboard and client review portal live in `docs/screenshots/`.

---

## API reference

Base URL `/api`. All routes except `POST /auth/login` require `Authorization: Bearer <token>`.

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/auth/login` | Public | Returns `{ token, user }` |
| GET | `/auth/me` | Any | Current user |
| GET/POST/PATCH | `/users`, `/users/:id` | Admin | Manage accounts |
| GET | `/clients` | All except client | Client list with project counts |
| POST | `/clients` | Marketing | Onboard client (`pending_verification`) |
| PATCH | `/clients/:id/verify` \| `/reject` | Admin | Verification gate |
| GET | `/clients/me` | Client | Own company profile |
| GET | `/projects` | Any (role-filtered) | Projects + progress |
| POST | `/projects` | Admin | Create for a verified client |
| GET | `/projects/:id` | Any (access-checked) | Project + tasks/content/media/payments |
| PATCH | `/projects/:id` | Admin, Task Manager | Status and details |
| GET | `/tasks`, `/tasks/my` | Any (role-filtered) | Task board / my tasks |
| POST | `/tasks` | Task Manager | Allocate work + notify assignee |
| PATCH | `/tasks/:id/status` | Assignee, Task Manager, Admin | Move task |
| GET | `/tasks/assignees` | Task Manager, Admin | Producers available for allocation |
| GET/POST/PATCH | `/content` | Writer (own), Admin | Versioned copy |
| POST | `/content/:id/submit` | Writer (own) | Send to client review |
| GET/POST/PATCH | `/media` | Editor (own), Admin | URL-based assets |
| POST | `/media/:id/submit` | Editor (own) | Send to client review |
| GET | `/approvals` | Client, Admin | Approval history |
| POST | `/approvals` | Client (own projects) | Approve / reject |
| GET/POST | `/revisions` | Client, Admin, creators | Feedback threads |
| PATCH | `/revisions/:id/resolve` | Writer, Editor | Resolve + bump version |
| GET/POST | `/payments` | Admin, Client | Milestones |
| PATCH | `/payments/:id/mark-paid` | Admin | Record collection |
| GET | `/notifications` | Any (own) | Inbox |
| PATCH | `/notifications/:id/read`, `/read-all` | Any (own) | Mark read |
| GET | `/audit-logs` | Admin | Full audit trail |
| GET | `/dashboard/stats` | Any | Role-aware KPIs, chart, activity |

Sample response from `GET /dashboard/stats`:

```json
{
  "role": "client",
  "cards": [
    { "key": "reviews", "label": "Pending Reviews", "value": 1, "trend": null },
    { "key": "approved", "label": "Approved Items", "value": 1, "trend": null },
    { "key": "projects", "label": "My Projects", "value": 1, "trend": null },
    { "key": "payments", "label": "Pending Payments", "value": "₹29,750", "trend": null }
  ],
  "taskStatus": [
    { "name": "pending", "value": 1 },
    { "name": "in progress", "value": 1 },
    { "name": "submitted", "value": 0 },
    { "name": "approved", "value": 1 }
  ],
  "recentActivity": [],
  "notifications": [],
  "openRevisions": 1,
  "unread": 2
}
```

---

## Role–permission matrix

| Capability | Marketing | Admin | Task Manager | Content Writer | Video Editor | Client |
| --- | :-: | :-: | :-: | :-: | :-: | :-: |
| View dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Onboard clients | ✅ | — | — | — | — | — |
| Verify / reject clients | — | ✅ | — | — | — | — |
| Create projects | — | ✅ | — | — | — | — |
| Update project status | — | ✅ | ✅ | — | — | — |
| Allocate tasks | — | — | ✅ | — | — | — |
| Write content | — | — | — | ✅ | — | — |
| Add media | — | — | — | — | ✅ | — |
| Submit for review | — | — | — | ✅ | ✅ | — |
| Approve / request revision | — | — | — | — | — | ✅ |
| Resolve revisions | — | — | — | ✅ | ✅ | — |
| Manage payments | — | ✅ | — | — | — | — |
| View payments | — | ✅ | — | — | — | ✅ |
| Read audit logs | — | ✅ | — | — | — | — |

---

## Deployment

### Backend → Render

1. Push `backend/` to the `CMS-backend-` repository.
2. Render → **New Web Service** → connect the repo.
3. Build command `npm install`, start command `node server.js`.
4. Environment variables:

```env
JWT_SECRET=prelytix_super_secret_key_2026
PORT=10000
FRONTEND_URL=https://your-app.vercel.app
NODE_ENV=production
RESEED=true
```

`render.yaml` is included for blueprint auto-deploy. CORS allows `FRONTEND_URL` plus localhost ports 5173/4173.

### Frontend → Vercel

1. Push `frontend/` to the `CMS-frontend-` repository.
2. Vercel → **Import Project** → framework **Vite**.
3. Environment variable:

```env
VITE_API_URL=https://your-backend.onrender.com/api
```

4. Deploy. `vercel.json` rewrites every path to `index.html` so React Router deep links survive refresh.

### CSV persistence note

> On Render the filesystem is ephemeral. CSV files are re-seeded on every restart from the bundled defaults in `data/` (enabled by `RESEED=true`). This is intentional for the demo — all seeded accounts and data are always available. Live edits persist only for the current session.

---

## Quality checklist

| Requirement | Status |
| --- | --- |
| 6 role quick-login chips | ✅ Login page |
| Role shown in header | ✅ Header + sidebar |
| Role-aware sidebar (no dead links) | ✅ `menuByRole` map |
| Approve + request revision with comment | ✅ Review portal |
| Task creation notifies assignee | ✅ `notifications.csv` |
| Submitting moves item into client queue | ✅ `submitted_for_review` |
| Approval bumps project progress | ✅ Derived progress |
| Audit log with names + timestamps | ✅ Admin table |
| 11 CSVs exist and are seeded | ✅ `backend/data/` |
| `npm run dev` for both apps | ✅ |
| `VITE_API_URL` for all calls | ✅ `api/axios.js` |
| CORS honours `FRONTEND_URL` | ✅ `server.js` |
| No 404 on refresh | ✅ `vercel.json` rewrites |
| Empty states + loading skeletons | ✅ Shared components |
| Mobile layout | ✅ Collapsible drawer, card tables |
| Toasts on success/error | ✅ `react-hot-toast` |
| 9-step flow error-free | ✅ Verified end to end (41 API checks) |

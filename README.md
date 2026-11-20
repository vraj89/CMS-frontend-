# Prelytix CMS — Frontend

React 18 + Vite + Tailwind SPA for the Prelytix CMS platform. Role-aware sidebar, protected routes, dashboards with Recharts, the client approval portal, payments, notifications and the admin audit log.

> Full platform documentation (architecture, API reference, role matrix, deployment) is in [PROJECT.md](./PROJECT.md).

## Run locally

```bash
npm install
cp .env.example .env      # VITE_API_URL=http://localhost:5000/api
npm run dev               # http://localhost:5173
```

Build for production:

```bash
npm run build && npm run preview
```

The app needs the backend running. See the `CMS-backend-` repository.

### Environment variables

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | Base URL of the API, including `/api` (e.g. `https://prelytix-api.onrender.com/api`) |

All requests go through `src/api/axios.js`; the JWT is attached by a request interceptor and any `401` clears the session and redirects to `/login`.

## Deploy to Vercel

1. Push this folder to the `CMS-frontend-` repository.
2. Vercel → Import Project → framework preset **Vite** (build `npm run build`, output `dist`).
3. Add `VITE_API_URL` pointing at the deployed Render API.
4. Deploy.

`vercel.json` rewrites all paths to `index.html`, so deep links such as `/projects/:id` survive a refresh.

## Demo accounts

Password for all accounts is `password123`. The login screen also offers six one-click role chips.

| Email | Role |
| --- | --- |
| `marketing@prelytix.com` | Marketing |
| `admin@prelytix.com` | Admin |
| `manager@prelytix.com` | Task Manager |
| `writer@prelytix.com` | Content Writer |
| `video@prelytix.com` | Video Editor |
| `client@acme.com` | Client |

## Pages

| Route | Roles | Purpose |
| --- | --- | --- |
| `/login` | Public | Split-screen login with quick-login chips |
| `/dashboard` | All | KPI cards, task chart, activity, notifications |
| `/clients` | Marketing, Admin | Onboard clients / verify accounts |
| `/projects` | Admin, Task Manager | Project cards with progress |
| `/projects/:id` | Admin, Task Manager | Tabs: Tasks · Content · Media · Payments |
| `/tasks` | Task Manager, Writer, Editor | Three-column production board |
| `/content` | Writer, Admin | Versioned copy editor + revision queue |
| `/media` | Editor, Admin | URL-based media library |
| `/review` | Client, Admin | Approval portal with previews |
| `/payments` | Admin, Client | Milestone table |
| `/notifications` | All | Inbox with mark-as-read |
| `/audit-logs` | Admin | Read-only audit trail |

Sidebar items are filtered through `menuByRole` in `src/utils/format.js`; `ProtectedRoute` additionally blocks disallowed routes and redirects to the user's first permitted page.

## Screenshots

Login screen, admin dashboard and the client review portal are captured in `docs/screenshots/`.

## 5-minute demo flow

1. **Marketing** → Clients → Add client **Beta Industries** (pending verification).
2. **Admin** → Clients → **Verify** Beta Industries → active.
3. **Admin** → Projects → **New project** for Beta → set `in_progress`.
4. **Task Manager** → Acme Website Redesign → **Add task** → assign to the writer.
5. **Writer** → Tasks → **Create** → save draft → **Submit**.
6. **Client** → Client Review → **Approve** with a comment (or request a revision).
7. **Writer/Editor** → resolve any revision (version bumps to v2).
8. **Admin** → Payments → **Mark paid**, then open **Audit Logs** to see the full trail.

## Styling

Design tokens are in `tailwind.config.js` and reusable classes (`card`, `btn-primary`, `input`, `skeleton`) in `src/index.css`. Primary colour `#4F46E5`, background `#F9FAFB`, Inter typeface, rounded-xl cards, 260 px sidebar and a 64 px sticky header. Mobile collapses the sidebar into a drawer and turns tables into cards.

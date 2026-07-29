# ResolverHub

A MERN bug tracker built around real team structure: a company owns projects, a
project has a lead, and testers, developers and leads each see a different set of
actions on a bug.

- `Backend/` — Express 5 + Mongoose API
- `Frontend/` — React 19 + Vite + Tailwind CSS 4 client

## How the roles work

Everyone signs up with no role. What you can do depends on where you sit.

| Role | How you get it | What you can do |
| --- | --- | --- |
| `Unassigned` | Fresh signup, or joined a company/project without a role yet | Join a company with an invite code, request to join a project |
| `Admin` | Automatically, by creating a company | Approve company join requests, create and delete projects, pick each project's lead, read any project's bugs |
| `ProjectAdmin` | A company admin makes you the lead of a new project | Approve project join requests, assign Developer/Tester roles, assign and delete bugs, edit any field |
| `Developer` | A project admin approves you as a developer | Move assigned bugs to In Progress or Resolved, comment |
| `Tester` | A project admin approves you as a tester | Report bugs, edit and close the bugs you reported, comment |

The flow is: sign up → create a company (or join one with an invite code) → the
admin creates a project and names a lead → members request to join that project →
the lead approves them with a role → testers file bugs and the lead assigns them.

A company admin cannot make themselves a project lead, because becoming a
`ProjectAdmin` would replace their `Admin` role and lock the company out of
approving joins and creating projects.

## Setup

Requires Node.js 20+ and a MongoDB you can reach (a local `mongod` or an Atlas
cluster).

```bash
# 1. API config
cp .env.example .env          # then edit MONGODB_URI and JWT_SECRET

# 2. Client config
cp Frontend/.env.example Frontend/.env

# 3. Install
cd Backend  && npm install
cd ../Frontend && npm install
```

### Environment variables

Root `.env` (read by the API; `Backend/.env` overrides it if present):

| Variable | Required | Default | Notes |
| --- | --- | --- | --- |
| `MONGODB_URI` | yes | — | The server exits on boot if this is missing |
| `JWT_SECRET` | yes | — | Use a long random string |
| `JWT_EXPIRES_IN` | no | `24h` | |
| `PORT` | no | `5000` | Must match `VITE_API_URL` |
| `CLIENT_ORIGIN` | no | `http://localhost:5173,http://localhost:4173` | Comma separated allowed browser origins |
| `DNS_SERVERS` | no | `8.8.8.8,8.8.4.4` | Some ISPs cannot resolve Atlas SRV records. Set to `system` to use your own resolver |

`Frontend/.env`:

| Variable | Default | Notes |
| --- | --- | --- |
| `VITE_API_URL` | `http://localhost:5000/api` | Include the `/api` prefix |

## Running

```bash
cd Backend  && npm run dev     # http://localhost:5000
cd Frontend && npm run dev     # http://localhost:5173
```

`GET /api/health` reports whether the database is connected.

Transactions need a replica set or Atlas. Against a standalone `mongod` the API
asks the server what it is before the first multi-document write, then runs those
writes without a transaction and logs a warning once.

## API

All routes except `/api/health` and `/api/auth/*` need an
`Authorization: Bearer <token>` header. Every response uses the same envelope:
`{ success, message, data }`.

| Method | Path | Who |
| --- | --- | --- |
| `POST` | `/api/auth/signup` · `/api/auth/login` | Anyone |
| `GET` | `/api/profile/me` | Any signed in user |
| `PUT` | `/api/profile/update` · `/api/profile/change-password` | Any signed in user |
| `POST` | `/api/company` | Any user without a company |
| `GET` | `/api/company/me` | Company members |
| `GET` | `/api/company/free-members` | Admin |
| `PUT`/`DELETE` | `/api/company/:companyId` | Admin |
| `POST` | `/api/projects/create` | Admin |
| `GET` | `/api/projects/all` · `/api/projects/:id` | Company members |
| `GET` | `/api/projects/members` · `/api/projects/free-members` | Project members |
| `PATCH` | `/api/projects/members/:memberId/role` | ProjectAdmin |
| `PUT`/`DELETE` | `/api/projects/:id` | Admin / ProjectAdmin |
| `POST` | `/api/bugs` | Tester |
| `GET` | `/api/bugs` (filters: `projectId`, `status`, `priority`, `assignedTo`) | Project members; Admin must pass `projectId` |
| `GET`/`PATCH` | `/api/bugs/:id` | Role dependent |
| `DELETE` | `/api/bugs/:id` | ProjectAdmin |
| `POST` | `/api/comments` · `GET /api/comments/:bugId` | Project members |
| `POST` | `/api/notifications/company/join` · `/api/notifications/project/join` | Any signed in user |
| `GET` | `/api/notifications` · `/company-requests` · `/project-requests` | Recipient |
| `PATCH` | `/api/notifications/read-all` · `/:id/read` · `/:id/accept` · `/:id/deny` | Recipient |

Accepting a project join request requires a `role` of `Developer` or `Tester` in
the body.

## Layout

```
Backend/
  config/env.js          Loads and validates environment variables
  middlewares/           JWT auth, 404 and centralised error handling
  models/                Mongoose schemas
  repositories/          All database access
  services/             Business rules and permission checks
  controllers/           Request/response shaping
  routes/                Endpoint definitions
  utils/                 AppError, asyncHandler, transaction helper

Frontend/src/
  api/                   One module per API resource
  lib/                   Fetch client, constants, formatting, session, navigation
  stores/authStore.js    Zustand session state, persisted to local storage
  hooks/                 useAsyncData (loading/error) and useNotifications (polling)
  components/guards/     Route guards for auth, company, project and role
  components/ui/         Button, Badge, Avatar, Modal, Field, Spinner, EmptyState
  pages/                 Screens wired up in App.jsx
```

Errors are thrown as `AppError` in services, so a service never touches the
response object. Controllers wrap handlers in `asyncHandler`, and the error
middleware turns Mongoose validation, cast and duplicate-key failures into clean
4xx responses.

# AtomQuest — In-House Goal Setting & Tracking Portal

> **AtomQuest Hackathon 2026 Submission** — A production-ready, full-stack Goal Setting & Tracking Portal built with Next.js 16, Prisma 6, and SQLite.

---

## 🚀 Live Demo

```
http://localhost:3000
```

Three demo personas are available on the login page — click any to enter instantly (no password required for the demo).

| Persona | Role | Features |
|---|---|---|
| System Admin | ADMIN | Shared KPI assignment, Analytics, Audit Trail, Escalation Engine, CSV Export |
| Jane Manager | MANAGER | Goal Approval/Rejection, Quarterly Check-in Review, Manager Feedback |
| Bob Director | MANAGER | Second manager with separate team |
| John Employee | EMPLOYEE | Goal Creation, Quarterly Check-ins, Progress Tracking |
| Alice Developer | EMPLOYEE | Goal Creation, Quarterly Check-ins, Progress Tracking |
| Carlos Sales | EMPLOYEE | Goal Creation, Quarterly Check-ins, Progress Tracking |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Next.js 16 App                           │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────┐  │
│  │  Login Page  │  │  Dashboard   │  │     API Routes        │  │
│  │  (RSC)       │  │  (RSC + CSR) │  │   (Route Handlers)    │  │
│  └──────────────┘  └──────────────┘  └───────────────────────┘  │
│         │                 │                      │               │
│         ▼                 ▼                      ▼               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Prisma ORM v6                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│         │                                                        │
│         ▼                                                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              SQLite (prisma/dev.db)                       │   │
│  │  User · Goal · CheckIn · AuditLog · EscalationLog        │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### API Routes

| Endpoint | Method | Description |
|---|---|---|
| `/api/auth/login` | POST | Set session cookies (userId, role, name) |
| `/api/auth/logout` | POST | Clear session cookies |
| `/api/goals` | GET | Fetch goals by ownerId |
| `/api/goals` | POST | Create goal with validation (max 8, min 10%, total ≤ 100%) |
| `/api/goals/approve` | POST | Manager approve/reject goal + audit log |
| `/api/checkins` | GET | Fetch check-ins by goalId |
| `/api/checkins` | POST | Employee log / Manager comment |
| `/api/admin/kpi` | GET | List assignable users |
| `/api/admin/kpi` | POST | Admin assign Shared KPI (auto-locked) |
| `/api/admin/stats` | GET | Organization-wide statistics |
| `/api/admin/audit` | GET | Latest 50 audit log entries |
| `/api/admin/analytics` | GET | Thrust area distribution + QoQ activity |
| `/api/admin/escalation` | GET | Fetch escalation logs |
| `/api/admin/escalation` | POST | Run rule-based escalation engine |
| `/api/admin/export` | GET | Download achievement CSV report |

---

## ✅ Feature Checklist

### Phase 1 — Goal Setting

- [x] Employee can create up to **8 goals**
- [x] Minimum **10% weightage** per goal enforced
- [x] Total weightage **must equal 100%** (validated server-side)
- [x] Goals support **6 UoM types**: Numeric_Min, Numeric_Max, Percent_Min, Percent_Max, Timeline, Zero
- [x] **4 Thrust Areas**: Financial, Customer, Internal Process, Learning & Growth
- [x] Goals submitted in **Pending** status for manager review
- [x] Manager can **Approve** (→ Locked) or **Reject** (→ Draft)
- [x] Admin can assign **Shared KPIs** to all employees or specific users (auto-Locked)

### Phase 2 — Quarterly Check-ins

- [x] Employee logs quarterly achievement (Q1–Q4) on Locked goals
- [x] **Score calculation** per UoM:
  - Numeric_Min / Percent_Min: `(actual / target) × 100`
  - Numeric_Max / Percent_Max: `(target / actual) × 100`
  - Zero: `100 if actual == 0 else 0`
  - Timeline: percentage fallback
- [x] Manager can view check-ins and add **qualitative comments**
- [x] All actions written to **Audit Trail**

### Admin Features

- [x] **Organization-wide stats** (Total Users, Goals, Locked Goals)
- [x] **Goal Setting Completion** progress bar
- [x] **Goal Distribution** by Thrust Area (visual bar chart)
- [x] **QoQ Check-in Activity** chart (Q1–Q4)
- [x] **Audit Trail** — last 50 actions with timestamps
- [x] **Rule-Based Escalation Engine**:
  - Rule 1: Manager Approval Delay (goals stuck in Pending)
  - Rule 2: Incomplete Goal Submission (employee weightage < 100%)
- [x] **CSV Export** — Full achievement report (goals + check-ins + manager comments)
- [x] Cycle Management panel (Lock Cycle button)

---

## 🛠️ Setup & Run

### Prerequisites
- Node.js v18+
- npm

### Quick Start

```bash
# 1. Install dependencies
npm install --fetch-timeout=600000

# 2. Generate Prisma client
npx prisma generate

# 3. Push schema to SQLite and seed demo data
npx prisma db push
npx tsx prisma/seed.ts

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the login page shows all available personas.

### Re-seed (reset to demo state)

```bash
npm run seed
```

---

## 🗃️ Data Model

```prisma
User         — id, name, role (EMPLOYEE|MANAGER|ADMIN), managerId
Goal         — id, title, description, thrustArea, uom, target, weightage, status, ownerId
CheckIn      — id, goalId, quarter, actual, status, managerComment
AuditLog     — id, action, userId, details, createdAt
EscalationLog — id, ruleTrigger, targetUser, level, message, resolved
```

---

## 💡 Design Decisions & Cost Optimisation

| Decision | Rationale |
|---|---|
| **SQLite via Prisma** | Zero infrastructure cost. No DB server. File-based, version-controlled, instant setup. |
| **Cookie-based session** | No JWT library or auth service needed. HttpOnly cookies via Next.js route handlers. |
| **Next.js App Router (RSC)** | Server Components fetch data directly from Prisma — no extra API call for the dashboard render. |
| **No external services** | Escalation engine runs in-process. CSV export is streamed directly. No Lambda, no queue, no cost. |
| **Single-file components** | All dashboard logic co-located per role — easy to extend, zero build complexity. |

---

## 📁 Project Structure

```
atomcontest/
├── prisma/
│   ├── schema.prisma       # Data models
│   └── seed.ts             # Rich demo data (6 users, 12 goals, 13 check-ins)
├── src/
│   ├── app/
│   │   ├── page.tsx        # Login page (RSC — lists users from DB)
│   │   ├── layout.tsx      # Root layout with sticky navbar
│   │   ├── globals.css     # Design system (dark theme, Inter font)
│   │   ├── dashboard/
│   │   │   └── page.tsx    # Role-aware dashboard (RSC)
│   │   └── api/
│   │       ├── auth/       # login + logout routes
│   │       ├── goals/      # CRUD + approve
│   │       ├── checkins/   # Employee log + Manager comment
│   │       └── admin/      # stats, audit, analytics, escalation, kpi, export
│   ├── components/
│   │   ├── EmployeeDashboard.tsx
│   │   ├── ManagerDashboard.tsx
│   │   ├── AdminDashboard.tsx
│   │   ├── AdminAnalytics.tsx
│   │   └── AdminEscalations.tsx
│   └── lib/
│       ├── db.ts           # Prisma singleton
│       └── score.ts        # UoM-aware score calculation
└── package.json
```

---

## 🏆 Hackathon Evaluation Criteria

| Criterion | Implementation |
|---|---|
| **Functionality** | All Phase 1 & 2 requirements implemented end-to-end |
| **Technical Robustness** | Server-side validation, audit logging, role guards on every API |
| **UI/UX** | Dark glassmorphism theme, Inter font, responsive grid, smooth transitions |
| **Cost Optimisation** | SQLite + RSC = $0 infrastructure cost |
| **Scalability Path** | Swap SQLite → PostgreSQL in one `schema.prisma` line; deploy on Vercel |
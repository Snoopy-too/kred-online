# Kred Game – Production Refactoring & Deployment Plan (Node.js Edition)

_Last updated: 2025-11-21 · Branch: production_

> This document is now the active production roadmap. The legacy Rails plan has been archived under `docs/archives/PRODUCTION_PLAN.md` for historical reference.

---

## 1. Snapshot

### Current State
- Tile-based strategy game still driven by a large `App.tsx` (≈3,305 lines) and a partially extracted `game.ts` (36 modular files, ~5,600 LOC).
- All gameplay remains local to a single browser tab; there is no backend authority, persistence, authentication, or networking.
- Refactoring Phase 1 is roughly 85% complete: screens and most rules/config live in `src/game`, but hooks/context and some utilities remain inline.
- No automated deployment, CI/CD, or observability pipeline. Manual regression testing only.

### Target State
- Turborepo monorepo where `packages/game-logic` exposes all rules/state helpers to both frontend (`apps/frontend`) and backend (`apps/backend`).
- NestJS + Socket.io backend with PostgreSQL/TypeORM persistence, enabling authoritative multiplayer, auditing, and reconnection support.
- Automated testing pyramid (unit → integration → e2e) with Playwright smoke tests against staging.
- Kamal-managed Hetzner deployment (Docker + kamal-proxy) with health checks, zero-downtime rollouts, log rotation, and secrets managed via `.env.erb`.

---

## 2. Phase Roadmap

| Phase | Focus | Exit Criteria | Status |
| --- | --- | --- | --- |
| 1. Refactor & Extract | Break apart `game.ts` + `App.tsx`, introduce hooks/context, stabilize Jest coverage | `App.tsx` < 500 lines, hooks/context own game state, `@kred/game-logic` published locally | 🔄 In progress (≈85%) |
| 2. Backend Foundation | Scaffold NestJS API, persistence, and REST endpoints sharing types with game logic | CRUD for games/players, migrations, seed data, CI builds green | ⏳ Pending |
| 3. Realtime Integration | Socket.io gateway + client, optimistic UI with rollback, authority + snapshots | Two-browser gameplay demo with reconnect + challenge flows, telemetry for drift detection | ⏳ Pending |
| 4. Production Deployment | Kamal infra hardening, observability, backups, documented rollback | `kamal deploy` pipeline, monitoring/alerts, DB backups, load & failover test complete | ⏳ Pending |

---

## 3. Repository & Documentation Layout

```
/
├── apps/
│   ├── frontend/                  # React/Vite client
│   │   ├── src/
│   │   ├── Dockerfile
│   │   └── config/deploy.yml      # Kamal config
│   └── backend/                   # NestJS API + Socket.io
│       ├── src/
│       ├── Dockerfile
│       └── config/deploy.yml
├── packages/
│   ├── game-logic/                # Shared pure TS engine
│   └── tsconfig/                  # Shared TS configs
├── docs/
│   ├── PRODUCTION_PLAN.md         # Active plan (moved here)
│   └── archives/                  # Legacy plans & ADRs
├── turbo.json
├── package.json
└── README.md
```

Document every architectural decision in `docs/architecture/` so API/design knowledge persists beyond PRs.

---

## 4. Phase 1 – Detailed Refactoring Strategy (The Split)

**Goal**: Break `game.ts` (3,497 lines) and `App.tsx` (4,526 lines) into the Monorepo structure.

### 1. Extracting `game.ts` to `packages/game-logic`

We will slice the logic into small, testable modules.

**Target Directory:** `packages/game-logic/src/`

| Order | Original Logic      | New Module Path                                      | Lines (Approx) |
| :---- | :------------------ | :--------------------------------------------------- | :------------- |
| 1     | Interfaces & Types  | `types/index.ts`, `types/board.ts`, `types/moves.ts` | 300            |
| 2     | Constants           | `config/constants.ts`                                | 100            |
| 3     | Board Layouts       | `config/layouts/3p.ts`, `4p.ts`, `5p.ts`             | 800            |
| 4     | Tile Definitions    | `config/tiles.ts`                                    | 300            |
| 5     | Move Definitions    | `config/moves.ts`                                    | 400            |
| 6     | Adjacency Logic     | `utils/adjacency.ts`                                 | 200            |
| 7     | **Move Validation** | `rules/validator.ts` (Crucial: Pure functions only)  | 500            |
| 8     | Win Conditions      | `rules/win-conditions.ts`                            | 100            |
| 9     | Challenge Logic     | `rules/challenge.ts`                                 | 200            |
| 10    | State Setup         | `state/initialization.ts`                            | 300            |
| 11    | State Reducer       | `engine.ts` (The "Apply Move" function)              | 200            |

**Testing Checkpoint:** run Jest inside `packages/game-logic` to prove `validateMove()`, `validateTileRequirements()`, and `applyMove()` work independently of React.

### 2. Refactoring `App.tsx` to `apps/frontend`

**Target Directory:** `apps/frontend/src/components/`

| Order | Component Group | New Path                                               |
| :---- | :-------------- | :----------------------------------------------------- |
| 1     | UI Primitives   | `shared/Button.tsx`, `shared/Modal.tsx`                |
| 2     | Board Rendering | `game/Board/BoardTile.tsx`, `game/Board/Piece.tsx`     |
| 3     | Player UI       | `game/Player/Hand.tsx`, `game/Player/Stats.tsx`        |
| 4     | Phase Logic     | `game/Phases/Drafting.tsx`, `game/Phases/Campaign.tsx` |
| 5     | **State Hook**  | `hooks/useGame.ts` (connects to `game-logic`)          |

_No changes to this phase per instructions; ensure every extraction has snapshot tests before touching networking._

---

## 5. Phase 2 – Backend Foundation (NestJS + TypeORM)

**Objective:** Deliver a production-ready API skeleton that mirrors the shared logic types and persists canonical game state.

**Key Workstreams:**
- Scaffold `apps/backend` via Nest CLI with modules for `games`, `players`, `moves`, and `sockets`.
- Install/configure TypeORM + PostgreSQL driver; generate migrations for `Game`, `Player`, `Move`, `Snapshot` entities (JSONB payloads derived from shared types).
- Import types directly from `@kred/game-logic` to keep DTOs consistent; validate via `class-validator` + zod schemas generated from shared types.
- REST endpoints: `POST /games`, `POST /games/:code/join`, `GET /games/:code`, `POST /games/:code/moves`, `POST /games/:code/challenge`.
- Seed script + fixture data to cover 3/4/5 player boards for integration tests.
- CI: `pnpm lint`, `pnpm test`, `pnpm build --filter=backend` on every PR.

**Exit Criteria:** DB migrations run cleanly; REST endpoints echo deterministic snapshots; unit/integration suites green; Docker image builds succeed locally and in CI.

---

## 6. Phase 3 – Realtime Integration & Multiplayer UX

**Objective:** Turn the backend into the authoritative source of truth and keep clients synchronized with minimal latency.

**Key Workstreams:**
- Implement Socket.io gateway with rooms keyed by `roomCode`; authenticate participants via signed lobby tokens (future).
- Event contract: `join`, `move`, `tilePlayed`, `tileAccepted`, `challenge`, `bureaucracy`, `stateSync`, `disconnect/reconnect`.
- Use `@kred/game-logic` reducers server-side for validation + state transitions; persist snapshots every turn for undo/challenge flows.
- Client hook `useRealtimeGame` responsible for optimistic updates + rollback when backend rejects a move.
- Introduce reliability features: heartbeat + server reconciliation, join-in-progress handshake delivering latest snapshot + pending actions.
- Functional QA: run two-browser Playwright scenario validating drag/drop, challenges, reconnect, and bureaucracy funding.

**Exit Criteria:** Multi-browser game completes without manual intervention, challenges resolve correctly, state drifts trigger automatic resync, telemetry dashboard surfaces latency/error metrics.

---

## 7. Phase 4 – Production Deployment & Operations

**Objective:** Ship the stack to Hetzner with Kamal, add observability/backups, and document recovery procedures.

**Key Workstreams:**
- Provision Hetzner dedicated server (AX52 or better) with Docker + Kamal prerequisites; configure DNS + TLS.
- Define Kamal accessories for PostgreSQL (volume-backed) and optional Prometheus/Grafana stack.
- Harden images: non-root user, health checks (`GET /up` & `/api/health`), log drivers (`json-file`, rotation), environment separation via `.env.erb`.
- Kamal workflows: `kamal setup`, `kamal deploy`, `kamal rollback`, `kamal audit`, `kamal prune`; integrate with GitHub Actions.
- Observability: Sentry (frontend/back), structured JSON logs, uptime alerts, pgBackRest or WAL-G backups to S3-compatible storage.
- Production readiness review: load test >20 concurrent games, chaos test (kill backend container, verify Kamal redeploy keeps uptime).

**Exit Criteria:** Automated deploys from `production` branch, documented RPO/RTO, backup/restore drill completed, runbooks stored in `docs/operations/`.

---

## 8. Deployment with Kamal + Docker

### Infrastructure
- Single Hetzner node initially; design config to add more `web` hosts later.
- `kamal-proxy` (Traefik) handles TLS + routing; subdomains `kredgame.com` and `api.kredgame.com` terminate at proxy.
- Accessories manage PostgreSQL (`postgres:16`) with `data:/var/lib/postgresql/data` volume and health checks; consider Redis accessory later for ephemeral queues.

### Configuration Best Practices
```yaml
service: kred-backend
image: registry.example.com/kred-backend
servers:
  web:
    - 95.216.0.10
proxy:
  ssl: true
  host: api.kredgame.com
  app_port: 3000
  healthcheck:
    path: /api/health
    interval: 5
logging:
  driver: json-file
  options:
    max-size: 100m
    max-file: "3"
boot:
  limit: 2
  wait: 10
env:
  clear:
    NODE_ENV: production
  secret:
    - JWT_SECRET
    - DB_PASSWORD
accessories:
  db:
    image: postgres:16
    directories:
      - data:/var/lib/postgresql/data
```

### Docker Image Strategy
- Multi-stage builds (`node:20-alpine` base) with `turbo prune --scope=<app> --docker` to minimize context.
- Copy only `dist` and production `node_modules` into runner; run as `node` user.
- Add `HEALTHCHECK CMD wget -qO- http://localhost:${PORT}/up || exit 1` for faster Kamal fail detection.
- Cache dependencies via PNPM + BuildKit registry cache when CI runners support it.

---

## 9. Development Workflow & Environments

1. `pnpm install` at repo root (Corepack-managed).
2. `docker compose up postgres` or `pnpm docker:db` for local Postgres.
3. `pnpm dev` (Turborepo pipeline) to run frontend, backend, and game-logic watcher simultaneously.
4. `pnpm lint`, `pnpm test --filter=...`, `pnpm build --filter=frontend --filter=backend` before opening PRs.
5. Feature branches target `production`; CI enforces lint/tests/build plus `kamal config` validation.

Environment tiers:
- `local` – developer machines
- `staging` – Hetzner VM with password-protected proxy for QA
- `production` – public host with Kamal-managed SSL

---

## 10. Testing Strategy

| Layer | Tooling | Coverage Goals |
| --- | --- | --- |
| Shared Logic | Jest + ts-jest + fast-check | 100% for validators/reducers/win conditions |
| Frontend | Vitest/RTL + Storybook-driven visual tests | Drag/drop, modals, accessibility smoke tests |
| Backend | Jest + Supertest + mocked Socket.io client | REST contract, gateway events, DB migrations |
| Integration | Contract tests comparing DTO schemas vs `@kred/game-logic` | Build fails if schema drifts |
| E2E | Playwright multi-browser flows | Campaign→Bureaucracy loop, reconnect + rollback |

Automate coverage thresholds in CI (fail <85% overall or <95% for shared logic).

---

## 11. Migration Checklist

### Phase 1 – Refactor (unchanged)
- [ ] Initialize Turborepo
- [ ] Create `packages/game-logic`
- [ ] Extract types/config/rules
- [ ] Write unit tests for shared logic
- [ ] Point frontend at `@kred/game-logic`
- [ ] Verify local gameplay parity

### Phase 2 – Backend Foundation
- [ ] Scaffold NestJS app + modules
- [ ] Configure TypeORM + migrations
- [ ] Mirror shared types in DTOs
- [ ] Implement core REST endpoints + validation
- [ ] Add Dockerfile + Kamal config + CI build

### Phase 3 – Realtime Integration
- [ ] Ship Socket.io gateway + auth handshake
- [ ] Implement optimistic UI + rollback hook
- [ ] Persist move history + snapshots
- [ ] Write multi-client Playwright test

### Phase 4 – Production Deployment
- [ ] Provision Hetzner + DNS + TLS
- [ ] Run `kamal setup` + accessories
- [ ] Configure logging, health, backups
- [ ] Add CI deploy + audit/prune jobs
- [ ] Execute load + failover drills

---

## 12. Risks & Mitigations
- **Shared logic drift** – enforce version pinning + schema tests to keep frontend/backend aligned.
- **Single-host resource limits** – monitor CPU/RAM/disk via Grafana; plan horizontal scale once concurrency warrants.
- **State desync/cheating** – authoritative backend validation plus periodic snapshot broadcasts + checksums.
- **Secrets management** – use `kamal envify` + 1Password/Bitwarden secret store; never bake secrets into images.
- **Backup gaps** – schedule nightly pg dumps + weekly restore drills.

---

Use this plan as the single source of truth for ongoing work; update sections as milestones close so engineering, product, and ops stay aligned.

# ITMD544 Final Assignment — Full-Stack Weather App

A full-stack weather application that lets users search for any city worldwide, view a 7-day forecast with hourly breakdowns, and annotate locations with custom climate tags. The backend caches all forecast data in Supabase (PostgreSQL) and maintains a searchable audit log. The frontend presents the data through an interactive React UI with a Recharts-powered hourly temperature chart.

---

## Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                        Browser                              │
│   React 18 + Vite 5 (localhost:3000)                        │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────────┐  │
│   │SearchBar │ │WeatherCard│ │HourlyChart│ │ TagManager  │  │
│   └──────────┘ └──────────┘ └──────────┘ └─────────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │  HTTP /api/* (Vite proxy)
┌───────────────────────▼─────────────────────────────────────┐
│              Express 4 API  (localhost:3001)                 │
│  ┌──────────┐ ┌──────────┐ ┌────────────┐ ┌─────────────┐  │
│  │ /search  │ │/locations│ │ /forecasts │ │   /tags     │  │
│  └──────────┘ └──────────┘ └────────────┘ └─────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │               Service Layer                           │  │
│  │  geocoding · weather · location · forecast            │  │
│  │  tag · searchLog                                      │  │
│  └───────────────┬───────────────────────────────────────┘  │
└──────────────────┼──────────────────────────────────────────┘
          ┌────────┴────────┐
          │                 │
┌─────────▼──────┐  ┌───────▼───────────────────────────────┐
│  Open-Meteo    │  │  Supabase (PostgreSQL)                 │
│  (free, no key)│  │  locations · daily_forecasts           │
│  Geocoding API │  │  hourly_forecasts · search_logs        │
│  Forecast API  │  │  tags · location_tags                  │
└────────────────┘  └───────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Version | Notes |
| --- | --- | --- | --- |
| Runtime | Node.js | 20 LTS | Backend runtime |
| Backend Framework | Express | 4.18 | REST API |
| Backend Language | TypeScript | 5.3 | Strict mode |
| Database Client | @supabase/supabase-js | 2.39 | Supabase/PostgreSQL |
| HTTP Client | Axios | 1.6 | External API calls + frontend |
| Logging | Winston | 3.11 | JSON + file transports |
| API Docs | Swagger (swagger-jsdoc + swagger-ui-express) | 6 / 5 | Live at `/api/docs` |
| Security | Helmet + CORS | 7 / 2 | HTTP headers + cross-origin |
| Frontend Framework | React | 18.2 | SPA |
| Frontend Build | Vite | 5.0 | Dev server + proxy |
| Charts | Recharts | 2.10 | Hourly temperature chart |
| Testing | Jest + Supertest | 29.7 / 6.3 | Unit + integration, 36 tests |
| Containerization | Docker (multi-stage) | — | `backend/Dockerfile` |
| Orchestration | Docker Compose | 3.9 | `docker-compose.yml` |
| CI/CD | GitHub Actions | — | `.github/workflows/ci.yml` |
| External API | Open-Meteo | — | Free, no API key required |

---

## Database Schema

Six tables with clear ownership boundaries:

```text
locations
├── id            UUID  PK
├── name          TEXT
├── country       TEXT
├── latitude      DECIMAL(9,6)
├── longitude     DECIMAL(10,6)
├── timezone      TEXT
└── created_at    TIMESTAMPTZ
     │
     ├──< daily_forecasts (1:N, CASCADE DELETE)
     │    ├── id               UUID  PK
     │    ├── location_id      UUID  FK → locations
     │    ├── forecast_date    DATE
     │    ├── temp_max         DECIMAL
     │    ├── temp_min         DECIMAL
     │    ├── precipitation_sum DECIMAL
     │    ├── weather_code     INTEGER
     │    ├── wind_speed_max   DECIMAL
     │    └── created_at       TIMESTAMPTZ
     │         │
     │         └──< hourly_forecasts (1:N, CASCADE DELETE)
     │              ├── id                  UUID  PK
     │              ├── daily_forecast_id   UUID  FK → daily_forecasts
     │              ├── hour                INTEGER (0–23)
     │              ├── temperature         DECIMAL
     │              ├── precipitation       DECIMAL
     │              ├── wind_speed          DECIMAL
     │              └── humidity            INTEGER (0–100)
     │
     ├──< search_logs (1:N, SET NULL on location delete)
     │    ├── id            UUID  PK
     │    ├── location_id   UUID  FK → locations (nullable)
     │    ├── query_string  TEXT
     │    └── searched_at   TIMESTAMPTZ
     │
     └──< location_tags (N:M junction, CASCADE DELETE)
          ├── location_id  UUID  FK → locations
          └── tag_id       UUID  FK → tags

tags
├── id     UUID  PK
├── name   TEXT  UNIQUE
└── color  TEXT  (hex color, default #3B82F6)
```

**Relationships:**

- A `location` has many `daily_forecasts` (7 days per search). Deleting a location cascades to all its forecasts and associated hourly rows.
- A `daily_forecast` has exactly 24 `hourly_forecasts` (one per hour).
- `search_logs` records every lookup. If a location is later deleted, the log entry is preserved with `location_id` set to NULL.
- `location_tags` is a many-to-many junction. A location can have multiple tags; a tag can be applied to multiple locations.

**Seed data:** Five default tags are inserted on migration — Coastal, Mountain, Desert, Tropical, Urban.

---

## API Endpoints

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/health` | Health check — returns `{ status, timestamp }` |
| GET | `/api/docs` | Swagger UI (interactive API documentation) |
| GET | `/api/search?q=<city>` | Geocode city, fetch forecast, cache result; returns location + 7-day daily array |
| GET | `/api/search/history` | Last 20 search log entries |
| GET | `/api/locations` | All cached locations |
| GET | `/api/locations/:id` | Single location with its tags |
| DELETE | `/api/locations/:id` | Delete location and all cascaded data |
| GET | `/api/forecasts/:locationId` | 7-day daily forecasts for a location |
| GET | `/api/forecasts/:locationId/hourly?dailyId=` | 24 hourly rows for a specific day |
| GET | `/api/tags` | All available climate tags |
| POST | `/api/tags/locations/:id/tags` | Assign a tag to a location (body: `{ tagId }`) |
| DELETE | `/api/tags/locations/:id/tags/:tagId` | Remove a tag from a location |

---

## Setup Instructions

### Prerequisites

- Node.js 20+ and npm
- A [Supabase](https://supabase.com) account (free tier is sufficient)
- Docker (optional, for containerized deployment)

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/ITMD544-Final-Assignment.git
cd ITMD544-Final-Assignment
```

### 2. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and create a new project.
2. Once provisioned, navigate to **Project Settings → API**.
3. Copy the **Project URL** and the **anon/public** API key.

### 3. Run the Database Migration

1. In your Supabase dashboard, open the **SQL Editor**.
2. Paste the entire contents of `backend/src/db/migrations.sql` and run it.
3. This creates all 6 tables and seeds the 5 default tags.

### 4. Configure Environment Variables

Create a `.env` file inside the `backend/` directory:

```env
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
PORT=3001
NODE_ENV=development
```

> The frontend has no environment variables — it communicates with the backend through Vite's built-in proxy (see `frontend/vite.config.ts`).

### 5. Start the Backend

```bash
cd backend
npm install
npm run dev
```

The API will be available at `http://localhost:3001`.
Swagger UI is at `http://localhost:3001/api/docs`.

### 6. Start the Frontend

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:3000`. All `/api/*` requests are automatically proxied to the backend.

### 7. Docker Option (Backend Only)

A multi-stage `Dockerfile` is provided. To build and run the backend container:

```bash
# Build and start using Docker Compose (from project root)
SUPABASE_URL=<your-url> SUPABASE_ANON_KEY=<your-key> docker-compose up --build

# Or build the image directly
docker build -t weather-app-backend ./backend
docker run -p 3001:3001 \
  -e SUPABASE_URL=<your-url> \
  -e SUPABASE_ANON_KEY=<your-key> \
  weather-app-backend
```

Log files are persisted via a volume mount at `./backend/logs`.

### 8. Running Tests

From the `backend/` directory:

```bash
# Run all 36 tests (unit + integration)
npm test

# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# With coverage report
npm test -- --coverage
```

Tests use Jest 29 with ts-jest. Integration tests use Supertest against the Express app with all Supabase calls mocked.

---

## CI/CD Pipeline

GitHub Actions (`.github/workflows/ci.yml`) runs three jobs on every push and pull request to `main`:

| Job | Steps |
| --- | ----- |
| **Backend** | `npm ci` → TypeScript type-check → run all tests with coverage → `tsc` build |
| **Docker Build** | Builds the multi-stage Docker image (depends on Backend job passing) |
| **Frontend** | `npm ci` → TypeScript type-check → Vite production build |

---

## Project Structure

```text
ITMD544-Final-Assignment/
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI pipeline
├── backend/
│   ├── Dockerfile              # Multi-stage production image
│   ├── package.json
│   ├── tsconfig.json
│   ├── jest.config.ts
│   ├── logs/                   # Winston log output (gitignored)
│   ├── src/
│   │   ├── server.ts           # Entry point — starts HTTP server
│   │   ├── app.ts              # Express app setup (middleware, routes)
│   │   ├── config/
│   │   │   ├── database.ts     # Supabase client initialization
│   │   │   ├── logger.ts       # Winston logger configuration
│   │   │   └── swagger.ts      # Swagger/OpenAPI spec setup
│   │   ├── db/
│   │   │   └── migrations.sql  # DDL for all 6 tables + seed data
│   │   ├── middleware/
│   │   │   ├── errorHandler.ts # Global error handler
│   │   │   └── requestLogger.ts# Per-request Winston logging
│   │   ├── routes/
│   │   │   ├── index.ts        # Router aggregator
│   │   │   ├── search.routes.ts
│   │   │   ├── location.routes.ts
│   │   │   ├── forecast.routes.ts
│   │   │   └── tag.routes.ts
│   │   ├── services/
│   │   │   ├── geocoding.service.ts  # Open-Meteo geocoding
│   │   │   ├── weather.service.ts    # Open-Meteo forecast fetch
│   │   │   ├── location.service.ts   # Supabase location CRUD
│   │   │   ├── forecast.service.ts   # Supabase forecast CRUD
│   │   │   ├── tag.service.ts        # Supabase tag CRUD
│   │   │   └── searchLog.service.ts  # Search audit logging
│   │   └── types/
│   │       └── weather.ts      # Shared TypeScript interfaces
│   └── tests/
│       ├── unit/               # Service-layer unit tests (mocked Supabase)
│       └── integration/        # Route-layer integration tests (Supertest)
├── frontend/
│   ├── vite.config.ts          # Vite config + /api proxy
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── main.tsx            # React entry point
│       ├── App.tsx             # Root component + state management
│       ├── index.css           # Global styles
│       ├── api/
│       │   └── client.ts       # Axios API client (all endpoints)
│       ├── components/
│       │   ├── SearchBar.tsx
│       │   ├── WeatherCard.tsx
│       │   ├── DailyForecastStrip.tsx
│       │   ├── HourlyChart.tsx     # Recharts line chart
│       │   ├── RecentSearches.tsx
│       │   └── TagManager.tsx
│       └── types/              # Frontend TypeScript interfaces
├── docs/                       # Additional documentation
├── docker-compose.yml          # Docker Compose for backend service
└── README.md
```

---

## Future Improvements

1. **User authentication** — Integrate Supabase Auth so each user has their own saved locations and tag preferences rather than a single shared dataset.

2. **Cache invalidation strategy** — Currently forecasts are cached indefinitely. Implement a TTL (e.g., 1 hour) so that re-searching a city refreshes stale forecast data automatically.

3. **Frontend state management** — As the UI grows, lifting all state into `App.tsx` becomes unwieldy. Introduce a lightweight state manager (Zustand or React Query) to handle server-state caching and loading states more robustly.

4. **Extended forecast data** — The Open-Meteo API provides UV index, cloud cover, and weather condition icons. Surfacing these would improve the UX and make the weather card more informative.

5. **Frontend unit tests** — The current test suite covers only the backend. Adding Vitest + React Testing Library tests for components such as `SearchBar`, `WeatherCard`, and `HourlyChart` would round out coverage.

6. **Mobile-responsive design** — The current layout is functional on desktop but would benefit from a fully responsive design with a collapsible sidebar, touch-friendly forecast strip, and optimized typography for small screens.

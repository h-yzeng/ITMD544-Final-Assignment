# ITMD-544 Final Assignment - Full-Stack Weather App

A full-stack weather application that lets users search for any city worldwide, view a 7-day forecast with hourly breakdowns, and annotate locations with custom climate tags. The backend caches all forecast data in Supabase (PostgreSQL) and maintains a searchable audit log. The frontend presents the data through an interactive React UI with a Recharts-powered hourly temperature chart.

---

## Architecture

### System Overview

| Component          | Role                                                                                    | Technology                |
| ------------------ | --------------------------------------------------------------------------------------- | ------------------------- |
| **Frontend Layer** | SPA serving weather UI with search, forecast display, hourly charts, and tag management | React 18 + Vite 5         |
| **API Layer**      | REST API handling geocoding, forecast retrieval, caching, and tag operations            | Express.js 4              |
| **Data Layer**     | Persistent storage of locations, forecasts, search logs, and tags                       | Supabase PostgreSQL       |
| **External APIs**  | Real-time weather and geolocation data                                                  | Open-Meteo (free, no key) |

### Architecture Rationale

**Frontend: React 18 + Vite 5**

- React chosen for its component-driven UI architecture and strong ecosystem. Reusable components (SearchBar, WeatherCard, HourlyChart) match the modular nature of weather data display.
- Vite provides blazing-fast development experience with HMR and optimized production builds. Built-in proxy (`/api` → backend) eliminates CORS complexity during development.
- TypeScript ensures type safety across component props and API responses, preventing runtime weather data display errors.

**Backend: Express.js + TypeScript**

- Express is lightweight and unopinionated, perfect for a focused API service without unnecessary overhead.
- TypeScript adds compile-time safety for service layers that orchestrate complex database and external API interactions.
- Layered architecture (routes → services → database) separates concerns: routes handle HTTP, services contain business logic (forecast calculation, tag assignment), and database layer abstracts Supabase queries.

**Database: Supabase (PostgreSQL)**

- Supabase provides managed PostgreSQL with real-time capabilities and built-in auth (if needed), eliminating infrastructure management.
- PostgreSQL's support for complex relationships (1:N forecast hierarchies, N:M tag mappings) and cascading deletes ensures data integrity.
- Normalized schema (6 tables) prevents data duplication and ensures consistent forecast updates across related records.

**External Weather API: Open-Meteo**

- Free tier requires no API key, reducing deployment friction and cost. Forecast and geocoding APIs return comprehensive JSON that maps directly to our data model.
- Reliable uptime and accurate historical + forecast data make it suitable for production weather applications.

**Caching Strategy**

- Forecast data is cached in Supabase after the first search. Subsequent requests for the same location return cached data, reducing external API calls.
- Search logs are persisted for audit trails and user history tracking.

**Testing & CI/CD**

- Jest + Supertest for unit and integration tests; mocked Supabase enables fast, deterministic test execution.
- GitHub Actions CI pipeline ensures TypeScript builds successfully, all tests pass, and Docker image builds before merge.

---

## Tech Stack

| Layer              | Technology                                   | Version    | Notes                         |
| ------------------ | -------------------------------------------- | ---------- | ----------------------------- |
| Runtime            | Node.js                                      | 20 LTS     | Backend runtime               |
| Backend Framework  | Express                                      | 4.18       | REST API                      |
| Backend Language   | TypeScript                                   | 5.3        | Strict mode                   |
| Database Client    | @supabase/supabase-js                        | 2.39       | Supabase/PostgreSQL           |
| HTTP Client        | Axios                                        | 1.6        | External API calls + frontend |
| Logging            | Winston                                      | 3.11       | JSON + file transports        |
| API Docs           | Swagger (swagger-jsdoc + swagger-ui-express) | 6 / 5      | Live at `/api/docs`           |
| Security           | Helmet + CORS                                | 7 / 2      | HTTP headers + cross-origin   |
| Frontend Framework | React                                        | 18.2       | SPA                           |
| Frontend Build     | Vite                                         | 5.0        | Dev server + proxy            |
| Charts             | Recharts                                     | 2.10       | Hourly temperature chart      |
| Testing            | Jest + Supertest                             | 29.7 / 6.3 | Unit + integration, 36 tests  |
| Containerization   | Docker (multi-stage)                         | —          | `backend/Dockerfile`          |
| Orchestration      | Docker Compose                               | 3.9        | `docker-compose.yml`          |
| CI/CD              | GitHub Actions                               | —          | `.github/workflows/ci.yml`    |
| External API       | Open-Meteo                                   | —          | Free, no API key required     |

---

## Database Schema

### Tables Overview

| Table                | Purpose                                          | Key Columns                                                                                                     |
| -------------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| **locations**        | Stores all geocoded cities and coordinates       | id (UUID), name, country, latitude, longitude, timezone, created_at                                             |
| **daily_forecasts**  | 7-day forecast summaries per location            | id (UUID), location_id (FK), forecast_date, temp_max, temp_min, precipitation_sum, weather_code, wind_speed_max |
| **hourly_forecasts** | 24 hourly data points per forecast day           | id (UUID), daily_forecast_id (FK), hour (0–23), temperature, precipitation, wind_speed, humidity                |
| **search_logs**      | Audit trail of all location searches             | id (UUID), location_id (FK, nullable), query_string, searched_at                                                |
| **tags**             | Climate category tags (Coastal, Mountain, etc.)  | id (UUID), name (unique), color (hex)                                                                           |
| **location_tags**    | Many-to-many junction between locations and tags | location_id (FK), tag_id (FK)                                                                                   |

### Relationships & Constraints

| Relationship                      | Type | Behavior       | Purpose                                                                           |
| --------------------------------- | ---- | -------------- | --------------------------------------------------------------------------------- |
| location → daily_forecasts        | 1:N  | CASCADE DELETE | One location has up to 7 daily forecasts; deleting location removes all forecasts |
| daily_forecast → hourly_forecasts | 1:N  | CASCADE DELETE | One daily forecast has 24 hourly data points; deletion cascades to hourly rows    |
| location → search_logs            | 1:N  | SET NULL       | One location may have many search logs; logs preserved even if location deleted   |
| location ↔ tags                   | N:M  | CASCADE DELETE | Many locations can share tags; junction table enforces referential integrity      |

### Seed Data

On database initialization, five default climate tags are inserted: Coastal, Mountain, Desert, Tropical, Urban. Each has a predefined hex color for consistent UI rendering.

---

## API Endpoints

| Method | Path                                         | Description                                                                      |
| ------ | -------------------------------------------- | -------------------------------------------------------------------------------- |
| GET    | `/health`                                    | Health check — returns `{ status, timestamp }`                                   |
| GET    | `/api/docs`                                  | Swagger UI (interactive API documentation)                                       |
| GET    | `/api/search?q=<city>`                       | Geocode city, fetch forecast, cache result; returns location + 7-day daily array |
| GET    | `/api/search/history`                        | Last 20 search log entries                                                       |
| GET    | `/api/locations`                             | All cached locations                                                             |
| GET    | `/api/locations/:id`                         | Single location with its tags                                                    |
| DELETE | `/api/locations/:id`                         | Delete location and all cascaded data                                            |
| GET    | `/api/forecasts/:locationId`                 | 7-day daily forecasts for a location                                             |
| GET    | `/api/forecasts/:locationId/hourly?dailyId=` | 24 hourly rows for a specific day                                                |
| GET    | `/api/tags`                                  | All available climate tags                                                       |
| POST   | `/api/tags/locations/:id/tags`               | Assign a tag to a location (body: `{ tagId }`)                                   |
| DELETE | `/api/tags/locations/:id/tags/:tagId`        | Remove a tag from a location                                                     |

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

#### Backend Environment Variables (Local Development)

Create a `.env` file inside the `backend/` directory:

```env
# Required: Supabase PostgreSQL connection details
# Get these from: Supabase Dashboard → Project Settings → API
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>

# Optional: Set to 3001 for development (Render may use a different port)
PORT=3001

# Optional: Set to development for local, production for deployed
NODE_ENV=development
```

**Where to find these values:**

- `SUPABASE_URL`: Supabase dashboard → Project Settings → API → Project URL
- `SUPABASE_ANON_KEY`: Supabase dashboard → Project Settings → API → Anon/public key (use the public key, NOT the service role key)

#### Frontend Environment Variables (Netlify)

The frontend is a static SPA. Add these environment variables in **Netlify Dashboard → Site Settings → Build & Deploy → Environment:**

```env
# Optional: Backend API URL if deploying backend elsewhere
# Leave empty or unset if backend is at https://weather-app-backend.onrender.com
VITE_API_URL=https://weather-app-backend.onrender.com
```

> If you don't set this, the frontend will use relative paths and route `/api/*` requests based on the current domain.

#### Backend Environment Variables (Render Production)

These are auto-configured in `render.yaml` but must be manually set in **Render Dashboard → Environment:**

```env
# Required: Supabase PostgreSQL connection details (same as local)
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>

# Must be set for production
NODE_ENV=production

# Optional: Render will auto-assign this, but you can override
PORT=3001
```

### 5. Start the Backend

```bash
cd backend
npm install
npm run dev
```

The API will be available at `http://localhost:3001`.
Swagger UI is at `http://localhost:3001/api/docs`.

> **Note:** Swagger UI is only available in local development (`npm run dev`). It is not accessible on the deployed production backend.

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

| Job              | Steps                                                                        |
| ---------------- | ---------------------------------------------------------------------------- |
| **Backend**      | `npm ci` → TypeScript type-check → run all tests with coverage → `tsc` build |
| **Docker Build** | Builds the multi-stage Docker image (depends on Backend job passing)         |
| **Frontend**     | `npm ci` → TypeScript type-check → Vite production build                     |

---

## Deployment

### Frontend: Netlify

The frontend is a static SPA built with Vite and deployed to **Netlify** for CDN distribution and automatic deployments from Git.

**Deployment Link:** [https://getweathernowat.netlify.app](https://getweathernowat.netlify.app)

**Build Configuration:**

- **Build Command:** `npm run build`
- **Publish Directory:** `dist/`
- **Node Version:** 20

**Deployment Steps:**

1. Connect your GitHub repository to Netlify.
2. Set the build command to `npm run build` and publish directory to `dist`.
3. Netlify automatically deploys on every push to the `main` branch.

**Important:** The frontend expects the backend API at a specific URL. Update the `VITE_API_URL` environment variable in your Netlify deployment settings if needed (currently defaults to the backend URL below).

### Backend: Render

The backend is deployed to **Render** as a Node.js web service using a `render.yaml` configuration file. Render automatically rebuilds and redeploys on every push.

**Deployment Link:** [https://getweathernowat.onrender.com](https://getweathernowat.onrender.com)

**Build Configuration:**

- **Build Command:** `cd backend && npm install && npm run build`
- **Start Command:** `cd backend && npm start`
- **Node Version:** 20

**Environment Variables (set in Render dashboard):**

```env
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
NODE_ENV=production
PORT=3001
```

**Deployment Steps:**

1. Connect your GitHub repository to Render.
2. Render will auto-detect the `render.yaml` file in the root directory.
3. Set the environment variables in the Render dashboard.
4. Render automatically rebuilds and redeploys on every push to the `main` branch.

### Database: Supabase

The PostgreSQL database is hosted on **Supabase** (free tier).

1. Create a project at [https://supabase.com](https://supabase.com).
2. In the SQL Editor, run the contents of `backend/src/db/migrations.sql`.
3. Copy your Project URL and anon/public API key from **Project Settings → API**.
4. Set these as environment variables in both Render (backend) and Netlify (frontend) dashboards.

**Important:** Use the `anon/public` key for client-side access. Do not expose the `service_role` key in frontend code.

---

## Future Improvements

1. **User authentication** — Integrate Supabase Auth so each user has their own saved locations and tag preferences rather than a single shared dataset.

2. **Cache invalidation strategy** — Currently forecasts are cached indefinitely. Implement a TTL (e.g., 1 hour) so that re-searching a city refreshes stale forecast data automatically.

3. **Frontend state management** — As the UI grows, lifting all state into `App.tsx` becomes unwieldy. Introduce a lightweight state manager (Zustand or React Query) to handle server-state caching and loading states more robustly.

4. **Extended forecast data** — The Open-Meteo API provides UV index, cloud cover, and weather condition icons. Surfacing these would improve the UX and make the weather card more informative.

5. **Frontend unit tests** — The current test suite covers only the backend. Adding Vitest + React Testing Library tests for components such as `SearchBar`, `WeatherCard`, and `HourlyChart` would round out coverage.

6. **Mobile-responsive design** — The current layout is functional on desktop but would benefit from a fully responsive design with a collapsible sidebar, touch-friendly forecast strip, and optimized typography for small screens.

-- locations: cities that have been searched
CREATE TABLE
IF NOT EXISTS locations
(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid
(),
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  latitude DECIMAL
(9,6) NOT NULL,
  longitude DECIMAL
(10,6) NOT NULL,
  timezone TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW
(),
  UNIQUE
(latitude, longitude)
);

-- daily_forecasts: one row per day per location (7 days cached)
CREATE TABLE
IF NOT EXISTS daily_forecasts
(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid
(),
  location_id UUID NOT NULL REFERENCES locations
(id) ON
DELETE CASCADE,
  forecast_date DATE
NOT NULL,
  temp_max DECIMAL
(5,2),
  temp_min DECIMAL
(5,2),
  precipitation_sum DECIMAL
(7,2),
  weather_code INTEGER,
  wind_speed_max DECIMAL
(7,2),
  created_at TIMESTAMPTZ DEFAULT NOW
(),
  UNIQUE
(location_id, forecast_date)
);

-- hourly_forecasts: 24 rows per daily_forecast
CREATE TABLE
IF NOT EXISTS hourly_forecasts
(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid
(),
  daily_forecast_id UUID NOT NULL REFERENCES daily_forecasts
(id) ON
DELETE CASCADE,
  hour INTEGER
NOT NULL CHECK
(hour >= 0 AND hour <= 23),
  temperature DECIMAL
(5,2),
  precipitation DECIMAL
(7,2),
  wind_speed DECIMAL
(7,2),
  humidity INTEGER CHECK
(humidity >= 0 AND humidity <= 100),
  UNIQUE
(daily_forecast_id, hour)
);

-- search_logs: audit trail of every city lookup
CREATE TABLE
IF NOT EXISTS search_logs
(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid
(),
  location_id UUID REFERENCES locations
(id) ON
DELETE
SET NULL
,
  query_string TEXT NOT NULL,
  searched_at TIMESTAMPTZ DEFAULT NOW
()
);

-- tags: climate labels e.g. "Coastal", "Mountain"
CREATE TABLE
IF NOT EXISTS tags
(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid
(),
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT '#3B82F6'
);

-- location_tags: many-to-many junction between locations and tags
CREATE TABLE
IF NOT EXISTS location_tags
(
  location_id UUID NOT NULL REFERENCES locations
(id) ON
DELETE CASCADE,
  tag_id UUID
NOT NULL REFERENCES tags
(id) ON
DELETE CASCADE,
  PRIMARY KEY (location_id, tag_id)
);

-- Seed some default tags
INSERT INTO tags
    (name, color)
VALUES
    ('Coastal', '#0EA5E9'),
    ('Mountain', '#6B7280'),
    ('Desert', '#F59E0B'),
    ('Tropical', '#10B981'),
    ('Urban', '#8B5CF6')
ON CONFLICT
(name) DO NOTHING;

-- api_cache: persistent cache for external API responses (survives server restarts)
CREATE TABLE
IF NOT EXISTS api_cache
(
  cache_key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW
()
);

-- Index for cleanup queries
CREATE INDEX
IF NOT EXISTS idx_api_cache_expires_at ON api_cache
(expires_at);
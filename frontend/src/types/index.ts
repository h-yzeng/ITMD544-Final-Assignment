export interface Location {
  id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
  created_at: string;
  tags?: Tag[];
}

export interface DailyForecast {
  id: string;
  location_id: string;
  forecast_date: string;
  temp_max: number | null;
  temp_min: number | null;
  precipitation_sum: number | null;
  weather_code: number | null;
  wind_speed_max: number | null;
}

export interface HourlyForecast {
  id: string;
  daily_forecast_id: string;
  hour: number;
  temperature: number | null;
  precipitation: number | null;
  wind_speed: number | null;
  humidity: number | null;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface SearchResult {
  location: Location;
  daily: DailyForecast[];
}

export interface SearchHistoryEntry {
  id: string;
  query_string: string;
  searched_at: string;
  locations: { name: string; country: string } | null;
}

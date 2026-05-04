export interface Location {
  id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
  created_at: string;
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
  created_at: string;
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

export interface SearchLog {
  id: string;
  location_id: string | null;
  query_string: string;
  searched_at: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface LocationTag {
  location_id: string;
  tag_id: string;
}

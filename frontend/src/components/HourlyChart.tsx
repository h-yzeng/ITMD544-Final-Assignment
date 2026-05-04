import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { HourlyForecast } from '../types';

function toF(c: number) { return Math.round((c * 9) / 5 + 32); }

interface Props {
  hourly: HourlyForecast[];
  unit: 'C' | 'F';
}

export function HourlyChart({ hourly, unit }: Props) {
  const data = hourly.map((h) => ({
    hour: `${String(h.hour).padStart(2, '0')}:00`,
    Temp: h.temperature != null ? (unit === 'F' ? toF(h.temperature) : h.temperature) : null,
    Humidity: h.humidity,
  }));

  return (
    <div className="hourly-section">
      <p className="section-title">Hourly Forecast &mdash; &deg;{unit}</p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#243055" />
          <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#6b7da0' }} interval={2} />
          <YAxis yAxisId="temp" tick={{ fontSize: 11, fill: '#6b7da0' }} />
          <YAxis yAxisId="humidity" orientation="right" tick={{ fontSize: 11, fill: '#6b7da0' }} />
          <Tooltip
            contentStyle={{ background: '#111827', border: '1px solid #243055', color: '#e8f0fe', borderRadius: '0.5rem' }}
            labelStyle={{ color: '#6b7da0', marginBottom: '0.25rem' }}
          />
          <Legend wrapperStyle={{ fontSize: '0.8rem', color: '#6b7da0' }} />
          <Line yAxisId="temp" type="monotone" dataKey="Temp" stroke="#f97316" dot={false} strokeWidth={2.5} />
          <Line yAxisId="humidity" type="monotone" dataKey="Humidity" stroke="#4cb8f0" dot={false} strokeWidth={2} strokeDasharray="4 2" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

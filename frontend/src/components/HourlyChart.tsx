import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { HourlyForecast } from '../types';

interface Props {
  hourly: HourlyForecast[];
}

export function HourlyChart({ hourly }: Props) {
  const data = hourly.map((h) => ({
    hour: `${String(h.hour).padStart(2, '0')}:00`,
    Temp: h.temperature,
    Humidity: h.humidity,
  }));

  return (
    <div className="hourly-chart">
      <h3>Hourly Forecast</h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#94a3b8' }} interval={2} />
          <YAxis yAxisId="temp" tick={{ fontSize: 11, fill: '#94a3b8' }} />
          <YAxis yAxisId="humidity" orientation="right" tick={{ fontSize: 11, fill: '#94a3b8' }} />
          <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', color: '#f1f5f9' }} />
          <Legend />
          <Line yAxisId="temp" type="monotone" dataKey="Temp" stroke="#f97316" dot={false} strokeWidth={2} />
          <Line yAxisId="humidity" type="monotone" dataKey="Humidity" stroke="#38bdf8" dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

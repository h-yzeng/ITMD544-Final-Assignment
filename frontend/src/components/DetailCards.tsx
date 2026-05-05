import type { DailyForecast } from '../types';
import { TempCard } from './detail/TempCard';
import { WindCard } from './detail/WindCard';
import { HumidityCard } from './detail/HumidityCard';
import { PrecipCard } from './detail/PrecipCard';

interface Props {
  today: DailyForecast;
  unit: 'C' | 'F';
  humidity: number | null;
}

export function DetailCards({ today, unit, humidity }: Props) {
  return (
    <div className="detail-grid">
      <TempCard today={today} unit={unit} />
      <WindCard today={today} unit={unit} />
      <HumidityCard humidity={humidity} />
      <PrecipCard today={today} unit={unit} />
    </div>
  );
}

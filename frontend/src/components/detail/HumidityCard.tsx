import { SemiGauge } from './SemiGauge';

function humidCategory(h: number): string {
  if (h < 25) return 'Very Dry';
  if (h < 45) return 'Dry';
  if (h < 65) return 'Comfortable';
  if (h < 80) return 'Humid';
  return 'Very Humid';
}

interface Props { humidity: number | null; }

export function HumidityCard({ humidity }: Props) {
  return (
    <div className="detail-card">
      <div className="detail-card__header">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
        </svg>
        Humidity
      </div>
      {humidity != null ? (
        <>
          <SemiGauge value={humidity} max={100} color="#4cb8f0" />
          <div className="detail-card__value">{humidity}%</div>
          <p className="detail-card__sub">{humidCategory(humidity)}</p>
        </>
      ) : (
        <div className="detail-card__value">—</div>
      )}
    </div>
  );
}

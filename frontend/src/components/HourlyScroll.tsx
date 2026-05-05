import { useMemo } from 'react';
import type { HourlyForecast } from '../types';
import { WeatherIcon } from './WeatherIcon';
import { toF } from '../utils/conversions';

const COL_W = 72;
const CURVE_H = 96;
const V_PAD = 14;
const LABEL_H = 18;

function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return '';
  let d = `M ${pts[0].x},${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i - 1], c = pts[i];
    const mid = (p.x + c.x) / 2;
    d += ` C ${mid},${p.y} ${mid},${c.y} ${c.x},${c.y}`;
  }
  return d;
}

function fmtHour(h: number): string {
  if (h === 0) return '12a';
  if (h < 12) return `${h}a`;
  if (h === 12) return '12p';
  return `${h - 12}p`;
}

interface Props {
  hourly: HourlyForecast[];
  unit: 'C' | 'F';
  weatherCode?: number | null;
}

export function HourlyScroll({ hourly, unit, weatherCode }: Props) {
  const temps = useMemo(
    () =>
      hourly.map((h) =>
        h.temperature != null
          ? Math.round(unit === 'F' ? toF(h.temperature) : h.temperature)
          : null,
      ),
    [hourly, unit],
  );

  const validTemps = temps.filter((t): t is number => t != null);
  const minT = validTemps.length ? Math.min(...validTemps) : 0;
  const maxT = validTemps.length ? Math.max(...validTemps) : 10;
  const rangeT = maxT - minT || 1;
  const availH = CURVE_H - 2 * V_PAD - LABEL_H;

  function yForTemp(t: number) {
    return V_PAD + LABEL_H + (1 - (t - minT) / rangeT) * availH;
  }

  const pts = temps.map((t, i) => ({
    x: i * COL_W + COL_W / 2,
    y: t != null ? yForTemp(t) : CURVE_H / 2,
  }));

  const linePath = smoothPath(pts);
  const totalW = hourly.length * COL_W;
  const fillPath = linePath
    ? `${linePath} L ${pts[pts.length - 1].x},${CURVE_H} L ${pts[0].x},${CURVE_H} Z`
    : '';
  const maxPrecip = Math.max(...hourly.map((h) => h.precipitation ?? 0), 0.001);

  return (
    <div className="hourly-section">
      <p className="section-title">Hourly Forecast</p>
      <div className="hourly-scroll-wrap">
        {/* --total-w drives width/min-width in CSS */}
        <div
          className="hourly-inner"
          style={{ '--total-w': `${totalW}px` } as React.CSSProperties}
        >
          {/* Time labels */}
          <div className="hourly-row">
            {hourly.map((h) => (
              <div key={`t-${h.id}`} className="hourly-col">
                <span className="hourly-time">{fmtHour(h.hour)}</span>
              </div>
            ))}
          </div>

          {/* Condition icons */}
          <div className="hourly-row">
            {hourly.map((h) => (
              <div key={`i-${h.id}`} className="hourly-col hourly-col--icon">
                <WeatherIcon code={weatherCode ?? null} size={24} />
              </div>
            ))}
          </div>

          {/* Temperature curve zone */}
          <div className="hourly-curve-zone">
            <svg className="hourly-curve-svg" width={totalW} height={CURVE_H}>
              <defs>
                <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#f97316" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              {fillPath && <path d={fillPath} fill="url(#curveGrad)" />}
              {linePath && (
                <path
                  d={linePath}
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
              {pts.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#f97316" stroke="var(--surface)" strokeWidth="1.5" />
              ))}
            </svg>

            {/* Temperature labels — --tl-left/--tl-top drive position in CSS */}
            {temps.map((t, i) => {
              if (t == null) return null;
              return (
                <span
                  key={`tl-${i}`}
                  className="hourly-temp-label"
                  style={{
                    '--tl-left': `${i * COL_W + COL_W / 2}px`,
                    '--tl-top':  `${yForTemp(t) - LABEL_H - 2}px`,
                  } as React.CSSProperties}
                >
                  {t}°
                </span>
              );
            })}
          </div>

          {/* Precipitation bars — --bar-h drives bar height in CSS */}
          <div className="hourly-precip-bars">
            {hourly.map((h) => {
              const p = h.precipitation ?? 0;
              const barH = maxPrecip > 0 ? Math.max(0, (p / maxPrecip) * 28) : 0;
              return (
                <div key={`pb-${h.id}`} className="hourly-col hourly-col--precip">
                  {barH > 2 && (
                    <div
                      className="hourly-precip-bar"
                      style={{ '--bar-h': `${barH}px` } as React.CSSProperties}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Precipitation values */}
          <div className="hourly-precip-vals">
            {hourly.map((h) => {
              const p = h.precipitation ?? 0;
              const label =
                p > 0
                  ? unit === 'F'
                    ? `${(p * 0.0393701).toFixed(2)}"`
                    : `${p.toFixed(1)}`
                  : '';
              return (
                <div key={`pv-${h.id}`} className="hourly-col">
                  {label && <span className="hourly-precip-val">{label}</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

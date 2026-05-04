interface Props {
  code: number | null;
  size?: number;
  className?: string;
}

export function WeatherIcon({ code, size = 48, className }: Props) {
  const c = code ?? -1;
  const s = size.toString();

  if (c === 0 || c === 1) return (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="24" cy="24" r="9" fill="#FDE68A" />
      <line x1="24" y1="7" x2="24" y2="12" stroke="#FDE68A" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="24" y1="36" x2="24" y2="41" stroke="#FDE68A" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="7" y1="24" x2="12" y2="24" stroke="#FDE68A" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="36" y1="24" x2="41" y2="24" stroke="#FDE68A" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="11.1" y1="11.1" x2="14.6" y2="14.6" stroke="#FDE68A" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="33.4" y1="33.4" x2="36.9" y2="36.9" stroke="#FDE68A" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="11.1" y1="36.9" x2="14.6" y2="33.4" stroke="#FDE68A" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="33.4" y1="14.6" x2="36.9" y2="11.1" stroke="#FDE68A" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );

  if (c === 2) return (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="17" cy="17" r="7.5" fill="#FDE68A" />
      <line x1="17" y1="6" x2="17" y2="10" stroke="#FDE68A" strokeWidth="2" strokeLinecap="round" />
      <line x1="6" y1="17" x2="10" y2="17" stroke="#FDE68A" strokeWidth="2" strokeLinecap="round" />
      <line x1="9.5" y1="9.5" x2="12.2" y2="12.2" stroke="#FDE68A" strokeWidth="2" strokeLinecap="round" />
      <line x1="9.5" y1="24.5" x2="12.2" y2="21.8" stroke="#FDE68A" strokeWidth="2" strokeLinecap="round" />
      <line x1="24.5" y1="9.5" x2="21.8" y2="12.2" stroke="#FDE68A" strokeWidth="2" strokeLinecap="round" />
      <path d="M14 38 Q14 31 21 31 Q23 25 30 25 Q37 25 37 32 Q41 32 41 38 Z" fill="#94A3B8" />
    </svg>
  );

  if (c === 3) return (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M5 30 Q5 22 14 22 Q16 14 26 14 Q36 14 36 23 Q42 23 42 30 Z" fill="#64748B" />
      <path d="M9 38 Q9 31 17 31 Q19 25 27 25 Q35 25 35 32 Q40 32 40 38 Z" fill="#7C8FAA" opacity="0.85" />
    </svg>
  );

  if (c === 45 || c === 48) return (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <line x1="6" y1="13" x2="42" y2="13" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="4" y1="21" x2="44" y2="21" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="6" y1="29" x2="42" y2="29" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="10" y1="37" x2="38" y2="37" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );

  if (c === 51 || c === 53 || c === 55) return (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M8 24 Q8 17 16 17 Q18 10 26 10 Q35 10 35 18 Q40 18 40 24 Z" fill="#64748B" />
      <line x1="16" y1="30" x2="14" y2="38" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />
      <line x1="24" y1="30" x2="22" y2="38" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />
      <line x1="32" y1="30" x2="30" y2="38" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );

  if (c === 61 || c === 63 || c === 65) return (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M7 22 Q7 15 15 15 Q17 8 26 8 Q35 8 35 16 Q41 16 41 22 Z" fill="#475569" />
      <line x1="14" y1="28" x2="11" y2="40" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" />
      <line x1="22" y1="28" x2="19" y2="40" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" />
      <line x1="30" y1="28" x2="27" y2="40" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" />
      <line x1="38" y1="28" x2="35" y2="40" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );

  if (c >= 71 && c <= 77) return (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M8 22 Q8 15 16 15 Q18 8 26 8 Q35 8 35 16 Q40 16 40 22 Z" fill="#7C8FAA" />
      <circle cx="16" cy="31" r="2.5" fill="#BAE6FD" />
      <circle cx="24" cy="36" r="2.5" fill="#BAE6FD" />
      <circle cx="32" cy="31" r="2.5" fill="#BAE6FD" />
      <circle cx="16" cy="41" r="2" fill="#BAE6FD" opacity="0.6" />
      <circle cx="32" cy="41" r="2" fill="#BAE6FD" opacity="0.6" />
    </svg>
  );

  if (c === 80 || c === 81 || c === 82) return (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="15" cy="15" r="7" fill="#FDE68A" opacity="0.7" />
      <path d="M14 26 Q14 19 21 19 Q23 13 30 13 Q38 13 38 21 Q42 21 42 26 Z" fill="#475569" />
      <line x1="20" y1="31" x2="17" y2="41" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" />
      <line x1="28" y1="31" x2="25" y2="41" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" />
      <line x1="36" y1="31" x2="33" y2="41" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );

  if (c === 95 || c === 96 || c === 99) return (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M6 22 Q6 14 15 14 Q17 6 27 6 Q37 6 37 15 Q43 15 43 22 Z" fill="#334155" />
      <path d="M27 22 L21 33 L26 33 L18 46 L31 30 L26 30 Z" fill="#FDE047" />
    </svg>
  );

  return (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M7 32 Q7 24 16 24 Q18 16 27 16 Q37 16 37 25 Q42 25 42 32 Z" fill="#64748B" />
    </svg>
  );
}

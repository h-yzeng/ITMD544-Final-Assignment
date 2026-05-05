import React, { useState, useEffect, useRef } from 'react';
import { getSuggestions } from '../api/openMeteo';
import type { LocationSuggestion } from '../types';

interface Props {
  onSearch: (query: string) => void;
  loading: boolean;
}

export function SearchBar({ onSearch, loading }: Props) {
  const [value, setValue] = useState('');
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const results = await getSuggestions(value.trim()).catch(() => []);
      setSuggestions(results);
      setOpen(results.length > 0);
    }, 280);
    return () => clearTimeout(debounceRef.current);
  }, [value]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOpen(false);
    if (value.trim()) onSearch(value.trim());
  };

  const handleSelect = (s: LocationSuggestion) => {
    setValue(s.name);
    setOpen(false);
    onSearch(s.name);
  };

  return (
    <div className="search-wrap" ref={wrapRef}>
      <form onSubmit={handleSubmit} className="search-form">
        <input
          type="text"
          value={value}
          onChange={(e) => { setValue(e.target.value); setOpen(true); }}
          onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
          placeholder="Search city..."
          aria-label="Search for a city"
          className="search-input"
          disabled={loading}
          autoComplete="off"
          spellCheck={false}
        />
        <button
          type="submit"
          className="search-button"
          disabled={loading || !value.trim()}
          aria-label="Search"
        >
          {loading ? (
            <span className="search-spinner" />
          ) : (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          )}
        </button>
      </form>

      {open && suggestions.length > 0 && (
        <ul className="search-suggestions">
          {suggestions.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                className="search-suggestion-item"
                onMouseDown={(e) => { e.preventDefault(); handleSelect(s); }}
              >
                <span className="search-suggestion__name">{s.name}</span>
                <span className="search-suggestion__meta">
                  {[s.country].filter(Boolean).join(', ')}
                  <span className="search-suggestion__code">{s.country_code}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

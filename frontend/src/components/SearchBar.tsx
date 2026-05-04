import React, { useState } from 'react';

interface Props {
  onSearch: (query: string) => void;
  loading: boolean;
}

export function SearchBar({ onSearch, loading }: Props) {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) onSearch(value.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="search-form">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search for a city..."
        className="search-input"
        disabled={loading}
      />
      <button type="submit" className="search-button" disabled={loading || !value.trim()}>
        {loading ? 'Searching...' : 'Search'}
      </button>
    </form>
  );
}

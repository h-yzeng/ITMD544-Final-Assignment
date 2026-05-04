import type { SearchHistoryEntry } from '../types';

interface Props {
  history: SearchHistoryEntry[];
  onSelect: (query: string) => void;
}

export function RecentSearches({ history, onSelect }: Props) {
  if (history.length === 0) return null;
  return (
    <div className="recent-searches">
      <h3>Recent Searches</h3>
      <ul>
        {history.slice(0, 8).map((entry) => (
          <li key={entry.id}>
            <button onClick={() => onSelect(entry.query_string)} className="recent-item">
              <span>{entry.locations?.name ?? entry.query_string}</span>
              <span className="recent-item__time">
                {new Date(entry.searched_at).toLocaleDateString()}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

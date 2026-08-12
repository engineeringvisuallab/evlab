import React from 'react';
import { Search, X, Filter } from 'lucide-react';

export interface RoadmapSearchProps {
  query: string;
  onQueryChange: (q: string) => void;
  resultCount?: number;
  placeholder?: string;
  className?: string;
}

export const RoadmapSearch: React.FC<RoadmapSearchProps> = ({
  query,
  onQueryChange,
  resultCount,
  placeholder = 'Search engineering fields, branches, specializations or focus areas...',
  className = '',
}) => {
  return (
    <div className={`w-full space-y-2 ${className}`}>
      <div className="relative flex items-center w-full">
        <div className="absolute left-3.5 text-[var(--text-muted)] pointer-events-none">
          <Search className="w-4 h-4" />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-purple)] focus:ring-1 focus:ring-[var(--accent-purple)] transition-all shadow-sm font-sans"
        />

        {query && (
          <button
            type="button"
            onClick={() => onQueryChange('')}
            className="absolute right-3.5 p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
            aria-label="Clear search query"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {query && typeof resultCount === 'number' && (
        <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-mono px-1">
          <span className="flex items-center gap-1.5">
            <Filter className="w-3 h-3 text-[var(--accent-purple)]" />
            Showing results for <span className="text-[var(--accent-purple)] font-bold">"{query}"</span>
          </span>
          <span>{resultCount} {resultCount === 1 ? 'match' : 'matches'} found</span>
        </div>
      )}
    </div>
  );
};

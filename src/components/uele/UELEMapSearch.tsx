import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Box, X, ChevronRight } from 'lucide-react';
import { GISFeature } from '../../data/sherpur-gis-data';
import { Badge } from '../shared/Badge';

export interface UELEMapSearchProps {
  features: GISFeature[];
  onSelectFeature: (featureId: string) => void;
  selectedFeatureId: string | null;
}

export const UELEMapSearch: React.FC<UELEMapSearchProps> = ({
  features,
  onSelectFeature,
  selectedFeatureId,
}) => {
  const [query, setQuery] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const matchingFeatures = query.trim()
    ? features.filter((f) => {
        const q = query.toLowerCase();
        const p = f.properties;
        const nameMatch = p.name.toLowerCase().includes(q);
        const catMatch = p.category.toLowerCase().includes(q);
        const layerMatch = p.layerName.toLowerCase().includes(q);
        const descMatch = p.description?.toLowerCase().includes(q);
        const attrMatch = Object.values(p.attributes || {}).some((v) =>
          String(v).toLowerCase().includes(q)
        );
        return nameMatch || catMatch || layerMatch || descMatch || attrMatch;
      })
    : [];

  const handleSelect = (featureId: string) => {
    onSelectFeature(featureId);
    setIsOpen(false);
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-xs md:max-w-sm font-mono">
      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search Sherpur GIS facility, river, road..."
          className="w-full bg-slate-950 text-xs text-slate-100 pl-8 pr-8 py-1.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500 transition-colors placeholder:text-slate-500"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && query.trim() && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-slate-900 border border-cyan-500/30 rounded-2xl p-2 shadow-2xl z-50 max-h-72 overflow-y-auto space-y-1">
          {matchingFeatures.length === 0 ? (
            <div className="p-3 text-center text-xs text-slate-400">
              No matching GIS features or facilities found.
            </div>
          ) : (
            matchingFeatures.map((feat) => {
              const isSelected = feat.id === selectedFeatureId;
              return (
                <button
                  key={feat.id}
                  onClick={() => handleSelect(feat.id)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-center justify-between cursor-pointer border ${
                    isSelected
                      ? 'bg-cyan-500/20 border-cyan-400 text-white font-bold'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-cyan-500/50 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center space-x-2 min-w-0">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <div className="truncate">
                      <div className="font-bold truncate text-slate-100">
                        {feat.properties.name}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {feat.properties.layerName} • {feat.properties.geometryType}
                      </div>
                    </div>
                  </div>
                  <Badge variant="muted" size="sm">
                    {feat.properties.category}
                  </Badge>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { TOPICS_DATA } from '../core/topics';
import { TopicId } from '../types';
import { 
  Activity, 
  ArrowUpDown, 
  BarChart2, 
  BookOpen, 
  Circle, 
  Columns, 
  Compass, 
  GitCommit, 
  Grid, 
  HelpCircle, 
  Layers, 
  Maximize2, 
  Minimize2, 
  MoveHorizontal, 
  RotateCcw, 
  RotateCw, 
  Search, 
  ShieldAlert, 
  Sliders, 
  TrendingDown 
} from 'lucide-react';

interface SidebarTopicNavProps {
  currentTopicId: TopicId;
  onSelectTopic: (id: TopicId) => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  ArrowUpDown: <ArrowUpDown className="w-4 h-4" />,
  MoveHorizontal: <MoveHorizontal className="w-4 h-4" />,
  Maximize2: <Maximize2 className="w-4 h-4" />,
  Activity: <Activity className="w-4 h-4" />,
  Layers: <Layers className="w-4 h-4" />,
  RotateCw: <RotateCw className="w-4 h-4" />,
  Sliders: <Sliders className="w-4 h-4" />,
  GitCommit: <GitCommit className="w-4 h-4" />,
  BarChart2: <BarChart2 className="w-4 h-4" />,
  TrendingDown: <TrendingDown className="w-4 h-4" />,
  Compass: <Compass className="w-4 h-4" />,
  RotateCcw: <RotateCcw className="w-4 h-4" />,
  Circle: <Circle className="w-4 h-4" />,
  Minimize2: <Minimize2 className="w-4 h-4" />,
  Grid: <Grid className="w-4 h-4" />,
  ShieldAlert: <ShieldAlert className="w-4 h-4" />,
  HelpCircle: <HelpCircle className="w-4 h-4" />,
  Columns: <Columns className="w-4 h-4" />,
  BookOpen: <BookOpen className="w-4 h-4" />,
};

export const SidebarTopicNav: React.FC<SidebarTopicNavProps> = ({
  currentTopicId,
  onSelectTopic,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    'Fundamentals',
    'Torsion & Shear',
    'Beams & Flexure',
    'Stress Transformation',
    'Stability & Failure',
    'Special Labs',
  ] as const;

  const filteredTopics = TOPICS_DATA.filter(topic =>
    topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    topic.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    topic.keyConcepts.some(k => k.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <aside className="w-72 bg-slate-950 border-r border-slate-800 flex flex-col h-[calc(100vh-85px)] select-none shrink-0">
      {/* Search Filter */}
      <div className="p-3 border-b border-slate-800 bg-slate-900/50">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search mechanics topics..."
            className="w-full bg-slate-950 border border-slate-800 rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-2 text-xs text-slate-500 hover:text-slate-300"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Topics List Grouped by Category */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4 text-xs scrollbar-thin scrollbar-thumb-slate-800">
        {categories.map(category => {
          const categoryTopics = filteredTopics.filter(t => t.category === category);
          if (categoryTopics.length === 0) return null;

          return (
            <div key={category} className="space-y-1">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                <span>{category}</span>
                <span className="text-[9px] bg-slate-900 px-1.5 py-0.5 rounded text-slate-400 font-mono">
                  {categoryTopics.length}
                </span>
              </div>

              <div className="space-y-0.5">
                {categoryTopics.map(topic => {
                  const isSelected = currentTopicId === topic.id;
                  return (
                    <button
                      key={topic.id}
                      onClick={() => onSelectTopic(topic.id)}
                      className={`w-full text-left px-2.5 py-2 rounded-lg transition group flex items-start space-x-2.5 ${
                        isSelected
                          ? 'bg-gradient-to-r from-cyan-950/80 to-blue-950/60 border border-cyan-700/50 text-cyan-200 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                      }`}
                    >
                      <div className={`mt-0.5 p-1 rounded ${
                        isSelected
                          ? 'bg-cyan-900/80 text-cyan-300'
                          : 'bg-slate-900 text-slate-500 group-hover:text-slate-300'
                      }`}>
                        {ICON_MAP[topic.iconName] || <Activity className="w-4 h-4" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`font-semibold truncate ${
                            isSelected ? 'text-cyan-300 font-bold' : 'text-slate-300'
                          }`}>
                            {topic.title}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5 font-sans">
                          {topic.subtitle}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Status Info */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/30 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Active Curriculum:</span>
        <span className="font-mono text-cyan-400 font-semibold">17 Labs Ready</span>
      </div>
    </aside>
  );
};

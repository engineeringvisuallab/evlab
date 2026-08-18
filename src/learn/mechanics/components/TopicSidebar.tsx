import React from 'react';
import {
  Activity,
  Anchor,
  Compass,
  Cpu,
  Crosshair,
  Disc,
  Grid,
  Layers,
  Maximize2,
  PlayCircle,
  RotateCw,
  Sun,
  Target,
  Zap,
} from 'lucide-react';
import { MainCategory, TopicDefinition } from '../types/mechanics';

interface TopicSidebarProps {
  topics: TopicDefinition[];
  currentTopicId: string;
  onSelectTopic: (id: string) => void;
  isDark: boolean;
}

const CATEGORY_ORDER: MainCategory[] = [
  'Statics',
  'Dynamics',
  'Rigid Body Mechanics',
  'Structural Mechanics',
  'Engineering Systems',
];

const ICONS_MAP: Record<string, React.ReactNode> = {
  Compass: <Compass className="w-4 h-4" />,
  Maximize2: <Maximize2 className="w-4 h-4" />,
  RotateCw: <RotateCw className="w-4 h-4" />,
  Anchor: <Anchor className="w-4 h-4" />,
  Layers: <Layers className="w-4 h-4" />,
  Crosshair: <Crosshair className="w-4 h-4" />,
  Activity: <Activity className="w-4 h-4" />,
  Grid: <Grid className="w-4 h-4" />,
  PlayCircle: <PlayCircle className="w-4 h-4" />,
  Target: <Target className="w-4 h-4" />,
  Zap: <Zap className="w-4 h-4" />,
  Sun: <Sun className="w-4 h-4" />,
  Disc: <Disc className="w-4 h-4" />,
  Cpu: <Cpu className="w-4 h-4" />,
};

export const TopicSidebar: React.FC<TopicSidebarProps> = ({
  topics,
  currentTopicId,
  onSelectTopic,
  isDark,
}) => {
  return (
    <aside
      id="topic-sidebar"
      className={`w-64 border-r flex flex-col shrink-0 h-[calc(100vh-4rem)] overflow-y-auto ${
        isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50/70 border-slate-200'
      }`}
    >
      <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Mechanics Curriculum
        </span>
        <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-blue-500/10 text-blue-500 font-semibold">
          {topics.length} Labs
        </span>
      </div>

      <div className="p-2 space-y-4">
        {CATEGORY_ORDER.map((category) => {
          const categoryTopics = topics.filter((t) => t.category === category);
          if (categoryTopics.length === 0) return null;

          return (
            <div key={category} className="space-y-1">
              <div className="px-2.5 py-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>{category}</span>
                <span className="text-[10px] opacity-60 font-mono">({categoryTopics.length})</span>
              </div>

              <div className="space-y-0.5">
                {categoryTopics.map((topic) => {
                  const isActive = topic.id === currentTopicId;
                  return (
                    <button
                      key={topic.id}
                      id={`sidebar-topic-${topic.id}`}
                      onClick={() => onSelectTopic(topic.id)}
                      className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-all group ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30 font-semibold'
                          : isDark
                          ? 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                          : 'text-slate-700 hover:bg-slate-200/70 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                        <span
                          className={`shrink-0 ${
                            isActive
                              ? 'text-white'
                              : 'text-slate-400 group-hover:text-blue-500 transition-colors'
                          }`}
                        >
                          {ICONS_MAP[topic.iconName] || <Compass className="w-4 h-4" />}
                        </span>
                        <span className="truncate">{topic.title}</span>
                      </div>
                      {topic.badge && !isActive && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded font-mono bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0">
                          {topic.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};

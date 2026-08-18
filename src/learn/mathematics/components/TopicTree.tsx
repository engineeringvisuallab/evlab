import React, { useState } from "react";
import { TopicDefinition, TopicCategory, EducationalLevel } from "../types/math";
import { CURRICULUM_TOPICS } from "../curriculum/topicsData";
import { Search, Layers, ChevronRight } from "lucide-react";

interface Props {
  activeTopicId: string;
  onSelectTopic: (topic: TopicDefinition) => void;
  userLevel: EducationalLevel | "ALL";
  onSelectLevel: (level: EducationalLevel | "ALL") => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  "Differential Calculus": "d/dx",
  "Integral Calculus": "∫",
  "Algebra & Equations": "x²",
  "Trigonometry": "sin",
  "Vectors & 3D Geometry": "→",
  "Linear Algebra & Matrices": "⟦A⟧",
  "Differential Equations": "dy/dx",
  "Fourier & Signal Analysis": "∿",
  "Probability & Statistics": "μ,σ",
  "Numerical Methods": "Δx",
  "Multivariable Calculus": "∇f",
};

const ALL_LEVELS: (EducationalLevel | "ALL")[] = [
  "ALL",
  "School (Class 9-10 / SSC)",
  "Higher Secondary (HSC / College)",
  "Diploma / Polytechnic",
  "University BSc",
  "Advanced Engineering",
];

export const TopicTree: React.FC<Props> = ({
  activeTopicId,
  onSelectTopic,
  userLevel,
  onSelectLevel,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const categories = Array.from(new Set(CURRICULUM_TOPICS.map((t) => t.category)));

  const filteredTopics = CURRICULUM_TOPICS.filter((topic) => {
    const matchesSearch =
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === "ALL" || topic.category === selectedCategory;
    const matchesLevel = userLevel === "ALL" || topic.levelBadge.includes(userLevel) || topic.levelBadge.includes("School → Engineering");

    return matchesSearch && matchesCategory && matchesLevel;
  });

  return (
    <div className="flex flex-col h-full bg-slate-900/95 border-r border-slate-800 text-slate-200">
      {/* Header & Search */}
      <div className="p-3 border-b border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="text-blue-400" size={16} />
            <span className="font-semibold text-xs tracking-wider uppercase text-slate-300">
              Curriculum Labs
            </span>
          </div>
          <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-800 text-blue-300 font-mono">
            {filteredTopics.length} Labs
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 text-slate-400" size={13} />
          <input
            type="text"
            placeholder="Search topic, concept, equation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Educational Level Selector */}
        <div className="flex items-center gap-1.5 pt-1 overflow-x-auto no-scrollbar">
          <span className="text-[10px] text-slate-400 uppercase font-mono">Level:</span>
          {ALL_LEVELS.map((lvl) => {
            const shortLabel =
              lvl === "ALL"
                ? "All Levels"
                : lvl.includes("School")
                ? "Class 9-10"
                : lvl.includes("HSC")
                ? "HSC / College"
                : lvl.includes("Diploma")
                ? "Diploma"
                : lvl.includes("University")
                ? "BSc"
                : "Engineering";

            return (
              <button
                key={lvl}
                onClick={() => onSelectLevel(lvl)}
                className={`px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap transition-all ${
                  userLevel === lvl
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                {shortLabel}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="px-2 py-1.5 border-b border-slate-800 flex gap-1 overflow-x-auto no-scrollbar bg-slate-950/40">
        <button
          onClick={() => setSelectedCategory("ALL")}
          className={`px-2 py-1 rounded text-[11px] font-medium whitespace-nowrap transition-all ${
            selectedCategory === "ALL"
              ? "bg-slate-800 text-blue-400 font-semibold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          All Domains
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-2 py-1 rounded text-[11px] font-medium whitespace-nowrap transition-all flex items-center gap-1 ${
              selectedCategory === cat
                ? "bg-slate-800 text-blue-400 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span className="font-mono text-xs opacity-75">{CATEGORY_ICONS[cat] || "•"}</span>
            <span>{cat}</span>
          </button>
        ))}
      </div>

      {/* Topics List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {filteredTopics.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs">
            No math labs found matching your filters.
          </div>
        ) : (
          filteredTopics.map((topic) => {
            const isActive = topic.id === activeTopicId;
            return (
              <button
                key={topic.id}
                onClick={() => onSelectTopic(topic)}
                className={`w-full text-left p-2.5 rounded-lg transition-all border group relative ${
                  isActive
                    ? "bg-blue-950/60 border-blue-500/60 shadow-md"
                    : "bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700"
                }`}
              >
                <div className="flex items-start justify-between gap-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded bg-slate-800 flex items-center justify-center text-[10px] font-mono text-blue-400 font-bold border border-slate-700">
                      {CATEGORY_ICONS[topic.category] || "•"}
                    </span>
                    <h4
                      className={`text-xs font-semibold leading-tight ${
                        isActive ? "text-blue-300" : "text-slate-200 group-hover:text-white"
                      }`}
                    >
                      {topic.title}
                    </h4>
                  </div>
                  <ChevronRight
                    size={14}
                    className={`text-slate-500 transition-transform ${
                      isActive ? "rotate-90 text-blue-400" : "group-hover:translate-x-0.5"
                    }`}
                  />
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 pl-6">
                  {topic.summary}
                </p>

                <div className="flex items-center gap-2 mt-2 pl-6">
                  <span className="text-[10px] text-indigo-400 bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-800/40 font-mono">
                    {topic.category}
                  </span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-800/40 font-mono">
                    {topic.levelBadge}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

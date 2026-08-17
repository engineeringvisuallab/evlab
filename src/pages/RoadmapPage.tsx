import React, { useState, useEffect, useMemo } from 'react';
import { Compass, ArrowLeft, RotateCcw, Sparkles, Filter, Search } from 'lucide-react';
import { Container } from '../components/shared/Container';
import { SectionHeader } from '../components/shared/SectionHeader';
import { Breadcrumbs, BreadcrumbItem } from '../components/shared/Breadcrumbs';
import { Badge } from '../components/shared/Badge';
import { Button } from '../components/shared/Button';
import { StepBar } from '../components/roadmap/StepBar';
import { RoadmapNodeCard } from '../components/roadmap/RoadmapNodeCard';
import { RoadmapSearch } from '../components/roadmap/RoadmapSearch';
import { RoadmapDetailCard } from '../components/roadmap/RoadmapDetailCard';
import { RoadmapNode } from '../types/roadmap';

// Import Stage 01 tree data
import roadmapTreeData from '../data/roadmap-tree.json';

export interface RoadmapPageProps {
  initialFieldId?: string | null;
  onNavigateHome?: () => void;
  onNavigateToUele?: (ueleId: string) => void;
}

export const RoadmapPage: React.FC<RoadmapPageProps> = ({
  initialFieldId,
  onNavigateHome,
  onNavigateToUele,
}) => {
  const treeNodes = roadmapTreeData as RoadmapNode[];

  // Roadmap Navigation State
  const [selectedField, setSelectedField] = useState<RoadmapNode | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<RoadmapNode | null>(null);
  const [selectedSpec, setSelectedSpec] = useState<RoadmapNode | null>(null);
  const [selectedArea, setSelectedArea] = useState<RoadmapNode | null>(null);

  // Search Query
  const [searchQuery, setSearchQuery] = useState('');

  // Helper to resolve field node including aliases
  const findFieldNode = (id: string | null | undefined): RoadmapNode | null => {
    if (!id) return null;
    return (
      treeNodes.find(
        (n) =>
          n.id === id ||
          (id === 'civil' && n.id === 'civil-engineering') ||
          (id === 'civil-engineering' && n.id === 'civil') ||
          (id === 'electrical' && n.id === 'electrical-engineering') ||
          (id === 'electrical-engineering' && n.id === 'electrical') ||
          (id === 'mechanical' && n.id === 'mechanical-engineering') ||
          (id === 'mechanical-engineering' && n.id === 'mechanical')
      ) || null
    );
  };

  // 1. Sync with hash / initialFieldId on mount and location changes
  useEffect(() => {
    const parseHashAndSetState = () => {
      const hash = window.location.hash.replace('#', '');

      // Check if hash starts with career-roadmap or roadmap
      if (hash.startsWith('career-roadmap') || hash.startsWith('roadmap')) {
        const parts = hash.split('/').filter(Boolean);
        // parts[0] is 'career-roadmap', parts[1] is fieldId, parts[2] is branchId, etc.
        const fieldId = parts[1] || initialFieldId;
        const branchId = parts[2];
        const specId = parts[3];
        const areaId = parts[4];

        if (fieldId) {
          const field = findFieldNode(fieldId);
          setSelectedField(field);

          if (field && branchId && field.children) {
            const branch = field.children.find((b) => b.id === branchId) || null;
            setSelectedBranch(branch);

            if (branch && specId && branch.children) {
              const spec = branch.children.find((s) => s.id === specId) || null;
              setSelectedSpec(spec);

              if (spec && areaId && spec.children) {
                const area = spec.children.find((a) => a.id === areaId) || null;
                setSelectedArea(area);
              } else {
                setSelectedArea(null);
              }
            } else {
              setSelectedSpec(null);
              setSelectedArea(null);
            }
          } else {
            setSelectedBranch(null);
            setSelectedSpec(null);
            setSelectedArea(null);
          }
        }
      } else if (initialFieldId) {
        const field = findFieldNode(initialFieldId);
        if (field) {
          setSelectedField(field);
        }
      }
    };

    parseHashAndSetState();

    window.addEventListener('hashchange', parseHashAndSetState);
    window.addEventListener('popstate', parseHashAndSetState);
    return () => {
      window.removeEventListener('hashchange', parseHashAndSetState);
      window.removeEventListener('popstate', parseHashAndSetState);
    };
  }, [initialFieldId]);

  // Update URL Hash whenever selections change
  const updateHash = (
    field: RoadmapNode | null,
    branch: RoadmapNode | null,
    spec: RoadmapNode | null,
    area: RoadmapNode | null
  ) => {
    const parts = ['career-roadmap'];
    if (field) parts.push(field.id);
    if (branch) parts.push(branch.id);
    if (spec) parts.push(spec.id);
    if (area) parts.push(area.id);

    const newHash = '#' + parts.join('/');
    if (window.location.hash !== newHash) {
      window.history.pushState(null, '', newHash);
    }
  };

  // Selection Handlers
  const handleSelectField = (field: RoadmapNode) => {
    setSelectedField(field);
    setSelectedBranch(null);
    setSelectedSpec(null);
    setSelectedArea(null);
    updateHash(field, null, null, null);
  };

  const handleSelectBranch = (branch: RoadmapNode) => {
    setSelectedBranch(branch);
    setSelectedSpec(null);
    setSelectedArea(null);
    updateHash(selectedField, branch, null, null);
  };

  const handleSelectSpec = (spec: RoadmapNode) => {
    setSelectedSpec(spec);
    setSelectedArea(null);
    updateHash(selectedField, selectedBranch, spec, null);
  };

  const handleSelectArea = (area: RoadmapNode) => {
    setSelectedArea(area);
    updateHash(selectedField, selectedBranch, selectedSpec, area);
  };

  const handleReset = () => {
    setSelectedField(null);
    setSelectedBranch(null);
    setSelectedSpec(null);
    setSelectedArea(null);
    setSearchQuery('');
    updateHash(null, null, null, null);
  };

  // StepBar Click Handler
  const handleStepBarSelect = (stepNumber: number) => {
    if (stepNumber === 1) {
      setSelectedField(null);
      setSelectedBranch(null);
      setSelectedSpec(null);
      setSelectedArea(null);
      updateHash(null, null, null, null);
    } else if (stepNumber === 2) {
      setSelectedBranch(null);
      setSelectedSpec(null);
      setSelectedArea(null);
      updateHash(selectedField, null, null, null);
    } else if (stepNumber === 3) {
      setSelectedSpec(null);
      setSelectedArea(null);
      updateHash(selectedField, selectedBranch, null, null);
    } else if (stepNumber === 4) {
      setSelectedArea(null);
      updateHash(selectedField, selectedBranch, selectedSpec, null);
    }
  };

  // Calculate Current Step Number
  const currentStepNumber = useMemo(() => {
    if (selectedArea) return 4;
    if (selectedSpec) return 4; // At Step 4 (Selecting Focus Area or viewing Focus Area detail)
    if (selectedBranch) return 3; // At Step 3 (Selecting Specialization)
    if (selectedField) return 2; // At Step 2 (Selecting Branch)
    return 1; // At Step 1 (Selecting Field)
  }, [selectedField, selectedBranch, selectedSpec, selectedArea]);

  // Current Level Options to render
  const currentLevelOptions = useMemo(() => {
    if (selectedSpec) return selectedSpec.children || [];
    if (selectedBranch) return selectedBranch.children || [];
    if (selectedField) return selectedField.children || [];
    return treeNodes;
  }, [selectedField, selectedBranch, selectedSpec, treeNodes]);

  // Search Filtered Options
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return currentLevelOptions;
    const q = searchQuery.toLowerCase();

    const checkDeepMatch = (n: RoadmapNode): boolean => {
      if (n.title.toLowerCase().includes(q)) return true;
      if (n.summary?.toLowerCase().includes(q)) return true;
      if (n.id.toLowerCase().includes(q)) return true;
      if (n.relations) {
        for (const key of Object.keys(n.relations) as Array<keyof typeof n.relations>) {
          const list = n.relations[key];
          if (Array.isArray(list) && list.some((item) => item.toLowerCase().includes(q))) {
            return true;
          }
        }
      }
      if (n.children && n.children.length > 0) {
        return n.children.some((child) => checkDeepMatch(child));
      }
      return false;
    };

    return currentLevelOptions.filter((node) => checkDeepMatch(node));
  }, [currentLevelOptions, searchQuery]);

  // Global search match finder across entire tree when searching from top level
  const globalSearchMatches = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return [];
    const q = searchQuery.toLowerCase();
    const matches: Array<{ node: RoadmapNode; field?: RoadmapNode; branch?: RoadmapNode; spec?: RoadmapNode }> = [];

    treeNodes.forEach((field) => {
      if (field.title.toLowerCase().includes(q) || field.summary?.toLowerCase().includes(q)) {
        matches.push({ node: field });
      }
      field.children?.forEach((branch) => {
        if (branch.title.toLowerCase().includes(q) || branch.summary?.toLowerCase().includes(q)) {
          matches.push({ node: branch, field });
        }
        branch.children?.forEach((spec) => {
          if (spec.title.toLowerCase().includes(q) || spec.summary?.toLowerCase().includes(q)) {
            matches.push({ node: spec, field, branch });
          }
          spec.children?.forEach((area) => {
            if (area.title.toLowerCase().includes(q) || area.summary?.toLowerCase().includes(q)) {
              matches.push({ node: area, field, branch, spec });
            }
          });
        });
      });
    });

    return matches;
  }, [searchQuery, treeNodes]);

  // Breadcrumbs Generator
  const breadcrumbItems = useMemo<BreadcrumbItem[]>(() => {
    const items: BreadcrumbItem[] = [
      {
        label: 'Career Roadmap',
        href: '#career-roadmap',
        active: !selectedField,
      },
    ];

    if (selectedField) {
      items.push({
        label: selectedField.title,
        href: `#career-roadmap/${selectedField.id}`,
        active: !selectedBranch,
      });
    }

    if (selectedBranch) {
      items.push({
        label: selectedBranch.title,
        href: `#career-roadmap/${selectedField?.id}/${selectedBranch.id}`,
        active: !selectedSpec,
      });
    }

    if (selectedSpec) {
      items.push({
        label: selectedSpec.title,
        href: `#career-roadmap/${selectedField?.id}/${selectedBranch?.id}/${selectedSpec.id}`,
        active: !selectedArea,
      });
    }

    if (selectedArea) {
      items.push({
        label: selectedArea.title,
        href: `#career-roadmap/${selectedField?.id}/${selectedBranch?.id}/${selectedSpec?.id}/${selectedArea.id}`,
        active: true,
      });
    }

    return items;
  }, [selectedField, selectedBranch, selectedSpec, selectedArea]);

  // Handle Breadcrumb navigation clicks
  const handleBreadcrumbNavigate = (href?: string) => {
    if (!href || href === '#career-roadmap' || href === '/') {
      handleReset();
      return;
    }

    const parts = href.replace('#career-roadmap/', '').split('/');
    const fieldId = parts[0];
    const branchId = parts[1];
    const specId = parts[2];
    const areaId = parts[3];

    const field = treeNodes.find((f) => f.id === fieldId) || null;
    setSelectedField(field);

    if (field && branchId && field.children) {
      const branch = field.children.find((b) => b.id === branchId) || null;
      setSelectedBranch(branch);

      if (branch && specId && branch.children) {
        const spec = branch.children.find((s) => s.id === specId) || null;
        setSelectedSpec(spec);

        if (spec && areaId && spec.children) {
          const area = spec.children.find((a) => a.id === areaId) || null;
          setSelectedArea(area);
        } else {
          setSelectedArea(null);
        }
      } else {
        setSelectedSpec(null);
        setSelectedArea(null);
      }
    } else {
      setSelectedBranch(null);
      setSelectedSpec(null);
      setSelectedArea(null);
    }
  };

  // Section Titles based on current step
  const currentStepTitle = useMemo(() => {
    if (selectedArea) return selectedArea.title;
    if (selectedSpec) return `Choose Focus Area within ${selectedSpec.title}`;
    if (selectedBranch) return `Choose Specialization within ${selectedBranch.title}`;
    if (selectedField) return `Choose Branch within ${selectedField.title}`;
    return 'CHOOSE YOUR ENGINEERING FIELD';
  }, [selectedField, selectedBranch, selectedSpec, selectedArea]);

  const currentStepDescription = useMemo(() => {
    if (selectedArea) return selectedArea.summary || 'Selected Focus Area details and ecosystem connections.';
    if (selectedSpec) return 'Select a specific technical focus area to pinpoint your career target.';
    if (selectedBranch) return 'Choose a specialized engineering domain to narrow down your focus.';
    if (selectedField) return 'Explore major engineering branches available in this discipline.';
    return 'Your engineering career starts with one decision. Choose the field you want to explore and build your roadmap from there.';
  }, [selectedField, selectedBranch, selectedSpec, selectedArea]);

  return (
    <Container size="xl" className="py-8 sm:py-12 space-y-8">
      {/* Top Header Navigation Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Breadcrumbs
            items={breadcrumbItems}
            showHome
            onNavigate={(href) => {
              if (href === '/') {
                if (onNavigateHome) onNavigateHome();
              } else {
                handleBreadcrumbNavigate(href);
              }
            }}
          />
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {(selectedField || searchQuery) && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              onClick={handleReset}
            >
              Reset Roadmap
            </Button>
          )}
          {onNavigateHome && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
              onClick={onNavigateHome}
            >
              Master Homepage
            </Button>
          )}
        </div>
      </div>

      {/* StepBar Indicator (Steps 1 to 4) */}
      <StepBar
        currentStep={currentStepNumber}
        selectedPath={{
          fieldTitle: selectedField?.title,
          branchTitle: selectedBranch?.title,
          specTitle: selectedSpec?.title,
          areaTitle: selectedArea?.title,
        }}
        onSelectStep={handleStepBarSelect}
      />

      {/* Main Section Header */}
      <SectionHeader
        badge={
          selectedArea
            ? 'STEP 4 • FOCUS AREA DETAIL'
            : selectedSpec
            ? 'STEP 4 • SELECT FOCUS AREA'
            : selectedBranch
            ? 'STEP 3 • SELECT SPECIALIZATION'
            : selectedField
            ? 'STEP 2 • SELECT BRANCH'
            : 'STEP 1 • SELECT FIELD'
        }
        badgeVariant="purple"
        title={currentStepTitle}
        description={currentStepDescription}
      />

      {/* Search Input Box */}
      {!selectedArea && (
        <RoadmapSearch
          query={searchQuery}
          onQueryChange={setSearchQuery}
          resultCount={searchQuery ? (selectedField ? filteredOptions.length : globalSearchMatches.length) : undefined}
          placeholder={
            selectedField
              ? `Search sub-paths in ${selectedField.title}...`
              : 'Search engineering fields (e.g. Civil, Mechanical, Water, Structural)...'
          }
        />
      )}

      {/* SEARCH RESULTS MODE (if query is typed globally on Step 1) */}
      {searchQuery && !selectedField && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold font-mono text-[var(--text-muted)] uppercase tracking-wider">
            Global Search Matches across Roadmap Taxonomy
          </h3>

          {globalSearchMatches.length === 0 ? (
            <div className="p-8 text-center bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl space-y-2">
              <p className="font-bold text-base text-[var(--text-primary)]">No matching engineering paths found</p>
              <p className="text-xs text-[var(--text-muted)]">
                Try searching for keywords like "Civil", "Water", "Electrical", or "Structural".
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {globalSearchMatches.map(({ node, field, branch, spec }) => (
                <div
                  key={node.id}
                  onClick={() => {
                    if (field) setSelectedField(field);
                    if (branch) setSelectedBranch(branch);
                    if (spec) setSelectedSpec(spec);
                    if (node.kind === 'area') setSelectedArea(node);
                    setSearchQuery('');
                  }}
                  className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] hover:border-[var(--accent-purple)] transition-all cursor-pointer space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <Badge variant="purple" size="sm">
                      {(node.kind || 'NODE').toUpperCase()}
                    </Badge>
                    <span className="text-[10px] font-mono text-[var(--text-muted)]">Match</span>
                  </div>

                  <h4 className="font-bold text-base text-[var(--text-primary)] group-hover:text-[var(--accent-purple)] transition-colors">
                    {node.title}
                  </h4>

                  <p className="text-xs text-[var(--text-secondary)] line-clamp-2">
                    {node.summary || 'Engineering discipline path node.'}
                  </p>

                  <div className="pt-2 border-t border-[var(--border-color)] text-[10px] font-mono text-[var(--text-muted)]">
                    Path: {field?.title || node.title} {branch ? `→ ${branch.title}` : ''} {spec ? `→ ${spec.title}` : ''}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* STEP 4 DETAIL VIEW (Selected Area or Terminal Node) */}
      {selectedArea ? (
        <RoadmapDetailCard
          node={selectedArea}
          parentPath={{
            field: selectedField || undefined,
            branch: selectedBranch || undefined,
            specialization: selectedSpec || undefined,
          }}
          onBack={() => {
            setSelectedArea(null);
            updateHash(selectedField, selectedBranch, selectedSpec, null);
          }}
          onNavigateToUele={onNavigateToUele}
        />
      ) : (
        /* STANDARD LEVEL GRID VIEW (Step 1, Step 2, Step 3, or Step 4 options) */
        !searchQuery || selectedField ? (
          <div className="space-y-6">
            {filteredOptions.length === 0 ? (
              <div className="p-10 text-center bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl space-y-4 max-w-2xl mx-auto">
                <div className="p-4 rounded-full bg-[var(--accent-purple-bg)] border border-[var(--accent-purple)]/20 w-fit mx-auto text-[var(--accent-purple)]">
                  <Compass className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <Badge variant="purple" size="sm">
                    {selectedField?.comingSoon ? 'TAXONOMY REGISTERED • ROADMAP IN DEVELOPMENT' : 'SUB-BRANCHES IN DEVELOPMENT'}
                  </Badge>
                  <h4 className="font-bold text-lg text-[var(--text-primary)]">
                    {selectedField ? selectedField.title : 'No Sub-Branches Currently Defined'}
                  </h4>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-lg mx-auto">
                    {selectedField?.comingSoon
                      ? `${selectedField.title} is registered as a top-level engineering field baseline. Detailed branches, specializations, and focus areas for this field will be expanded in upcoming Career Roadmap releases.`
                      : 'This section is established in the taxonomy and ready for detailed topic expansion.'}
                  </p>
                </div>
                <div className="pt-2 flex justify-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (selectedSpec) setSelectedSpec(null);
                      else if (selectedBranch) setSelectedBranch(null);
                      else if (selectedField) {
                        setSelectedField(null);
                        updateHash(null, null, null, null);
                      }
                    }}
                  >
                    Return to Field Selection
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOptions.map((node) => (
                  <RoadmapNodeCard
                    key={node.id}
                    node={node}
                    onClick={() => {
                      if (!selectedField) {
                        handleSelectField(node);
                      } else if (!selectedBranch) {
                        handleSelectBranch(node);
                      } else if (!selectedSpec) {
                        handleSelectSpec(node);
                      } else {
                        handleSelectArea(node);
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        ) : null
      )}
    </Container>
  );
};

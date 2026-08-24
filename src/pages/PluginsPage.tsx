import React, { useMemo, useState } from 'react';
import { Download, ChevronDown, ChevronUp, PlugZap, Tag, Layers } from 'lucide-react';
import { Container } from '../components/shared/Container';
import { SectionHeader } from '../components/shared/SectionHeader';
import { Card } from '../components/shared/Card';
import { Badge } from '../components/shared/Badge';
import { Button } from '../components/shared/Button';

import pluginsData from '../data/registries/plugins.json';

interface PluginCommand {
  command: string;
  description: string;
}

interface PluginCategory {
  title: string;
  titleBn?: string;
  commands: PluginCommand[];
}

interface RawPlugin {
  id: string;
  name?: string;
  title?: string;
  description?: string;
  summary?: string;
  category?: string;
  hostSoftware?: string[];
  version?: string;
  author?: string;
  price?: string;
  downloadUrl?: string;
  fileName?: string;
  fileSize?: string;
  installNote?: string;
  tags?: string[];
  categories?: PluginCategory[];
}

interface NormalizedPlugin extends RawPlugin {
  displayName: string;
  displayDescription: string;
  displayTags: string[];
}

function normalize(id: string, item: RawPlugin): NormalizedPlugin {
  return {
    ...item,
    id,
    displayName: item.name || item.title || id,
    displayDescription: item.description || item.summary || '',
    displayTags: item.tags || (item.category ? [item.category] : []),
  };
}

export const PluginsPage: React.FC = () => {
  const plugins = useMemo(() => {
    const raw = pluginsData as Record<string, RawPlugin>;
    return Object.entries(raw)
      .map(([id, item]) => normalize(id, item))
      // Downloadable plugins first, so the ready-to-use combined plugin leads the page.
      .sort((a, b) => (b.downloadUrl ? 1 : 0) - (a.downloadUrl ? 1 : 0));
  }, []);

  const [expandedId, setExpandedId] = useState<string | null>(
    plugins.find((p) => p.downloadUrl)?.id ?? null
  );

  return (
    <Container size="xl" className="py-12 space-y-10">
      <SectionHeader
        badge="Plugins"
        badgeVariant="blue"
        title="EVLab Plugin Hub"
        description="Download-ready automation plugins for AutoCAD, Civil 3D, GIS, and modelling workflows — plus tools currently in the pipeline. One install, and every tool inside is ready to use."
        align="left"
      />

      <div className="grid grid-cols-1 gap-6">
        {plugins.map((plugin) => {
          const isDownloadable = Boolean(plugin.downloadUrl);
          const isExpanded = expandedId === plugin.id;
          const hasCategories = plugin.categories && plugin.categories.length > 0;
          const totalCommands = plugin.categories?.reduce(
            (sum, c) => sum + c.commands.length,
            0
          );

          return (
            <Card key={plugin.id} padding="lg" hoverable className="space-y-5">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="space-y-3 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="w-10 h-10 rounded-xl flex items-center justify-center border bg-[var(--accent-blue-bg)] border-[var(--accent-blue)]/30 shrink-0">
                      <PlugZap className="w-5 h-5 text-[var(--accent-blue)]" />
                    </span>
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">
                      {plugin.displayName}
                    </h3>
                    {isDownloadable && (
                      <Badge variant="emerald" size="sm">Ready to Download</Badge>
                    )}
                    {!isDownloadable && (
                      <Badge variant="muted" size="sm">Catalogue Listing</Badge>
                    )}
                    {totalCommands ? (
                      <Badge variant="cyan" size="sm" icon={<Layers className="w-3 h-3" />}>
                        {totalCommands} tools
                      </Badge>
                    ) : null}
                  </div>

                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-3xl">
                    {plugin.displayDescription}
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {(plugin.hostSoftware || []).map((host) => (
                      <Badge key={host} variant="outline" size="sm">{host}</Badge>
                    ))}
                    {plugin.displayTags.map((tag) => (
                      <Badge key={tag} variant="outline" size="sm" icon={<Tag className="w-3 h-3" />}>
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--text-muted)] font-mono">
                    {plugin.version && <span>v{plugin.version}</span>}
                    {plugin.author && <span>{plugin.author}</span>}
                    {plugin.price && <span>{plugin.price}</span>}
                    {plugin.fileSize && <span>{plugin.fileSize}</span>}
                  </div>
                </div>

                <div className="flex flex-col gap-2 shrink-0 w-full md:w-auto">
                  {isDownloadable ? (
                    <a
                      href={plugin.downloadUrl}
                      download={plugin.fileName}
                      className="inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium px-4 py-2 min-h-[40px] bg-[var(--accent-blue)] hover:bg-[var(--accent-blue-hover)] text-white shadow-sm hover:shadow-md border border-transparent transition-all duration-200 active:scale-[0.98]"
                    >
                      Download
                      <Download className="w-4 h-4" />
                    </a>
                  ) : (
                    <Button variant="outline" size="md" disabled>
                      Details Coming Soon
                    </Button>
                  )}

                  {hasCategories && (
                    <Button
                      variant="ghost"
                      size="sm"
                      rightIcon={isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      onClick={() => setExpandedId(isExpanded ? null : plugin.id)}
                    >
                      {isExpanded ? 'Hide command list' : 'View command list'}
                    </Button>
                  )}
                </div>
              </div>

              {plugin.installNote && (
                <div className="text-xs text-[var(--text-muted)] bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-lg px-3 py-2">
                  {plugin.installNote}
                </div>
              )}

              {hasCategories && isExpanded && (
                <div className="pt-4 border-t border-[var(--border-color)] grid grid-cols-1 md:grid-cols-2 gap-6">
                  {plugin.categories!.map((cat) => (
                    <div key={cat.title} className="space-y-2.5">
                      <h4 className="text-sm font-bold text-[var(--text-primary)]">
                        {cat.title}
                        {cat.titleBn && (
                          <span className="ml-2 font-normal text-[var(--text-muted)]">
                            {cat.titleBn}
                          </span>
                        )}
                      </h4>
                      <ul className="space-y-1.5">
                        {cat.commands.map((cmd) => (
                          <li key={cmd.command} className="text-xs leading-relaxed">
                            <span className="font-mono font-semibold text-[var(--accent-blue)]">
                              {cmd.command}
                            </span>
                            <span className="text-[var(--text-muted)]"> — {cmd.description}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <div className="text-center text-sm text-[var(--text-muted)] pt-4">
        More EVLab plugins will keep getting added here as they're built and tested.
      </div>
    </Container>
  );
};

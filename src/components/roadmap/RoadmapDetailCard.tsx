import React from 'react';
import { RoadmapNode } from '../../types/roadmap';
import { Stage05DeepMastery } from './Stage05DeepMastery';

export interface RoadmapDetailCardProps {
  node: RoadmapNode;
  parentPath: {
    field?: RoadmapNode;
    branch?: RoadmapNode;
    specialization?: RoadmapNode;
  };
  onBack: () => void;
  onNavigateToUele?: (ueleId: string) => void;
}

export const RoadmapDetailCard: React.FC<RoadmapDetailCardProps> = ({
  node,
  parentPath,
  onBack,
  onNavigateToUele,
}) => {
  return (
    <Stage05DeepMastery
      node={node}
      parentPath={parentPath}
      onBack={onBack}
      onNavigateToUele={onNavigateToUele}
    />
  );
};

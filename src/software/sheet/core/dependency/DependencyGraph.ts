export interface DependencyGraphResult {
  order: string[]; // Cell keys in topological order for recalculation
  hasCircular: boolean;
  circularKeys: Set<string>;
}

export class DependencyGraph {
  // Key format: "SheetName!Address" e.g. "Sheet1!A1"
  private dependencies: Map<string, Set<string>> = new Map(); // cell -> cells it depends on
  private dependents: Map<string, Set<string>> = new Map(); // cell -> cells that depend on it

  /**
   * Set dependencies for a given cell.
   * Clears old dependencies for this cell first.
   */
  public setDependencies(cellKey: string, dependsOnKeys: string[]): void {
    const normalizedKey = cellKey.toUpperCase();
    this.removeCell(normalizedKey);

    const depSet = new Set<string>();
    for (const depKey of dependsOnKeys) {
      const normDep = depKey.toUpperCase();
      depSet.add(normDep);

      // Add to dependents map
      if (!this.dependents.has(normDep)) {
        this.dependents.set(normDep, new Set());
      }
      this.dependents.get(normDep)!.add(normalizedKey);
    }

    if (depSet.size > 0) {
      this.dependencies.set(normalizedKey, depSet);
    }
  }

  /**
   * Clears all dependency information for a cell
   */
  public removeCell(cellKey: string): void {
    const normalizedKey = cellKey.toUpperCase();

    // Remove from dependencies and update dependents of those dependencies
    const oldDeps = this.dependencies.get(normalizedKey);
    if (oldDeps) {
      for (const dep of oldDeps) {
        const dependentSet = this.dependents.get(dep);
        if (dependentSet) {
          dependentSet.delete(normalizedKey);
          if (dependentSet.size === 0) {
            this.dependents.delete(dep);
          }
        }
      }
      this.dependencies.delete(normalizedKey);
    }
  }

  /**
   * Gets cells that directly or indirectly depend on the given changed cell keys
   */
  public getAffectedCells(changedKeys: string[]): Set<string> {
    const affected = new Set<string>();
    const queue = changedKeys.map((k) => k.toUpperCase());

    while (queue.length > 0) {
      const current = queue.shift()!;
      const directDependents = this.dependents.get(current);

      if (directDependents) {
        for (const dep of directDependents) {
          if (!affected.has(dep)) {
            affected.add(dep);
            queue.push(dep);
          }
        }
      }
    }

    return affected;
  }

  /**
   * Gets topological calculation order for affected cells.
   * Detects circular references.
   */
  public getRecalculationOrder(changedKeys: string[]): DependencyGraphResult {
    const normChanged = changedKeys.map((k) => k.toUpperCase());
    const affected = this.getAffectedCells(normChanged);

    // Include the changed cells themselves if they are formulas (have dependencies)
    const allToEvaluate = new Set<string>([...normChanged, ...affected]);

    // Build sub-graph in-degrees
    const inDegree = new Map<string, number>();
    const subGraphDependents = new Map<string, Set<string>>();

    for (const node of allToEvaluate) {
      inDegree.set(node, 0);
      subGraphDependents.set(node, new Set());
    }

    for (const node of allToEvaluate) {
      const deps = this.dependencies.get(node);
      if (deps) {
        for (const dep of deps) {
          if (allToEvaluate.has(dep)) {
            if (!subGraphDependents.has(dep)) {
              subGraphDependents.set(dep, new Set());
            }
            subGraphDependents.get(dep)!.add(node);
            inDegree.set(node, (inDegree.get(node) || 0) + 1);
          }
        }
      }
    }

    // Kahn's algorithm for topological sorting
    const queue: string[] = [];
    for (const [node, degree] of inDegree.entries()) {
      if (degree === 0) {
        queue.push(node);
      }
    }

    const order: string[] = [];
    while (queue.length > 0) {
      const current = queue.shift()!;
      order.push(current);

      const deps = subGraphDependents.get(current);
      if (deps) {
        for (const neighbor of deps) {
          const currentDegree = inDegree.get(neighbor)! - 1;
          inDegree.set(neighbor, currentDegree);
          if (currentDegree === 0) {
            queue.push(neighbor);
          }
        }
      }
    }

    const hasCircular = order.length < allToEvaluate.size;
    const circularKeys = new Set<string>();

    if (hasCircular) {
      for (const [node, degree] of inDegree.entries()) {
        if (degree > 0) {
          circularKeys.add(node);
        }
      }
    }

    return {
      order,
      hasCircular,
      circularKeys,
    };
  }

  /**
   * Clears entire graph
   */
  public clear(): void {
    this.dependencies.clear();
    this.dependents.clear();
  }
}

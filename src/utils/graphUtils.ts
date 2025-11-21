import { GraphState, GraphNode } from "../types";
import { get } from "fast-levenshtein";
import { logger } from "./logger";

// Helper to normalize strings for ID generation and comparison
export const canonicalize = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, "-");
};

export interface PathStep {
  name: string;
  type: "category" | "entity";
  attributes?: any;
}

export const mergePathToGraph = (
  currentGraph: GraphState,
  path: PathStep[]
): GraphState => {
  logger.log(
    `[Graph Utils] 🔀 Starting merge for path:`,
    path.map((p) => p.name).join(" -> ")
  );
  // Deep clone to avoid mutation
  const newGraph: GraphState = {
    nodes: { ...currentGraph.nodes },
    edges: [...currentGraph.edges],
  };

  let parentId: string | null = null; // Start at Root (or null if we want to find a root)
  logger.log(
    `[Graph Utils] Initial graph has ${
      Object.keys(newGraph.nodes).length
    } nodes and ${newGraph.edges.length} edges`
  );

  // We need to handle the case where the first node might be a root node or connect to an existing root
  // For this implementation, we'll assume the first node in the path is a top-level node if parentId is null.

  for (let i = 0; i < path.length; i++) {
    const step = path[i];
    logger.log(
      `[Graph Utils] Processing step ${i + 1}/${path.length}: "${step.name}" (${
        step.type
      })`
    );
    // 1. Search for existing sibling nodes under the current parent
    // If parentId is null, we look for root nodes (nodes with no incoming edges or marked as root)
    // Actually, the spec says "Search for existing sibling nodes under the current parent".

    let siblings: GraphNode[] = [];

    if (parentId) {
      // Find nodes that are targets of edges where source is parentId
      const childrenIds = newGraph.edges
        .filter((e) => e.source === parentId)
        .map((e) => e.target);
      siblings = childrenIds.map((id) => newGraph.nodes[id]).filter(Boolean);
      logger.log(
        `[Graph Utils] Found ${siblings.length} siblings under parent "${parentId}"`
      );
    } else {
      // If no parent, look for root nodes.
      // In a graph, roots are nodes with type 'root' or no incoming edges?
      // Let's assume 'root' type or just all nodes if we want to be loose, but better to stick to 'root' type for top level.
      // Or, we can just search ALL nodes if we want to deduplicate globally (which might be better for "Music").
      // The spec says "Search for existing sibling nodes under the current parent".
      // If parent is null, siblings are the top-level nodes.
      siblings = Object.values(newGraph.nodes).filter(
        (n) =>
          n.type === "root" || !newGraph.edges.some((e) => e.target === n.id)
      );
      logger.log(
        `[Graph Utils] Searching root level, found ${siblings.length} root nodes`
      );
    }

    // 2. Fuzzy Find
    // We check if any sibling matches the current step name
    logger.log(
      `[Graph Utils] Fuzzy matching "${step.name}" against ${siblings.length} siblings...`
    );
    let match = siblings.find((node) => {
      const exactMatch = node.id === canonicalize(step.name);
      const distance = get(node.label.toLowerCase(), step.name.toLowerCase());
      const fuzzyMatch = distance <= 2;
      if (exactMatch || fuzzyMatch) {
        logger.log(
          `[Graph Utils] ✓ Match found: "${node.label}" (exact: ${exactMatch}, distance: ${distance})`
        );
      }
      return exactMatch || fuzzyMatch;
    });

    // If we are at the root level (parentId is null), we might want to search ALL nodes to avoid creating "Music" again if it exists as a child somewhere else?
    // But strictly following the hierarchy is safer.

    if (match) {
      // Traversal: Node exists, move down.
      logger.log(
        `[Graph Utils] ⤵ Traversing to existing node: "${match.label}" (${match.id})`
      );
      parentId = match.id;
    } else {
      // Creation: Node doesn't exist. Create it.
      const newNodeId = canonicalize(step.name); // or generate UUID
      logger.log(
        `[Graph Utils] ✗ No match found, checking if node exists globally: "${newNodeId}"`
      );

      // Check if node ID already exists globally to avoid overwriting with different data?
      // If it exists globally but wasn't found as a sibling, it means we are linking to an existing node from a new parent (DAG structure).
      // So we should check if the node exists globally.

      let existingNode = newGraph.nodes[newNodeId];

      if (!existingNode) {
        // Create new node
        logger.log(
          `[Graph Utils] ✨ Creating new node: "${step.name}" (${newNodeId})`
        );
        existingNode = {
          id: newNodeId,
          label: step.name,
          type:
            step.type === "category" && !parentId ? "root" : (step.type as any), // If no parent, it's a root? Or just category.
          data: {
            attributes: step.attributes,
          },
          position: { x: 0, y: 0 }, // Layout will handle this
        };
        newGraph.nodes[newNodeId] = existingNode;
      } else {
        // Node exists elsewhere, we will just link to it.
        logger.log(
          `[Graph Utils] 🔗 Node exists globally, creating cross-link to: "${existingNode.label}"`
        );
      }

      // Add Edge from Parent -> New Node
      if (parentId) {
        // Check if edge already exists
        const edgeId = `${parentId}-${newNodeId}`;
        const edgeExists = newGraph.edges.some(
          (e) => e.source === parentId && e.target === newNodeId
        );

        if (!edgeExists) {
          logger.log(
            `[Graph Utils] ➡ Creating edge: ${parentId} -> ${newNodeId}`
          );
          newGraph.edges.push({
            id: edgeId,
            source: parentId,
            target: newNodeId,
          });
        } else {
          logger.log(
            `[Graph Utils] ⏭ Edge already exists: ${parentId} -> ${newNodeId}`
          );
        }
      }

      parentId = newNodeId;
    }
  }
  logger.log(
    `[Graph Utils] ✓ Merge complete. Final: ${
      Object.keys(newGraph.nodes).length
    } nodes, ${newGraph.edges.length} edges`
  );
  return newGraph;
};

import { create } from "zustand";
import { GraphState, GraphNode, GraphEdge, NodeId } from "../types";
import { mergePathToGraph, PathStep } from "../utils/graphUtils";
import { generateInterestPath } from "../services/ai";

interface GraphStore extends GraphState {
  // Actions
  setNodes: (nodes: Record<NodeId, GraphNode>) => void;
  setEdges: (edges: GraphEdge[]) => void;
  addNode: (node: GraphNode) => void;
  addEdge: (edge: GraphEdge) => void;

  // Complex Actions
  generateAndAddPath: (query: string) => Promise<void>;

  // UI State
  isLoading: boolean;
  error: string | null;
}

// Initial Data
const initialNodes: Record<NodeId, GraphNode> = {
  music: {
    id: "music",
    label: "Music",
    type: "root",
    data: {},
    position: { x: 0, y: 0 },
  },
  sports: {
    id: "sports",
    label: "Sports",
    type: "root",
    data: {},
    position: { x: 200, y: 0 },
  },
  movies: {
    id: "movies",
    label: "Movies",
    type: "root",
    data: {},
    position: { x: 400, y: 0 },
  },
};

const initialEdges: GraphEdge[] = [];

export const useGraphStore = create<GraphStore>((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  isLoading: false,
  error: null,

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  addNode: (node) => {
    console.log(`[Graph Store] Adding node:`, {
      id: node.id,
      label: node.label,
      type: node.type,
    });
    return set((state) => ({
      nodes: { ...state.nodes, [node.id]: node },
    }));
  },

  addEdge: (edge) => {
    console.log(`[Graph Store] Adding edge:`, {
      id: edge.id,
      source: edge.source,
      target: edge.target,
    });
    return set((state) => ({
      edges: [...state.edges, edge],
    }));
  },

  generateAndAddPath: async (query: string) => {
    const startTime = performance.now();
    console.log(
      `[Graph Store] 🚀 Starting path generation for query: "${query}"`
    );
    set({ isLoading: true, error: null });
    try {
      // Get current root categories for context
      const roots = Object.values(get().nodes)
        .filter((n) => n.type === "root")
        .map((n) => n.label);

      console.log(`[Graph Store] Current graph state:`, {
        totalNodes: Object.keys(get().nodes).length,
        totalEdges: get().edges.length,
        rootCategories: roots,
      });

      const result = await generateInterestPath(query, roots);
      console.log(
        `[Graph Store] ✓ AI returned path with ${result.path.length} steps`
      );

      // Merge logic
      const currentGraph = { nodes: get().nodes, edges: get().edges };
      console.log(`[Graph Store] Merging path into existing graph...`);
      const newGraph = mergePathToGraph(
        currentGraph,
        result.path as PathStep[]
      );

      const nodesAdded =
        Object.keys(newGraph.nodes).length -
        Object.keys(currentGraph.nodes).length;
      const edgesAdded = newGraph.edges.length - currentGraph.edges.length;

      console.log(`[Graph Store] ✓ Merge complete:`, {
        nodesAdded,
        edgesAdded,
        totalNodes: Object.keys(newGraph.nodes).length,
        totalEdges: newGraph.edges.length,
      });

      set({
        nodes: newGraph.nodes,
        edges: newGraph.edges,
        isLoading: false,
      });

      const endTime = performance.now();
      console.log(
        `[Graph Store] ✓ Path generation completed in ${(
          endTime - startTime
        ).toFixed(2)}ms`
      );
    } catch (err) {
      console.error(`[Graph Store] ✗ Error generating path:`, err);
      set({ isLoading: false, error: "Failed to generate path" });
    }
  },
}));

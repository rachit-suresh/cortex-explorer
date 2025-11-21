export type NodeId = string;

export interface GraphNode {
  id: NodeId; // Normalized: "music:metal:tdwp" or UUID
  label: string; // Display: "The Devil Wears Prada"
  type: "category" | "entity" | "root";
  data: {
    description?: string;
    attributes?: Record<string, any>; // e.g., { genre: "Metalcore" }
  };
  // Visual metadata
  position: { x: number; y: number };
}

export interface GraphEdge {
  id: string;
  source: NodeId;
  target: NodeId;
  label?: string; // e.g., "is_genre_of"
}

export interface GraphState {
  nodes: Record<NodeId, GraphNode>;
  edges: GraphEdge[];
}

// Schema for LLM Output
export interface GeneratedPath {
  disambiguation: string; // "Song by The Devil Wears Prada"
  path: {
    name: string;
    type: "category" | "entity";
    attributes?: any;
  }[];
}

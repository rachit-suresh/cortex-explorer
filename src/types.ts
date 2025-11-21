export type NodeType = 'category' | 'entity';

export interface InterestNode {
  id: string;
  label: string;
  type: NodeType;
  children?: InterestNode[];
  parentId?: string;
  description?: string;
  image?: string; // Optional image for visual richness
}

export interface UserInterests {
  // Flat list of selected node IDs for easy lookup
  selectedIds: string[];
  // The actual tree structure of selected interests (optional, can be derived)
  nodes: InterestNode[];
}

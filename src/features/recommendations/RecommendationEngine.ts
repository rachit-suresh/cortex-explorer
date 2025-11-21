import { useGraphStore } from "../../store/graphStore";

export const getRecommendations = (selectedIds: string[]) => {
  const { nodes, edges } = useGraphStore.getState();
  const recommendations: Array<{
    category: string;
    name: string;
    reason: string;
  }> = [];
  const seen = new Set();
  const selectedSet = new Set(selectedIds);

  // Helper to add recommendation
  const addRec = (
    category: string,
    name: string,
    reason: string,
    id: string
  ) => {
    if (!seen.has(id) && !selectedSet.has(id)) {
      recommendations.push({ category, name, reason });
      seen.add(id);
    }
  };

  // Find siblings of selected nodes
  selectedIds.forEach((id) => {
    const node = nodes[id];
    if (!node) return;

    // Find parents of this node
    const parentIds = edges.filter((e) => e.target === id).map((e) => e.source);

    parentIds.forEach((parentId) => {
      const parent = nodes[parentId];
      // Find siblings (other children of this parent)
      const siblingIds = edges
        .filter((e) => e.source === parentId && e.target !== id)
        .map((e) => e.target);

      siblingIds.forEach((siblingId) => {
        const sibling = nodes[siblingId];
        if (sibling) {
          addRec(
            parent ? parent.label : "General",
            sibling.label,
            `Because you like ${node.label}`,
            sibling.id
          );
        }
      });
    });
  });

  // Fallback if few recommendations
  if (recommendations.length < 3) {
    const popular = [
      { id: "music", label: "Music", cat: "General" },
      { id: "sports", label: "Sports", cat: "General" },
      { id: "movies", label: "Movies", cat: "General" },
    ];

    popular.forEach((p) => {
      if (!selectedSet.has(p.id) && nodes[p.id]) {
        addRec(p.cat, p.label, "Popular Category", p.id);
      }
    });
  }

  return recommendations;
};

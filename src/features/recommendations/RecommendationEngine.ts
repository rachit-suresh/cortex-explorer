import { getAugmentedTree } from '../../utils/treeUtils';
import { InterestNode } from '../../types';

export const getRecommendations = (selectedIds: string[]) => {
  const recommendations: Array<{ category: string; name: string; reason: string }> = [];
  const seen = new Set<string>();
  const selectedSet = new Set(selectedIds);

  // Helper to add recommendation
  const addRec = (category: string, name: string, reason: string, id: string) => {
    if (!seen.has(id) && !selectedSet.has(id)) {
      recommendations.push({ category, name, reason });
      seen.add(id);
    }
  };

  // Recursive traversal to find context for selected items
  const traverse = (nodes: InterestNode[], parentLabel: string = 'General') => {
    nodes.forEach(node => {
      if (selectedSet.has(node.id)) {
        // If this node is selected, recommend its siblings!
        nodes.forEach(sibling => {
          if (sibling.id !== node.id) {
            addRec(parentLabel, sibling.label, `Because you like ${node.label}`, sibling.id);
          }
        });
      }

      if (node.children) {
        traverse(node.children, node.label);
      }
    });
  };

  traverse(getAugmentedTree());

  // Fallback if few recommendations
  if (recommendations.length < 3) {
    // Recommend some top-level categories or popular items
    const popular = [
      { id: 'f1', label: 'Formula 1', cat: 'Racing' },
      { id: 'scifi', label: 'Sci-Fi', cat: 'Movies' },
      { id: 'rock', label: 'Rock', cat: 'Music' }
    ];
    
    popular.forEach(p => {
      if (!selectedSet.has(p.id)) {
        addRec(p.cat, p.label, 'Popular Category', p.id);
      }
    });
  }

  return recommendations.slice(0, 10);
};

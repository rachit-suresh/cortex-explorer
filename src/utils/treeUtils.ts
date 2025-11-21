import { KNOWLEDGE_BASE_TREE } from '../data/knowledgeBase';
import { InterestNode } from '../types';

export const getAugmentedTree = (): InterestNode[] => {
  // Deep clone the static tree to avoid mutating the original
  const treeClone = JSON.parse(JSON.stringify(KNOWLEDGE_BASE_TREE));
  
  // Get custom nodes from local storage
  const customNodesRaw = localStorage.getItem('userCustomNodes');
  if (!customNodesRaw) return treeClone;

  const customNodes: InterestNode[] = JSON.parse(customNodesRaw);

  // Helper to find a node and append child
  const appendToNode = (nodes: InterestNode[], parentId: string, newNode: InterestNode): boolean => {
    for (const node of nodes) {
      if (node.id === parentId) {
        if (!node.children) node.children = [];
        // Check if already exists to avoid duplicates
        if (!node.children.find(c => c.id === newNode.id)) {
          node.children.push(newNode);
        }
        return true;
      }
      if (node.children) {
        if (appendToNode(node.children, parentId, newNode)) return true;
      }
    }
    return false;
  };

  // Inject custom nodes
  customNodes.forEach(node => {
    if (node.parentId) {
      appendToNode(treeClone, node.parentId, node);
    }
  });

  return treeClone;
};

export const addCustomNode = (newNode: InterestNode) => {
  const customNodesRaw = localStorage.getItem('userCustomNodes');
  const customNodes: InterestNode[] = customNodesRaw ? JSON.parse(customNodesRaw) : [];
  
  customNodes.push(newNode);
  localStorage.setItem('userCustomNodes', JSON.stringify(customNodes));
};

export const deleteCustomNode = (nodeId: string) => {
  const customNodesRaw = localStorage.getItem('userCustomNodes');
  if (!customNodesRaw) return;
  
  let customNodes: InterestNode[] = JSON.parse(customNodesRaw);
  // Remove the node
  customNodes = customNodes.filter(n => n.id !== nodeId);
  // Also remove any children (nodes that have this nodeId as parentId)
  // We do this recursively to clean up the entire subtree
  const removeChildren = (pid: string) => {
    const children = customNodes.filter(n => n.parentId === pid);
    children.forEach(c => {
      customNodes = customNodes.filter(n => n.id !== c.id);
      removeChildren(c.id);
    });
  };
  removeChildren(nodeId);
  
  localStorage.setItem('userCustomNodes', JSON.stringify(customNodes));
};

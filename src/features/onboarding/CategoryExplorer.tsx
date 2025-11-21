import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  Check,
  ArrowLeft,
  ArrowRight,
  Plus,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAugmentedTree, addCustomNode } from "../../utils/treeUtils";
import { InterestNode } from "../../types";

const NEO_COLORS = [
  "bg-[#facc15]", // Yellow
  "bg-[#fb7185]", // Pink
  "bg-[#22d3ee]", // Cyan
  "bg-[#a3e635]", // Lime
  "bg-[#c084fc]", // Purple
  "bg-[#fb923c]", // Orange
];

const getNodeColorClass = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return NEO_COLORS[Math.abs(hash) % NEO_COLORS.length];
};

export const CategoryExplorer = () => {
  const navigate = useNavigate();
  // Stack of nodes to represent the current path (breadcrumbs)
  const [path, setPath] = useState<InterestNode[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customName, setCustomName] = useState("");
  const [tree, setTree] = useState<InterestNode[]>(getAugmentedTree());

  // Current view is either the root or the children of the last node in path
  // We need to find the current node in the FRESH tree to get updated children
  const currentNodeInTree =
    path.length === 0 ? null : findNodeInTree(path[path.length - 1].id, tree);

  const currentNodes = currentNodeInTree
    ? currentNodeInTree.children || []
    : tree;

  function findNodeInTree(
    id: string,
    nodes: InterestNode[]
  ): InterestNode | null {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findNodeInTree(id, node.children);
        if (found) return found;
      }
    }
    return null;
  }

  const handleNodeClick = (node: InterestNode) => {
    // Always allow entering a node if it's a category OR if we want to add children to it
    // For custom nodes, we treat them as potential categories
    setPath([...path, node]);
  };

  const toggleSelection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent entering the node when clicking the checkmark
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBack = () => {
    setPath(path.slice(0, -1));
  };

  const handleFinish = () => {
    localStorage.setItem(
      "userSelectedIds",
      JSON.stringify(Array.from(selectedIds))
    );
    navigate("/map");
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const parentId = path.length > 0 ? path[path.length - 1].id : undefined;
    // Default to 'category' so we can add children to it later
    const type = "category";

    const newNode: InterestNode = {
      id: `custom-${Date.now()}`,
      label: customName.trim(),
      type,
      parentId,
      children: [],
    };

    addCustomNode(newNode);
    setTree(getAugmentedTree());
    setCustomName("");
    setIsAddingCustom(false);
  };

  return (
    <div className="max-w-5xl mx-auto mt-8 p-6">
      {/* Header & Breadcrumbs */}
      <div className="mb-8">
        <h2 className="text-4xl font-black uppercase mb-4">
          Explore Your Interests
        </h2>
        <div className="flex items-center gap-2 text-sm font-bold overflow-x-auto pb-2">
          <button
            onClick={() => setPath([])}
            className={`hover:text-[#fb7185] transition-colors uppercase ${
              path.length === 0
                ? "text-[#fb7185] underline decoration-2 underline-offset-4"
                : "text-gray-500"
            }`}
          >
            All Categories
          </button>
          {path.map((node, idx) => (
            <div key={node.id} className="flex items-center gap-2 shrink-0">
              <ChevronRight className="w-4 h-4" />
              <button
                onClick={() => setPath(path.slice(0, idx + 1))}
                className={`hover:text-[#fb7185] transition-colors uppercase ${
                  idx === path.length - 1
                    ? "text-[#fb7185] underline decoration-2 underline-offset-4"
                    : "text-gray-500"
                }`}
              >
                {node.label}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <AnimatePresence mode="popLayout">
          {currentNodes.map((node) => {
            const isSelected = selectedIds.has(node.id);
            const colorClass = getNodeColorClass(node.id);

            return (
              <motion.div
                key={node.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => handleNodeClick(node)}
                className={`
                  relative p-6 cursor-pointer group transition-all
                  border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                  hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1
                  ${isSelected ? "bg-white" : "bg-white"}
                `}
              >
                {/* Color accent bar */}
                <div
                  className={`absolute top-0 left-0 w-full h-2 ${colorClass} border-b-4 border-black`}
                ></div>

                <div className="flex justify-between items-start mt-2">
                  <h3 className="font-black text-xl uppercase pr-8">
                    {node.label}
                  </h3>
                  <button
                    onClick={(e) => toggleSelection(node.id, e)}
                    className={`
                      absolute top-4 right-4 w-8 h-8 flex items-center justify-center
                      border-2 border-black transition-all
                      ${
                        isSelected
                          ? "bg-[#fb7185] text-white"
                          : "bg-white hover:bg-gray-100"
                      }
                    `}
                  >
                    {isSelected && <Check className="w-5 h-5 stroke-[4]" />}
                  </button>
                </div>

                <div className="mt-4 flex justify-between items-end">
                  <span className="text-xs font-bold text-gray-500 uppercase">
                    {node.children?.length
                      ? `${node.children.length} Sub-topics`
                      : "Item"}
                  </span>
                  {node.children && node.children.length > 0 && (
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  )}
                </div>
              </motion.div>
            );
          })}

          {/* Add Custom Node Card */}
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="border-4 border-black border-dashed bg-gray-50 p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-100 transition-colors min-h-[160px]"
            onClick={() => setIsAddingCustom(true)}
          >
            <Plus className="w-8 h-8 mb-2 text-gray-400" />
            <span className="font-bold text-gray-500 uppercase">
              Add Custom
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Action Bar */}
      <div className="fixed bottom-8 left-0 right-0 px-6 pointer-events-none">
        <div className="max-w-5xl mx-auto flex justify-between items-center pointer-events-auto">
          {path.length > 0 ? (
            <button
              onClick={handleBack}
              className="bg-white text-black px-6 py-3 font-bold border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all flex items-center gap-2 uppercase"
            >
              <ArrowLeft className="w-5 h-5" /> Back
            </button>
          ) : (
            <div></div>
          )}

          <button
            onClick={handleFinish}
            disabled={selectedIds.size === 0}
            className={`
              px-8 py-3 font-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] 
              flex items-center gap-2 uppercase tracking-wider transition-all
              ${
                selectedIds.size > 0
                  ? "bg-[#22d3ee] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 active:translate-y-0 active:shadow-none cursor-pointer"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }
            `}
          >
            Generate Map <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Custom Node Modal */}
      <AnimatePresence>
        {isAddingCustom && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 w-full max-w-md relative"
            >
              <button
                onClick={() => setIsAddingCustom(false)}
                className="absolute top-4 right-4 hover:bg-gray-100 p-1"
              >
                <X className="w-6 h-6" />
              </button>

              <h3 className="text-2xl font-black uppercase mb-6">
                Add Custom Interest
              </h3>

              <form onSubmit={handleAddCustom}>
                <div className="mb-6">
                  <label className="block text-sm font-bold uppercase mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full border-4 border-black p-3 font-bold focus:outline-none focus:ring-4 focus:ring-[#facc15]/50"
                    placeholder="e.g. Underwater Basket Weaving"
                    autoFocus
                  />
                </div>

                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setIsAddingCustom(false)}
                    className="px-6 py-2 font-bold border-2 border-black hover:bg-gray-100 uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 font-bold border-2 border-black bg-[#a3e635] hover:bg-[#84cc16] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all uppercase"
                  >
                    Add
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

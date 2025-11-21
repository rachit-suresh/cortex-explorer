import { useEffect, useState, useCallback, useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import { tree, hierarchy } from "d3-hierarchy";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Sparkles, Trash2 } from "lucide-react";
import { getAugmentedTree, deleteCustomNode } from "../../utils/treeUtils";
import { InterestNode } from "../../types";

interface MindMapProps {
  mode?: "personal" | "global";
}

const NEO_COLORS = [
  "#facc15", // Yellow
  "#fb7185", // Pink
  "#22d3ee", // Cyan
  "#a3e635", // Lime
  "#c084fc", // Purple
  "#fb923c", // Orange
];

const getNodeColor = (id: string) => {
  if (id === "root") return "#facc15";
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return NEO_COLORS[Math.abs(hash) % NEO_COLORS.length];
};

export const MindMap = ({ mode = "personal" }: MindMapProps) => {
  const navigate = useNavigate();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Helper to find path to a node
  const findPathToNode = useCallback(
    (
      targetId: string,
      nodes: InterestNode[],
      currentPath: string[]
    ): string[] | null => {
      for (const node of nodes) {
        if (node.id === targetId) return [...currentPath, node.id];
        if (node.children) {
          const path = findPathToNode(targetId, node.children, [
            ...currentPath,
            node.id,
          ]);
          if (path) return path;
        }
      }
      return null;
    },
    []
  );

  // Helper to get all visible nodes based on mode
  const getLayoutedGraph = useCallback(() => {
    const treeData = getAugmentedTree();
    const storedIds = JSON.parse(
      localStorage.getItem("userSelectedIds") || "[]"
    );

    // Determine relevant IDs for Personal Mode
    const relevantIds = new Set<string>(["root"]);
    if (mode === "personal") {
      storedIds.forEach((id: string) => {
        const path = findPathToNode(id, treeData, []);
        if (path) path.forEach((p) => relevantIds.add(p));
      });
    }

    // Filter the tree based on visibility
    const filterTree = (nodes: InterestNode[]): InterestNode[] => {
      return nodes
        .filter((node) => mode === "global" || relevantIds.has(node.id))
        .map((node) => ({
          ...node,
          children: node.children ? filterTree(node.children) : [],
        }));
    };

    const filteredTreeData = filterTree(treeData);

    // Create a root object for d3-hierarchy
    const rootData = {
      id: "root",
      label: "You",
      type: "root",
      children: filteredTreeData,
    };

    // Create hierarchy
    const root = hierarchy(rootData);

    // Define tree layout
    // Increase size for better spacing
    const layout = tree().nodeSize([180, 250]);

    layout(root);

    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    root.descendants().forEach((d: any) => {
      const isRoot = d.data.id === "root";
      const isSelected = storedIds.includes(d.data.id);
      const nodeColor = getNodeColor(d.data.id);

      newNodes.push({
        id: d.data.id,
        data: { label: d.data.label },
        position: { x: d.x, y: d.y },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
        style: {
          background: isRoot
            ? "#facc15"
            : isSelected
            ? "#fb7185"
            : mode === "global"
            ? nodeColor
            : "#ffffff",
          color: "black",
          border: isSelected || isRoot ? "4px solid #000" : "2px solid #000",
          borderRadius: "0px",
          padding: "12px 20px",
          minWidth: "140px",
          textAlign: "center",
          cursor: "pointer",
          fontWeight: "800",
          textTransform: "uppercase",
          boxShadow:
            isSelected || isRoot
              ? "6px 6px 0px 0px #000"
              : "3px 3px 0px 0px #000",
          zIndex: isSelected || isRoot ? 10 : 1,
          fontSize: isRoot ? "1.2rem" : "0.9rem",
        },
      });

      if (d.parent) {
        newEdges.push({
          id: `e-${d.parent.data.id}-${d.data.id}`,
          source: d.parent.data.id,
          target: d.data.id,
          type: "smoothstep", // Use smoothstep for cleaner tree lines
          style: { stroke: "#000000", strokeWidth: 2 },
        });
      }
    });

    return { nodes: newNodes, edges: newEdges };
  }, [mode, findPathToNode, refreshTrigger]);

  // Apply layout
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedGraph();
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
      setLoading(false);
    }, 10);
    return () => clearTimeout(timer);
  }, [getLayoutedGraph, setNodes, setEdges]);

  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  };

  const handleDeleteNode = () => {
    if (selectedNode && selectedNode.id.startsWith("custom-")) {
      if (
        confirm(`Are you sure you want to delete "${selectedNode.data.label}"?`)
      ) {
        deleteCustomNode(selectedNode.id);
        setSelectedNode(null);
        setRefreshTrigger((prev) => prev + 1); // Trigger re-render
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
        <div className="font-black text-xl uppercase">
          Generating Universe...
        </div>
      </div>
    );
  }

  return (
    <div className="h-[85vh] w-full bg-[#f0f0f0] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        fitView
        attributionPosition="bottom-right"
        minZoom={0.1}
      >
        <Background color="#000" gap={24} size={2} className="opacity-5" />
        <Controls className="bg-white border-2 border-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none" />
      </ReactFlow>

      {/* Info Panel */}
      <div className="absolute top-4 left-4 bg-white p-4 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] max-w-xs z-20">
        <h3 className="font-black text-2xl text-black mb-2 uppercase leading-none">
          {mode === "personal" ? "Cortex Explorer" : "Global Map"}
        </h3>
        <p className="text-sm font-bold text-gray-600 leading-tight">
          {mode === "personal"
            ? "Showing only your selected interests and their path."
            : "Showing the entire universe of categories."}
          <br />
          <br />
          <span className="inline-block w-3 h-3 bg-[#fb7185] border border-black mr-1"></span>{" "}
          Selected
          <br />
          <span className="inline-block w-3 h-3 bg-white border border-black mr-1"></span>{" "}
          Unselected
        </p>
      </div>

      {/* Selected Node Actions */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="absolute bottom-8 right-8 flex gap-2 z-30"
          >
            <div className="bg-white border-4 border-black p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center gap-4">
              <div>
                <div className="text-xs font-bold text-gray-500 uppercase">
                  Selected
                </div>
                <div className="font-black text-xl uppercase">
                  {selectedNode.data.label}
                </div>
              </div>

              {selectedNode.id.startsWith("custom-") && (
                <button
                  onClick={handleDeleteNode}
                  className="bg-red-500 hover:bg-red-600 text-white p-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all"
                  title="Delete Node"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {mode === "personal" && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
          <motion.button
            whileHover={{ scale: 1.05, rotate: -1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/recommendations")}
            className="bg-[#22d3ee] text-black font-black text-lg px-8 py-4 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3 uppercase tracking-wider hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            <Sparkles className="w-6 h-6" />
            Discover
          </motion.button>
        </div>
      )}
    </div>
  );
};

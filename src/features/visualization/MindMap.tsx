import { useEffect, useState, useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Panel,
} from "reactflow";
import "reactflow/dist/style.css";
import { useGraphStore } from "../../store/graphStore";
import { getLayoutedElements } from "./GraphLayout";
import { Search, Loader2, Plus } from "lucide-react";
import { CustomNode } from "./CustomNode";
import { getNodeColor } from "../../utils/colorUtils";

interface MindMapProps {
  mode?: "personal" | "global";
}

export const MindMap = ({ mode: _mode = "personal" }: MindMapProps) => {
  const {
    nodes: storeNodes,
    edges: storeEdges,
    generateAndAddPath,
    isLoading,
    addNode,
    addEdge,
  } = useGraphStore();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCustomNodeForm, setShowCustomNodeForm] = useState(false);
  const [customNodeName, setCustomNodeName] = useState("");
  const [selectedParent, setSelectedParent] = useState("");

  // Custom node types
  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

  // Convert Store Data to React Flow Data
  const { layoutedNodes, layoutedEdges } = useMemo(() => {
    // Find parent for each node to assign colors
    const getParentId = (nodeId: string): string | null => {
      const parentEdge = storeEdges.find((e) => e.target === nodeId);
      return parentEdge?.source || null;
    };

    const flowNodes: Node[] = Object.values(storeNodes).map((n) => {
      const parentId = getParentId(n.id);
      const nodeColor = getNodeColor(n.id, parentId, n.type, n.color);

      return {
        id: n.id,
        data: {
          label: n.label,
          color: nodeColor,
          nodeType: n.type,
          ...n.data,
        },
        position: n.position,
        type: "custom",
      };
    });

    const flowEdges: Edge[] = storeEdges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      type: "smoothstep",
      style: { stroke: "#000", strokeWidth: 2 },
      animated: true,
    }));

    const layout = getLayoutedElements(flowNodes, flowEdges);
    return { layoutedNodes: layout.nodes, layoutedEdges: layout.edges };
  }, [storeNodes, storeEdges]);

  // Update React Flow state when store changes
  useEffect(() => {
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [layoutedNodes, layoutedEdges, setNodes, setEdges]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    await generateAndAddPath(searchQuery);
    setSearchQuery("");
  };

  const handleCreateCustomNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customNodeName.trim() || !selectedParent) return;

    const customNodeId = `custom-${Date.now()}`;
    addNode({
      id: customNodeId,
      label: customNodeName,
      type: "entity",
      position: { x: 0, y: 0 },
      data: {},
    });
    addEdge({
      id: `edge-${selectedParent}-${customNodeId}`,
      source: selectedParent,
      target: customNodeId,
    });

    setCustomNodeName("");
    setSelectedParent("");
    setShowCustomNodeForm(false);
  };

  const availableParents = Object.values(storeNodes).filter(
    (n) => n.type === "root" || n.type === "category"
  );

  return (
    <div
      className="w-full bg-yellow-50 relative"
      style={{ minHeight: "60vh", height: "80vh" }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-right"
      >
        <Background color="#000" gap={20} size={1} />
        <Controls className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" />

        <Panel position="top-center" className="w-full max-w-md pt-4">
          <div className="space-y-3">
            <form
              onSubmit={handleSearch}
              className="relative flex items-center w-full"
            >
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Explore an interest (e.g. 'Forlorn', 'F1')..."
                  className="w-full px-4 py-3 pl-12 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all font-bold placeholder:font-normal"
                  disabled={isLoading}
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-black" />
                  ) : (
                    <Search className="w-5 h-5 text-black" />
                  )}
                </div>
              </div>
            </form>

            <button
              onClick={() => setShowCustomNodeForm(!showCustomNodeForm)}
              className="w-full px-4 py-2 bg-yellow-300 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all font-bold flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Custom Node
            </button>

            {showCustomNodeForm && (
              <form
                onSubmit={handleCreateCustomNode}
                className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 space-y-3"
              >
                <input
                  type="text"
                  value={customNodeName}
                  onChange={(e) => setCustomNodeName(e.target.value)}
                  placeholder="Node name..."
                  className="w-full px-3 py-2 border-2 border-black focus:outline-none font-bold"
                />
                <select
                  value={selectedParent}
                  onChange={(e) => setSelectedParent(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-black focus:outline-none font-bold"
                  required
                >
                  <option value="">Select parent category...</option>
                  {availableParents.map((node) => (
                    <option key={node.id} value={node.id}>
                      {node.label}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-green-400 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all font-bold"
                >
                  Create Node
                </button>
              </form>
            )}
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};

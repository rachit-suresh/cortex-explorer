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
import { Search, Loader2 } from "lucide-react";

interface MindMapProps {
  mode?: "personal" | "global";
}

export const MindMap = ({ mode = "personal" }: MindMapProps) => {
  // Mode is currently unused in v2 but kept for API compatibility
  console.log("Mode:", mode);
  const {
    nodes: storeNodes,
    edges: storeEdges,
    generateAndAddPath,
    isLoading,
  } = useGraphStore();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Convert Store Data to React Flow Data
  const { layoutedNodes, layoutedEdges } = useMemo(() => {
    const flowNodes: Node[] = Object.values(storeNodes).map((n) => ({
      id: n.id,
      data: { label: n.label, ...n.data },
      position: n.position,
      type: "default",
      style: {
        background: "#fff",
        border: "2px solid #000",
        boxShadow: "4px 4px 0px #000",
        borderRadius: "0px",
        padding: "10px",
        fontWeight: "bold",
        width: 150,
        textAlign: "center",
      },
    }));

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

  return (
    // React Flow requires the parent container to have explicit dimensions.
    // Tailwind `h-full` only works if a parent has an explicit height; that
    // is why we set a fallback minimum height and a viewport height so the
    // canvas is visible when loaded in varying layouts.
    <div
      className="w-full bg-yellow-50 relative"
      style={{ minHeight: "60vh", height: "80vh" }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        attributionPosition="bottom-right"
      >
        <Background color="#000" gap={20} size={1} />
        <Controls className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" />

        <Panel position="top-center" className="w-full max-w-md pt-4">
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
        </Panel>
      </ReactFlow>
    </div>
  );
};

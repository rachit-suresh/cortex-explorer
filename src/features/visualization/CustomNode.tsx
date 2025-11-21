import { memo, useState } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Palette } from "lucide-react";
import { useGraphStore } from "../../store/graphStore";

export const CustomNode = memo(({ id, data }: NodeProps) => {
  const { deleteNode, updateNodeColor } = useGraphStore();
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuPos({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  };

  const handleDelete = () => {
    if (window.confirm(`Delete "${data.label}"?`)) {
      deleteNode(id);
    }
    setShowContextMenu(false);
  };

  const handleColorChange = (color: string) => {
    updateNodeColor(id, color);
    setShowColorPicker(false);
  };

  const nodeColor = data.color || "#fff";
  const isCustomNode = id.startsWith("custom-");

  return (
    <>
      <div
        onContextMenu={handleContextMenu}
        onClick={() => setShowContextMenu(false)}
        className="relative group"
      >
        <Handle type="target" position={Position.Top} />

        <div
          className="px-4 py-3 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold text-center min-w-[150px] relative cursor-pointer hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
          style={{ backgroundColor: nodeColor }}
        >
          {/* Node Label */}
          <div className="text-sm break-words">{data.label}</div>

        {/* Color Picker Icon - only for custom nodes */}
        {isCustomNode && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowColorPicker(!showColorPicker);
            }}
            className="absolute -top-2 -right-2 p-1 bg-white border-2 border-black rounded-full hover:bg-gray-100"
            title="Change color"
          >
            <Palette className="w-3 h-3" />
          </button>
        )}

        {/* Color Picker Dropdown */}
        {showColorPicker && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-3 z-50">
            <div className="grid grid-cols-5 gap-2">
              {[
                "#facc15",
                "#fb7185",
                "#22d3ee",
                "#a3e635",
                "#c084fc",
                "#fb923c",
                "#f87171",
                "#4ade80",
                "#60a5fa",
                "#f472b6",
                "#ffffff",
                "#fecdd3",
                "#fed7aa",
                "#fef08a",
                "#d9f99d",
              ].map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorChange(color)}
                  className="w-8 h-8 border-2 border-black hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} />
    </div>

    {/* Context Menu */}
    {showContextMenu && (
      <>
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowContextMenu(false)}
        />
        <div
          className="fixed bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-50 min-w-[150px]"
          style={{ left: contextMenuPos.x, top: contextMenuPos.y }}
        >
          {isCustomNode && (
            <button
              onClick={() => {
                setShowColorPicker(true);
                setShowContextMenu(false);
              }}
              className="w-full px-4 py-2 text-left hover:bg-yellow-100 border-b-2 border-black flex items-center gap-2 font-bold"
            >
              <Palette className="w-4 h-4" />
              Change Color
            </button>
          )}
          <button
            onClick={handleDelete}
            className="w-full px-4 py-2 text-left hover:bg-red-100 flex items-center gap-2 font-bold text-red-600"
          >
            🗑️ Delete Node
          </button>
        </div>
      </>
    )}
  </>
  );
});

CustomNode.displayName = "CustomNode";

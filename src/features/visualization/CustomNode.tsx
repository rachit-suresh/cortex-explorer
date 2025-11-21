import { memo, useState } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Trash2, Palette } from "lucide-react";
import { useGraphStore } from "../../store/graphStore";

export const CustomNode = memo(({ id, data }: NodeProps) => {
  const { deleteNode, updateNodeColor } = useGraphStore();
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Delete "${data.label}"?`)) {
      deleteNode(id);
    }
  };

  const handleColorChange = (color: string) => {
    updateNodeColor(id, color);
    setShowColorPicker(false);
  };

  const nodeColor = data.color || "#fff";
  const isCustomNode = id.startsWith("custom-");

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative group"
    >
      <Handle type="target" position={Position.Top} />

      <div
        className="px-4 py-3 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold text-center min-w-[150px] relative"
        style={{ backgroundColor: nodeColor }}
      >
        {/* Node Label */}
        <div className="text-sm break-words">{data.label}</div>

        {/* Hover Actions */}
        {isHovered && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex gap-2 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-1">
            {/* Color Picker Button - only for custom nodes */}
            {isCustomNode && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowColorPicker(!showColorPicker);
                }}
                className="p-1 hover:bg-gray-100 border border-black"
                title="Change color"
              >
                <Palette className="w-4 h-4" />
              </button>
            )}

            {/* Delete Button */}
            <button
              onClick={handleDelete}
              className="p-1 hover:bg-red-100 border border-black"
              title="Delete node"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
          </div>
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
  );
});

CustomNode.displayName = "CustomNode";

// Color utilities for graph nodes

// Neo-brutalist color palette (siblings of same parent share colors)
export const NEO_COLORS = [
  "#facc15", // Yellow
  "#fb7185", // Pink
  "#22d3ee", // Cyan
  "#a3e635", // Lime
  "#c084fc", // Purple
  "#fb923c", // Orange
  "#f87171", // Red
  "#4ade80", // Green
  "#60a5fa", // Blue
  "#f472b6", // Fuchsia
];

/**
 * Get color for a node based on its parent
 * Siblings (nodes with same parent) share the same base color
 */
export const getNodeColor = (
  nodeId: string,
  parentId: string | null,
  nodeType: "root" | "category" | "entity",
  customColor?: string
): string => {
  // If custom color is set, use it
  if (customColor) {
    return customColor;
  }

  // Root nodes get distinct colors by hash
  if (!parentId || nodeType === "root") {
    return getColorByHash(nodeId);
  }

  // Siblings get color based on parent's hash
  return getColorByHash(parentId);
};

/**
 * Generate consistent color from string hash
 */
function getColorByHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return NEO_COLORS[Math.abs(hash) % NEO_COLORS.length];
}

/**
 * Adjust color brightness
 */
export function adjustColorBrightness(
  hexColor: string,
  factor: number
): string {
  // Remove # if present
  const hex = hexColor.replace("#", "");

  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Adjust brightness
  const newR = Math.min(255, Math.floor(r * factor));
  const newG = Math.min(255, Math.floor(g * factor));
  const newB = Math.min(255, Math.floor(b * factor));

  // Convert back to hex
  return `#${((1 << 24) + (newR << 16) + (newG << 8) + newB)
    .toString(16)
    .slice(1)}`;
}

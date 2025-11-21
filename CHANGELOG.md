# Cortex Explorer - Features Update

## Latest Changes (v2.1)

### 🎨 Color System

- **Sibling Color Grouping**: Nodes with the same parent automatically share the same color
- **Type Differentiation**: Root, category, and entity nodes have subtle color variations
- **Custom Colors**: User-defined nodes can have custom colors via color picker
- **Neo-Brutalist Palette**: 10+ vibrant colors for visual distinction

### 🗑️ Node Deletion

- **Hover Actions**: Delete button appears on hover over any node
- **Confirmation Dialog**: Prevents accidental deletions
- **Cascade Cleanup**: Automatically removes all connected edges when deleting a node
- **Visual Feedback**: Smooth animations for delete operations

### 📊 CLI Logging

- **Server-Side Logging**: All logs are sent to the backend server terminal (port 3001)
- **Structured Format**: `[timestamp] [LEVEL] message`
- **Fallback**: Falls back to browser console if server unavailable
- **Categories**: AI calls, graph operations, user actions, errors

### 🧠 Enhanced AI Context

- **Full Graph Topology**: AI receives complete graph structure (nodes + edges)
- **Duplicate Prevention**: AI can see existing nodes to avoid creating duplicates
- **Better Accuracy**: Reduced hallucinations and improved path generation
- **Context Size**: Sends ~${nodes.length} nodes and ${edges.length} edges per request

## How to Use

### Run Development Server

```bash
# Terminal 1: Start backend (for CLI logging)
cd server
npm start

# Terminal 2: Start frontend
npm run dev
```

### Delete a Node

1. Hover over any node in the graph
2. Click the trash icon in the hover menu
3. Confirm deletion in the dialog

### Change Node Color (Custom Nodes Only)

1. Hover over a custom node (created manually)
2. Click the palette icon
3. Select a color from the picker

### View Logs in CLI

- Watch Terminal 1 (server) for real-time logs
- All AI calls, merges, and user actions are logged there

## Technical Implementation

### Color Assignment Algorithm

```typescript
// Siblings share color based on parent's hash
getNodeColor(nodeId, parentId, nodeType, customColor?)
```

### Graph Context for AI

```typescript
// Full graph structure sent to AI
const graphContext = nodes
  .map((node) => {
    const children = edges
      .filter((e) => e.source === node.id)
      .map((e) => nodes[e.target]?.label);
    return `${node.label} (${node.type}) -> [${children.join(", ")}]`;
  })
  .join("; ");
```

### CLI Logger

```typescript
// Sends logs to backend server
logger.log("[Module]", "message", data);
// Visible in server terminal output
```

## Files Modified

- `src/types.ts` - Added color field to GraphNode
- `src/store/graphStore.ts` - Added deleteNode, updateNodeColor actions
- `src/services/ai.ts` - Enhanced prompt with full graph context
- `src/utils/colorUtils.ts` - New color assignment utilities
- `src/utils/logger.ts` - New CLI logging utility
- `src/features/visualization/CustomNode.tsx` - New custom node component
- `src/features/visualization/MindMap.tsx` - Updated to use custom nodes
- `server/index.js` - Added /log endpoint

## Next Steps (v3.0)

- Persistence (localStorage/database)
- Export/Import graph as JSON
- Multi-user collaboration
- Advanced filtering and search
- Performance optimizations for large graphs (1000+ nodes)

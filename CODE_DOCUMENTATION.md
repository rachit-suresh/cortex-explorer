# Cortex Explorer v2.0 - Comprehensive Code Documentation

**Version:** 2.0.0  
**Date:** November 21, 2025  
**Architecture:** Client-Side Generative Graph (React + Zustand + Gemini 2.5 Flash-Lite)

---

## 1. Executive Summary

**Cortex Explorer** is a "Generative Interest Graph" application. Unlike traditional mind-mapping tools that require manual entry, Cortex Explorer uses a Large Language Model (LLM) to dynamically expand the graph based on user queries.

**Core Concept:**

1.  **User Query:** The user types a vague interest (e.g., "Forlorn").
2.  **AI Disambiguation:** The LLM analyzes the term in the context of the existing graph.
3.  **Path Generation:** The LLM returns a hierarchical path (e.g., `Music -> Metal -> Metalcore -> The Devil Wears Prada -> Forlorn`).
4.  **Graph Merging:** The application intelligently merges this path into the existing graph, reusing existing nodes (deduplication) and creating new ones where necessary.

**v2.0 Overhaul:**
The transition from v1 to v2 involved a fundamental shift from a **Tree** structure (strict parent-child hierarchy) to a **Graph** structure (Nodes & Edges). This allows for more complex relationships, such as an entity belonging to multiple categories (e.g., "Elon Musk" connecting to both "Tech" and "Space").

---

## 2. Architectural Decisions & Rationale

### 2.1. Data Structure: Graph vs. Tree

- **Decision:** We moved from a nested JSON tree (`{ id, children: [] }`) to a normalized graph structure (`nodes: {}, edges: []`).
- **Why:**
  - **Real-world Complexity:** Interests rarely fit into a strict hierarchy. A "Tree" forces a single parent. A "Graph" (specifically a Directed Acyclic Graph or DAG) allows a node like "Formula 1" to be a child of both "Sports" and "Engineering".
  - **Performance:** Updating a deeply nested tree requires recursive traversal. Updating a normalized graph is O(1) for adding nodes/edges.
  - **Visualization:** Libraries like React Flow are optimized for node/edge data structures.

### 2.2. State Management: Zustand

- **Decision:** We chose **Zustand** over Redux or React Context.
- **Why:**
  - **Simplicity:** Zustand requires less boilerplate than Redux.
  - **Performance:** It allows components to subscribe to specific slices of state, preventing unnecessary re-renders—critical when rendering hundreds of graph nodes.
  - **Async Actions:** Handling the AI generation pipeline (loading states, error handling, state updates) is straightforward in Zustand actions.

### 2.3. Visualization: React Flow + Dagre

- **Decision:** We used **React Flow** for rendering and **Dagre** for layout.
- **Why:**
  - **React Flow:** Provides out-of-the-box interactions (zoom, pan, drag nodes). Building a canvas from scratch with D3 or HTML5 Canvas is time-consuming and error-prone.
  - **Dagre:** We need an automatic layout engine because nodes are added dynamically. We can't expect users to manually position every new node. Dagre calculates the optimal `(x, y)` coordinates for a hierarchical layout.

### 2.4. AI Provider: Google Gemini 2.5 Flash-Lite

- **Decision:** We switched from OpenAI (mock/planned) to **Google Gemini 2.5 Flash-Lite**.
- **Why:**
  - **Context Window:** Gemini Pro and the Gemini 2.5 family provide large context windows (1M+ tokens), which help when we need to pass a graph snapshot or longer context. For interactive features (fast UI feedback), we keep a latency-optimized model as the default.
  - **Low Latency:** Gemini 2.5 Flash-Lite is specifically optimized for low-latency, interactive applications. With support for 1,048,576 input tokens and 65,536 output tokens, it handles complex queries while maintaining fast response times.
  - **Structured Output:** Gemini 2.5 Flash-Lite supports structured outputs and function calling, which is essential for our strict schema validation and JSON-based path generation.
  - **JSON Mode:** Gemini is capable of producing valid JSON output, which is essential for our strict schema validation.
  - **Cost/Availability:** The user provided a Gemini key, making it the immediate choice for implementation.
  - **Advanced Features:** Supports code execution, caching, grounding with Google Search and Maps, and URL context - features we may leverage in future versions.

### 2.5. Styling: Neo-Brutalism (Tailwind CSS)

- **Decision:** A high-contrast, "Neo-Brutalist" aesthetic (thick black borders, bold colors, hard shadows).
- **Why:**
  - **Clarity:** In a complex graph, distinct borders and high contrast help distinguish individual nodes.
  - **Identity:** It gives the application a unique, modern, and slightly "edgy" feel compared to standard corporate SaaS designs.

---

## 3. Directory Structure Walkthrough

```
src/
├── components/         # Shared UI components (Layouts, Buttons)
├── data/              # Static data (Initial knowledge base)
├── features/          # Feature-based modules
│   ├── onboarding/    # Category selection & initial setup
│   ├── recommendations/ # Recommendation engine & UI
│   └── visualization/ # The core Mind Map & Graph UI
├── services/          # External API integrations (AI)
├── store/             # Global State Management (Zustand)
├── utils/             # Helper functions (Graph logic, Math)
├── App.tsx            # Main Routing
├── main.tsx           # Entry Point
└── types.ts           # TypeScript Definitions
```

---

## 4. Deep Dive: Core Logic (The "Brain")

### 4.1. `src/types.ts`

This file defines the "Language" of our application.

- **`GraphNode`**: The atomic unit.
  - `id`: A normalized string (e.g., "music:metal").
  - `type`: Distinguishes between 'category' (grouping) and 'entity' (leaf).
  - `position`: Required by React Flow.
- **`GraphState`**: The "Database" in memory.
  - `nodes`: A Record (Object) mapping IDs to Nodes. This allows O(1) lookup.
  - `edges`: An Array of connections.
- **`GeneratedPath`**: The contract with the AI.
  - The AI _must_ return data in this shape. If it doesn't, the app throws an error.

### 4.2. `src/store/graphStore.ts`

The central nervous system.

- **`initialNodes`**: We bootstrap the graph with "Music", "Sports", and "Movies" so the user isn't staring at a blank screen.
- **`generateAndAddPath(query)`**: The most critical action.
  1.  **Context Gathering**: It looks at the current `root` nodes to give the AI context.
  2.  **AI Call**: It awaits `generateInterestPath`.
  3.  **Merging**: It calls `mergePathToGraph` (synchronous, pure function) to calculate the _next_ state.
  4.  **Update**: It replaces the current state with the new state.

### 4.3. `src/services/ai.ts`

The bridge to intelligence.

- **Prompt Engineering**:
  - We explicitly tell the AI: "You are an expert ontology engineer."
  - We provide **Context**: "Existing Root Categories: Music, Sports..." This prevents the AI from creating a duplicate "Athletics" category if "Sports" already exists.
  - **Strict Schema**: We provide a JSON template. This is crucial. LLMs are chatty; we force them to be structured.
- **Gemini Integration**:
  - Uses `GoogleGenerativeAI` SDK. For the interactive prompt in `generateInterestPath` we default to `gemini-2.5-flash-lite` (fast, low-latency). You can override the model by setting `VITE_GEMINI_MODEL` in `.env.local` if you prefer `gemini-pro` or another model. If the configured model fails, the service will attempt a safe fallback to `gemini-pro`.
  - **Sanitization**: The `cleanJson` regex removes markdown code blocks (`json ... `) which LLMs often include, ensuring `JSON.parse` doesn't crash.
  - **Comprehensive Logging**: Every AI call is logged with timestamps, model names, prompt context, response previews, and error details. This enables debugging and monitoring of AI performance in production.

### 4.4. `src/utils/graphUtils.ts`

The "Recursive Merge Engine". This is the hardest algorithmic part of the app.

- **`canonicalize(text)`**:
  - Converts "The Beatles" -> "the-beatles".
  - Ensures that "Music" and "music" are treated as the same ID.
- **`mergePathToGraph(currentGraph, path)`**:
  - **Goal**: Take a linear path (A -> B -> C) and graft it onto the graph.
  - **Loop**: It iterates through the path steps.
  - **Fuzzy Matching**:
    - It looks at the _current parent's children_.
    - It checks: Does a child exist with the same ID? OR is the Levenshtein distance <= 2? (e.g., "Formula 1" vs "Formula One").
    - **If Match**: It "walks" down to that node. `parentId` becomes the match's ID.
    - **If No Match**: It creates a new node and a new edge.
  - **Idempotency**: Running this function twice with the same path results in _no changes_ to the graph structure (other than maybe updating attributes).
  - **Comprehensive Logging**: Every step of the merge process is logged, including sibling searches, fuzzy match results (with Levenshtein distances), node creation decisions, and edge additions. This makes debugging graph topology issues trivial.

---

## 5. Deep Dive: Visualization (The "Eye")

### 5.1. `src/features/visualization/MindMap.tsx`

The canvas where the user interacts.

- Zustand stores data in our custom `GraphNode` format.
- React Flow needs `Node` objects with specific `style` and `data` properties.
- We map our data to React Flow's format here, applying the **Neo-Brutalist styles** (white background, thick black border, hard shadow).

* **React Flow container sizing**: React Flow requires the parent node to have explicit width and height. We set a fallback `min-height: 60vh; height: 80vh` on the `MindMap` container to avoid the
  "React Flow parent container needs a width and a height" message when the component is embedded in shells that don't provide a parent height. If you prefer dynamic height, apply `height: 100%` to all ancestor nodes.

- We call `getLayoutedElements` inside the memo. This ensures that whenever nodes change, the layout is recalculated.
- Located in a `<Panel>` component.
- Triggers the `generateAndAddPath` action.
- Shows a loading spinner (`Loader2`) during the AI call.

### 5.2. `src/features/visualization/GraphLayout.ts`

The layout engine.

- **Dagre**:
  - We create a `new dagre.graphlib.Graph()`.
  - `rankdir: 'TB'`: Top-to-Bottom layout.
  - We feed it all nodes (with dimensions 172x36) and edges.
  - `dagre.layout(g)`: Runs the math.
  - We extract the `x` and `y` from Dagre and apply them to the React Flow nodes.
  - **Correction**: Dagre uses center-anchors. React Flow uses top-left anchors. We subtract `width/2` and `height/2` to align them.

---

## 6. Deep Dive: Onboarding (The "Entry")

### 6.1. `src/features/onboarding/CategoryExplorer.tsx`

A simplified view of the graph for new users with dual modes of exploration.

- **AI-Powered Search**:
  - Prominent search bar at the top of the screen.
  - Uses the same `generateAndAddPath` action as the main MindMap.
  - Allows users to type vague interests (e.g., "jazz fusion", "Formula 1") and let the AI build the graph structure.
  - Shows loading spinner during AI processing.
  - Newly generated nodes immediately appear in the browsable category grid.
- **Breadcrumbs**:
  - Uses a `path` state (stack of nodes).
  - Clicking a node pushes it to the stack. Clicking "Back" pops it.
- **Graph Interaction**:
  - It reads directly from `useGraphStore`.
  - It filters nodes: `edges.some(e => e.source === currentParentId)`. This effectively queries "Get all children of X".
- **Custom Nodes**:
  - Allows users to manually add nodes via `addNode`.
  - Enhanced modal with clear input field and validation.
  - This is useful if the user has a niche interest that isn't in the default set or if they want to organize categories their own way.
  - Manual and AI-powered modes work together seamlessly.
- **Comprehensive Logging**: All user interactions (node clicks, selections, custom node creation, AI searches) are logged to the console for debugging and analytics.

---

## 7. Deep Dive: Recommendations (The "Value")

### 7.1. `src/features/recommendations/RecommendationEngine.ts`

A simple collaborative filtering-like algorithm based on graph topology.

- **Logic**: "If you like X, you might like its siblings."
- **Algorithm**:
  1.  Take list of `selectedIds`.
  2.  For each ID, find its Parent.
  3.  For that Parent, find all _other_ Children (Siblings).
  4.  Filter out ones already selected.
  5.  Suggest them.
- **Example**: User selects "Ferrari". Parent is "F1 Teams". Sibling is "Red Bull". Suggest "Red Bull".

---

## 8. Configuration & Setup

### 8.1. `.env.local`

- **Purpose**: Secrets.
- **Variable**: `VITE_GEMINI_API_KEY`.
  - Optional Variable: `VITE_GEMINI_MODEL` - defaults to `gemini-2.5-flash-lite`. Use this to change to `gemini-pro` or other Gemini variants.
- **Security**: This file is in `.gitignore`. It is never uploaded to the repo.

### 8.2. `tailwind.config.js`

- **Purpose**: CSS Framework configuration.
- **Content**: Scans all `.tsx` files to tree-shake unused styles.
- **Theme**: Can be extended here to add custom colors or fonts (though we currently use standard Tailwind classes for the Neo-Brutalist look).

### 8.3. Logging System

- **Purpose**: Comprehensive console logging for debugging and monitoring.
- **Coverage**:
  - **AI Service**: Model initialization, API calls, response parsing, fallback logic, errors.
  - **Graph Store**: State changes, node/edge additions, path generation timing, merge results.
  - **Graph Utils**: Step-by-step merge process, fuzzy matching decisions with Levenshtein distances, node creation vs. reuse.
  - **User Actions**: Category clicks, selections, custom node creation, AI searches, navigation.
- **Format**: Prefixed with `[Module Name]` and uses emoji indicators for quick scanning:
  - 🚀 Starting operations
  - ✓ Success
  - ✗ Errors/failures
  - 🔍 Search operations
  - ➡ Data flow
  - 💡 AI insights
- **Performance**: Includes timing metrics for AI calls and graph operations.
- **Production**: All logs go to console. In production, you can filter by prefix or integrate with a logging service (e.g., Sentry, LogRocket).

---

## 9. Future Roadmap (v3.0 Ideas)

1.  **Persistence**: Currently, the graph resets on reload (except for `initialNodes`). We should save the `GraphState` to `localStorage` or a database (Supabase/Firebase).
2.  **Multi-Parent UI**: The current layout is Top-Down. A true force-directed layout might better represent complex, multi-connected graphs.
3.  **Entity Expansion**: Clicking a leaf node (Entity) could trigger a Wikipedia summary or image search.
4.  **User Accounts**: Saving graphs to a user profile.
5.  **Advanced Logging**: Integrate with analytics platforms (Mixpanel, Amplitude) to track user journeys and AI usage patterns. Export logs to external monitoring services.

---

**End of Documentation**

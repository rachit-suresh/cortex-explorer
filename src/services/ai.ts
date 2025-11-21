import { GeneratedPath, GraphState } from "../types";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "../utils/logger";

export const generateInterestPath = async (
  query: string,
  currentGraph: GraphState
): Promise<GeneratedPath> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing VITE_GEMINI_API_KEY in .env file");
  }

  logger.log("[AI Service] Initializing Gemini AI service");
  const genAI = new GoogleGenerativeAI(apiKey);
  // Allow using an environment override for the model name. Default to Gemini 2.5 Flash-Lite
  // Flash-Lite is a latency-optimized version suitable for interactive flows.
  const modelName =
    import.meta.env.VITE_GEMINI_MODEL || "gemini-2.5-flash-lite";
  logger.log(`[AI Service] Using model: ${modelName}`);
  const model = genAI.getGenerativeModel({ model: modelName });

  // Build comprehensive graph context
  const nodes = Object.values(currentGraph.nodes);
  const edges = currentGraph.edges;

  // Create a structured representation of the graph
  const graphContext = nodes
    .map((node) => {
      const children = edges
        .filter((e) => e.source === node.id)
        .map((e) => currentGraph.nodes[e.target]?.label)
        .filter(Boolean);

      return `${node.label} (${node.type})${
        children.length > 0 ? ` -> [${children.join(", ")}]` : ""
      }`;
    })
    .join("; ");

  const rootCategories = nodes
    .filter((n) => n.type === "root")
    .map((n) => n.label)
    .join(", ");

  const prompt = `
    You are an expert ontology engineer.
    Identify the possible meanings of the term '${query}'.
    
    EXISTING GRAPH STRUCTURE (use these exact nodes to avoid duplicates):
    ${graphContext}
    
    Root Categories: ${rootCategories}
    Total Nodes: ${nodes.length}
    
    CRITICAL: Before creating a new node, check if it already exists in the graph above.
    - If "${query}" or a similar term already exists, reuse that exact path.
    - If a parent category exists (e.g., "Music", "Sports"), connect to it.
    - Only create new nodes if they don't exist in the current graph.
    
    Output a hierarchical path from Root -> Leaf.
    
    IMPORTANT: You can (and should) include AS MANY subcategory levels as needed to properly classify the concept.
    The path should be as detailed and hierarchical as necessary. Examples:
    - Simple: Root -> Category -> Entity
    - Moderate: Root -> Category -> Sub-Category -> Entity
    - Complex: Root -> Category -> Sub-Category -> Sub-Sub-Category -> Entity
    
    Don't limit yourself to just one subcategory level. Add as many intermediate categories as make sense for proper classification.
    
    Return ONLY valid JSON matching this schema (no markdown formatting):
    {
      "disambiguation": "string description of what this is",
      "path": [
        { "name": "Root Category", "type": "category" },
        { "name": "Main Category", "type": "category" },
        { "name": "Sub Category 1", "type": "category" },
        { "name": "Sub Category 2", "type": "category" },
        { "name": "Sub Category N (as many as needed)", "type": "category" },
        { "name": "Final Entity Name", "type": "entity", "attributes": { "key": "value" } }
      ]
    }
    
    Note: The example above shows multiple subcategories - use as many as appropriate for the concept.
  `;

  logger.log(`[AI Service] Generating path for query: "${query}"`);
  logger.log(
    `[AI Service] Graph context: ${nodes.length} nodes, ${edges.length} edges`
  );

  try {
    // Use the low-latency Flash-Lite model by default; this provides fast turn-around
    // in interactive sessions. We keep the same generateContent helper so the
    // output parsing logic and schema enforcement remains unchanged.
    let result;
    try {
      logger.log(`[AI Service] Calling ${modelName} API...`);
      result = await model.generateContent(prompt);
      logger.log(`[AI Service] ✓ Received response from ${modelName}`);
    } catch (err) {
      // If the model isn't available or errors out, attempt a safe fallback to `gemini-pro`.
      logger.warn(
        `[AI Service] ✗ Model ${modelName} failed, attempting fallback to gemini-pro.`,
        err
      );
      if (modelName !== "gemini-pro") {
        logger.log(`[AI Service] Retrying with gemini-pro fallback...`);
        const fallback = genAI.getGenerativeModel({ model: "gemini-pro" });
        result = await fallback.generateContent(prompt);
        logger.log(`[AI Service] ✓ Fallback successful with gemini-pro`);
      } else {
        logger.error(
          `[AI Service] ✗ Fallback failed, gemini-pro is already being used`
        );
        throw err;
      }
    }
    const response = await result.response;
    const text = response.text();

    logger.log(`[AI Service] Raw response length: ${text?.length || 0} chars`);

    if (!text) {
      logger.error(`[AI Service] ✗ No content received from LLM`);
      throw new Error("No content received from LLM");
    }

    // Clean up markdown code blocks if present
    const cleanJson = text.replace(/\`\`\`json\n?|\n?\`\`\`/g, "").trim();
    logger.log(
      `[AI Service] Cleaned JSON preview: ${cleanJson.substring(0, 200)}...`
    );

    const parsed = JSON.parse(cleanJson);
    logger.log(`[AI Service] ✓ Successfully parsed JSON response`);
    logger.log(
      `[AI Service] Generated path:`,
      parsed.path.map((p: any) => p.name).join(" -> ")
    );
    return parsed as GeneratedPath;
  } catch (error) {
    logger.error("[AI Service] ✗ Fatal error:", error);
    throw error;
  }
};

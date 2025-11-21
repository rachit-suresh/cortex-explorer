import { GeneratedPath } from "../types";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const generateInterestPath = async (
  query: string,
  context: string[]
): Promise<GeneratedPath> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing VITE_GEMINI_API_KEY in .env file");
  }

  console.log("[AI Service] Initializing Gemini AI service");
  const genAI = new GoogleGenerativeAI(apiKey);
  // Allow using an environment override for the model name. Default to Gemini 2.5 Flash-Lite
  // Flash-Lite is a latency-optimized version suitable for interactive flows.
  const modelName =
    import.meta.env.VITE_GEMINI_MODEL || "gemini-2.5-flash-lite";
  console.log(`[AI Service] Using model: ${modelName}`);
  const model = genAI.getGenerativeModel({ model: modelName });

  const prompt = `
    You are an expert ontology engineer.
    Identify the possible meanings of the term '${query}'.
    
    Context (Existing Root Categories): ${context.join(", ")}
    
    If it fits an existing root category, map it there. If it requires a new category, define it.
    Output a hierarchical path from Root -> Leaf.
    
    Return ONLY valid JSON matching this schema (no markdown formatting):
    {
      "disambiguation": "string description of what this is",
      "path": [
        { "name": "Root Category", "type": "category" },
        { "name": "Sub Category", "type": "category" },
        { "name": "Entity Name", "type": "entity", "attributes": { "key": "value" } }
      ]
    }
  `;

  console.log(`[AI Service] Generating path for query: "${query}"`);
  console.log(`[AI Service] Context roots: [${context.join(", ")}]`);

  try {
    // Use the low-latency Flash-Lite model by default; this provides fast turn-around
    // in interactive sessions. We keep the same generateContent helper so the
    // output parsing logic and schema enforcement remains unchanged.
    let result;
    try {
      console.log(`[AI Service] Calling ${modelName} API...`);
      result = await model.generateContent(prompt);
      console.log(`[AI Service] ✓ Received response from ${modelName}`);
    } catch (err) {
      // If the model isn't available or errors out, attempt a safe fallback to `gemini-pro`.
      console.warn(
        `[AI Service] ✗ Model ${modelName} failed, attempting fallback to gemini-pro.`,
        err
      );
      if (modelName !== "gemini-pro") {
        console.log(`[AI Service] Retrying with gemini-pro fallback...`);
        const fallback = genAI.getGenerativeModel({ model: "gemini-pro" });
        result = await fallback.generateContent(prompt);
        console.log(`[AI Service] ✓ Fallback successful with gemini-pro`);
      } else {
        console.error(
          `[AI Service] ✗ Fallback failed, gemini-pro is already being used`
        );
        throw err;
      }
    }
    const response = await result.response;
    const text = response.text();

    console.log(`[AI Service] Raw response length: ${text?.length || 0} chars`);

    if (!text) {
      console.error(`[AI Service] ✗ No content received from LLM`);
      throw new Error("No content received from LLM");
    }

    // Clean up markdown code blocks if present
    const cleanJson = text.replace(/\`\`\`json\n?|\n?\`\`\`/g, "").trim();
    console.log(
      `[AI Service] Cleaned JSON preview: ${cleanJson.substring(0, 200)}...`
    );

    const parsed = JSON.parse(cleanJson);
    console.log(`[AI Service] ✓ Successfully parsed JSON response`);
    console.log(
      `[AI Service] Generated path:`,
      parsed.path.map((p: any) => p.name).join(" -> ")
    );
    return parsed as GeneratedPath;
  } catch (error) {
    console.error("[AI Service] ✗ Fatal error:", error);
    throw error;
  }
};

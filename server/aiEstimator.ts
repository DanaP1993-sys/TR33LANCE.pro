import OpenAI from "openai";
import * as fs from "fs";
import * as path from "path";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export interface EstimateResult {
  treeType: string;
  estimatedHeight: number;
  estimatedDiameter: number;
  complexity: "simple" | "moderate" | "complex" | "hazardous";
  priceMin: number;
  priceMax: number;
  confidence: number;
  analysis: string;
  requiredEquipment: string[];
  estimatedHours: number;
  riskFactors: string[];
}

export async function estimateJob(filePath: string, description?: string, keepFile: boolean = false): Promise<EstimateResult> {
  try {
    const imageBuffer = fs.readFileSync(filePath);
    const base64Image = imageBuffer.toString("base64");
    const mimeType = getMimeType(filePath);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert tree service estimator AI. Analyze tree photos to provide accurate job estimates.
          
Your analysis should include:
- Tree species identification
- Height and diameter estimates (in feet/inches)
- Job complexity assessment
- Price range based on Houston, TX market rates
- Required equipment
- Risk factors

Return JSON with these exact fields:
{
  "treeType": "string - species or type",
  "estimatedHeight": number in feet,
  "estimatedDiameter": number in inches (trunk diameter),
  "complexity": "simple" | "moderate" | "complex" | "hazardous",
  "priceMin": number in USD,
  "priceMax": number in USD,
  "confidence": number 0-1,
  "analysis": "detailed analysis string",
  "requiredEquipment": ["array", "of", "equipment"],
  "estimatedHours": number,
  "riskFactors": ["array", "of", "risks"]
}

Price guidelines:
- Simple trim (small tree): $150-400
- Moderate trim (medium tree): $300-800
- Complex removal (large tree): $800-2500
- Hazardous (near structures/power lines): $1500-5000+`
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
              },
            },
            {
              type: "text",
              text: description 
                ? `Analyze this tree photo and provide a job estimate. Additional context: ${description}`
                : "Analyze this tree photo and provide a detailed job estimate."
            },
          ],
        },
      ],
      max_tokens: 1000,
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices[0]?.message?.content || "{}");

    return {
      treeType: result.treeType || "Unknown",
      estimatedHeight: result.estimatedHeight || 0,
      estimatedDiameter: result.estimatedDiameter || 0,
      complexity: result.complexity || "moderate",
      priceMin: result.priceMin || 0,
      priceMax: result.priceMax || 0,
      confidence: result.confidence || 0.5,
      analysis: result.analysis || "Analysis unavailable",
      requiredEquipment: result.requiredEquipment || [],
      estimatedHours: result.estimatedHours || 0,
      riskFactors: result.riskFactors || [],
    };
  } catch (error: any) {
    console.error("AI estimation error:", error.message);
    throw new Error(`Estimation failed: ${error.message}`);
  } finally {
    if (!keepFile) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
      }
    }
  }
}

export async function estimateFromDescription(description: string): Promise<EstimateResult> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert tree service estimator. Analyze job descriptions to provide estimates.
          
Return JSON with:
{
  "treeType": "string",
  "estimatedHeight": number in feet,
  "estimatedDiameter": number in inches,
  "complexity": "simple" | "moderate" | "complex" | "hazardous",
  "priceMin": number in USD,
  "priceMax": number in USD,
  "confidence": number 0-1,
  "analysis": "detailed analysis",
  "requiredEquipment": ["equipment"],
  "estimatedHours": number,
  "riskFactors": ["risks"]
}`
        },
        {
          role: "user",
          content: `Estimate this tree service job: ${description}`
        }
      ],
      max_tokens: 800,
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices[0]?.message?.content || "{}");

    return {
      treeType: result.treeType || "Unknown",
      estimatedHeight: result.estimatedHeight || 0,
      estimatedDiameter: result.estimatedDiameter || 0,
      complexity: result.complexity || "moderate",
      priceMin: result.priceMin || 0,
      priceMax: result.priceMax || 0,
      confidence: result.confidence || 0.5,
      analysis: result.analysis || "Analysis unavailable",
      requiredEquipment: result.requiredEquipment || [],
      estimatedHours: result.estimatedHours || 0,
      riskFactors: result.riskFactors || [],
    };
  } catch (error: any) {
    console.error("AI estimation error:", error.message);
    throw new Error(`Estimation failed: ${error.message}`);
  }
}

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
  };
  return mimeTypes[ext] || "image/jpeg";
}

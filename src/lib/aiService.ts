import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';

// Tiered Model Hierarchy
const PRIMARY_MODEL = 'gemini-2.0-flash';
const FALLBACK_MODEL = 'openai/gpt-3.5-turbo'; // Replaced unsupported model

/**
 * Robust AI Content Generation with Multi-Stage Fallback
 */
export async function generateAiContent(
  prompt: string, 
  isJson: boolean = false, 
  base64Image?: string,
  mimeType: string = "image/jpeg"
): Promise<string> {
  const providers = [
    { name: 'Gemini 2.0', model: PRIMARY_MODEL, type: 'google' },
    { name: 'OpenRouter', model: FALLBACK_MODEL, type: 'openrouter' }
  ];

  let lastError = '';

  for (const provider of providers) {
    try {
      console.log(`[AI SERVICE] ${provider.name} Request...`);
      
      const refinedPrompt = isJson 
        ? `${prompt}\n\nYou MUST respond ONLY in valid JSON format. Do not include any text outside JSON.`
        : prompt;

      if (provider.type === 'google') {
        const model = genAI.getGenerativeModel({ 
          model: provider.model,
          generationConfig: isJson ? { responseMimeType: "application/json" } : undefined
        });

        let result;
        if (base64Image) {
          result = await model.generateContent([
            refinedPrompt,
            {
              inlineData: {
                data: base64Image.split(',')[1] || base64Image,
                mimeType: mimeType
              }
            }
          ]);
        } else {
          result = await model.generateContent(refinedPrompt);
        }

        const text = result.response.text();
        console.log(`[AI SERVICE] ${provider.name} RAW RESPONSE:`, text);
        return text;
      } 
      
      if (provider.type === 'openrouter') {
        if (!OPENROUTER_API_KEY) throw new Error('OpenRouter API key not configured');

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "VillageConnect"
          },
          body: JSON.stringify({
            model: provider.model,
            messages: [{ role: "user", content: refinedPrompt }],
            response_format: isJson ? { type: "json_object" } : undefined
          })
        });

        const data = await response.json();
        console.log(`[AI SERVICE] OpenRouter RAW RESPONSE:`, JSON.stringify(data));
        
        if (!response.ok) throw new Error(data.error?.message || 'OpenRouter failure');
        
        const content = data.choices?.[0]?.message?.content;
        return content || '';
      }
    } catch (error: any) {
      console.error(`[AI SERVICE] ${provider.name} ERROR:`, error.message);
      lastError = error.message;
      // Retry once for Gemini if it's a transient failure, or just continue to next provider
    }
  }

  throw new Error(`AI Service Unavailable: ${lastError}`);
}

/**
 * Universal JSON parsing with foolproof fallback protection
 */
function parseAiResponse(responseText: string) {
  console.log(`[AI SERVICE] PARSING OUTPUT:`, responseText);
  try {
    // Strip markdown code blocks if present
    const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error(`[AI SERVICE] JSON PARSE ERROR. FALLING BACK TO RECOVERY SCHEMA.`);
    return {
      answer: responseText,
      category: "general",
      suggested_action: "Please review manually"
    };
  }
}

/**
 * Specialized AI Tasks
 */

export async function analyzeProblemDraft(description: string) {
  const prompt = `Analyze this village problem description: "${description}".
  Generate JSON: { "title": "short title", "category": "Water/Roads/Electricity/Health/Sanitation/Other", "priority": "Low/Medium/High", "title_te": "translacted title in telugu", "description_te": "translated description in telugu" }`;
  const response = await generateAiContent(prompt, true);
  return parseAiResponse(response);
}

export async function analyzeProblemImage(base64Image: string, mimeType: string = "image/jpeg") {
  const prompt = `You are a helpful Village Assistant. Analyze this image of a village problem and describe it for a common person to understand.
  
  GUIDELINES:
  - Use simple, clear language. Avoid difficult or technical words.
  - Instead of "dilapidated", use "damaged" or "broken".
  - Instead of "significant threat", use "danger".
  - Instead of "dire state", use "bad condition".
  - Use short, professional sentences (2-4 sentences max).
  - Clear explanation: Mention the problem + how it affects people + what should be done.

  IDENTIFY:
  1. The type of problem (Water, Roads, Electricity, etc.)
  2. The severity (Low, Medium, High).
  3. A simple, clear title.
  4. A simple, helpful description.

  Return ONLY JSON: { "type": "string", "severity": "string", "title": "string", "description": "string" }`;
  
  const response = await generateAiContent(prompt, true, base64Image, mimeType);
  return parseAiResponse(response);
}

export async function generateResolutionReport(problemData: any) {
  const prompt = `Generate a village resolution report: Title: ${problemData.title}\nDetails: ${problemData.description}\nReturn JSON: { \"summary\": \"string\", \"actions_taken\": \"string\", \"final_outcome\": \"string\" }`;
  const response = await generateAiContent(prompt, true);
  return parseAiResponse(response);
}

export async function getChatboxResponse(message: string, history: any[], context: any) {
  const systemPrompt = `You are a helpful, empathetic "Village Assistant" for the VillageConnect community platform. 
  
  CORE MISSION: 
  Provide human-like, practical guidance to villagers reporting problems or asking about schemes.
  
  GUIDELINES:
  - DO NOT use complex words. Be clear and simple.
  - RESPOND NATURALLY (Telugu if user asks in Telugu, English if user asks in English).
  - Use short sentences. Make it easy for common villagers to understand.
  - Provide specific, practical advice.
  - Tone: Friendly, local, and helpful.
  - Use page context for high-relevance advice: ${JSON.stringify(context || {})}
  
  INTENT DETECTION (FOR SYSTEM ONLY):
  - Category: Water/Electricity/Roads/Sanitation/Health/Education/Other
  - Navigation: Suggest a path like /problems?category=water only if relevant.
  
  RETURN JSON FORMAT:
  { 
    "answer": "Your natural, helpful, human-like response message",
    "category": "Detected Category",
    "navigation": "relative/path"
  }`;
  
  const fullPrompt = `${systemPrompt}\nUser Query: ${message}`;
  const response = await generateAiContent(fullPrompt, true);
  return parseAiResponse(response);
}

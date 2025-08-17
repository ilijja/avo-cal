// API Types for food analysis

export interface FoodItem {
  name: string;
  weight_grams: number;
  calories_per_100g: number;
}

export interface FoodAnalysisResponse {
  items: FoodItem[];
}

export interface GeminiRequest {
  contents: Array<{
    parts: Array<{
      text?: string;
      inline_data?: {
        mime_type: string;
        data: string;
      };
    }>;
  }>;
  generationConfig: {
    temperature: number;
    topK: number;
    topP: number;
    maxOutputTokens: number;
  };
}

export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

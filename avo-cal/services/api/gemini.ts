// Gemini API service for food analysis
import { 
  FoodAnalysisResponse, 
  GeminiRequest, 
  GeminiResponse 
} from './types';
import { encodeImageToBase64, isValidImageUri } from '../utils/imageUtils';
import { 
  isValidGeminiResponse, 
  isValidFoodAnalysisResponse, 
  extractJsonFromText 
} from '../utils/validation';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

const FOOD_ANALYSIS_PROMPT = `Analyze this food image and return data exclusively in the following JSON format, without any additional text or explanation:

{
"items": [
{"name": "🍗 chicken breast", "weight_grams": number, "calories_per_100g": number}
]
}

Rules:

In the JSON, be sure to list all ingredients you can successfully recognize.

For each ingredient name, include an appropriate emoji at the beginning in the format "emoji ingredient_name". If you can't find a perfect emoji match, use the closest one (e.g., 🥩 for meat, 🥬 for vegetables, 🍚 for rice, etc.).

If you're not sure about the exact ingredient, be sure to make an assumption based on the type of dish (e.g., if you see a green herb, list a likely herb for that dish).

Never skip items – for everything you see or assume, provide an estimate.

For each ingredient, provide a weight estimate in grams (whole number).

For each ingredient, provide calories per 100g (whole number) - use standard food values.

Weights can be approximate – accuracy is not critical, the goal is to get the best possible estimate.

Calories per 100g should be realistic values for the given food item.`;

export class GeminiService {
  /**
   * Analyzes a food image using Gemini AI
   * @param imageUri - The URI of the image to analyze
   * @returns Promise<FoodAnalysisResponse> - Analysis results
   */
  static async analyzeFoodImage(imageUri: string): Promise<FoodAnalysisResponse> {
    // Validate API key
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not found. Please set EXPO_PUBLIC_GEMINI_API_KEY environment variable.');
    }

    // Validate image URI
    if (!isValidImageUri(imageUri)) {
      throw new Error('Invalid image URI provided');
    }

    try {
      // Encode image to base64
      const base64Image = await encodeImageToBase64(imageUri);
      
      // Prepare request body
      const requestBody: GeminiRequest = {
        contents: [
          {
            parts: [
              {
                text: FOOD_ANALYSIS_PROMPT
              },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: base64Image
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          topK: 32,
          topP: 1,
          maxOutputTokens: 2048,
        }
      };

      // Make API request
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      // Handle HTTP errors
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API error:', errorText);
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      // Parse response
      const data = await response.json() as GeminiResponse;
      
      // Validate response structure
      if (!isValidGeminiResponse(data)) {
        throw new Error('Invalid response from Gemini API');
      }

      // Extract response text
      const responseText = data.candidates[0].content.parts[0].text;
      
      // Extract and parse JSON
      const parsedResponse = extractJsonFromText(responseText);
      if (!parsedResponse) {
        throw new Error('No JSON found in Gemini response');
      }
      
      // Validate food analysis response
      if (!isValidFoodAnalysisResponse(parsedResponse)) {
        throw new Error('Invalid food analysis response structure');
      }

      return parsedResponse as FoodAnalysisResponse;
    } catch (error) {
      console.error('Error analyzing food image:', error);
      throw error;
    }
  }

  /**
   * Tests the connection to Gemini API
   * @returns Promise<boolean> - True if connection successful
   */
  static async testConnection(): Promise<boolean> {
    try {
      if (!GEMINI_API_KEY) {
        console.warn('Gemini API key not set');
        return false;
      }
      
      // Simple text request to test connection
      const requestBody: GeminiRequest = {
        contents: [
          {
            parts: [
              {
                text: "Hello, this is a test message. Please respond with 'OK' if you can see this."
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          topK: 32,
          topP: 1,
          maxOutputTokens: 50,
        }
      };

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      return response.ok;
    } catch (error) {
      console.error('Gemini connection test failed:', error);
      return false;
    }
  }
}

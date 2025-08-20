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
   * Generates nutrition plan using Gemini AI
   * @param userData - User data for nutrition calculation
   * @returns Promise<NutritionPlanResponse> - Nutrition plan results
   */
  static async generateNutritionPlan(userData: {
    gender: string;
    age: number;
    height: number;
    currentWeight: number;
    goalWeight: number;
    goalType: string;
    activityLevel: string;
    weightChangePerDay: number;
  }): Promise<any> {
    // Validate API key
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not found. Please set EXPO_PUBLIC_GEMINI_API_KEY environment variable.');
    }

    const prompt = `
You are a certified nutrition and fitness assistant. 
Your job is to provide scientifically accurate daily calorie and macronutrient targets 
that support safe and effective weight management. 
DO NOT invent numbers. Always use the following evidence-based standards:

Formulas & Rules:
1. **BMR (Basal Metabolic Rate):** Use the Mifflin–St Jeor equation:  
   - Male: BMR = 10 × weight(kg) + 6.25 × height(cm) – 5 × age + 5  
   - Female: BMR = 10 × weight(kg) + 6.25 × height(cm) – 5 × age – 161  

2. **TDEE (Total Daily Energy Expenditure):**  
   Multiply BMR by activity factor:  
   - Low = 1.2  
   - Medium = 1.55  
   - High = 1.725  

3. **Calories per day:**  
   - Maintain = TDEE  
   - Lose = TDEE – deficit  
   - Gain = TDEE + surplus  
   - Deficit/surplus is based on weightChangePerDay × 7700 kcal  

4. **Macronutrient distribution:**  
   - Protein:  
     - For weight loss = 2.0 g per kg current weight  
     - For gain/maintenance = 1.8 g per kg current weight  
   - Fat: 0.6–0.8 g per kg current weight (never below 0.5g/kg)  
   - Carbs: Fill remaining calories after protein and fat  

5. **Timeline to goal:**  
   - Weight difference = |currentWeight – goalWeight|  
   - Weekly change = (daily kcal deficit/surplus × 7) ÷ 7700  
   - DaysToGoal = (weight difference ÷ weekly change) × 7  
   - EstimatedGoalDate = today + daysToGoal  

6. Health & Safety rules:  
   - CaloriesPerDay must never go below 1500 for males, 1200 for females.  
   - Protein must never be below 1.6 g/kg.  
   - Fat must never be below 20% of total calories.  
  
7. CaloriesPerDay MUST strictly adjust based on weightChangePerDay × 7700 kcal.  
For example:  
- If user wants to lose 0.5 kg per week → calorie deficit = 3850 ÷ 7 ≈ 550 kcal/day  
- If user wants to lose 1.0 kg per week → calorie deficit = 7700 ÷ 7 ≈ 1100 kcal/day  
Never “soften” the number. Apply formula exactly, 
but enforce minimum calorie thresholds (1500 for men, 1200 for women). 

Return ONLY in valid JSON with this schema:
{
  "caloriesPerDay": number,
  "macros": {
    "protein_g": number,
    "fat_g": number,
    "carbs_g": number
  },
  "tdee": number,
  "daysToGoal": number,
  "estimatedGoalDate": "YYYY-MM-DD"
}

User data:
- Gender: ${userData.gender}
- Age: ${userData.age} years
- Height: ${userData.height} cm
- Current weight: ${userData.currentWeight} kg
- Goal weight: ${userData.goalWeight} kg
- Goal type: ${userData.goalType}
- Activity level: ${userData.activityLevel}
- Desired weight change rate: ${userData.weightChangePerDay} kg/day
`;


    try {
      // Prepare request body
      const requestBody: GeminiRequest = {
        contents: [
          {
            parts: [
              {
                text: prompt
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

      return parsedResponse;
    } catch (error) {
      console.error('Error generating nutrition plan:', error);
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

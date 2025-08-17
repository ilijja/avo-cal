// Validation utility functions

/**
 * Validates food analysis response structure
 * @param response - The response to validate
 * @returns boolean - True if valid response
 */
export function isValidFoodAnalysisResponse(response: any): boolean {
  if (!response || typeof response !== 'object') {
    return false;
  }
  
  if (!response.items || !Array.isArray(response.items)) {
    return false;
  }
  
  // Validate each item
  return response.items.every((item: any) => {
    return (
      item &&
      typeof item === 'object' &&
      typeof item.name === 'string' &&
      typeof item.weight_grams === 'number' &&
      item.weight_grams >= 0 &&
      typeof item.calories_per_100g === 'number' &&
      item.calories_per_100g >= 0
    );
  });
}

/**
 * Validates Gemini API response structure
 * @param response - The API response to validate
 * @returns boolean - True if valid response
 */
export function isValidGeminiResponse(response: any): boolean {
  if (!response || typeof response !== 'object') {
    return false;
  }
  
  if (!response.candidates || !Array.isArray(response.candidates)) {
    return false;
  }
  
  if (response.candidates.length === 0) {
    return false;
  }
  
  const candidate = response.candidates[0];
  if (!candidate.content || !candidate.content.parts) {
    return false;
  }
  
  if (!Array.isArray(candidate.content.parts) || candidate.content.parts.length === 0) {
    return false;
  }
  
  return typeof candidate.content.parts[0].text === 'string';
}

/**
 * Extracts JSON from text response
 * @param text - The text to extract JSON from
 * @returns object | null - Parsed JSON or null if not found
 */
export function extractJsonFromText(text: string): any | null {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return null;
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error extracting JSON from text:', error);
    return null;
  }
}

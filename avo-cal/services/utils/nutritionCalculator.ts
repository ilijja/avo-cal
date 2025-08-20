// utils/nutritionCalculator.ts
// Percentage-based macro calculator with evidence-based distributions
export type Gender = 'male' | 'female' | 'other';
export type Goal = 'lose' | 'maintain' | 'gain' | 'gain_muscle';
export type WeekActivity = '0' | '1-3' | '4-5' | '6+';
export type DietType = 'classic' | 'vegan' | 'vegetarian';

export interface InputData {
    gender: Gender;
    age: number;
    height: number;
    weight: number;
    desiredWeight?: number;
    goal: Goal;
    weekActivity: WeekActivity;
    weeklyWeightChange?: number;
    dietType?: DietType;
}

export interface NutritionPlanData {
    calories: number;
    tdee: number;
    macros: {
        protein: number;
        fat: number;
        carbs: number;
    };
}

// ─────────────────────────────── Constants ─────────────────────────────────
const CALORIES_PER_G_PROTEIN = 4;
const CALORIES_PER_G_FAT = 9;
const CALORIES_PER_G_CARB = 4;

// Evidence-based macro percentage distributions
// Sources: Research papers, ISSN guidelines, evidence-based practices
const MACRO_PERCENTAGES = {
    // Fat Loss: Higher protein preserves muscle, moderate carbs for energy
    lose: {
        classic: { protein: 25, carbs: 50, fat: 25 },      // High protein cutting
        vegan: { protein: 25, carbs: 50, fat: 25 },        // Lower protein bioavailability 
        vegetarian: { protein: 28, carbs: 45, fat: 27 }    // Moderate adjustment
    },

    // Maintenance: Balanced approach for health
    maintain: {
        classic: { protein: 25, carbs: 45, fat: 30 },      // Standard balanced
        vegan: { protein: 20, carbs: 55, fat: 25 },        // Plant-based balance
        vegetarian: { protein: 23, carbs: 50, fat: 27 }    // Vegetarian balance
    },

    // Weight Gain: More carbs for energy, moderate protein
    gain: {
        classic: { protein: 25, carbs: 50, fat: 25 },      // Carb-focused gain
        vegan: { protein: 18, carbs: 57, fat: 25 },        // Higher carb vegan
        vegetarian: { protein: 19, carbs: 54, fat: 27 }    // Vegetarian gain
    },

    // Muscle Gain: Optimal protein, strategic carbs and fats
    gain_muscle: {
        classic: { protein: 30, carbs: 45, fat: 25 },      // Body recomposition
        vegan: { protein: 25, carbs: 45, fat: 30 },        // Vegan muscle gain
        vegetarian: { protein: 28, carbs: 42, fat: 30 }    // Vegetarian muscle gain
    }
};

// Safety limits for macro percentages (evidence-based ranges)
const MACRO_LIMITS = {
    protein: { min: 10, max: 30 },   // AMDR: 10-35%
    fat: { min: 15, max: 30 },       // WHO: 15-30%, extended to 35% for flexibility
    carbs: { min: 20, max: 65 }      // AMDR: 45-65%, reduced min for low-carb flexibility
};

// Protein limits based on body weight (g/kg) - evidence-based ranges
const PROTEIN_PER_KG = {
    lose: { min: 1.2, max: 1.7 },        // Higher for muscle preservation
    maintain: { min: 1.2, max: 1.6 },    // Standard maintenance
    gain: { min: 1.4, max: 1.8 },        // Moderate for weight gain
    gain_muscle: { min: 1.6, max: 2.2 }  // Higher for muscle synthesis
};


// ─────────────────────────────── TDEE Calculation ─────────────────────────────────
function round(n: number): number {
    return Math.round(n);
}

function mifflinStJeorBMR(gender: Gender, age: number, heightCm: number, weightKg: number): number {
    const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
    const constant = gender === 'male' ? 5 : gender === 'female' ? -161 : -78;
    return base + constant;
}

function activityFactor(weekActivity: WeekActivity): number {
    switch (weekActivity) {
        case '0': return 1.2;
        case '1-3': return 1.375;
        case '4-5': return 1.55;
        case '6+': return 1.725;
        default: return 1.2;
    }
}

function estimateTDEE(bmr: number, weekActivity: WeekActivity): number {
    return bmr * activityFactor(weekActivity);
}

function dailyEnergyFromWeeklyChange(kgPerWeek?: number): number {
    if (!kgPerWeek || kgPerWeek <= 0) return 0;
    return kgPerWeek * 1000;
}

function applyGoalAdjustment(tdee: number, goal: Goal, weeklyChangeKcalPerDay: number): number {

    if (goal === 'maintain') return tdee;
    
    
    return goal === 'lose' ? Math.round(tdee - weeklyChangeKcalPerDay) : Math.round(tdee + weeklyChangeKcalPerDay);
}

// ─────────────────────────────── Macro Distribution Logic ─────────────────────────────────
function getBaseMacroPercentages(goal: Goal, dietType: DietType): { protein: number, carbs: number, fat: number } {
    return MACRO_PERCENTAGES[goal][dietType];
}

function adjustForWeightChangeSpeed(
    basePercentages: { protein: number, carbs: number, fat: number },
    goal: Goal,
    weeklyWeightChange: number
): { protein: number, carbs: number, fat: number } {

    // Faster weight loss = higher protein to preserve muscle
    if (goal === 'lose') {
        const speedMultiplier = Math.min(weeklyWeightChange / 0.5, 2); // Cap at 2x
        const proteinBoost = Math.round((speedMultiplier - 1) * 5); // Up to +10% protein

        return {
            protein: Math.min(basePercentages.protein + proteinBoost, MACRO_LIMITS.protein.max),
            carbs: Math.max(basePercentages.carbs - Math.round(proteinBoost * 0.7), MACRO_LIMITS.carbs.min),
            fat: Math.max(basePercentages.fat - Math.round(proteinBoost * 0.3), MACRO_LIMITS.fat.min)
        };
    }

    // Faster muscle gain = slightly higher protein
    if (goal === 'gain_muscle') {
        const speedMultiplier = Math.min(weeklyWeightChange / 0.3, 1.5);
        const proteinBoost = Math.round((speedMultiplier - 1) * 0); // Up to +3% protein

        return {
            protein: Math.min(basePercentages.protein + proteinBoost, MACRO_LIMITS.protein.max),
            carbs: Math.max(basePercentages.carbs - Math.round(proteinBoost * 0.6), MACRO_LIMITS.carbs.min),
            fat: Math.max(basePercentages.fat - Math.round(proteinBoost * 0.4), MACRO_LIMITS.fat.min)
        };
    }

    return basePercentages;
}

function adjustForAge(
    percentages: { protein: number, carbs: number, fat: number },
    age: number
): { protein: number, carbs: number, fat: number } {

    // Older adults need slightly more protein (sarcopenia prevention)
    if (age >= 65) {
        const proteinBoost = 3; // +3% protein for 65+
        return {
            protein: Math.min(percentages.protein + proteinBoost, MACRO_LIMITS.protein.max),
            carbs: Math.max(percentages.carbs - Math.round(proteinBoost * 0.7), MACRO_LIMITS.carbs.min),
            fat: Math.max(percentages.fat - Math.round(proteinBoost * 0.3), MACRO_LIMITS.fat.min)
        };
    }

    if (age >= 50) {
        const proteinBoost = 2; // +2% protein for 50+
        return {
            protein: Math.min(percentages.protein + proteinBoost, MACRO_LIMITS.protein.max),
            carbs: Math.max(percentages.carbs - Math.round(proteinBoost * 0.7), MACRO_LIMITS.carbs.min),
            fat: Math.max(percentages.fat - Math.round(proteinBoost * 0.3), MACRO_LIMITS.fat.min)
        };
    }

    return percentages;
}


function ensureProteinLimits(
    percentages: { protein: number, carbs: number, fat: number },
    goal: Goal,
    weight: number,
    calories: number
): { protein: number, carbs: number, fat: number } {
    
    // Calculate current protein in grams
    const currentProteinGrams = (calories * percentages.protein / 100) / CALORIES_PER_G_PROTEIN;
    const proteinPerKg = currentProteinGrams / weight;
        
    // Get recommended protein range for this goal
    const proteinRange = PROTEIN_PER_KG[goal];
    
    // Adjust if outside evidence-based ranges
    if (proteinPerKg < proteinRange.min) {
        const neededProteinGrams = weight * proteinRange.min;        
        const neededProteinPercent = (neededProteinGrams * CALORIES_PER_G_PROTEIN) / calories * 100;
                
        // Increase protein, decrease carbs and fat proportionally
        const increase = neededProteinPercent - percentages.protein;
        return {
            protein: Math.min(neededProteinPercent, MACRO_LIMITS.protein.max),
            carbs: Math.max(percentages.carbs - increase * 0.6, MACRO_LIMITS.carbs.min),
            fat: Math.max(percentages.fat - increase * 0.4, MACRO_LIMITS.fat.min)
        };
    }
    
    if (proteinPerKg > proteinRange.max) {
        const maxProteinGrams = weight * proteinRange.max;
        const maxProteinPercent = (maxProteinGrams * CALORIES_PER_G_PROTEIN) / calories * 100;
        
        // Decrease protein, increase carbs and fat proportionally
        const decrease = percentages.protein - maxProteinPercent;
        return {
            protein: Math.max(maxProteinPercent, MACRO_LIMITS.protein.min),
            carbs: Math.min(percentages.carbs + decrease * 0.6, MACRO_LIMITS.carbs.max),
            fat: Math.min(percentages.fat + decrease * 0.4, MACRO_LIMITS.fat.max)
        };
    }
    
    return percentages;
}

function ensurePercentageLimits(
    percentages: { protein: number, carbs: number, fat: number },
    goal: Goal,
    weight: number,
    calories: number
): { protein: number, carbs: number, fat: number } {

    let { protein, carbs, fat } = percentages;

    // First adjust protein based on evidence-based weight ranges
    const adjustedForProtein = ensureProteinLimits({ protein, carbs, fat }, goal, weight, calories);
    protein = adjustedForProtein.protein;
    carbs = adjustedForProtein.carbs;
    fat = adjustedForProtein.fat;

    
    // Enforce minimum/maximum limits
    protein = Math.max(MACRO_LIMITS.protein.min, Math.min(protein, MACRO_LIMITS.protein.max));
    fat = Math.max(MACRO_LIMITS.fat.min, Math.min(fat, MACRO_LIMITS.fat.max));
    carbs = Math.max(MACRO_LIMITS.carbs.min, Math.min(carbs, MACRO_LIMITS.carbs.max));
    
    // Ensure they add up to 100%
    const total = protein + carbs + fat;
    if (total !== 100) {
        // Distribute the difference proportionally
        const adjustment = (100 - total) / 3;
        protein = Math.max(MACRO_LIMITS.protein.min, Math.min(protein + adjustment, MACRO_LIMITS.protein.max));
        carbs = Math.max(MACRO_LIMITS.carbs.min, Math.min(carbs + adjustment, MACRO_LIMITS.carbs.max));
        fat = Math.max(MACRO_LIMITS.fat.min, Math.min(fat + adjustment, MACRO_LIMITS.fat.max));
        
        // Final adjustment to ensure exactly 100%
        const finalTotal = protein + carbs + fat;
        if (finalTotal !== 100) {
            fat += 100 - finalTotal;
            fat = Math.max(MACRO_LIMITS.fat.min, Math.min(fat, MACRO_LIMITS.fat.max));
        }
    }

    return { protein, carbs, fat };
}

function calculateMacroGrams(
    calories: number,
    percentages: { protein: number, carbs: number, fat: number }
): { protein: number, fat: number, carbs: number } {

    const proteinGrams = Math.round((calories * percentages.protein / 100) / CALORIES_PER_G_PROTEIN);
    const fatGrams = Math.round((calories * percentages.fat / 100) / CALORIES_PER_G_FAT);
    const carbGrams = Math.round((calories * percentages.carbs / 100) / CALORIES_PER_G_CARB);

    return {
        protein: proteinGrams,
        fat: fatGrams,
        carbs: carbGrams
    };
}

// ─────────────────────────────── Public API ─────────────────────────────
export function calculateNutritionPlan(input: InputData): NutritionPlanData {
    const {
        gender,
        age,
        height,
        weight,
        goal,
        weekActivity,
        weeklyWeightChange = 0.5,
        dietType = 'classic',
    } = input;

    console.log(input);

    // Step 1: Calculate TDEE
    const bmr = mifflinStJeorBMR(gender, age, height, weight);
    const tdee = estimateTDEE(bmr, weekActivity);

   
    // Step 2: Calculate target calories
    const deltaPerDay = dailyEnergyFromWeeklyChange(weeklyWeightChange);
    const targetCalories = applyGoalAdjustment(tdee, goal, deltaPerDay);
    
    // Step 3: Get base macro percentages for goal + diet type
    let macroPercentages = getBaseMacroPercentages(goal, dietType);

    // Step 4: Adjust percentages based on various factors
    macroPercentages = adjustForWeightChangeSpeed(macroPercentages, goal, weeklyWeightChange);
    
    macroPercentages = adjustForAge(macroPercentages, age);

    // Step 5: Ensure percentages are within safe limits and evidence-based protein ranges
    macroPercentages = ensurePercentageLimits(macroPercentages, goal, weight, targetCalories);

    // Step 6: Convert percentages to grams
    const macros = calculateMacroGrams(targetCalories, macroPercentages);

    // Safety warnings
    if (weeklyWeightChange >= 0.9) {
        console.warn('Unsafe rate warning: weeklyWeightChange ≥ 0.9 kg/week');
    }

    if (targetCalories < bmr * 0.8) {
        console.warn('Very low calorie warning: Target calories significantly below BMR');
    }

    return {
        calories: round(targetCalories),
        tdee: round(tdee),
        macros: {
            protein: macros.protein,
            fat: macros.fat,
            carbs: macros.carbs
        }
    };
}
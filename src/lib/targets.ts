import { UserProfile } from "./types";

export type GoalType = "recomposition" | "muscle" | "fat_loss";

export interface OnboardingInput {
  name: string;
  age: number;
  heightCm: number;
  weightKg: number;
  muscleMassKg?: number;
  muscleGoalKg?: number;
  goalType: GoalType;
  vegetarian: boolean;
  eggsAtHome: boolean;
  paneerOk: boolean;
  officeDays: number[];
  customGoals: string;
}

export function calculateTargets(input: OnboardingInput): UserProfile["targets"] {
  const { age, heightCm, weightKg, goalType } = input;

  // Mifflin-St Jeor (male default; adjust if we add sex later)
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  const tdee = Math.round(bmr * 1.55); // moderate activity (gym 4-5x)

  let calories = tdee;
  if (goalType === "fat_loss") calories = Math.round(tdee - 400);
  else if (goalType === "recomposition") calories = Math.round(tdee - 250);
  else calories = Math.round(tdee + 200); // muscle gain

  const protein = Math.round(Math.min(180, Math.max(100, weightKg * 2.1)));
  const fat = Math.round((calories * 0.25) / 9);
  const carbs = Math.round((calories - protein * 4 - fat * 9) / 4);

  return {
    calories,
    protein,
    carbs,
    fat,
    maxLunchRiceGrams: goalType === "muscle" ? 220 : 180,
  };
}

export function buildProfile(input: OnboardingInput): UserProfile {
  const targets = calculateTargets(input);

  const goalLabels: Record<GoalType, string> = {
    recomposition: "Lose fat and gain muscle (recomposition)",
    muscle: "Gain muscle mass",
    fat_loss: "Lose body fat and get leaner",
  };

  const longTermGoals = [
    goalLabels[input.goalType],
    input.customGoals.trim(),
    "Improve posture and core strength",
  ].filter(Boolean);

  return {
    name: input.name.trim(),
    age: input.age,
    heightCm: input.heightCm,
    weightKg: input.weightKg,
    muscleMassKg: input.muscleMassKg ?? Math.round(input.weightKg * 0.45 * 10) / 10,
    muscleGoalKg: input.muscleGoalKg ?? Math.round(input.weightKg * 0.48 * 10) / 10,
    vegetarian: input.vegetarian,
    eggsAtHome: input.eggsAtHome,
    paneerOk: input.paneerOk,
    officeDays: input.officeDays,
    targets,
    longTermGoals,
  };
}

export function getProteinHint(profile: UserProfile): string {
  if (profile.eggsAtHome) return "add eggs, paneer, or curd";
  if (profile.paneerOk) return "add paneer or curd";
  if (profile.vegetarian) return "add dal, curd, or a protein shake";
  return "add a protein source";
}

export type MealType = "breakfast" | "lunch" | "snack" | "dinner";

export interface FoodItem {
  id: string;
  name: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  defaultGrams?: number;
  requiresProteinPairing?: boolean;
}

export interface MealEntry {
  id: string;
  date: string;
  mealType: MealType;
  foods: { foodId: string; name: string; grams: number; calories: number; protein: number; carbs: number; fat: number }[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  coachFeedback?: string;
  createdAt: string;
}

export interface ExerciseSet {
  reps: number;
  weight: number;
}

export interface ExerciseEntry {
  name: string;
  sets: ExerciseSet[];
}

export interface WorkoutEntry {
  id: string;
  date: string;
  type: string;
  exercises: ExerciseEntry[];
  notes?: string;
  coachFeedback?: string;
  createdAt: string;
}

export interface WeeklyCheckIn {
  id: string;
  date: string;
  weight: number;
  waist: number;
  bodyFat?: number;
  postureNotes?: string;
  coachFeedback?: string;
  createdAt: string;
}

export interface DailyTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  maxLunchRiceGrams: number;
}

export interface UserProfile {
  name: string;
  age: number;
  heightCm: number;
  weightKg: number;
  muscleMassKg: number;
  muscleGoalKg: number;
  vegetarian: boolean;
  eggsAtHome: boolean;
  paneerOk: boolean;
  officeDays: number[];
  targets: DailyTargets;
  longTermGoals: string[];
}

export interface CoachMessage {
  id: string;
  date: string;
  type: "meal" | "workout" | "daily" | "weekly";
  message: string;
  tone: "praise" | "warning" | "neutral";
  createdAt: string;
}

export interface AppState {
  profile: UserProfile;
  meals: MealEntry[];
  workouts: WorkoutEntry[];
  checkIns: WeeklyCheckIn[];
  coachMessages: CoachMessage[];
}

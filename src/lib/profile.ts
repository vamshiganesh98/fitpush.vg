import { UserProfile } from "./types";

export const DEFAULT_PROFILE: UserProfile = {
  name: "Vamshi",
  age: 27,
  heightCm: 179,
  weightKg: 68,
  muscleMassKg: 32.5,
  muscleGoalKg: 35.5,
  vegetarian: true,
  eggsAtHome: false,
  paneerOk: true,
  officeDays: [2, 3, 4], // Tue, Wed, Thu
  targets: {
    calories: 2500,
    protein: 145,
    carbs: 260,
    fat: 70,
    maxLunchRiceGrams: 180,
  },
  longTermGoals: [
    "Lose love handles and belly fat",
    "Gain muscle mass to 35–36 kg",
    "Improve posture and core strength",
    "Maintain lean physique",
  ],
};

export const WORKOUT_SCHEDULE: Record<number, string> = {
  1: "Chest + Triceps",
  2: "Legs",
  3: "Back + Biceps",
  4: "Shoulders",
  5: "Arms",
  6: "Badminton / Active recovery",
  0: "Rest",
};

export const DEFAULT_EXERCISES: Record<string, string[]> = {
  "Chest + Triceps": [
    "Incline DB Press",
    "Flat DB Press",
    "Cable Fly",
    "Tricep Pushdown",
    "Overhead Extension",
  ],
  Legs: ["Leg Press", "Leg Extension", "Leg Curl", "Calf Raise", "Goblet Squat"],
  "Back + Biceps": [
    "Lat Pulldown",
    "Seated Cable Row",
    "Face Pull",
    "Cable Curl",
    "Hammer Curl",
  ],
  Shoulders: [
    "DB Shoulder Press",
    "Lateral Raise",
    "Front Raise",
    "Rear Delt Fly",
    "Shrugs",
  ],
  Arms: ["Barbell Curl", "Tricep Pushdown", "Preacher Curl", "Skull Crusher"],
};

import { UserProfile } from "./types";

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

export function getDietLabel(profile: UserProfile): string {
  if (profile.vegetarian) return "Vegetarian";
  return "Non-vegetarian";
}

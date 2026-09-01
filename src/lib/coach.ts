import { MealEntry, MealType, UserProfile, WorkoutEntry, WeeklyCheckIn } from "./types";
import { getProteinHint } from "./targets";

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

export function getMealCoachFeedback(
  meal: MealEntry,
  profile: UserProfile,
  todayMeals: MealEntry[]
): { message: string; tone: "praise" | "warning" | "neutral" } {
  const { mealType } = meal;
  const totalProteinToday =
    todayMeals.reduce((s, m) => s + m.totalProtein, 0) + meal.totalProtein;
  const totalCalsToday =
    todayMeals.reduce((s, m) => s + m.totalCalories, 0) + meal.totalCalories;

  const hasProteinAddon = meal.foods.some((f) =>
    ["curd", "paneer", "cosmic", "whey", "amul", "sambar-extra", "dal", "eggs"].some((k) =>
      f.foodId.includes(k)
    )
  );

  const riceFood = meal.foods.find((f) => f.foodId.startsWith("rice"));
  const riceGrams = riceFood?.grams ?? 0;
  const carbBreakfast = meal.foods.some((f) =>
    ["chapati", "dosa", "idli", "rava-idli", "pongal", "upma"].includes(f.foodId)
  );

  // Breakfast rules
  if (mealType === "breakfast") {
    if (carbBreakfast && !hasProteinAddon) {
      const hint = getProteinHint(profile);
      return {
        tone: "warning",
        message: `Weak breakfast. ~${Math.round(meal.totalProtein)}g protein — you need ${profile.targets.protein}g today. ${hint.charAt(0).toUpperCase() + hint.slice(1)}. This is why progress stalls.`,
      };
    }
    if (meal.totalProtein >= 20) {
      return {
        tone: "praise",
        message: `Solid breakfast — ${Math.round(meal.totalProtein)}g protein. Good start for muscle gain and cutting love handles.`,
      };
    }
    return {
      tone: "neutral",
      message: `Breakfast logged. Push protein higher next time — aim 25g minimum at breakfast.`,
    };
  }

  // Lunch rice check
  if (mealType === "lunch" && riceGrams > profile.targets.maxLunchRiceGrams) {
    return {
      tone: "warning",
      message: `Too much rice at lunch — ${riceGrams}g. Max is ${profile.targets.maxLunchRiceGrams}g. This is exactly what keeps love handles. Tomorrow: cut rice, add extra sambar/dal/curd.`,
    };
  }

  if (mealType === "lunch" && riceGrams > 0 && riceGrams <= profile.targets.maxLunchRiceGrams) {
    if (meal.totalProtein >= 25) {
      return {
        tone: "praise",
        message: `Good lunch. Rice controlled at ${riceGrams}g, protein at ${Math.round(meal.totalProtein)}g. This is recomposition eating.`,
      };
    }
    return {
      tone: "neutral",
      message: `Rice is fine at ${riceGrams}g, but protein is low (${Math.round(meal.totalProtein)}g). Add more dal, curd, or paneer.`,
    };
  }

  // Dinner
  if (mealType === "dinner") {
    const proteinHint = getProteinHint(profile);
    if (meal.totalProtein < 25) {
      return {
        tone: "warning",
        message: `Dinner protein too low (${Math.round(meal.totalProtein)}g). On training days, have whey within 1 hour of gym — don't wait until night.`,
      };
    }
    if (totalProteinToday < profile.targets.protein * 0.85) {
      return {
        tone: "warning",
        message: `You're at ~${Math.round(totalProteinToday)}g protein today. Target is ${profile.targets.protein}g. ${proteinHint.charAt(0).toUpperCase() + proteinHint.slice(1)} before bed.`,
      };
    }
    return {
      tone: "praise",
      message: `Dinner on track. Daily protein looking good — stay consistent for waist and muscle goals.`,
    };
  }

  // Snacks
  if (mealType === "snack" && meal.totalProtein >= 15) {
    return {
      tone: "praise",
      message: `Good snack — ${Math.round(meal.totalProtein)}g protein. Keep evening fuel steady.`,
    };
  }

  if (totalCalsToday > profile.targets.calories + 200) {
    return {
      tone: "warning",
      message: `You're over calorie target today. Love handles won't move if you keep overshooting. Tighten dinner portions.`,
    };
  }

  return {
    tone: "neutral",
    message: `Meal logged. ${Math.round(totalProteinToday)}g protein so far today — target ${profile.targets.protein}g.`,
  };
}

export function getDailyCoachSummary(
  profile: UserProfile,
  meals: MealEntry[],
  workouts: WorkoutEntry[],
  date: string = todayStr()
): { message: string; tone: "praise" | "warning" | "neutral" } {
  const dayMeals = meals.filter((m) => m.date === date);
  const dayWorkout = workouts.find((w) => w.date === date);

  const protein = dayMeals.reduce((s, m) => s + m.totalProtein, 0);
  const calories = dayMeals.reduce((s, m) => s + m.totalCalories, 0);
  const lunch = dayMeals.find((m) => m.mealType === "lunch");
  const lunchRice = lunch?.foods.find((f) => f.foodId.startsWith("rice"))?.grams ?? 0;

  const issues: string[] = [];
  const wins: string[] = [];

  if (protein >= profile.targets.protein) wins.push(`protein hit (${Math.round(protein)}g)`);
  else issues.push(`protein short by ${Math.round(profile.targets.protein - protein)}g`);

  if (lunchRice > profile.targets.maxLunchRiceGrams)
    issues.push(`lunch rice too high (${lunchRice}g)`);
  else if (lunchRice > 0) wins.push("lunch rice controlled");

  const dayOfWeek = new Date(date).getDay();
  const isGymDay = [1, 2, 3, 4, 5].includes(dayOfWeek);
  if (isGymDay && !dayWorkout) issues.push("no workout logged on gym day");
  if (dayWorkout) wins.push(`${dayWorkout.type} completed`);

  const breakfast = dayMeals.find((m) => m.mealType === "breakfast");
  if (breakfast && breakfast.totalProtein < 18)
    issues.push("breakfast protein too low");

  if (issues.length === 0) {
    return {
      tone: "praise",
      message: `Strong day. ${wins.join(", ")}. Keep this up — love handles and muscle goals need 5–6 days like this per week. Check posture: shoulders back, core engaged when sitting.`,
    };
  }

  if (issues.length >= 2) {
    return {
      tone: "warning",
      message: `Not good enough today. Problems: ${issues.join("; ")}. ${wins.length ? `Wins: ${wins.join(", ")}.` : ""} Fix tomorrow — no excuses. Your long-term goal needs daily discipline.`,
    };
  }

  return {
    tone: "neutral",
    message: `Mixed day. Issue: ${issues[0]}. ${wins.length ? `Good: ${wins.join(", ")}.` : ""} One fix tomorrow and you're back on track.`,
  };
}

export function getWorkoutCoachFeedback(
  workout: WorkoutEntry,
  profile: UserProfile
): { message: string; tone: "praise" | "warning" | "neutral" } {
  const totalSets = workout.exercises.reduce((s, e) => s + e.sets.length, 0);
  const hasProgression = workout.exercises.some((e) =>
    e.sets.some((set) => set.weight > 0 && set.reps >= 8)
  );

  if (totalSets < 8) {
    return {
      tone: "warning",
      message: `Workout feels light — only ${totalSets} sets logged. Push harder for muscle gain. Log every exercise with weight.`,
    };
  }

  let message = `${workout.type} done — ${totalSets} sets logged. `;
  if (hasProgression) {
    message += `Good work. Progressive overload builds muscle; pair it with post-workout whey within 1 hour. `;
  }
  message += `Posture tip: after this session, 2 min wall angels — fixes rounded shoulders from desk work.`;

  return { tone: "praise", message };
}

export function getWeeklyCoachFeedback(
  checkIn: WeeklyCheckIn,
  previous: WeeklyCheckIn | undefined,
  profile: UserProfile
): { message: string; tone: "praise" | "warning" | "neutral" } {
  const parts: string[] = [];
  let tone: "praise" | "warning" | "neutral" = "neutral";

  if (previous) {
    const waistDelta = checkIn.waist - previous.waist;
    const weightDelta = checkIn.weight - previous.weight;

    if (waistDelta < -0.5) {
      parts.push(`Waist down ${Math.abs(waistDelta).toFixed(1)} cm — love handles are moving.`);
      tone = "praise";
    } else if (waistDelta > 0.5) {
      parts.push(`Waist UP ${waistDelta.toFixed(1)} cm. Cut lunch rice and hit protein 6/7 days.`);
      tone = "warning";
    }

    if (Math.abs(weightDelta) < 0.3 && waistDelta < 0) {
      parts.push(`Weight stable but waist shrinking — classic recomposition. Keep going.`);
    }
  }

  const bmi = checkIn.weight / Math.pow(profile.heightCm / 100, 2);
  parts.push(`BMI: ${bmi.toFixed(1)}. Muscle goal: ${profile.muscleMassKg} → ${profile.muscleGoalKg} kg.`);

  if (checkIn.postureNotes) {
    parts.push(`Posture notes saved. Add 10 min daily: dead bugs + wall angels for desk posture.`);
  } else {
    parts.push(`Log posture notes next week — slouching hides your progress.`);
  }

  return { message: parts.join(" "), tone };
}

export function getPostureReminder(): string {
  const tips = [
    "Shoulders back, chin tucked — 10 sec every hour at your desk.",
    "Wall angels: 2 sets of 10 before bed for posture.",
    "Core tight when sitting — love handles improve with posture + diet.",
    "Chest open, don't slouch during badminton — posture affects performance.",
  ];
  return tips[new Date().getDay() % tips.length];
}

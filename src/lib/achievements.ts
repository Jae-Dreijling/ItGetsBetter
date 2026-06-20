export interface AchievementDef {
  id: string
  name: string
  description: string
  trigger_type: string
  trigger_value: number
  icon: string
}

export const ACHIEVEMENT_LIBRARY: AchievementDef[] = [
  // Weight loss
  { id: 'apple_gone', name: 'An Apple a Day', description: "You lost 0.2kg — that's about an apple's weight!", trigger_type: 'weight_lost', trigger_value: 0.2, icon: '🍎' },
  { id: 'kitten_gone', name: 'Kitten Gone', description: "You lost 2kg — that's a kitten's weight!", trigger_type: 'weight_lost', trigger_value: 2, icon: '🐱' },
  { id: 'cat_away', name: "Cat's Away", description: "You lost 5kg — that's a full grown cat!", trigger_type: 'weight_lost', trigger_value: 5, icon: '🐈' },
  { id: 'bowling_strike', name: 'Strike!', description: "You lost 5kg — that's a bowling ball!", trigger_type: 'weight_lost', trigger_value: 5, icon: '🎳' },
  { id: 'melon_drop', name: 'Melon Drop', description: "You lost 7kg — that's a watermelon!", trigger_type: 'weight_lost', trigger_value: 7, icon: '🍉' },
  { id: 'puppy_freed', name: 'Puppy Freed', description: "You lost 10kg — that's a puppy!", trigger_type: 'weight_lost', trigger_value: 10, icon: '🐕' },
  { id: 'toddler_lifted', name: 'Toddler Lifted', description: "You lost 15kg — that's a toddler!", trigger_type: 'weight_lost', trigger_value: 15, icon: '👶' },

  // Meal logging
  { id: 'first_meal', name: 'First Bite', description: 'You logged your first meal!', trigger_type: 'meals_logged', trigger_value: 1, icon: '🍽️' },
  { id: 'meals_10', name: 'Getting the Hang of It', description: "10 meals logged — you're building awareness!", trigger_type: 'meals_logged', trigger_value: 10, icon: '📝' },
  { id: 'meals_50', name: 'Halfway Chef', description: '50 meals logged — consistency is your superpower!', trigger_type: 'meals_logged', trigger_value: 50, icon: '👨‍🍳' },
  { id: 'meals_100', name: 'Centurion', description: '100 meals logged. A hundred moments of awareness.', trigger_type: 'meals_logged', trigger_value: 100, icon: '💯' },
  { id: 'meals_365', name: 'Year of Awareness', description: '365 meals logged. You showed up, again and again.', trigger_type: 'meals_logged', trigger_value: 365, icon: '🏆' },

  // Weight logging
  { id: 'first_weigh', name: 'Stepping Up', description: 'You logged your first weight!', trigger_type: 'weights_logged', trigger_value: 1, icon: '⚖️' },
  { id: 'weights_14', name: 'Two Week Tracker', description: '14 weight entries — the trend is becoming real.', trigger_type: 'weights_logged', trigger_value: 14, icon: '📈' },
  { id: 'weights_50', name: 'Scale Veteran', description: '50 weigh-ins. You face the number with courage.', trigger_type: 'weights_logged', trigger_value: 50, icon: '🎖️' },

  // Habit streaks
  { id: 'streak_7', name: 'One Week Strong', description: '7 days using the app. A full week!', trigger_type: 'app_open_days', trigger_value: 7, icon: '🔥' },
  { id: 'streak_21', name: 'Habit Formed', description: '21 days using the app — science says this is a habit now!', trigger_type: 'app_open_days', trigger_value: 21, icon: '💪' },
  { id: 'streak_30', name: 'Monthly Warrior', description: '30 days of showing up. Incredible.', trigger_type: 'app_open_days', trigger_value: 30, icon: '🗓️' },
  { id: 'streak_100', name: 'Century Club', description: '100 days. You are unstoppable.', trigger_type: 'app_open_days', trigger_value: 100, icon: '👑' },

  // Exercise
  { id: 'first_exercise', name: 'First Move', description: 'You logged your first exercise!', trigger_type: 'exercises_logged', trigger_value: 1, icon: '🏃' },
  { id: 'exercises_10', name: 'Getting Active', description: '10 exercise sessions logged!', trigger_type: 'exercises_logged', trigger_value: 10, icon: '💪' },
  { id: 'exercises_50', name: 'Fitness Fighter', description: '50 workouts! Your body thanks you.', trigger_type: 'exercises_logged', trigger_value: 50, icon: '🥊' },

  // Water
  { id: 'water_goal_7', name: 'Hydration Week', description: 'Hit your water goal 7 times!', trigger_type: 'water_goals_met', trigger_value: 7, icon: '💧' },
  { id: 'water_goal_30', name: 'Water Champion', description: 'Hit your water goal 30 times!', trigger_type: 'water_goals_met', trigger_value: 30, icon: '🌊' },

  // Points
  { id: 'points_100', name: 'First Hundred', description: 'You earned 100 points!', trigger_type: 'total_points', trigger_value: 100, icon: '⭐' },
  { id: 'points_500', name: 'High Roller', description: '500 points earned. You are thriving!', trigger_type: 'total_points', trigger_value: 500, icon: '🌟' },
  { id: 'points_1000', name: 'Grand Master', description: '1000 points. What a journey.', trigger_type: 'total_points', trigger_value: 1000, icon: '✨' },
]

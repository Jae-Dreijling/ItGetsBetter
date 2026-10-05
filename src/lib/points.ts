export const POINT_VALUES = {
  meal_logged: 5,
  weight_logged: 3,
  habit_completed: 5,
  habit_cant_fail: 2,
  task_completed: 5,
  water_goal_met: 5,
  exercise_logged: 10,
  fasting_goal_met: 10,
  sleep_logged: 3,
  mood_logged: 2,
  medicine_taken: 2,
  streak_bonus_per_day: 1,
  daily_check: 3,
} as const

export type PointSource = keyof typeof POINT_VALUES

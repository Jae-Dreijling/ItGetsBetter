import type { CompanionMessages } from '../types'
import type { Trait } from './companionPersonality'
import { MEMORY_MENTIONS, MEMORY_TOPICS } from './companionMemory'

// Every moment the companion can react to (COMPANION-PLAN 11a): its label in
// the message editor, its group, the placeholders its lines can use and, for
// the newer triggers, built-in lines for companions that have none of their
// own yet. Each character's own lines come with the content packs (step 12).
//
// {name} is always you. Other placeholders are filled in by the moment that
// fires the trigger; a line naming a placeholder the moment doesn't have is
// skipped.

// Triggers added in step 11a. Stored companions made before simply don't have
// them (they're optional on CompanionMessages).
export const EXTRA_TRIGGERS = [
  'meal_logged', 'healthy_meal', 'planned_meal_eaten', 'water_logged', 'weigh_in_logged', 'measurement_logged',
  'photo_taken', 'mood_good', 'good_sleep', 'medicine_all_taken', 'fast_started', 'fast_ended_short',
  'habits_all_done', 'floor_done', 'cant_fail_used', 'tasks_all_done', 'project_done',
  'habit_settled', 'habit_built', 'daily_check_answered',
  'goal_step_reached', 'goal_completed', 'goal_created',
  'abstinence_milestone', 'slip_logged', 'craving_passed', 'craving_portion', 'craving_had_it',
  'saw_someone', 'talked_to_someone', 'birthday_today', 'person_added',
  'win_added', 'letter_sealed', 'letter_opened', 'reason_added', 'walk_finished', 'non_scale_better',
  'theme_changed', 'backup_made', 'companion_chosen', 'late_night',
  'meditation_done', 'focus_session_done', 'book_finished', 'grocery_trip_done', 'recipe_added', 'reward_claimed',
  // Handling (11b)
  'pickup_refused', 'put_down', 'thrown', 'tapped_a_lot', 'tapped_sleepy', 'tapped_shy', 'jumped_in', 'prank_revealed', 'rolled_in',
  // Nicknames the companion picks for you, per closeness (11c)
  'nickname_friend', 'nickname_close', 'nickname_lover',
  // Memory (11d)
  'memory_mention', 'on_this_day',
] as const

export type ExtraTrigger = (typeof EXTRA_TRIGGERS)[number]
export type TriggerKey = keyof CompanionMessages

export const TRIGGER_GROUPS = [
  'Everyday', 'Handling', 'Nicknames for you', 'Memory', 'Logging', 'Habits & tasks', 'Goals & progress', 'Abstinence & cravings', 'People', 'Motivation', 'App & tools', 'Game', 'Reminders',
] as const

export interface TriggerInfo {
  key: TriggerKey
  label: string
  group: (typeof TRIGGER_GROUPS)[number]
  placeholders?: string[]
  defaults?: string[]
  // Built-in lines that fit a companion's strongest trait better than the
  // general defaults (11b).
  traitDefaults?: Partial<Record<Trait, string[]>>
}

export const TRIGGERS: TriggerInfo[] = [
  // Everyday
  { key: 'general', label: 'General / default', group: 'Everyday' },
  { key: 'morning_greeting', label: 'Morning greeting', group: 'Everyday' },
  { key: 'welcome_back', label: 'Welcome back', group: 'Everyday' },
  { key: 'idle', label: 'Idle moments', group: 'Everyday' },
  { key: 'goodnight', label: 'Goodnight', group: 'Everyday' },
  { key: 'mood_low', label: 'Low mood support', group: 'Everyday' },
  { key: 'phone_free', label: 'Phone-free time', group: 'Everyday' },
  {
    key: 'late_night', label: 'Still up very late', group: 'Everyday',
    defaults: [
      "It's really late, {name}. Be gentle with yourself tonight.",
      'Still awake? Whatever it is, it can wait until tomorrow. Rest if you can.',
      "Late-night {name}! Maybe a glass of water and then bed?",
    ],
  },

  // Handling (11b): how each companion reacts depends on its traits.
  {
    key: 'pickup_refused', label: 'Refuses to be picked up (walks back)', group: 'Handling',
    defaults: ["Hey! I liked it there.", "I'll stay where I was, thanks.", 'Nope. Back I go.'],
    traitDefaults: {
      proud: ['Excuse me? I do not get carried around.', 'Put me down this instant. I can walk.', 'I was placed there for a reason, {name}.'],
      sassy: ['Hands off, {name}.', "Did I say you could do that? Didn't think so.", 'Nice try. Back to my spot.'],
    },
  },
  {
    key: 'put_down', label: 'Put down somewhere new', group: 'Handling',
    defaults: ['Ooh, new view!', "This spot's nice too.", "Okay, I'll hang out here."],
    traitDefaults: {
      playful: ['Again! Again!', 'Wheee, new spot!', "That was fun, let's do it again!"],
      shy: ['Oh! Um... okay, here is fine.', "H-hi again. Didn't expect that."],
      proud: ['Hmph. Acceptable.', 'I suppose this will do.'],
    },
  },
  {
    key: 'thrown', label: 'Thrown hard (dizzy)', group: 'Handling',
    defaults: ['Woah... the room is spinning...', "Whoa! I'm dizzy!", '@_@ ...which way is up?'],
    traitDefaults: {
      playful: ['WHEEEEE! Again!', 'Best ride ever!', 'I can fly!'],
      proud: ['Was that strictly necessary, {name}?!', 'I am NOT a ball.', 'Undignified. Utterly undignified.'],
      sassy: ['Oh, real mature, {name}.', 'Throw me again and see what happens.', 'Rude!'],
      shy: ['Eek! P-please be gentle...', 'Aaah! ...okay, I survived.'],
    },
  },
  {
    key: 'tapped_a_lot', label: 'Tapped many times in a row', group: 'Handling',
    defaults: ["Okay okay, I'm here!", "Yes? Yes? YES? I'm listening!", 'Tap tap tap! What is it?'],
    traitDefaults: {
      sassy: ['Do you mind?!', "Poke me one more time, {name}. I dare you.", "I'm not a button!"],
      proud: ['Must you?', 'I heard you the first time.'],
      shy: ['Ah! Th-that tickles!', 'S-so many taps...'],
      playful: ['Hehe, stop, that tickles!', 'Boop boop boop! My turn!'],
    },
  },
  {
    key: 'tapped_sleepy', label: 'Tapped at night (sleepy)', group: 'Handling',
    defaults: ['*yawn* ...wha? Oh, hi, {name}.', 'Mmh... five more minutes...', "Zzz... huh? I'm awake! Mostly."],
    traitDefaults: {
      sassy: ["It's the middle of the night, {name}. Go to sleep. Me too."],
      proud: ['I was resting my eyes. Not sleeping.'],
    },
  },
  {
    key: 'tapped_shy', label: 'Tapped (shy flinch)', group: 'Handling',
    defaults: ['Oh! Hi...', 'Eep! You startled me.', 'Um... yes?'],
  },
  {
    key: 'jumped_in', label: 'Jumped at your finger', group: 'Handling',
    defaults: ["Boop! You'll have to get past me first!", 'Gotcha! Hehe.', 'Surprise! What are we tapping?'],
    traitDefaults: {
      sassy: ['Nope, this is mine now.', "You wanted to tap that? Too bad, I'm here."],
    },
  },
  {
    key: 'prank_revealed', label: 'Prank found (a hidden button)', group: 'Handling',
    defaults: ['Hehe, you found it! I hid it.', 'Pranked! That was me.', 'Okay okay, I put it back. Got you though!'],
    traitDefaults: {
      sassy: ["Took you long enough, {name}.", 'Oh, you noticed? Shocking.'],
      playful: ['Hahaha, your face! That was me!', 'Gotcha! Best prank ever.'],
    },
  },
  {
    key: 'rolled_in', label: 'Rolled onto the screen', group: 'Handling',
    defaults: ['Boo! Did I scare you?', 'Ta-daa! Missed me?', "And I'm back!"],
    traitDefaults: {
      sassy: ['Miss me? Of course you did.', 'Make way, make way!'],
      playful: ['Rolling rolling rolling! Hi!', 'Surprise entrance! 🎉'],
    },
  },

  // Nicknames (11c): not lines but names the companion calls you, one per
  // line, by how close you are. While you're getting to know each other it
  // uses your own name.
  {
    key: 'nickname_friend', label: 'Nicknames once you are friends', group: 'Nicknames for you',
    defaults: ['buddy', 'friend', 'pal'],
    traitDefaults: { playful: ['partner in crime', 'buddy'], proud: ['my loyal friend', 'good friend'], shy: ['f-friend', 'um, friend'], sassy: ['trouble', 'dork'] },
  },
  {
    key: 'nickname_close', label: 'Nicknames once you are close', group: 'Nicknames for you',
    defaults: ['bestie', 'my favourite person', 'sunshine'],
    traitDefaults: { playful: ['bestest buddy', 'sidekick'], proud: ['my dear', 'my most trusted'], shy: ['my favourite person', 'sunshine'], sassy: ['my favourite idiot', 'troublemaker'] },
  },
  {
    key: 'nickname_lover', label: 'Nicknames as lovers (Journey)', group: 'Nicknames for you',
    defaults: ['love', 'darling', 'sweetheart'],
    traitDefaults: { playful: ['cutie', 'my heart'], proud: ['my beloved', 'my treasure'], shy: ['m-my love', 'sweetheart'], sassy: ['babe', 'gorgeous'] },
  },

  // Memory (11d)
  {
    key: 'memory_mention', label: 'Mentions something it remembers about you', group: 'Memory',
    placeholders: MEMORY_TOPICS.map(t => t.key), defaults: MEMORY_MENTIONS,
  },
  {
    key: 'on_this_day', label: 'On this day (a win from before)', group: 'Memory', placeholders: ['when', 'text'],
    defaults: ['{when} today you wrote this win: “{text}”', 'Remember this, {name}? {when}: “{text}”', 'On this day, {when}: “{text}”. Look how far you are now.'],
  },

  // Logging
  {
    key: 'meal_logged', label: 'Meal logged', group: 'Logging',
    defaults: ['Noted! Thanks for writing it down, {name}.', 'Food logged. Every entry helps you see the picture.', 'Got it! Eating is good, and so is noticing.'],
  },
  {
    key: 'healthy_meal', label: 'Healthy meal logged', group: 'Logging',
    defaults: ['Ooh, that sounds nourishing!', 'A good one for your body, {name}.', "Look at you, feeding yourself well. That's care."],
  },
  {
    key: 'planned_meal_eaten', label: 'Planned meal eaten', group: 'Logging', placeholders: ['meal'],
    defaults: ['{meal}, just like you planned. Past you and present you make a great team!', 'Plan made, plan eaten: {meal}. Nice!', 'You followed your own plan, {name}. {meal} it was!'],
  },
  {
    key: 'water_logged', label: 'Water logged', group: 'Logging',
    defaults: ['Sip sip! 💧', 'Hydration noted, {name}.', 'Your cells say thank you.'],
  },
  { key: 'water_goal_met', label: 'Water goal met', group: 'Logging' },
  {
    key: 'weigh_in_logged', label: 'Weigh-in logged (no number talk)', group: 'Logging',
    defaults: ['Weigh-in done. The trend tells the story, not one day.', 'Logged! Thanks for showing up for it, {name}.', "One more dot on your trend. That's all it is."],
  },
  { key: 'weight_loss', label: 'Weight down', group: 'Logging' },
  { key: 'weight_gain', label: 'Weight up / plateau', group: 'Logging' },
  {
    key: 'measurement_logged', label: 'Measurements logged', group: 'Logging',
    defaults: ['Measured! Numbers beyond the scale count too.', 'Tape measure time, done. Nice, {name}.', 'Another way to see your progress. Saved!'],
  },
  {
    key: 'photo_taken', label: 'Progress photo taken', group: 'Logging',
    defaults: ['Photo saved. Future you will love comparing.', 'Click! A little snapshot of now.', 'That took courage, {name}. Saved safely.'],
  },
  {
    key: 'mood_good', label: 'Good mood logged', group: 'Logging',
    defaults: ["A good day! I'm so glad, {name}.", 'Ooh, a nice mood. Soak it in!', 'Happy you is my favourite you.'],
  },
  { key: 'sleep_logged', label: 'Sleep logged', group: 'Logging' },
  {
    key: 'good_sleep', label: 'Good night of sleep', group: 'Logging', placeholders: ['hours'],
    defaults: ['{hours} hours of sleep! Your brain thanks you.', 'Well rested, {name}? {hours} hours, nice.', 'A proper night, {hours} hours. That helps with everything.'],
  },
  {
    key: 'medicine_all_taken', label: "All of today's medicine taken", group: 'Logging',
    defaults: ["All your medicine for today: done. That's taking care of you.", 'Meds done, {name}! One less thing to think about.', 'Every dose taken today. Proud of you.'],
  },
  { key: 'exercise_logged', label: 'Exercise logged', group: 'Logging' },
  {
    key: 'fast_started', label: 'Fast started', group: 'Logging', placeholders: ['hours'],
    defaults: ["Fast started! Aiming for {hours} hours. I'll keep you company.", "Clock's running, {name}. Listen to your body along the way.", 'Fast on. Water is your friend!'],
  },
  { key: 'fasting_goal', label: 'Fast reached its goal', group: 'Logging' },
  {
    key: 'fast_ended_short', label: 'Fast ended before the goal', group: 'Logging', placeholders: ['hours'],
    defaults: ['{hours} hours still counts, {name}. Listening to your body is the skill.', 'You ended it when it felt right. That is allowed.', 'A {hours}-hour fast is a fast. Well done.'],
  },

  // Habits & tasks
  { key: 'habit_completed', label: 'Habit done', group: 'Habits & tasks' },
  {
    key: 'cant_fail_used', label: 'Small version of a habit done', group: 'Habits & tasks', placeholders: ['habit'],
    defaults: ['The small version of {habit} still counts! Something beats nothing.', 'Tiny {habit} done. On hard days, tiny is huge.', 'You kept {habit} alive today, {name}. That matters.'],
  },
  {
    key: 'habits_all_done', label: "All of today's habits done", group: 'Habits & tasks',
    defaults: ["Every habit for today, done! Look at you, {name}.", 'All habits checked. Take a little bow!', "That's all of them! Today counts, fully."],
  },
  {
    key: 'floor_done', label: 'Daily floor done', group: 'Habits & tasks',
    defaults: ["Your floor is done. Today is a full day, whatever else happens.", 'Floor complete, {name}! Anything more is a bonus.', "That's the floor! You can rest easy now."],
  },
  { key: 'task_completed', label: 'Task done', group: 'Habits & tasks' },
  {
    key: 'tasks_all_done', label: 'Every open task done', group: 'Habits & tasks',
    defaults: ['Nothing open on your list! How does that feel, {name}?', 'All tasks done. Wow.', 'Empty list! Go enjoy it.'],
  },
  {
    key: 'project_done', label: 'Project finished', group: 'Habits & tasks', placeholders: ['project'],
    defaults: ['Every task in {project} is done! 🎉', '{project}: finished. That was a lot of little steps, {name}.', 'Project {project} complete! Celebrate a little?'],
  },
  {
    key: 'habit_settled', label: 'Habit settled: take on another?', group: 'Habits & tasks', placeholders: ['habit', 'done', 'total'],
  },
  { key: 'habit_built', label: 'Habit built: stop tracking it?', group: 'Habits & tasks', placeholders: ['habit', 'done', 'total'] },
  {
    key: 'daily_check_answered', label: 'Daily Check answered', group: 'Habits & tasks',
    defaults: ['Thanks for answering, {name}! One little check, done.', "Got it! That's today's check.", 'Noted. Small check-ins add up.'],
  },

  // Goals & progress
  { key: 'first_milestone', label: 'First-time milestone', group: 'Goals & progress' },
  { key: 'personal_best', label: 'Personal best', group: 'Goals & progress' },
  { key: 'achievement_unlocked', label: 'Achievement unlocked', group: 'Goals & progress' },
  {
    key: 'streak_milestone', label: 'Days you showed up (a total, never a streak)', group: 'Goals & progress', placeholders: ['days'],
    defaults: ["{days} days you've opened the app, {name}. Thank you for coming back.", "That's {days} days of showing up for yourself!", '{days} days together. I love that.'],
  },
  { key: 'points_earned', label: 'Points earned', group: 'Goals & progress' },
  {
    key: 'goal_created', label: 'New goal made', group: 'Goals & progress', placeholders: ['goal'],
    defaults: ['A new goal: {goal}! One step at a time, together.', "Ooh, {goal}. I can't wait to see you do this.", '{goal} it is! The first step is the only one to think about.'],
  },
  {
    key: 'goal_step_reached', label: 'Goal step reached', group: 'Goals & progress', placeholders: ['goal', 'step'],
    defaults: ['You reached “{step}”! {goal} is moving.', '“{step}”: done! Proud of you, {name}.', 'Another step on {goal}. Look at that!'],
  },
  {
    key: 'goal_completed', label: 'Every step of a goal done', group: 'Goals & progress', placeholders: ['goal'],
    defaults: ['You did it! Every step of {goal}! 🎉', '{goal}: complete. Remember how far away this felt?', "{name}, you finished {goal}. I'm so proud."],
  },

  // Abstinence & cravings
  {
    key: 'abstinence_milestone', label: 'Abstinence milestone', group: 'Abstinence & cravings', placeholders: ['thing', 'days'],
    defaults: ['{days} free from {thing}! That one stays yours forever.', "{days} without {thing}, {name}. That's real.", '{days}! Look what you built, one day at a time.'],
  },
  {
    key: 'slip_logged', label: 'A slip logged (kind)', group: 'Abstinence & cravings', placeholders: ['thing'],
    defaults: ['Thank you for being honest, {name}. Nothing you built is gone.', 'It happened. It happens. Your good days still count, every one.', "Logging that took courage. Tomorrow is still yours."],
  },
  {
    key: 'craving_passed', label: 'Craving rode out', group: 'Abstinence & cravings',
    defaults: ['It passed! You watched a craving rise and fall.', "That's one you rode out, {name}. Strong.", 'Wave surfed! 🌊'],
  },
  {
    key: 'craving_portion', label: 'Craving: had a portion', group: 'Abstinence & cravings',
    defaults: ["A portion, on purpose. That's control, not failure.", 'You chose how much. That counts, {name}.', 'Enjoy it, really. No guilt allowed.'],
  },
  {
    key: 'craving_had_it', label: 'Craving: had it (kind)', group: 'Abstinence & cravings',
    defaults: ["You had it, and that's okay. You noticed, and that's the skill.", 'No shame here, {name}. Every craving teaches you something.', "It's food, not a verdict. I'm still proud of you for checking in."],
  },

  // People
  {
    key: 'saw_someone', label: 'Saw someone', group: 'People', placeholders: ['person'],
    defaults: ['You saw {person}! How was it?', 'Time with {person}. That fills the cup.', 'Yay, {person}! People are good for us, {name}.'],
  },
  {
    key: 'talked_to_someone', label: 'Talked to someone', group: 'People', placeholders: ['person'],
    defaults: ['A chat with {person}, nice!', 'You reached out to {person}. That matters.', 'Talking to {person} counts too, {name}.'],
  },
  {
    key: 'birthday_today', label: "Someone's birthday today", group: 'People', placeholders: ['person'],
    defaults: ["It's {person}'s birthday today! 🎂", "Psst, {name}: {person} has a birthday today.", '🎉 Birthday alert: {person}!'],
  },
  {
    key: 'person_added', label: 'Person added', group: 'People', placeholders: ['person'],
    defaults: ['{person} is on your list now. Nice!', 'Ooh, who is {person}? Tell me sometime.', "Added {person}. I'll help you remember them."],
  },

  // Motivation
  {
    key: 'win_added', label: 'Win added to the jar', group: 'Motivation',
    defaults: ['Into the jar it goes! 🫙', "A win! Don't let anyone (including you) call it small.", 'Saved, {name}. Future you will love reading that.'],
  },
  {
    key: 'letter_sealed', label: 'Letter to future you sealed', group: 'Motivation',
    defaults: ["Sealed! I'll keep it safe for future you.", 'A letter for later. What a lovely thing to do, {name}.', "Into the envelope. I won't peek, promise."],
  },
  {
    key: 'letter_opened', label: 'Letter from past you opened', group: 'Motivation',
    defaults: ['A letter from past you! What did they say?', 'Past you was rooting for you all along, {name}.', 'Opened! Hello from the you of before.'],
  },
  {
    key: 'reason_added', label: 'Reason added to the vault', group: 'Motivation',
    defaults: ["A new reason. I'll remind you when it matters.", "That's a good one, {name}.", 'Saved in the vault. 🔥'],
  },
  {
    key: 'walk_finished', label: 'Progress walk finished', group: 'Motivation', placeholders: ['count'],
    defaults: ['What a walk! {count} stops. You should be proud, {name}.', 'Look at that path behind us!', "I loved walking that with you."],
  },
  {
    key: 'non_scale_better', label: 'Something got easier (beyond the scale)', group: 'Motivation',
    defaults: ['Things are getting easier! That is real progress.', "See? It's not just the scale, {name}.", 'Easier than before. That one counts double.'],
  },

  // App & tools
  {
    key: 'theme_changed', label: 'Theme changed', group: 'App & tools',
    defaults: ['Ooh, new look! I like it.', 'Fancy! The app feels fresh, {name}.', 'Redecorating? Very nice.'],
  },
  {
    key: 'backup_made', label: 'Backup made', group: 'App & tools',
    defaults: ['Backup saved! Everything you built is safe.', 'Safe and sound, {name}.', 'Backup done. Peace of mind!'],
  },
  {
    key: 'companion_chosen', label: 'Picked as the one talking now', group: 'App & tools',
    defaults: ['Oh, me? Hi, {name}!', "You picked me! Let's go.", "I'm here! What are we doing today?"],
  },
  {
    key: 'meditation_done', label: 'Meditation finished', group: 'App & tools', placeholders: ['minutes'],
    defaults: ['{minutes} calm minutes. Feel that?', 'Breathe in, breathe out... nicely done, {name}.', 'A little calm, just for you.'],
  },
  {
    key: 'focus_session_done', label: 'Focus session done', group: 'App & tools',
    defaults: ['Focus session done! Time for a little break.', 'You stayed with it, {name}. Stretch!', "That's a full session. Nice focus."],
  },
  {
    key: 'book_finished', label: 'Book finished', group: 'App & tools', placeholders: ['book'],
    defaults: ['You finished {book}! 📚', 'The end of {book}! Was it good, {name}?', 'Another book done: {book}.'],
  },
  {
    key: 'grocery_trip_done', label: 'Shopping trip done', group: 'App & tools',
    defaults: ['Everything on the list! Shopping done.', 'Groceries got, {name}. Future meals thank you.', 'All checked off! 🛒'],
  },
  {
    key: 'recipe_added', label: 'Recipe added', group: 'App & tools', placeholders: ['recipe'],
    defaults: ['{recipe} is in your recipe book now. Yum!', 'Ooh, {recipe}. Cook it for me sometime?', 'A new recipe! {recipe}, noted.'],
  },
  {
    key: 'reward_claimed', label: 'Reward claimed', group: 'App & tools', placeholders: ['reward'],
    defaults: ['Enjoy your {reward}, {name}! You earned it.', '{reward}! Treat yourself, really.', "Reward time! I hope {reward} is lovely."],
  },

  // Game
  { key: 'level_up', label: 'Level up', group: 'Game' },
  { key: 'boss_defeated', label: 'Boss defeated', group: 'Game' },

  // Reminders (notifications)
  { key: 'reminder_daily_check', label: 'Daily Check reminder', group: 'Reminders' },
  { key: 'reminder_floor', label: 'Floor reminder', group: 'Reminders' },
]

const BY_KEY = new Map(TRIGGERS.map(t => [t.key, t]))

export function triggerInfo(key: TriggerKey): TriggerInfo | undefined {
  return BY_KEY.get(key)
}

export type TriggerValues = Record<string, string | number>

// Fills {name} and the moment's own placeholders.
export function fillPlaceholders(line: string, name: string, values: TriggerValues = {}): string {
  return Object.entries({ name, ...values }).reduce((text, [k, v]) => text.replaceAll(`{${k}}`, String(v)), line)
}

// A line that still names a placeholder this moment doesn't have can't be said.
export function canSay(line: string, values: TriggerValues = {}): boolean {
  const known = new Set(['name', ...Object.keys(values)])
  return [...line.matchAll(/\{(\w+)\}/g)].every(m => known.has(m[1]))
}

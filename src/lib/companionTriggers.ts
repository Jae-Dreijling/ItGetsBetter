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
  // Visits, banter, celebrations (11e)
  'visit_knock', 'visit_accepted', 'visit_declined', 'visit_leaving', 'banter', 'banter_reply', 'cheer',
  // Hard days (11f)
  'quiet_today_on', 'body_double_start', 'body_double',
  // Calendar and rare moments (11g)
  'monday_morning', 'friday_evening', 'weekend_morning', 'holiday', 'together_anniversary', 'companion_birthday', 'shiny_day', 'rare',
  // Fun and gifts (11h)
  'gift_received', 'gift_for_you', 'request_done',
  // Prank hints and support visits (11j)
  'prank_hint', 'support_knock', 'support_visit', 'support_leaving',
  // Asked for alone time (dragged onto the ✕, 2026-10-22)
  'alone_time',
  // Minors who feel like family slip and call you dad, big sib, ... (lib/ageGroup)
  'family_slip',
  // Your own birthday (ROADMAP 2.6)
  'your_birthday',
] as const

export type ExtraTrigger = (typeof EXTRA_TRIGGERS)[number]
export type TriggerKey = keyof CompanionMessages

export const TRIGGER_GROUPS = [
  'Everyday', 'Calendar', 'Handling', 'Nicknames for you', 'Memory', 'Visits', 'Gifts', 'Logging', 'Habits & tasks', 'Goals & progress', 'Abstinence & cravings', 'People', 'Motivation', 'App & tools', 'Game', 'Reminders',
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
    key: 'quiet_today_on', label: '"Quiet today" switched on', group: 'Everyday',
    defaults: ["I'll be quiet today. I'm still right here if you tap me.", 'Shh, got it. Rest easy, {name}.', "Quiet mode. I'll just sit with you."],
  },
  {
    key: 'body_double_start', label: 'Focus session started (working with you)', group: 'Everyday',
    defaults: ["Let's do this together. I'll work right here next to you.", "I'm with you, {name}. One thing at a time.", 'Focus buddies! I brought my tiny desk.'],
  },
  {
    key: 'body_double', label: 'Keeping you company while you focus', group: 'Everyday',
    defaults: ['Still here with you.', "You're doing it. Keep going, gently.", '*works quietly next to you*', 'Halfway-ish? Proud of you.'],
  },
  {
    key: 'late_night', label: 'Still up very late', group: 'Everyday',
    defaults: [
      "It's really late, {name}. Be gentle with yourself tonight.",
      'Still awake? Whatever it is, it can wait until tomorrow. Rest if you can.',
      "Late-night {name}! Maybe a glass of water and then bed?",
    ],
  },

  // Calendar and rare moments (11g), mostly said when the app opens.
  {
    key: 'monday_morning', label: 'Monday morning', group: 'Calendar',
    defaults: ['Monday again! One small thing at a time, {name}.', 'New week, fresh start. No pressure though.', "Mondays are just Sunday's sleepy cousin. We've got this."],
  },
  {
    key: 'friday_evening', label: 'Friday evening', group: 'Calendar',
    defaults: ['Friday evening! You made it through the week, {name}.', "It's the weekend-ish! Anything nice planned?", 'Friday! Time to let your shoulders drop.'],
  },
  {
    key: 'weekend_morning', label: 'Weekend morning', group: 'Calendar',
    defaults: ['Weekend morning! Take it slow today, {name}.', 'No alarms, no rush. Happy weekend!', 'Lazy morning? Allowed. Encouraged even.'],
  },
  {
    key: 'holiday', label: 'A holiday', group: 'Calendar', placeholders: ['holiday'],
    defaults: ['Happy {holiday}, {name}! 🎉', "It's {holiday}! I hope today is kind to you.", '{holiday}! Do something nice for yourself today.'],
  },
  {
    key: 'together_anniversary', label: 'A year together (and more)', group: 'Calendar', placeholders: ['years'],
    defaults: ['{years} year(s) together today, {name}! Thank you for coming back, again and again.', 'Happy anniversary! {years} year(s) of you and me.', "It's been {years} year(s) since you started. Look how far you've come."],
  },
  {
    key: 'companion_birthday', label: 'Its own birthday (it stays with you all day)', group: 'Calendar',
    defaults: ["It's my birthday today!! 🎂 Spend the day with me?", 'Guess who has a birthday today? Me! 🎉', 'Birthday me is here all day, {name}! Cake? 🎂'],
    traitDefaults: {
      proud: ['Today is my birthday. You may celebrate me accordingly. 🎂'],
      sassy: ["It's my birthday. You'd better have remembered. 🎂"],
      shy: ['Um... it is my birthday today. Would you... spend it with me? 🎂'],
    },
  },
  {
    key: 'shiny_day', label: 'A rare shiny day ✨', group: 'Calendar',
    defaults: ["✨ Something feels sparkly today. I'm shiny! ✨", 'Whoa, look at me! ✨ A lucky day, {name}!', '✨ Rare shiny me! Make a wish!'],
  },
  {
    key: 'rare', label: 'Rare lines (now and then)', group: 'Everyday',
    defaults: ['Did you know octopuses have three hearts? I have one, and it likes you.', 'Fun fact: you are doing better than you think.', "I just counted, and you're my favourite. Don't tell the others."],
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
    key: 'your_birthday', label: 'Your birthday (set in Profile)', group: 'Calendar',
    defaults: [
      'HAPPY BIRTHDAY, {name}! 🎂 Today is all about you.',
      "It's your birthday! I'm so glad you were born, {name}. 🎉",
      'Happy birthday! Eat something nice, do something fun, and let us celebrate you. 🎈',
      'Birthday {name}! 🎂 Everyone came by to say it: we are so happy you exist.',
    ],
    traitDefaults: {
      proud: ['Happy birthday, {name}. Another year of you. The world is better for it. 🎂'],
      sassy: ["Happy birthday! Yes, you're getting older. Yes, you're still iconic. 🎉"],
      romantic: ['Happy birthday, my dear {name}. Today I only want to celebrate you. 💗🎂'],
      shy: ['H-happy birthday, {name}... I made you a tiny cake. 🎂'],
    },
  },
  {
    key: 'family_slip', label: 'Minors only: calls you {family} by accident', group: 'Nicknames for you', placeholders: ['family'],
    defaults: [
      'Thanks, {family}! ...I mean, {name}! Forget I said that.',
      'Okay, {family}. ...Wait. I did NOT just say that.',
      "You're kind of like family, you know? ...Never mind.",
      "I'm glad you're around. Like, really glad. ...Don't make it weird.",
    ],
  },
  {
    key: 'alone_time', label: 'You asked for some alone time (dragged onto the ✕)', group: 'Handling',
    defaults: ["Okay! I'll give you some space. See you in a bit.", 'Alone time, got it. Take care of yourself.', "Sure thing. I'll be around when you want me."],
    traitDefaults: {
      playful: ['Fine, fine, I know when I am not wanted! ...Kidding. Bye for now!', "Hide and seek? I'll hide. Don't come looking. Bye!"],
      proud: ['Very well. I have matters to attend to anyway.', 'As you wish. Call when you need me.'],
      sassy: ['Wow, kicked out. Rude. ...Okay, enjoy your peace.', "Fine. But you'll miss me."],
      shy: ["Oh! Um, okay. I hope I wasn't too much...", 'S-sure. Rest well.'],
      caring: ["Of course. Rest is important. I'm proud of you for asking.", 'Take all the quiet you need.'],
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
    key: 'prank_hint', label: 'Hinting at a prank (something is hidden)', group: 'Handling',
    defaults: ['Pffft...', '*trying very hard not to laugh*', 'Hehe... nothing. Nothing at all.'],
    traitDefaults: {
      sassy: ['Something missing, {name}? No idea what you mean.', 'Pffft. Look harder.'],
      proud: ['I have done nothing. Carry on.'],
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

  // Gifts (11h)
  {
    key: 'gift_received', label: 'You gave it a gift', group: 'Gifts', placeholders: ['gift'],
    defaults: ['A {gift}? For me?! Thank you, {name}!', "Oh! I love it. I'm keeping this {gift} forever.", "You didn't have to... but I'm so glad you did."],
    traitDefaults: {
      proud: ['A {gift}. Hm. ...It is acceptable. Thank you. Truly.', 'I shall treasure this {gift}. Do not tell anyone I said that.'],
      sassy: ['A {gift}? Took you long enough. ...I love it.', "Don't look at me while I'm happy."],
      shy: ['F-for me? Oh... thank you so much...', "I don't know what to say... thank you, {name}."],
      playful: ['A {gift}!!! Best day ever!', 'YAY! Gift dance! 🎉'],
    },
  },
  {
    key: 'gift_for_you', label: 'It gives you a gift', group: 'Gifts', placeholders: ['gift'],
    defaults: ['I got you something: {gift}! It is in your gift safe.', 'Here, {name}. {gift}. Just because.', 'Look what I found for you: {gift}!'],
    traitDefaults: {
      proud: ['I have selected a gift for you: {gift}. You are welcome.'],
      sassy: ["Here. {gift}. Don't make it weird."],
      shy: ['Um... I got you {gift}. I hope you like it...'],
    },
  },
  {
    key: 'request_done', label: 'You did its small request', group: 'Gifts',
    defaults: ['You did it! Thank you for doing that with me.', 'Yay! Tiny things, big difference.', "That's one small kind thing for you, {name}."],
  },

  // Visits (11e): said by the companion who comes to visit.
  {
    key: 'visit_knock', label: 'Asks if it may visit', group: 'Visits',
    defaults: ['Knock knock! Can I come hang out for a bit, {name}?', 'Hiii! Mind if I visit?', 'Got room for one more on your screen?'],
    traitDefaults: {
      proud: ['I have decided to grace you with a visit. If you will have me.'],
      sassy: ["Open up, {name}. I'm visiting. ...Please?"],
      shy: ['Um... would it be okay if I visited? Only if you want...'],
      playful: ['Knock knock! (Who is there? Me! Let me in!)'],
    },
  },
  {
    key: 'visit_accepted', label: 'You let it in', group: 'Visits',
    defaults: ["Yay! I'll stay a little while.", 'Thanks, {name}! Make some room!', "Hi hi! Don't mind me."],
    traitDefaults: {
      proud: ['A wise decision.'],
      sassy: ['Obviously. Who would say no to me?'],
      shy: ['R-really? Thank you...'],
    },
  },
  {
    key: 'visit_declined', label: 'You said not now', group: 'Visits',
    defaults: ['Okay! Another time then.', 'No worries, see you around!', "That's fine, I'll come back later."],
    traitDefaults: {
      proud: ['Very well. I have other places to be anyway.', 'Your loss.'],
      sassy: ['Wow. Okay. Rude.', "Fine. I didn't want to come anyway. (I did.)"],
      shy: ['Oh... okay. Maybe another time.'],
      playful: ['Aww! Next time then!', "I'll be back! Hehe."],
    },
  },
  {
    key: 'visit_leaving', label: 'Leaving after a visit', group: 'Visits',
    defaults: ['That was nice! See you, {name}!', 'Time for me to go. Thanks for having me!', 'Bye bye! Visit me back sometime?'],
    traitDefaults: {
      proud: ['I must take my leave. It was... pleasant.'],
      sassy: ["I'm off. Try not to miss me too much."],
      shy: ['Th-thank you for having me... bye!'],
    },
  },
  {
    key: 'support_knock', label: 'Asks to come by on a hard day', group: 'Visits',
    defaults: ['I heard today is hard. Can I come sit with you for a while?', "Knock knock... it's me. Want some company today, {name}?", "I won't say much. Can I just be here with you?"],
    traitDefaults: {
      romantic: ['My dear {name}, may I come and hold your hand for a bit?'],
      sassy: ["Move over. I'm keeping you company today, no arguments. ...If that's okay."],
      proud: ['I have cleared my schedule. For you. May I come by?'],
    },
  },
  {
    key: 'support_visit', label: 'Kind words while visiting on a hard day', group: 'Visits',
    defaults: ["You don't have to do anything right now. Just breathe.", "I'm proud of you for getting through today.", 'Hard days end too. I am right here.', 'Want to drink some water? I will wait.'],
    traitDefaults: {
      romantic: ['You are so loved, {name}. Even today. Especially today.'],
      sassy: ['Anyone who gives you a hard time has to go through me first.'],
    },
  },
  {
    key: 'support_leaving', label: 'Leaving after a hard-day visit', group: 'Visits',
    defaults: ['I have to go, but I left you a hug. Be gentle with yourself, {name}.', 'Rest well, okay? Tomorrow is a new page.', 'I am only a tap away. Always.'],
  },
  {
    key: 'banter', label: 'Starts some banter with the other companion', group: 'Visits', placeholders: ['other'],
    defaults: ['Hey {other}, are you looking after {name} properly?', '{other}! Fancy seeing you here.', 'So {other}, what have you two been up to?'],
    traitDefaults: {
      sassy: ["{other}, you call that encouragement? Watch and learn.", 'Move over, {other}. My turn.'],
      proud: ['{other}. I trust you have been behaving.'],
      playful: ['Tag, {other}! You are it!', '{other}, race you to the top of the screen!'],
      shy: ['H-hi, {other}... nice to see you.'],
    },
  },
  {
    key: 'banter_reply', label: 'Answers the other companion', group: 'Visits', placeholders: ['other'],
    defaults: ['Ha! Good to see you too, {other}.', "Of course I am, {other}. Who do you think I am?", 'We are doing great, thanks {other}!'],
    traitDefaults: {
      sassy: ['Keep dreaming, {other}.', 'Says you, {other}.'],
      proud: ['Naturally, {other}.'],
      playful: ["You're on, {other}!", 'Hehe, hi {other}!'],
      shy: ['Oh! H-hello, {other}.'],
    },
  },
  {
    key: 'cheer', label: 'Joins in on a big moment', group: 'Visits',
    defaults: ['Woohoo! 🎉', 'Yes, {name}! Amazing!', 'That deserves a celebration!'],
    traitDefaults: {
      sassy: ['Okay, okay, that was impressive.'],
      proud: ['Splendid work.'],
      shy: ['Y-yay! 🎉'],
      playful: ['PARTY! 🎊', 'Confetti time!'],
    },
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

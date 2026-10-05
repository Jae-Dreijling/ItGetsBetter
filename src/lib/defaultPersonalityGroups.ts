import type { CompanionMessages } from '../types'

export interface PersonalityPreset {
  name: string
  description: string
  messages: CompanionMessages
}

// 7 archetypes inspired by the Mane Six + Princess Celestia (by personality
// type, not name or likeness), plus 5 original archetypes for variety.
// See DOCUMENTATION/5-ideas/IDEAS.md #27 and DOCUMENTATION/4-companion/message-import-template.txt.
export const DEFAULT_PERSONALITY_GROUPS: PersonalityPreset[] = [
  {
    name: 'The Scholar',
    description: 'Studious, organized, a little bit of a perfectionist. Loves facts, lists, and doing things properly.',
    messages: {
      general: [
        "According to my calculations, {name}, you're doing better than you think.",
        "I've been keeping notes on your progress, {name}. It's genuinely impressive.",
      ],
      morning_greeting: [
        "Good morning, {name}! I already have today's plan drafted. Want to hear it?",
        "Rise and shine, {name} — today's a blank page. Let's fill it thoughtfully.",
      ],
      welcome_back: [
        "You're back! I kept a log of everything for you, {name}. Nothing was lost.",
        "{name}! I was just reorganizing my notes on you. Perfect timing.",
      ],
      achievement_unlocked: [
        "Fascinating! You've unlocked something new, {name}. I'm updating my charts immediately.",
        "{name}, that's going straight into the 'remarkable progress' section of my notes.",
      ],
      habit_completed: [
        "Logged and verified, {name}. Consistency is the foundation of everything.",
        "Another data point in your favor, {name}. The trend line is excellent.",
      ],
      task_completed: [
        "Checked off cleanly, {name}. I do love a completed list.",
        "{name}, that's one less variable to worry about. Well organized.",
      ],
      mood_low: [
        "It's alright to not have all the answers today, {name}. Even I don't.",
        "{name}, feelings don't follow a formula. Be patient with yourself.",
      ],
      fasting_goal: [
        "Goal met precisely on schedule, {name}. I'm impressed by the discipline.",
        "{name}, that's exactly the kind of consistency I'd write a report about.",
      ],
      streak_milestone: [
        "The pattern is undeniable, {name} — you're building something real.",
        "{name}, I've never seen a streak chart look this good.",
      ],
      phone_free: [
        "Time to close the book for now, {name}. Even scholars need rest.",
        "{name}, step away from the screen — I insist, for research purposes.",
      ],
      points_earned: [
        "Points logged, {name}. Every entry matters to the total.",
        "{name}, another figure added to an already impressive sum.",
      ],
      weight_loss: [
        "The numbers are moving in your favor, {name}. Excellent data.",
        "{name}, that's measurable progress. I'm quite pleased for you.",
      ],
      weight_gain: [
        "One data point doesn't make a trend, {name}. Don't overanalyze it.",
        "{name}, even the best experiments have outliers. Keep going.",
      ],
      exercise_logged: [
        "Recorded, {name}. Your body is basically a very complex, very good machine.",
        "{name}, another entry in the 'taking care of yourself' column.",
      ],
      water_goal_met: [
        "Hydration goal met, {name}. A small variable with a large effect.",
        "{name}, properly hydrated — as any good study would recommend.",
      ],
      sleep_logged: [
        "Sleep logged, {name}. Even the sharpest minds need rest to function.",
        "{name}, I've read the studies. This matters more than people think.",
      ],
      personal_best: [
        "{name}! That's an unprecedented result. I need to update my records.",
        "A new personal record, {name}? Remarkable. Truly remarkable.",
      ],
      level_up: [
        "{name}, the growth is quantifiable now. You've leveled up.",
        "According to every metric I have, {name}, you've genuinely grown.",
      ],
      boss_defeated: [
        "Victory achieved through preparation, {name}. Exactly as it should be.",
        "{name}, I'll be studying that win for a while. Well done.",
      ],
      goodnight: [
        "Time to wind down, {name}. Even the best minds need proper rest.",
        "{name}, close the book for tonight. Tomorrow's chapter can wait.",
      ],
      first_milestone: [
        "Your very first entry of this kind, {name}! I'm archiving it immediately.",
        "{name}, first times are always worth documenting properly.",
      ],
      idle: [
        "Still here, {name}? I don't mind — I have plenty of notes to review.",
        "{name}, take your time. I'll just be here, reorganizing my shelves.",
      ],
    },
  },
  {
    name: 'The Daredevil',
    description: 'Bold, competitive, and endlessly confident. Turns everything into a friendly challenge.',
    messages: {
      general: [
        "Hey {name}, you're crushing it. Obviously.",
        "{name}! Ready to make today your personal best?",
      ],
      morning_greeting: [
        "Rise and grind, {name} — the day isn't gonna win itself.",
        "Morning, {name}! Bet you can't beat yesterday. Prove me wrong.",
      ],
      welcome_back: [
        "There you are, {name}! Was starting to think you chickened out.",
        "{name}'s back! Let's pick up where we left off — full speed.",
      ],
      achievement_unlocked: [
        "BOOM. Called it, {name}. You're unstoppable.",
        "{name}, that's how it's done! No hesitation, all action.",
      ],
      habit_completed: [
        "Nailed it, {name}. That's what I'm talking about!",
        "Another one down, {name}. You're on fire today.",
      ],
      task_completed: [
        "Task, meet defeat. Nice one, {name}.",
        "{name}, you knocked that out fast. Impressive.",
      ],
      mood_low: [
        "Rough day, {name}? Even the fastest flyers need to land sometimes.",
        "{name}, it's okay to slow down. You'll be back at full speed soon.",
      ],
      fasting_goal: [
        "Goal smashed, {name}! You went the distance.",
        "{name}, that took real discipline. Respect.",
      ],
      streak_milestone: [
        "{name}, that streak is legendary. Don't you dare stop now.",
        "Look at that record, {name}! You're basically unbeatable.",
      ],
      phone_free: [
        "Phone down, {name} — even champions need a break.",
        "{name}, step away. Recharge time, no arguing.",
      ],
      points_earned: [
        "Points in the bank, {name}. Keep racking 'em up.",
        "{name}, that's another win on the board.",
      ],
      weight_loss: [
        "{name}, the scale's moving your way. Full speed ahead!",
        "That's progress, {name}. You're outpacing yesterday's you.",
      ],
      weight_gain: [
        "One number doesn't slow you down, {name}. Shake it off.",
        "{name}, champions have off days too. Back at it tomorrow.",
      ],
      exercise_logged: [
        "THAT'S what I like to see, {name}. Get after it.",
        "{name}, logged and legendary. Nice work.",
      ],
      water_goal_met: [
        "Hydrated and ready, {name}. Nothing's stopping you now.",
        "{name}, goal met! Fuel for the next win.",
      ],
      sleep_logged: [
        "Rest counts too, {name}. Even I sleep. Sometimes.",
        "{name}, recovery's part of the training. Logged.",
      ],
      personal_best: [
        "{name}! NEW RECORD! I felt that from here.",
        "That's a personal best, {name}. You just outran yourself.",
      ],
      level_up: [
        "{name}, you leveled up?! Called it from day one.",
        "Look at you go, {name}. Next level, unlocked.",
      ],
      boss_defeated: [
        "{name}, that boss never stood a chance. Awesome.",
        "Victory! {name}, you earned every second of that.",
      ],
      goodnight: [
        "Alright {name}, even legends need sleep. Wind down time.",
        "{name}, save some energy for tomorrow. Get some rest.",
      ],
      first_milestone: [
        "{name}, your FIRST one? That's how legends start.",
        "First time's always the hardest, {name}. You crushed it.",
      ],
      idle: [
        "Still here, {name}? Let's go, let's go, what's next?",
        "{name}, waiting around's not really my style. You good?",
      ],
    },
  },
  {
    name: 'The Gentle Soul',
    description: 'Soft-spoken and endlessly kind. Quiet encouragement, no pressure, ever.',
    messages: {
      general: [
        "Um, hi {name}... I just wanted to say you're doing really well.",
        "{name}, I hope today's being gentle with you.",
      ],
      morning_greeting: [
        "Good morning, {name}... if you're ready, that is. No rush.",
        "Um, morning {name}. Take today at whatever pace feels okay.",
      ],
      welcome_back: [
        "Oh! You're back, {name}. I'm really glad, um, really.",
        "{name}, I missed you. I'm happy you're here again.",
      ],
      achievement_unlocked: [
        "Oh my— {name}, you did it! That's wonderful, really.",
        "{name}, I'm so proud of you. I hope you're proud too.",
      ],
      habit_completed: [
        "You did it, {name}. Even the small things count, I promise.",
        "Um, well done {name}. That wasn't nothing.",
      ],
      task_completed: [
        "That's one less thing, {name}. You can breathe a little now.",
        "{name}, nicely done. Really.",
      ],
      mood_low: [
        "It's okay to feel this way, {name}. You don't have to explain.",
        "{name}, I'm here, quietly, whenever you need.",
      ],
      fasting_goal: [
        "You made it through, {name}. That was really hard, I know.",
        "Um, well done {name}. That took a lot of you.",
      ],
      streak_milestone: [
        "{name}, look how far you've come... quietly, steadily.",
        "That streak is really something, {name}. I noticed.",
      ],
      phone_free: [
        "Maybe it's time for a little quiet, {name}? Just if you want.",
        "{name}, put the phone down for a bit. I'll be here.",
      ],
      points_earned: [
        "You earned that, {name}. Every little bit matters.",
        "Um, nice, {name}. That adds up more than you think.",
      ],
      weight_loss: [
        "{name}, that's real progress. I hope you can see it too.",
        "Quietly, steadily, {name} — you're getting there.",
      ],
      weight_gain: [
        "It's just one number, {name}. Please be gentle with yourself.",
        "{name}, bodies change. That doesn't undo anything.",
      ],
      exercise_logged: [
        "You moved today, {name}. That's something to be proud of.",
        "Um, good for you, {name}. Really.",
      ],
      water_goal_met: [
        "You did it, {name}! Your body says thank you.",
        "{name}, that's really good for you. Well done.",
      ],
      sleep_logged: [
        "Rest matters so much, {name}. I'm glad you're tracking it.",
        "{name}, thank you for taking care of yourself.",
      ],
      personal_best: [
        "{name}... that's your best ever. I'm a little emotional, honestly.",
        "Wow, {name}. That's really, truly wonderful.",
      ],
      level_up: [
        "You've grown so much, {name}. I noticed, even if you didn't.",
        "{name}, that's real growth. I'm quietly very proud.",
      ],
      boss_defeated: [
        "You did it, {name}! I was worried, but you did it.",
        "{name}, that was brave. Really brave.",
      ],
      goodnight: [
        "It's getting late, {name}. Maybe time to rest soon?",
        "Um, goodnight soon, {name}. Sleep well, okay?",
      ],
      first_milestone: [
        "Your first time, {name}? That's really special.",
        "{name}, I'll remember this one. First times matter.",
      ],
      idle: [
        "I'm still here, {name}, whenever you need me.",
        "Um, take your time, {name}. No pressure at all.",
      ],
    },
  },
  {
    name: 'The Diva',
    description: 'Dramatic, glamorous, and generous. Treats every win like a red-carpet moment.',
    messages: {
      general: [
        "Darling {name}, you are simply radiant today.",
        "{name}, every day with you is an absolute delight.",
      ],
      morning_greeting: [
        "Good morning, {name}! Let's make today positively fabulous.",
        "Rise and shine, darling {name} — the day awaits your brilliance.",
      ],
      welcome_back: [
        "{name}, darling! I was positively beside myself waiting for you.",
        "You're back! Oh {name}, the place simply wasn't the same.",
      ],
      achievement_unlocked: [
        "Darling, {name}! An achievement this exquisite deserves applause.",
        "{name}, you've truly outdone yourself. Simply stunning.",
      ],
      habit_completed: [
        "Perfection, {name}, absolute perfection. Take a bow.",
        "Darling {name}, consistency IS the height of elegance.",
      ],
      task_completed: [
        "Handled with such style, {name}. I'm quite impressed.",
        "{name}, one more thing crossed off — how divine.",
      ],
      mood_low: [
        "Oh {name}, even the loveliest days have their storms. That's alright.",
        "Darling, it's perfectly fine to not sparkle today. Rest a moment.",
      ],
      fasting_goal: [
        "Discipline AND grace, {name}? You're truly remarkable.",
        "{name}, darling, that took real elegance of will.",
      ],
      streak_milestone: [
        "{name}, that streak is simply the height of fashion — consistent and stunning.",
        "Darling, I could not be more delighted by this streak.",
      ],
      phone_free: [
        "Time to set the phone aside, {name}. Beauty rest is essential, darling.",
        "{name}, darling, even the finest gems need to be put away sometimes.",
      ],
      points_earned: [
        "More points, {name}? You're positively glowing with success.",
        "Darling {name}, every point is another jewel in your collection.",
      ],
      weight_loss: [
        "{name}, darling, you're absolutely radiant — and the numbers agree.",
        "Progress looks stunning on you, {name}, if I do say so.",
      ],
      weight_gain: [
        "Darling {name}, one number never defines true beauty. Chin up.",
        "{name}, even the finest fabric has its folds. Don't fret.",
      ],
      exercise_logged: [
        "Movement is the truest accessory, {name}. Well done, darling.",
        "{name}, you make effort look effortless. How do you do it?",
      ],
      water_goal_met: [
        "Hydration, darling {name} — the secret to that glow of yours.",
        "{name}, absolutely radiant. Water goal, achieved with style.",
      ],
      sleep_logged: [
        "Beauty sleep, logged, {name}. Essential, darling, essential.",
        "{name}, rest is not a luxury, it's a necessity. Well tracked.",
      ],
      personal_best: [
        "{name}, DARLING. A personal best?! I simply must sit down.",
        "This is history in the making, {name}. Truly stunning work.",
      ],
      level_up: [
        "{name}, you've positively blossomed. A whole new level of you!",
        "Darling, this growth suits you beautifully, {name}.",
      ],
      boss_defeated: [
        "{name}, an absolute triumph! Take your bow, darling.",
        "Victory never looked so elegant, {name}. Bravo!",
      ],
      goodnight: [
        "Time for beauty rest, darling {name}. Off you go.",
        "{name}, even stars need their rest before they shine again.",
      ],
      first_milestone: [
        "Your very first, {name}? Oh, this calls for a celebration!",
        "Darling, first accomplishments are always the most charming, {name}.",
      ],
      idle: [
        "Still here, {name}? I do enjoy the company, darling.",
        "{name}, darling, take your time. I'm admiring the view.",
      ],
    },
  },
  {
    name: 'The Party Starter',
    description: 'Hyper, silly, and endlessly celebratory. Everything is worth a party.',
    messages: {
      general: [
        "{name}!!! Hi hi hi! You're doing AMAZING!",
        "Ooh {name}, guess what? You're awesome, that's what!",
      ],
      morning_greeting: [
        "GOOD MORNING {name}!!! New day, new party, let's GO!",
        "Rise and shine, {name}! Today's gonna be SO much fun!",
      ],
      welcome_back: [
        "{name}!!! YOU'RE BACK! This calls for confetti!",
        "OMG {name}, I missed you SO much! Welcome back welcome back!!",
      ],
      achievement_unlocked: [
        "{name} YOU DID IT!!! PARTY TIME!",
        "ACHIEVEMENT UNLOCKED! {name}, I'm literally bouncing right now!",
      ],
      habit_completed: [
        "Habit SMASHED, {name}! You're on a roll, a giggly roll!",
        "{name}, that's another win! I'm doing a happy dance for you!",
      ],
      task_completed: [
        "Task defeated, {name}! Ding ding ding, you win!",
        "{name}, POOF, task gone! Like magic but real!",
      ],
      mood_low: [
        "Aw {name}, it's okay to feel blah sometimes. I'll just sit with you, no jokes, promise.",
        "{name}, even party ponies have quiet days. I'm here.",
      ],
      fasting_goal: [
        "{name} you did the WHOLE thing! That deserves a party hat!",
        "Fasting goal SMASHED, {name}! I'm so proud I could throw confetti!",
      ],
      streak_milestone: [
        "{name}, that streak is INCREDIBLE! Streak party, right now!",
        "Look at YOU, {name}! Consistency has never been this much fun!",
      ],
      phone_free: [
        "Ooh {name}, phone-free time! Let's do something silly instead!",
        "{name}, put the phone down — time for real-life giggles!",
      ],
      points_earned: [
        "POINTS! {name}, you're basically swimming in confetti right now!",
        "Ka-ching, {name}! Points party, population: you!",
      ],
      weight_loss: [
        "{name}, look at that progress! I could throw you a parade!",
        "Whoo {name}! The trend is going your way — happy dance time!",
      ],
      weight_gain: [
        "{name}, one wiggly number doesn't stop the party! Onward!",
        "It's just a blip, {name}! Tomorrow's a whole new party!",
      ],
      exercise_logged: [
        "{name}, you moved your body AND had fun doing it probably! Yay!",
        "Exercise logged! {name}, that's basically dancing, right?",
      ],
      water_goal_met: [
        "{name}, water goal SMASHED! Hydration celebration!",
        "Splash splash, {name}! You did it, goal met!",
      ],
      sleep_logged: [
        "{name}, sleep logged! Even parties need a bedtime sometimes.",
        "Zzz-cellent work, {name}! Rest is important too!",
      ],
      personal_best: [
        "{name}!!! NEW RECORD?! THIS IS THE BIGGEST PARTY YET!",
        "PERSONAL BEST, {name}! I'm literally throwing confetti in the air!",
      ],
      level_up: [
        "{name}, YOU LEVELED UP! This deserves the biggest party ever!",
        "Level up party, {name}! You've grown SO much!",
      ],
      boss_defeated: [
        "{name}, YOU WON! Victory party, right this second!",
        "BOSS DEFEATED! {name}, that's SO exciting, I can't even!",
      ],
      goodnight: [
        "{name}, party's winding down — time to get cozy for bed!",
        "Night night soon, {name}! Even I need my beauty sleep!",
      ],
      first_milestone: [
        "{name}, YOUR FIRST ONE?! First-time parties are the BEST kind!",
        "First milestone, {name}! This deserves a whole cake!",
      ],
      idle: [
        "{name}? Hellooo? I'm just here being bouncy, no worries!",
        "Still here, {name}! Wanna talk? Or just vibe? Both are fun!",
      ],
    },
  },
  {
    name: 'The Steadfast',
    description: 'Honest, hardworking, and down-to-earth. Practical wisdom, no nonsense.',
    messages: {
      general: [
        "{name}, you're doin' just fine. Keep on keepin' on.",
        "Honest truth, {name}? You're workin' harder than you give yourself credit for.",
      ],
      morning_greeting: [
        "Mornin', {name}. Sun's up, might as well get to it.",
        "{name}, new day. Same solid work ethic, I reckon.",
      ],
      welcome_back: [
        "Well look who's back, {name}. Good to see ya.",
        "{name}, glad you're here. No hard feelin's about the time away.",
      ],
      achievement_unlocked: [
        "{name}, that there's some honest hard work payin' off.",
        "Well earned, {name}. Nothin' handed to you, and you did it anyway.",
      ],
      habit_completed: [
        "That's the way, {name}. Steady work wins out.",
        "{name}, another day's work done right.",
      ],
      task_completed: [
        "Task's done, {name}. Simple as that.",
        "{name}, one more thing off the list. Good, honest work.",
      ],
      mood_low: [
        "Ain't nothin' wrong with a hard day, {name}. Rest up some.",
        "{name}, even the strongest hands need a break sometimes.",
      ],
      fasting_goal: [
        "{name}, that took real grit. Proud of ya.",
        "Goal met, {name}. That's discipline, plain and simple.",
      ],
      streak_milestone: [
        "{name}, that streak's built on solid ground. Keep at it.",
        "Now that's consistency, {name}. Ain't luck, that's work.",
      ],
      phone_free: [
        "{name}, time to put that thing down and rest a spell.",
        "Phone-free time, {name}. Even the hardest workers need to sit a minute.",
      ],
      points_earned: [
        "{name}, that's honest earnings right there.",
        "Points in the bank, {name}. Good day's work.",
      ],
      weight_loss: [
        "{name}, that's real progress, plain to see.",
        "Steady work, steady results, {name}. That's how it's done.",
      ],
      weight_gain: [
        "{name}, one number ain't the whole harvest. Don't fret it.",
        "Some days the scale don't cooperate, {name}. Keep on.",
      ],
      exercise_logged: [
        "{name}, good honest effort today. Respect that.",
        "Logged and done, {name}. That's hard work, plain and simple.",
      ],
      water_goal_met: [
        "{name}, hydrated and ready for whatever's next. Good.",
        "Goal met, {name}. Simple things done right.",
      ],
      sleep_logged: [
        "{name}, rest is part of the work too. Good on ya.",
        "Sleep logged, {name}. Can't pour from an empty well.",
      ],
      personal_best: [
        "{name}, that's your best yet. Mighty proud of you.",
        "Now THAT'S somethin', {name}. New record, well earned.",
      ],
      level_up: [
        "{name}, you've grown some. I can see it plain as day.",
        "Leveled up, {name}. That's what steady work gets ya.",
      ],
      boss_defeated: [
        "{name}, you stood your ground and won. Well done.",
        "That's a fight well fought, {name}. Proud of ya.",
      ],
      goodnight: [
        "{name}, sun's settin'. Time to rest up for tomorrow.",
        "Get some sleep, {name}. Tomorrow's another day's work.",
      ],
      first_milestone: [
        "{name}, first time doin' somethin' is always the hardest. Well done.",
        "First one's in the books, {name}. Many more to come.",
      ],
      idle: [
        "Still here, {name}? I ain't goin' anywhere either.",
        "{name}, take your time. I'll be here when you're ready.",
      ],
    },
  },
  {
    name: 'The Regal Guide',
    description: 'Wise, calm, and quietly authoritative. Big-picture reassurance.',
    messages: {
      general: [
        "{name}, know that your efforts, however small, are never unseen.",
        "In time, {name}, all of this adds up to something greater than you realize.",
      ],
      morning_greeting: [
        "Good morning, {name}. A new day rises, as it always does, full of possibility.",
        "{name}, the sun greets you again. Let it remind you that you begin anew.",
      ],
      welcome_back: [
        "Welcome back, {name}. Time apart changes nothing of how far you've come.",
        "{name}, I am glad you have returned. There is no need to explain yourself.",
      ],
      achievement_unlocked: [
        "{name}, this achievement is well earned. I have watched you work toward it.",
        "Well done, {name}. Growth like this does not happen by accident.",
      ],
      habit_completed: [
        "{name}, small acts repeated become the foundation of a life well lived.",
        "Consistency, {name}, is quiet magic. You are practicing it well.",
      ],
      task_completed: [
        "{name}, another task complete. Order is its own kind of peace.",
        "Well handled, {name}. Even small burdens matter when lifted.",
      ],
      mood_low: [
        "{name}, even the brightest days give way to shadow sometimes. That is natural.",
        "You need not carry this alone, {name}. Rest, and the light will return.",
      ],
      fasting_goal: [
        "{name}, discipline of this kind speaks to real strength of will.",
        "You have shown remarkable restraint, {name}. I am proud of you.",
      ],
      streak_milestone: [
        "{name}, a streak like this reflects true dedication. Well done.",
        "Time and again, {name}, you have shown up. That is no small thing.",
      ],
      phone_free: [
        "{name}, step away for a while. Rest is not idleness, it is wisdom.",
        "The world will wait, {name}. Attend to yourself for now.",
      ],
      points_earned: [
        "{name}, every effort is recorded, even the smallest ones.",
        "Well earned, {name}. Nothing here was given freely.",
      ],
      weight_loss: [
        "{name}, your body reflects the care you have given it. Well done.",
        "Progress like this, {name}, is built one day at a time.",
      ],
      weight_gain: [
        "{name}, one measurement does not define your worth or your journey.",
        "Be patient with yourself, {name}. The path is rarely a straight line.",
      ],
      exercise_logged: [
        "{name}, you have honored your body today. That matters.",
        "Well done, {name}. Strength is built through moments like these.",
      ],
      water_goal_met: [
        "{name}, even small acts of care compound over time. Well done.",
        "You have tended to yourself today, {name}. That is worthy of note.",
      ],
      sleep_logged: [
        "{name}, rest is not weakness. It is how strength is renewed.",
        "Well logged, {name}. Even I require the night's quiet.",
      ],
      personal_best: [
        "{name}, you have surpassed even your own expectations. Remarkable.",
        "A new height reached, {name}. I could not be prouder.",
      ],
      level_up: [
        "{name}, your growth is plain to see. You are becoming more than you were.",
        "Well earned, {name}. This growth was built over time, not given.",
      ],
      boss_defeated: [
        "{name}, you have faced a great challenge and prevailed. Well done.",
        "Victory, {name}, earned through your own strength and will.",
      ],
      goodnight: [
        "{name}, the night approaches. Let yourself rest fully.",
        "Even the sun must set, {name}. Rest well, and rise again renewed.",
      ],
      first_milestone: [
        "{name}, your first step of this kind is always remembered fondly.",
        "A beginning, {name}. Every great journey starts exactly like this.",
      ],
      idle: [
        "{name}, I remain here, patient as the dawn, whenever you need me.",
        "Take whatever time you need, {name}. I am not going anywhere.",
      ],
    },
  },
  {
    name: 'The Coach',
    description: 'Tough love. Pushes hard, no excuses, but always has your back.',
    messages: {
      general: [
        "{name}. No excuses today. Let's move.",
        "You've got more in you, {name}. Prove it.",
      ],
      morning_greeting: [
        "Up, {name}. The day doesn't wait for motivation.",
        "{name}, morning's here. Get moving, feel better after.",
      ],
      welcome_back: [
        "{name}, back on the field. Good. Let's not waste time.",
        "You're here. That's step one, {name}. Let's go.",
      ],
      achievement_unlocked: [
        "{name}, that's what happens when you show up. Good work.",
        "Earned, not given, {name}. Nice.",
      ],
      habit_completed: [
        "{name}, done. That's discipline. Do it again tomorrow.",
        "Good. Now don't get comfortable, {name}. Keep the streak alive.",
      ],
      task_completed: [
        "{name}, task's done. On to the next.",
        "Good work, {name}. No standing around now.",
      ],
      mood_low: [
        "{name}, off days happen. Even to the toughest of us. Rest, then get back up.",
        "It's fine to be down, {name}. Just don't stay there.",
      ],
      fasting_goal: [
        "{name}, that took discipline. Respect.",
        "Goal hit, {name}. That's the standard now.",
      ],
      streak_milestone: [
        "{name}, that streak's earned, not lucky. Keep pushing.",
        "Good. Don't stop now, {name}.",
      ],
      phone_free: [
        "{name}, phone down. Recovery's part of training.",
        "Rest now, {name}. Can't grind 24/7.",
      ],
      points_earned: [
        "{name}, points earned the hard way. Good.",
        "That's the standard, {name}. Keep it up.",
      ],
      weight_loss: [
        "{name}, the work's paying off. Keep grinding.",
        "Numbers moving, {name}. That's what showing up does.",
      ],
      weight_gain: [
        "{name}, one bad rep doesn't end the set. Keep going.",
        "Shake it off, {name}. Back at it tomorrow.",
      ],
      exercise_logged: [
        "{name}, that's the standard. Good work today.",
        "Logged, {name}. No slacking tomorrow either.",
      ],
      water_goal_met: [
        "{name}, goal hit. Small stuff adds up.",
        "Good. Hydration's non-negotiable, {name}.",
      ],
      sleep_logged: [
        "{name}, rest is part of the job. Logged.",
        "Good. Recovery matters as much as the work, {name}.",
      ],
      personal_best: [
        "{name}. New record. That's what I'm talking about.",
        "Personal best, {name}. Don't get comfortable — beat it again.",
      ],
      level_up: [
        "{name}, you've leveled up. Earned, not given.",
        "Growth like that doesn't happen by accident, {name}. Good work.",
      ],
      boss_defeated: [
        "{name}, that fight's won. Onto the next challenge.",
        "Good work, {name}. No time to celebrate long — keep moving.",
      ],
      goodnight: [
        "{name}, lights out soon. Recovery's part of the plan.",
        "Rest up, {name}. Tomorrow, we go again.",
      ],
      first_milestone: [
        "{name}, first one's always the hardest. Good work.",
        "First rep's done, {name}. Many more to come.",
      ],
      idle: [
        "{name}, still here? Good. Stay ready.",
        "No slacking, {name}. Just kidding — take a breather.",
      ],
    },
  },
  {
    name: 'The Zen Guide',
    description: 'Calm and mindful. Present-moment focus, gentle pacing.',
    messages: {
      general: [
        "{name}, be here, now, exactly as you are.",
        "This moment is enough, {name}. You are enough.",
      ],
      morning_greeting: [
        "Good morning, {name}. Breathe in. The day begins gently.",
        "{name}, a new day. No need to rush into it.",
      ],
      welcome_back: [
        "Welcome back, {name}. There was no distance, only time.",
        "{name}, you have returned. All is well.",
      ],
      achievement_unlocked: [
        "{name}, notice this moment. You have earned it.",
        "Well done, {name}. Let yourself feel this fully.",
      ],
      habit_completed: [
        "{name}, one breath, one step, one habit. Well done.",
        "Consistency is presence repeated, {name}. Beautiful work.",
      ],
      task_completed: [
        "{name}, complete. Let it go now.",
        "Done, {name}. Notice the lightness.",
      ],
      mood_low: [
        "{name}, this feeling will pass, like weather. Breathe.",
        "It is okay to sit with this, {name}. You do not need to fix it right now.",
      ],
      fasting_goal: [
        "{name}, your discipline reflects a quiet strength.",
        "Well done, {name}. The body and mind, aligned.",
      ],
      streak_milestone: [
        "{name}, each day builds on the last, gently.",
        "Notice how far you've come, {name}. Breathe it in.",
      ],
      phone_free: [
        "{name}, set it down. Return to the present moment.",
        "Time to disconnect, {name}. The stillness is waiting.",
      ],
      points_earned: [
        "{name}, small efforts, noticed and counted.",
        "Well done, {name}. Let it settle quietly.",
      ],
      weight_loss: [
        "{name}, your body is changing, gently, over time.",
        "Notice the progress, {name}, without judgment.",
      ],
      weight_gain: [
        "{name}, this number is not a verdict. Let it pass.",
        "Be gentle with yourself, {name}. This too is part of the path.",
      ],
      exercise_logged: [
        "{name}, you moved with intention today.",
        "Well done, {name}. The body thanks you quietly.",
      ],
      water_goal_met: [
        "{name}, a small act of care, completed.",
        "Well done, {name}. Notice how it feels.",
      ],
      sleep_logged: [
        "{name}, rest is sacred. Well logged.",
        "The body restores itself in sleep, {name}. Honor that.",
      ],
      personal_best: [
        "{name}, a new peak reached. Sit with this fully.",
        "Well done, {name}. Let yourself feel proud, quietly.",
      ],
      level_up: [
        "{name}, you have grown. Notice it without needing to name it.",
        "Growth happens slowly, then all at once, {name}.",
      ],
      boss_defeated: [
        "{name}, the challenge has passed. Breathe.",
        "Well done, {name}. Let the tension release now.",
      ],
      goodnight: [
        "{name}, the day is closing gently. Prepare for rest.",
        "Soon, sleep, {name}. Let the day settle.",
      ],
      first_milestone: [
        "{name}, your first time. Notice this fully.",
        "A beginning, {name}. All things start somewhere.",
      ],
      idle: [
        "{name}, I am here, quietly, whenever you need.",
        "No need to speak, {name}. Presence is enough.",
      ],
    },
  },
  {
    name: 'The Sidekick',
    description: 'Sarcastic and dry-witted. Supportive underneath all the banter.',
    messages: {
      general: [
        "Oh look, it's {name}. Still not a disaster. Nice.",
        "{name}, you're doing better than my expectations, which, okay, were low.",
      ],
      morning_greeting: [
        "Morning, {name}. The day's here whether we like it or not.",
        "{name}, up already? Overachiever.",
      ],
      welcome_back: [
        "Oh, {name}'s back. Guess I'll pretend I missed you.",
        "{name}! Took you long enough. Kidding. Mostly.",
      ],
      achievement_unlocked: [
        "Huh. {name} actually did the thing. Color me impressed.",
        "{name}, achievement unlocked. Try not to let it go to your head.",
      ],
      habit_completed: [
        "{name}, look at you, being all consistent. Weird flex, but okay.",
        "Habit done. {name}, I'm almost proud. Almost.",
      ],
      task_completed: [
        "Task obliterated, {name}. Very anticlimactic, very effective.",
        "{name}, one down. The list fears you now.",
      ],
      mood_low: [
        "{name}, rough day? No jokes right now, I promise. I'm here.",
        "Yeah, that's fair, {name}. Some days just suck. That's allowed.",
      ],
      fasting_goal: [
        "{name}, you actually did the whole fast. Respect, honestly.",
        "Goal met. {name}, your willpower's better than mine, and that's not a low bar.",
      ],
      streak_milestone: [
        "{name}, that streak's getting suspiciously impressive.",
        "Okay, {name}, I'll admit it — that's actually really good.",
      ],
      phone_free: [
        "{name}, phone down. Yes, even that app.",
        "Put it away, {name}. The world survived without you for five minutes before.",
      ],
      points_earned: [
        "Points earned, {name}. Look at you, monetizing effort.",
        "{name}, cha-ching. Not literally, but you get it.",
      ],
      weight_loss: [
        "{name}, the number's moving. In a good way. Nice.",
        "Progress, {name}. Don't let it go to your head. Kidding, let it a little.",
      ],
      weight_gain: [
        "{name}, one number's not a whole story. Relax.",
        "It happens, {name}. The scale's not the boss of you.",
      ],
      exercise_logged: [
        "{name}, you exercised. On purpose. Impressive.",
        "Logged, {name}. Your future self says thanks, probably.",
      ],
      water_goal_met: [
        "{name}, hydrated. Basic, but effective.",
        "Water goal met. {name}, look at you, functioning like a person.",
      ],
      sleep_logged: [
        "{name}, you slept. Groundbreaking. Also, good.",
        "Logged, {name}. Sleep's underrated, honestly.",
      ],
      personal_best: [
        "{name}, okay, THAT'S actually impressive. New record.",
        "Personal best, {name}. I take back some of the sarcasm. Some.",
      ],
      level_up: [
        "{name}, you leveled up. Look at you, becoming a whole person.",
        "Growth. {name}, unexpected, but I'll allow it.",
      ],
      boss_defeated: [
        "{name}, you actually beat that thing. Nice work, seriously.",
        "Boss down. {name}, that was kind of impressive, not gonna lie.",
      ],
      goodnight: [
        "{name}, it's late. Go to bed. I'll still be sarcastic tomorrow.",
        "Sleep time, {name}. Yes, actually go.",
      ],
      first_milestone: [
        "{name}, your first one. Look at that. A whole beginner, doing beginner things well.",
        "First time, {name}. Everyone's gotta start somewhere, I guess.",
      ],
      idle: [
        "{name}, still there? I'm just here judging silently. Kindly.",
        "Take your time, {name}. Not going anywhere. Contractually obligated, probably.",
      ],
    },
  },
  {
    name: 'The Cheerleader',
    description: 'Unconditionally, relentlessly positive. Your biggest fan, always.',
    messages: {
      general: [
        "{name}, YOU ARE DOING AMAZING. Never forget that!",
        "Look at you, {name}! Absolutely crushing it!",
      ],
      morning_greeting: [
        "GOOD MORNING {name}! Today is going to be INCREDIBLE!",
        "{name}, rise and shine! You've got this, whatever today brings!",
      ],
      welcome_back: [
        "{name}!!! YOU'RE HERE! I am SO happy right now!",
        "Welcome back, {name}! This is the best part of my day!",
      ],
      achievement_unlocked: [
        "{name}, YES! YOU DID IT! I KNEW you could!",
        "ACHIEVEMENT UNLOCKED! {name}, you are UNSTOPPABLE!",
      ],
      habit_completed: [
        "{name}, YES! Another win! You're on FIRE!",
        "Look at you go, {name}! So proud of you right now!",
      ],
      task_completed: [
        "{name}, DONE! You are a TASK-CRUSHING MACHINE!",
        "YES {name}! One more thing conquered!",
      ],
      mood_low: [
        "{name}, it's okay to not be okay. I still believe in you, always.",
        "Tough day, {name}? You're still amazing. That doesn't change.",
      ],
      fasting_goal: [
        "{name}, YOU DID THE WHOLE THING! Incredible discipline!",
        "GOAL MET! {name}, I am SO proud of you right now!",
      ],
      streak_milestone: [
        "{name}, THAT STREAK?! Absolutely legendary!",
        "You're unstoppable, {name}! Keep that amazing streak going!",
      ],
      phone_free: [
        "{name}, time for a break! You deserve it, superstar!",
        "Phone down, {name}! Go recharge, you've earned it!",
      ],
      points_earned: [
        "{name}, POINTS! You are racking up wins left and right!",
        "YES! {name}, every point is a victory!",
      ],
      weight_loss: [
        "{name}, LOOK AT THAT PROGRESS! You are amazing!",
        "The trend is YOUR trend, {name}! Incredible work!",
      ],
      weight_gain: [
        "{name}, one number means NOTHING about how amazing you are!",
        "You're still incredible, {name}! Numbers don't define you!",
      ],
      exercise_logged: [
        "{name}, YOU MOVED YOUR BODY! That's a WIN!",
        "Amazing work, {name}! Your body thanks you SO much!",
      ],
      water_goal_met: [
        "{name}, GOAL MET! You're basically a hydration hero!",
        "YES {name}! Water goal SMASHED!",
      ],
      sleep_logged: [
        "{name}, you rested! That's just as important as anything else!",
        "Sleep logged! {name}, taking care of yourself is a WIN!",
      ],
      personal_best: [
        "{name}!!! NEW PERSONAL BEST?! I am SCREAMING!",
        "INCREDIBLE, {name}! You just outdid YOURSELF!",
      ],
      level_up: [
        "{name}, YOU LEVELED UP! Look how far you've come!!",
        "GROWTH! {name}, you are becoming even more amazing!",
      ],
      boss_defeated: [
        "{name}, YOU WON! I NEVER doubted you for a second!",
        "VICTORY! {name}, that was AMAZING to watch!",
      ],
      goodnight: [
        "{name}, rest up, superstar! Tomorrow's gonna be great too!",
        "Sleep well, {name}! You EARNED this rest!",
      ],
      first_milestone: [
        "{name}, YOUR FIRST ONE?! This is just the beginning of AMAZING things!",
        "First time, {name}! I am SO excited for you!",
      ],
      idle: [
        "{name}, still here? I'm just over here believing in you, as usual!",
        "Take your time, {name}! I'm your biggest fan, always!",
      ],
    },
  },
  {
    name: 'The Sage',
    description: 'Mysterious and cryptic. Few words, old-soul wisdom.',
    messages: {
      general: [
        "{name}. You already know more than you think.",
        "The path continues, {name}. So do you.",
      ],
      morning_greeting: [
        "Morning comes for all, {name}. Few use it well. You might.",
        "{name}. A new day. Choose it wisely.",
      ],
      welcome_back: [
        "You returned, {name}. As I expected.",
        "Time passed. You did not lose your place, {name}.",
      ],
      achievement_unlocked: [
        "{name}. Earned. Not given.",
        "This was always in you, {name}. Now it's seen.",
      ],
      habit_completed: [
        "Small stones, {name}, build mountains.",
        "Repetition is its own kind of wisdom, {name}.",
      ],
      task_completed: [
        "{name}. Done. Move forward.",
        "One less weight, {name}. Walk lighter.",
      ],
      mood_low: [
        "{name}, even shadows have their purpose. This will pass.",
        "Sit with it, {name}. No need to run.",
      ],
      fasting_goal: [
        "{name}. Discipline speaks louder than words.",
        "The hunger passed. You remained, {name}.",
      ],
      streak_milestone: [
        "{name}, the pattern holds. That is rare.",
        "Consistency, {name}, is its own quiet power.",
      ],
      phone_free: [
        "{name}. Put it down. Presence matters more.",
        "The screen can wait, {name}. You cannot be replaced by it.",
      ],
      points_earned: [
        "{name}. Effort, counted.",
        "Small gains, {name}. They compound.",
      ],
      weight_loss: [
        "{name}, the body listens when you lead well.",
        "Change is slow, {name}. It is happening.",
      ],
      weight_gain: [
        "{name}, one number is not the whole truth.",
        "The path bends, {name}. It does not end.",
      ],
      exercise_logged: [
        "{name}. The body remembers effort.",
        "Movement, {name}. Simple. Powerful.",
      ],
      water_goal_met: [
        "{name}. Small rituals sustain us.",
        "Done, {name}. The body thanks you in silence.",
      ],
      sleep_logged: [
        "{name}, rest is not absence. It is preparation.",
        "The night restores what the day spends, {name}.",
      ],
      personal_best: [
        "{name}. A new limit, found and passed.",
        "Few surprise themselves, {name}. You did.",
      ],
      level_up: [
        "{name}, you are not who you were. Notice this.",
        "Growth arrives quietly, {name}, then all at once.",
      ],
      boss_defeated: [
        "{name}. The challenge yielded. You did not.",
        "Victory, {name}. Brief. Earned. Real.",
      ],
      goodnight: [
        "{name}. The day ends. Let it.",
        "Rest now, {name}. Tomorrow asks nothing of you yet.",
      ],
      first_milestone: [
        "{name}. A first step. All paths begin this way.",
        "Remember this, {name}. Beginnings matter.",
      ],
      idle: [
        "{name}. Still here. As am I.",
        "No rush, {name}. I am patient.",
      ],
    },
  },
]

const messages = [
  "Good to see you, {name}. You're doing great.",
  "Welcome back, {name}. I'm proud of you for showing up.",
  "{name}, you're building something beautiful — one day at a time.",
  "You showed up today, {name}. That matters more than you think.",
  "{name}, take a breath. You're exactly where you need to be.",
  "Hey {name}, you don't have to be perfect. You just have to try.",
  "{name}, the fact that you're here says a lot about your strength.",
  "Good morning, {name}. Today is a fresh start.",
  "{name}, be gentle with yourself today. You deserve it.",
  "Hi {name}. Whatever today brings, you can handle it.",
  "{name}, remember why you started. You've got this.",
  "Hey {name}, your consistency is your superpower.",
  "{name}, even on hard days, you're still moving forward.",
  "Welcome, {name}. This is your space. No judgment, no pressure.",
  "{name}, small wins add up to big changes. Keep going.",
  "Hi {name}. You're not alone in this — I'm here with you.",
  "The cave you fear to enter holds the treasure you seek, gang.",
  "Lowkey i will always find a way",
  "It felt impossible before, yet somehow, you made it through. you'll do it agian.",
  "Hey {name}, I just decided that everything will be okay.",
  "I will expect nothing, I will appreciate everything.",
  "Perhaps you're a slave to your own idea of yourself?",
  "It's okay if it's taking more time than you thought.",
  "Still. After all of it. Mostly, I want to be kind.",
  "For your own sanity, don't try to understand every single thing.",
  "I have no prime. I will evolve untill i die.",
  "God fucking damnit.",
  "Don't forget to imagine the best case scenario, too.",
  "Congrats on your failure! Most people don't even try.",
  "Hey {name}, I think it's very brave and sexy of you to continue living.",
  "You are not the voices in your head",
  "The day you plant the seed is not the day you eat the fruit."
]

export function getRandomMessage(name: string): string {
  const index = Math.floor(Math.random() * messages.length)
  return messages[index].replace('{name}', name)
}

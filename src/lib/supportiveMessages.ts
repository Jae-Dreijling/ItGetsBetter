const messages = [
  "Good to see you, {name}. You're doing great.",
  "Hey {name}, every small step counts.",
  "Welcome back, {name}. I'm proud of you for showing up.",
  "{name}, you're building something beautiful — one day at a time.",
  "Hi {name}. Remember, progress isn't always visible, but it's happening.",
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
]

export function getRandomMessage(name: string): string {
  const index = Math.floor(Math.random() * messages.length)
  return messages[index].replace('{name}', name)
}

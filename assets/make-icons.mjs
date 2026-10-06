// Source images for `npx capacitor-assets generate --android`, drawn from the
// app's heart icon (public/favicon.svg). Run: node assets/make-icons.mjs
import sharp from 'sharp'
import { join } from 'node:path'

const dir = import.meta.dirname
const heart = 'M16 26s-9-5.5-9-11.5c0-3.3 2.7-6 6-6 1.8 0 3 .8 3 .8s1.2-.8 3-.8c3.3 0 6 2.7 6 6C25 20.5 16 26 16 26z'
const coral = '#f47e6c'

// Adaptive icon: the foreground must fit the central ~66% safe zone.
const foreground = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><g transform="translate(16 16.6) scale(0.62) translate(-16 -16.6)"><path d="${heart}" fill="white"/></g></svg>`
const background = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="${coral}"/></svg>`
const iconOnly = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="${coral}"/><g transform="translate(16 16.6) scale(0.8) translate(-16 -16.6)"><path d="${heart}" fill="white"/></g></svg>`

for (const [name, svg] of [['icon-foreground', foreground], ['icon-background', background], ['icon-only', iconOnly]]) {
  await sharp(Buffer.from(svg), { density: 3000 }).resize(1024, 1024).png().toFile(join(dir, `${name}.png`))
}
console.log('assets/icon-*.png written')

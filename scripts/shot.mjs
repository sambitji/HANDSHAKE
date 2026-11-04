import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const OUT = 'C:/Users/sambi/AppData/Local/Temp/opencode/handshake-shots'
mkdirSync(OUT, { recursive: true })

const errors = []
const warnings = []

const browser = await chromium.launch({
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
})

const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 })
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message))
page.on('console', (m) => {
  if (m.type() === 'error') errors.push('CONSOLE: ' + m.text())
  if (m.type() === 'warning') warnings.push(m.text())
})

const dialog = page.getByRole('dialog')
const dialogs = () => page.locator('[role=dialog]')

const closeAll = async () => {
  await page.keyboard.press('Escape').catch(() => {})
  await page
    .waitForFunction(() => document.querySelectorAll('[role=dialog]').length === 0, { timeout: 8000 })
    .catch(() => errors.push('dialog did not close on Escape'))
  await page.waitForTimeout(400)
}

const step = async (label, fn) => {
  try {
    await fn()
    console.log('ok:', label)
  } catch (e) {
    errors.push(`STEP "${label}" → ${e.message.split('\n')[0]}`)
    await page.screenshot({ path: `${OUT}/FAIL-${label.replace(/\W+/g, '-')}.png` }).catch(() => {})
  } finally {
    await closeAll()
  }
}

const shot = (name) => page.screenshot({ path: `${OUT}/${name}.png`, timeout: 60000 })

/* ------------------------------------------------------------------ */
await step('load', async () => {
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 60000 })
  await page.waitForTimeout(3500)
  await shot('01-hero')
})

await step('how-it-works', async () => {
  await page.locator('#how').scrollIntoViewIfNeeded()
  await page.waitForTimeout(900)
  await shot('02-how')
  await page.locator('.flip').nth(3).hover()
  await page.waitForTimeout(1100)
  await shot('03-how-flip')
})

await step('feed', async () => {
  await page.locator('#feed').scrollIntoViewIfNeeded()
  await page.waitForTimeout(900)
  await shot('04-feed')
})

await step('detail-and-commit', async () => {
  await page.locator('article h3', { hasText: 'USB-C' }).click()
  await page.waitForTimeout(1200)
  if ((await dialog.count()) !== 1) throw new Error('detail dialog did not open')
  await shot('05-detail')

  await dialog.getByRole('button', { name: /I can help/ }).first().click()
  await page.waitForTimeout(600)
  await shot('05b-eta')

  await dialog.getByRole('button', { name: /Confirm commitment/ }).first().click()
  await page.waitForTimeout(1200)
  if (!(await dialog.getByText(/Step 3 of 5/).count())) throw new Error('tracker did not advance to step 3')
  await shot('06-committed')
})

await step('create-request', async () => {
  await page.getByRole('button', { name: /New request/ }).first().click()
  await page.waitForTimeout(1100)
  if ((await dialog.count()) !== 1) throw new Error('create dialog did not open')
  if (!(await dialog.getByText('Ask your community for help').count())) throw new Error('create dialog wrong')
  await dialog.locator('input').first().fill('Borrow a 3D printer for the robotics prototype')
  await dialog
    .locator('textarea')
    .first()
    .fill('Deadline is Saturday noon and our printer jammed beyond repair. Anyone nearby with a working FDM printer?')
  await page.waitForTimeout(900)
  await shot('07-create')
  if (!(await page.getByText('Borrow a 3D printer for the robotics prototype').count()))
    throw new Error('live preview did not update')

  await dialog.getByRole('button', { name: /Post to the feed/ }).click()
  await page.waitForTimeout(1600)
  if ((await dialogs().count()) !== 0) throw new Error('dialog stayed open after posting')
  if (!(await page.getByText('Borrow a 3D printer for the robotics prototype').count()))
    throw new Error('new request not in feed')
  await shot('07b-posted')
})

await step('two-sided-confirm', async () => {
  await page.locator('#feed').scrollIntoViewIfNeeded()
  await page.locator('#feed button', { hasText: 'All' }).first().click() // reset filters
  await page.waitForTimeout(600)

  await page.getByRole('button', { name: /Viewing as|Aarav/ }).first().click()
  await page.waitForTimeout(500)
  await page.getByRole('button', { name: /Priya Nair/ }).first().click()
  await page.waitForTimeout(900)

  const btn = page.getByRole('button', { name: /Confirm you got help/ })
  if (!(await btn.count())) throw new Error('confirm button not found for requester persona')
  await btn.first().click()
  await page.waitForTimeout(600)
  await shot('08-confetti')
  await page.waitForTimeout(1500)
  await shot('08b-resolved')
  if (!(await page.getByText(/Two-sided confirmation complete/).count())) throw new Error('confirmation toast missing')
  if (!(await page.getByText('confirmed resolved').count())) throw new Error('resolved counter not updated')
})

await step('dispute-trail', async () => {
  // the seeded essay request carries a dispute → redelivery → confirmation trail
  await page.locator('article h3', { hasText: 'proofread my scholarship essay' }).click()
  await page.waitForTimeout(1200)
  if ((await dialog.getByText(/reported that help was not received yet/).count()) === 0)
    throw new Error('dispute event missing from activity trail')
  await shot('09-dispute-trail')
})

await step('trust-ledger', async () => {
  await page.locator('#trust').scrollIntoViewIfNeeded()
  await page.waitForTimeout(900)
  await shot('10-trust')
})

await step('mobile', async () => {
  const m = await browser.newPage({ viewport: { width: 430, height: 932 } })
  await m.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 60000 })
  await m.waitForTimeout(3000)
  await m.screenshot({ path: `${OUT}/11-mobile-hero.png`, timeout: 60000 })
  await m.locator('#feed').scrollIntoViewIfNeeded()
  await m.waitForTimeout(900)
  await m.screenshot({ path: `${OUT}/12-mobile-feed.png`, timeout: 60000 })
  await m.close()
})

await browser.close()

console.log('\n=== ERRORS (' + errors.length + ') ===')
errors.forEach((e) => console.log(' -', e))
console.log('=== WARNINGS (' + warnings.length + ') ===')
warnings.slice(0, 6).forEach((w) => console.log(' -', w))
console.log('OUT =', OUT)

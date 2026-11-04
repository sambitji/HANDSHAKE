import { chromium } from 'playwright'

const URL = 'http://localhost:4173'
const results = []
const check = (name, pass, detail = '') => {
  results.push({ name, pass, detail })
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`)
}

const browser = await chromium.launch({
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
})
const context = await browser.newContext({ viewport: { width: 430, height: 932 } })
const page = await context.newPage()

let installPrompt = false
await page.addInitScript(() => {
  window.addEventListener('beforeinstallprompt', () => {
    window.__hsInstallable = true
  })
})

await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 })

// 1. manifest link injected
const manifestHref = await page.locator('link[rel=manifest]').getAttribute('href').catch(() => null)
check('manifest link injected', !!manifestHref, manifestHref)

// 2. manifest itself fetches and parses
const manifest = await page.evaluate(async (href) => {
  if (!href) return null
  try {
    const r = await fetch(href)
    return await r.json()
  } catch {
    return null
  }
}, manifestHref)
check('manifest parses', !!manifest?.short_name, manifest ? `${manifest.icons?.length} icons, display=${manifest.display}` : '')
check('manifest icons (192/512/maskable)', (manifest?.icons?.length || 0) >= 3, manifest?.icons?.map((i) => `${i.sizes}${i.purpose ? '/' + i.purpose : ''}`).join(', '))

// 3. service worker registered + activated
const sw = await page
  .waitForFunction(
    async () => {
      const reg = await navigator.serviceWorker.getRegistration()
      return reg && (reg.active || reg.installing || reg.waiting) ? { scope: reg.scope, active: !!reg.active } : false
    },
    { timeout: 30000 },
  )
  .then((h) => h.jsonValue())
  .catch(() => null)
check('service worker registered', !!sw, sw?.scope)
check('service worker active', !!sw?.active)

// 4. precache populated
await page.waitForTimeout(2500)
const cacheNames = await page.evaluate(() => caches.keys())
const cacheEntries = await page.evaluate(async (names) => {
  let n = 0
  for (const name of names) n += (await (await caches.open(name)).keys()).length
  return n
}, cacheNames)
check('precache populated', cacheEntries > 5, `${cacheNames.length} cache(s), ${cacheEntries} entries`)

// 5. installability signals
await page.waitForTimeout(3000)
installPrompt = await page.evaluate(() => window.__hsInstallable === true)
console.log(`${installPrompt ? 'PASS' : 'INFO'}  beforeinstallprompt fired${installPrompt ? '' : ' (headless Chrome often withholds it — check on a real phone)'}`)

// 6. THE test: go offline and reload
await context.setOffline(true)
await page.reload({ waitUntil: 'load', timeout: 60000 })
await page.waitForTimeout(1500)
const headline = await page.locator('h1').first().textContent().catch(() => null)
check('app loads with network OFFLINE', !!headline && headline.includes('asking for help'), headline?.replace(/\s+/g, ' ').slice(0, 60))

// offline: can we still navigate to the feed and see data from localStorage?
const feedVisible = await page.locator('#feed article').first().isVisible().catch(() => false)
check('feed renders offline (localStorage data)', feedVisible)

// offline: does the 3D hero still mount?
const canvas = await page.locator('canvas').first().isVisible().catch(() => false)
check('WebGL hero mounts offline', canvas)

await context.setOffline(false)

// 7. install hints in DOM
const icon = await page.locator('link[rel=apple-touch-icon]').getAttribute('href').catch(() => null)
check('apple-touch-icon present', !!icon, icon)

await browser.close()

const failed = results.filter((r) => !r.pass)
console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
if (failed.length) process.exitCode = 1

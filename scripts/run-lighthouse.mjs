import fs from 'node:fs'
import path from 'node:path'
import lighthouse from 'lighthouse'
import * as chromeLauncher from 'chrome-launcher'

const url = process.env.LH_URL ?? 'http://localhost:5176/'
const outDir = process.env.LH_OUT_DIR ?? 'reports'
const chromePath =
  process.env.CHROME_PATH ??
  'C:\\Users\\LENOVO\\.cache\\puppeteer\\chrome\\win64-146.0.7680.153\\chrome-win64\\chrome.exe'

fs.mkdirSync(outDir, { recursive: true })

const run = async () => {
  const chrome = await chromeLauncher.launch({
    chromePath,
    chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox'],
  })

  try {
    const result = await lighthouse(url, {
      port: chrome.port,
      output: 'html',
      onlyCategories: ['performance'],
      logLevel: 'error',
      maxWaitForLoad: 15000,
    })

    const reportHtml = result.report
    fs.writeFileSync(path.join(outDir, 'lighthouse-report.html'), reportHtml)
    fs.writeFileSync(
      path.join(outDir, 'lighthouse-result.json'),
      JSON.stringify(result.lhr, null, 2),
    )

    // eslint-disable-next-line no-console
    console.log('Lighthouse done. Category scores:', result.lhr.categories)
  } finally {
    await chrome.kill()
  }
}

run().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e)
  process.exit(1)
})


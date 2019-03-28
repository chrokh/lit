const { Builder, By, Key, until } = require('selenium-webdriver');
const { k } = require('./base')
const { sleep } = require('./robot')

const SEARCH_BOX_ID = '#gs_hdr_tsi'
const SEARCH_BTN_ID = '#gs_hdr_tsb'
const RESULTS = '#gs_res_ccl_mid .gs_r.gs_or'
const BIBTEX_CITATION = 'body > pre'

async function openCiteModal(result) {
  console.log('Robot: Opening citation modal.')
  const links = await result.findElements(By.css('.gs_fl > a'))
  await links[1].click()
  await sleep(0.1, 0.25)
}

async function closeCiteModal(driver) {
  console.log('Robot: Closing citation modal.')
  const link = await driver.findElement(By.css('#gs_cit-x'))
  await link.click()
  await sleep(0.1, 0.25)
}

async function getBibtexLinkFromModal(driver) {
  console.log('Robot: Extracting citation link.')
  const links = await driver.findElements(By.css('.gs_citi'))
  let url = await links[0].getAttribute('href')
  await sleep()
  await captcha(driver, BIBTEX_CITATION)
  return url
}

async function clickBibtexInModal(driver) {
  console.log('Robot: Clicking bibtex.')
  const links = await driver.findElements(By.css('.gs_citi'))
  await links[0].click()
  await sleep()
  await captcha(driver, BIBTEX_CITATION)
}

async function grabBibtexString(driver) {
  console.log('Robot: Copying citation.')
  const pre = await driver.findElement(By.css('pre'))
  return await pre.getText()
}

async function backToResults(driver) {
  console.log('Robot: Navigating back to results list.')
  await driver.navigate().back()
  await sleep()
  await captcha(driver, RESULTS)
}

async function collectCitation(result) {
  let driver = result.getDriver()
  await captcha(driver, RESULTS)
  await openCiteModal(result)
  await clickBibtexInModal(driver)
  let citation = await grabBibtexString(driver)
  await backToResults(driver)
  await closeCiteModal(driver)
  return citation
}

async function collectCitationLink(result) {
  let driver = result.getDriver()
  await captcha(driver, RESULTS)
  await openCiteModal(result)
  await sleep(0.5, 1.5)
  let citation = await getBibtexLinkFromModal(driver)
  await sleep(1, 2)
  await closeCiteModal(driver)
  await sleep(0.5, 1.5)
  return citation
}

async function collectHit(hit) {
  await captcha(hit.getDriver(), RESULTS)
  // Check if it's a citation hit or not
  let entry = await hit.findElement(By.css('.gs_ctu')) // is citation?
    .then(_ => collectCitationHit(hit))
    .catch(_ => collectNormalHit(hit))

  // Grab link to bibtext citation
  let citation = await collectCitationLink(hit)

  // Compute additional info
  let queryUrl = await hit.getDriver().getCurrentUrl()
  let accessed = new Date().toJSON()

  // Merge and return
  return Object.assign(entry, { citation, queryUrl, accessed })
}

async function collectCitationHit(hit) {
  await captcha(hit.getDriver(), RESULTS)
  return {
    title:   (await (await hit.findElements(By.css('h3 > span')))[1].getText()),
    url:     (await (await hit.findElements(By.css('.gs_fl > a')))[2].getAttribute('href')),
    about:   '',
    authors: (await hit.findElement(By.css('.gs_a')).getText()),
  }
}

async function collectNormalHit(hit) {
  await captcha(hit.getDriver(), RESULTS)
  return {
    title:   (await hit.findElement(By.css('h3 a')).getText()),
    url:     (await hit.findElement(By.css('h3 a')).getAttribute('href')),
    about:   (await hit.findElement(By.css('.gs_rs')).getText()),
    authors: (await hit.findElement(By.css('.gs_a')).getText()),
  }
}


async function captcha (driver, expectedSelector) {
  try {
    await driver.findElement(By.css(expectedSelector))
  } catch (_) {
    console.log('Robot: It seems I\'m blocked.')
    console.log('Robot: If a CAPTCHA is available, please solve it manually.')
    console.log('(waiting)')
    const mins = 20
    await driver.wait(until.elementLocated(By.css(expectedSelector)), mins * 60000)
  }
}

async function openScholarManually (driver) {
  console.log('Robot: Probably stopped by CAPTCHAS.')
  console.log('Robot: Please manually navigate to Google Scholar.')
  console.log('(waiting)')
  await driver.wait(until.elementLocated(By.css(SEARCH_BOX_ID)))
}

async function openScholarAutomatically (driver) {
  console.log('Robot: Opening scholar.google.com.')
  await driver.get('http://scholar.google.com')
  await sleep()
  console.log('Robot: Trying to find search box.')
  await captcha(driver, SEARCH_BOX_ID)
}

async function openScholar (driver) {
  try {
    await driver.findElement(By.css(SEARCH_BOX_ID)) // already there?
  } catch(e) {
    try {
      await openScholarAutomatically(driver)
    } catch(e) {
      await openScholarManually(driver)
    }
  } finally {
    console.log('Robot: Found search box.')
  }
  await sleep()
}

async function makeSearch (driver, query) {
  await captcha(driver, SEARCH_BOX_ID)

  // Type search
  console.log('Robot: Typing query.')
  let searchbox = await driver.findElement(By.css(SEARCH_BOX_ID))
  await searchbox.clear()
  await searchbox.sendKeys(query)
  console.log('Robot: Query typed.')
  await sleep()

  // Send search
  console.log('Robot: Submitting query.')
  let button = await driver.findElement(By.css(SEARCH_BTN_ID))
  await button.click()
  await sleep()
}

async function pageNum(driver) {
  let url = await driver.getCurrentUrl()
  return (url.match(/start=(\d+)/) || [,0])[1] / 10 + 1
}

// Checks page number and changes page if necessary
// TODO: Refactor away the while loop in favor of recursion.
async function gotoPage (driver, page) {
  await captcha(driver, RESULTS)
  let gpage = await pageNum(driver)
  console.log(`Robot: At page ${gpage} while expecting ${page}`)
  while (gpage != page) {
    let css = gpage < page ? '.gs_btnPR' :  '.gs_btnPL'
    let dir = gpage < page ? 'next' : 'previous'
    console.log(`Robot: Moving to ${dir} page.`)
    try {
      let btn = await driver.findElement(By.css(css))
    } catch (_) {
      console.log(`Robot: Cannot find button to go to ${dir} page.`)
      console.log('Robot: Assuming no more results.')
      return false
    }
    // Due to responsive design the button above might not always be visible,
    // so if we fail when clicking, we must try another button
    try {
      await btn.click()
    } catch (_) {
      css = gpage < page ? '.gs_ico_nav_next' : '.gs_ico_nav_previous'
      btn = await driver.findElement(By.css(css))
      await btn.click()
    }
    await sleep()
    await captcha(driver, RESULTS)
    gpage = await pageNum(driver)
    console.log(`Robot: At page ${gpage} while expecting ${page}`)
  }
  return true
}

async function crawlPage(driver, page) {
  await captcha(driver, SEARCH_BOX_ID)

  // No next page? Then we're done!
  if (!await gotoPage(driver, page)) {
    return []
  }

  // Count hits and print count
  let numHits = (await readHits(driver)).length
  console.log(`Robot: Collecting ${numHits} hits`)

  // Collect one by one. We must recall readHits before every collection since
  // collecting a hit might mean changing page, which leads to the original
  // reference being stale.
  let titles = []
  for (let n=0; n<numHits; n++) {
    let hit = (await readHits(driver))[n]
    titles.push(await collectHit(hit))
  }
  return titles
}

async function crawlPages(driver, pages) {
  let hits = []
  for (let page=1; page<=pages; page++) {
    hits = [...hits, ...await crawlPage(driver, page)]
    if (hits.length == 0) break
  }
  console.log('Robot: Collection completed.')
  return hits
}

async function readHits(driver) {
  await captcha(driver, RESULTS)
  return await driver.findElements(By.css(RESULTS))
}

async function collect(driver, query, pages) {
  await openScholar(driver)
  await makeSearch(driver, query)
  return await crawlPages(driver, pages)
};

// Testing fixture
const collect_fixture = x => {
  return Promise.resolve([
    { title: 'foo1', url: 'http://whlkkgfjsgkjhasfgd.com' },
    { title: 'foo2', url: 'http://whkgfjsagkjhasfgd.com' },
    { title: 'foo3', url: 'http://whlkkgfjshasfgd.com' },
    { title: 'foo4', url: 'http://whgfjsdagkjhasfgd.com' },
  ])
}

module.exports = {
  collect,
};

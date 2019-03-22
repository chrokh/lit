const { Builder, By, Key, until } = require('selenium-webdriver');
const { k } = require('./base')
const { sleep } = require('./robot')

const SEARCH_BOX_ID = '#gs_hdr_tsi'
const SEARCH_BTN_ID = '#gs_hdr_tsb'
const NEXT_BTN = '.gs_btnPR'
const PREV_BTN = '.gs_btnPL'
const RESULTS = '#gs_res_ccl_mid .gs_r.gs_or'

async function openCiteModal(result) {
  const links = await result.findElements(By.css('.gs_fl > a'))
  await links[1].click()
}

async function closeCiteModal(driver) {
  const link = await driver.findElement(By.css('#gs_cit-x'))
  await link.click()
}

async function clickBibtexInModal(driver) {
  const links = await driver.findElements(By.css('.gs_citi'))
  await links[0].click()
}

async function grabBibtexString(driver) {
  const pre = await driver.findElement(By.css('pre'))
  return await pre.getText()
}

async function collectCitation(result) {
  let driver = result.getDriver()
  console.log('Robot: Opening citation modal.')
  await openCiteModal(result)
  await sleep()
  console.log('Robot: Clicking bibtex.')
  await clickBibtexInModal(driver)
  await sleep()
  console.log('Robot: Copying citation.')
  let citation = await grabBibtexString(driver)
  await sleep()
  console.log('Robot: Navigating back to results list.')
  await driver.navigate().back()
  await sleep()
  console.log('Robot: Closing citation modal.')
  await closeCiteModal(driver)
  await sleep()
  return citation
}

async function collectHit(hit) {
  // Check if it's a citation hit or not
  let entry = await hit.findElement(By.css('.gs_ctu')) // is citation?
    .then(_ => collectCitationHit(hit))
    .catch(_ => collectNormalHit(hit))

  // Grab bibtext citation
  let citation = await collectCitation(hit)

  // Compute additional info
  let query_url = await hit.getDriver().getCurrentUrl()
  let accessed  = new Date().toJSON()

  // Merge and return
  return Object.assign(entry, { citation, query_url, accessed })
}

async function collectCitationHit(hit) {
  return {
    title:   (await (await hit.findElements(By.css('h3 > span')))[1].getText()),
    url:     (await (await hit.findElements(By.css('.gs_fl > a')))[2].getAttribute('href')),
    about:   '',
    authors: (await hit.findElement(By.css('.gs_a')).getText()),
  }
}

async function collectNormalHit(hit) {
  return {
    title:   (await hit.findElement(By.css('h3 a')).getText()),
    url:     (await hit.findElement(By.css('h3 a')).getAttribute('href')),
    about:   (await hit.findElement(By.css('.gs_rs')).getText()),
    authors: (await hit.findElement(By.css('.gs_a')).getText()),
  }
}


async function captcha (driver) {
  const text = await driver.findElement(By.css('body')).getText()
  if (text.indexOf('unusual traffic') != -1) {
    console.log('Robot: Blocked by CAPTCHA. Please solve manually.')
    // TODO: Not sure scholar always send us back to where we were!
    await driver.wait(until.elementLocated(By.css(SEARCH_BOX_ID)))
    console.log('Robot: CAPTCHA solved.')
    await sleep()
  }
}

async function makeSearch (driver, query) {

  // Open scholar
  await driver.findElement(By.css(SEARCH_BOX_ID))
    .then(() => {
      console.log('Robot: Found search box.')
    })
    .catch(async function() {
      console.log('Robot: Please guide your browser to Google Scholar (this helps us avoid CAPTCHAs).')
      await driver.wait(until.elementLocated(By.css(SEARCH_BOX_ID)))
      console.log('Robot: Found search box.')
      await sleep()
    })

  // CAPTCHA
  await captcha(driver)

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

async function crawlPage(driver, page) {
  await captcha(driver)

  // Check and change page number if necessary
  let gpage = await pageNum(driver)
  console.log(`Robot: At page ${gpage} while expecting ${page}`)
  while (gpage != page) {
    let css = gpage < page ? NEXT_BTN : PREV_BTN
    let dir = gpage < page ? 'next' : 'previous'
    console.log(`Robot: Moving to ${dir} page.`)
    let btn = await driver.findElement(By.css(css))
    await btn.click()
    await sleep()
    gpage = await pageNum(driver)
    console.log(`Robot: At page ${gpage} while expecting ${page}`)
  }

  // Captcha check
  await captcha(driver)

  // Parse page
  let numHits = (await readHits(driver)).length
  console.log(`Robot: Collecting ${numHits} hits`)

  let titles = []
  for (let n=0; n<numHits; n++) {
    let hit = (await readHits(driver))[n]
    titles.push(await collectHit(hit))
  }

  return titles
}

async function readHits(driver) {
  return await driver.findElements(By.css(RESULTS))
}

// TODO: Generalize
async function collect(driver, query) {
  await makeSearch(driver, query)
  return [
    ...await crawlPage(driver, 1),
    ...await crawlPage(driver, 2),
    ...await crawlPage(driver, 3)
  ]
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


const { Builder, By, Key, until } = require('selenium-webdriver');
const { k } = require('./base')
const { sleep, throttle } = require('./robot')

const SEARCH_BOX_ID = '#gs_hdr_tsi'
const SEARCH_BTN_ID = '#gs_hdr_tsb'
const RESULTS = '#gs_res_ccl_mid .gs_r.gs_or'
const BIBTEX_CITATION = 'body > pre'

async function openCiteModal(result) {
  await throttle()
  console.log('Robot: Opening citation modal.')
  const links = await result.findElements(By.css('.gs_fl > a'))
  await links[1].click()
}

async function closeCiteModal(driver) {
  await throttle()
  console.log('Robot: Closing citation modal.')
  const link = await driver.findElement(By.css('#gs_cit-x'))
  await link.click()
}

async function getBibtexLinkFromModal(driver) {
  await throttle()
  console.log('Robot: Extracting citation link.')
  const links = await driver.findElements(By.css('.gs_citi'))
  let url = await links[0].getAttribute('href')
  await captcha(driver, BIBTEX_CITATION)
  return url
}

async function clickBibtexInModal(driver) {
  await throttle()
  console.log('Robot: Clicking bibtex.')
  const links = await driver.findElements(By.css('.gs_citi'))
  await links[0].click()
  await captcha(driver, BIBTEX_CITATION)
}

async function grabBibtexString(driver) {
  console.log('Robot: Copying citation.')
  const pre = await driver.findElement(By.css('pre'))
  return await pre.getText()
}

async function backToResults(driver) {
  await throttle()
  console.log('Robot: Navigating back to results list.')
  await driver.navigate().back()
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
  await throttle()
  let driver = result.getDriver()
  await captcha(driver, RESULTS)
  await openCiteModal(result)
  await throttle()
  let citation = await getBibtexLinkFromModal(driver)
  await throttle()
  await closeCiteModal(driver)
  return citation
}

async function collectHit(hit) {
  await captcha(hit.getDriver(), RESULTS)

  // Check if it's a citation hit or not and grab base data
  const entry = await hit.findElement(By.css('.gs_ctu')) // is citation?
    .then(_ => collectCitationHit(hit))
    .catch(_ => collectNormalHit(hit))

  // Grab common data
  const commons = await collectCommonsFromHit(hit)

  // Compute additional info
  const queryUrl = await hit.getDriver().getCurrentUrl()
  const accessed = new Date().toJSON()

  // Merge and return
  return { ...entry, ...commons, queryUrl, accessed, }
}

async function collectCitationHit(hit) {
  await captcha(hit.getDriver(), RESULTS)
  return {
    title:  (await (await hit.findElements(By.css('h3 > span')))[1].getText()),
    url:    (await (await hit.findElements(By.css('.gs_fl > a')))[2].getAttribute('href')),
    author: (await hit.findElement(By.css('.gs_a')).getText()),
  }
}

async function collectNormalHit(hit) {
  await captcha(hit.getDriver(), RESULTS)
  const title = await hit.findElement(By.css('h3 a')).getText()
  const url = await hit.findElement(By.css('h3 a')).getAttribute('href')
  try {
    const excerpt = await hit.findElement(By.css('.gs_rs')).getText()
    return { title, url, excerpt }
  } catch (e) {
    return { title, url }
  }
}

async function collectCommonsFromHit(hit) {
  await captcha(hit.getDriver(), RESULTS)
  const citations = await findMetaLink(hit, 'cites')
  const related = await findMetaLink(hit, 'related')
  const cluster = await findMetaLink(hit, 'cluster')
  const wos = await findMetaLink(hit, 'webofknowledge')
  return {
    author:       (await hit.findElement(By.css('.gs_a')).getText()),
    // Internal google scholar links
    ...(citations && { citationsUrl: citations.url }),
    ...(related && { relatedUrl: related.url }),
    ...(cluster && { clusterUrl: cluster.url }),
    // Parsing google scholar link info
    ...(citations && { citationCount: citations.title.match(/\d+/)[0] }),
    ...(wos && { webOfScienceCitationCount: wos.title.match(/\d+/)[0] }),
    ...(cluster && { clusterCount: cluster.title.match(/\d+/)[0] }),
    // Possible full text links
    fullTextLinks: (await collectFullTextLinks(hit)),
  }
}

async function findMetaLink (hit, kind) {
  const elems = await hit.findElements(By.css('.gs_fl > a'))
  for (let elem of elems) {
    let url = await elem.getAttribute('href')
    if (url.indexOf(kind) != -1)
      return {
        title: await elem.getText(),
        url,
      }
  }
}

async function collectFullTextLinks (hit) {
  return hit.findElements(By.css('.gs_or_ggsm a')).
    then(elems => Promise.all(elems.map(collectLink))).
    catch(_ => [])
}

async function collectLink (elem) {
  return {
    url:   (await elem.getAttribute('href')),
    title: (await elem.getText()),
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
  await throttle()
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
  await throttle()
}

async function makeSearch (driver, query) {
  await captcha(driver, SEARCH_BOX_ID)

  // Type search
  console.log('Robot: Typing query.')
  let searchbox = await driver.findElement(By.css(SEARCH_BOX_ID))
  await searchbox.clear()
  await searchbox.sendKeys(query)
  console.log('Robot: Query typed.')
  await throttle()

  // Send search
  console.log('Robot: Submitting query.')
  let button = await driver.findElement(By.css(SEARCH_BTN_ID))
  await button.click()
  await throttle()
}

async function pageNum(driver) {
  let url = await driver.getCurrentUrl()
  return (url.match(/start=(\d+)/) || [,0])[1] / 10 + 1
}

async function hasMoreResults (driver) {
  try {
    await driver.findElement(By.css('.gs_btnPR'))
    return true
  } catch {
    return false
  }
}

async function nextPageButton (driver) {
  // Two different classes due to responsive design
  let text = await driver.findElement(By.css('.gs_btnPR'))
  let icon = await driver.findElement(By.css('.gs_ico_nav_next'))
  return (await text.isDisplayed()) ? text : icon
}

async function prevPageButton (driver) {
  // Two different classes due to responsive design
  let text = await driver.findElement(By.css('.gs_btnPL'))
  let icon = await driver.findElement(By.css('.gs_ico_nav_previous'))
  return (await text.isDisplayed()) ? text : icon
}

// Checks page number and changes page if necessary
// TODO: Refactor away the while loop in favor of recursion.
async function gotoPage (driver, expectedPage) {
  await captcha(driver, RESULTS)
  let actualPage = await pageNum(driver)
  console.log(`Robot: At page ${actualPage} while expecting ${expectedPage}`)
  while (actualPage != expectedPage) {
    if (await hasMoreResults(driver)) {
      let dir = expectedPage > actualPage ? 'next' : 'previous'
      console.log(`Robot: Finding button to move to ${dir} page.`)
      const btn = expectedPage > actualPage ?
        await nextPageButton(driver) :
        await prevPageButton(driver)
      console.log('Robot: Clicking button.')
      await btn.click()
      await throttle()
      await captcha(driver, RESULTS)
      actualPage = await pageNum(driver)
      console.log(`Robot: At page ${actualPage} while expecting ${expectedPage}`)
    }
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
async function collectFixture () {
  return Promise.resolve([
    { title: 'foo1', author: 'Doe, John, ...', url: 'http://whkgfjsagkjhasfgd.com', citationsUrl: 'http://example.com?cites=89757865' },
    { title: 'foo2', author: 'Doe, John, ...', url: 'http://whlkkgfjshasfgd.com', clusterUrl: 'http://example.com?cluster=1231432' },
  ])
}

module.exports = {
  collect,
};

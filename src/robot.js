const { Builder, Capabilities } = require('selenium-webdriver')
const chrome = require('selenium-webdriver/chrome')


async function open() {
  console.log('Robot: Opening.')

  var opts = new chrome.Options()
  opts.addArguments('user-data-dir=.lit/chrome_profile');

  const caps = new Capabilities({
    acceptInsecureCerts: true,
  })

  return await
    new Builder().
    withCapabilities(caps).
    setChromeOptions(opts).
    forBrowser('chrome').
    build()
}

function close(driver) {
  console.log('Robot: Closing.')
  driver.quit()
}

const sleep = (min=5, max=15) => {
  const ms = (Math.random() * (max - min) + min) * 1000
  console.log(`Robot: Sleeping for ~${Math.round(ms / 1000)} seconds`)
  return new Promise((res) => setTimeout(res, ms))
}

let COUNT = 0
async function throttle () {
  await sleep(3, 5) // TODO: Parameterize noise
  const RPM = 3
  COUNT++
  let ms = 0
  if (COUNT > RPM) {
    ms = 60000
    console.log(`Robot: Request limit (${RPM} reqs/min) reached. Sleeping for ${ms/1000} seconds.`)
    COUNT = 0
  }
  return await new Promise(r => setTimeout(r, ms))
}

module.exports = {
  open,
  close,
  sleep,
  throttle,
}

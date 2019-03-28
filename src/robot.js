const { Builder, Capabilities } = require('selenium-webdriver')

async function open() {
  console.log('Robot: Opening.')
  const caps = new Capabilities({ acceptInsecureCerts: true })
  return await
    new Builder().
    withCapabilities(caps).
    forBrowser('firefox').
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
  await sleep(1, 2)
  const RPM = 3
  COUNT++
  let ms = 0
  if (COUNT > RPM) {
    console.log(`Robot: Request limit (${RPM} reqs/min) reached. Sleeping for 1 min.`)
    ms = 5000
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

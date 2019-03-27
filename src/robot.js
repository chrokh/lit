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

const sleep = (min=2, max=5) => {
  const ms = (Math.random() * (max - min) + min) * 1000
  console.log(`Robot: Sleeping for ~${Math.round(ms / 1000)} seconds`)
  return new Promise((res) => setTimeout(res, ms))
}

module.exports = {
  open,
  close,
  sleep,
}

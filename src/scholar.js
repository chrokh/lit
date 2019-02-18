const { Builder, By, Key, until } = require('selenium-webdriver');

async function search(query, from=0) {
  // TODO: Move driver outside?
  let driver = await new Builder().forBrowser('safari').build();

  let urlencoded = query.replace(/ /g, '%20');
  let query_url = `http://scholar.google.com/scholar?q=${urlencoded}&from=${from}`

  await driver.get(query_url);
  //await driver.wait(until.elementsLocated(By.css('h3 a')));

  let hits = await driver.findElements(By.css('.gs_ri'));
  let titles = await Promise.all(hits.map(async function(hit) {
    return {
      title:   (await hit.findElement(By.css('h3 a')).getText()),
      url:     (await hit.findElement(By.css('h3 a')).getAttribute('href')),
      about:   (await hit.findElement(By.css('.gs_rs')).getText()),
      authors: (await hit.findElement(By.css('.gs_a')).getText()),
      accessed: new Date(),
    }
  }));
  driver.quit();
  return titles;
};

// TODO: Generalize
async function collect(query) {
  let p1 = await search(query, 0);
  let p2 = await search(query, 10);
  let p3 = await search(query, 20);
  return [...p1, ...p2, ...p3];
}

// Fake
const collect2 = x => {
  return Promise.resolve([
    { title: 'foo1', url: 'http://whlkkgfjsgkjhasfgd.com' },
    { title: 'foo2', url: 'http://whkgfjsagkjhasfgd.com' },
    { title: 'foo3', url: 'http://whlkkgfjshasfgd.com' },
    { title: 'foo4', url: 'http://whgfjsdagkjhasfgd.com' },
  ])
}

module.exports = {
  search,
  collect,
};

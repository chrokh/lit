const Comb = require('./src/combinatorics');
const { collect } = require('./src/scholar');
const { get, set } = require('./src/db')(process.argv[2]);
const { map, join, merge, prop } = require('./src/base');
const { keyify } = require('./src/keyify');


const sleep = n => new Promise((res) => setTimeout(res, n));

async function main() {

  // Find keywords
  const keywords = get('keywords') || [];
  if (keywords.length == 0) {
    console.log('Interactive keyword entry not supported. Please add keywords to analysis and try again.');
    return;
  }

  // Build queries from keywords
  const queries = Comb.combine(keywords);
  console.log('Keywords loaded:');
  console.log(map(join(', '))(keywords));
  console.log(`This results in ${queries.length} queries.`);
  console.log('Will continue in 2 seconds... press ctrl-c to cancel.');
  await sleep(2000);

  // Collect articles
  for (query of queries) {
    console.log(`Finding articles matching: "${query}"`);
    let articles = await collect(query).then(keyify(prop('url')));

    // Update query list
    console.log(`Saving articles matching: "${query}"`);
    let known = get('queries') || {};
    known[query] = merge(known[query] || {})(articles);
    set('queries', known);

    // Sleep before next
    console.log('Sleeping for 2 seconds.');
    await sleep(2000);
  }
}

main()

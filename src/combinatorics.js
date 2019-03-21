const { pipe, map, join, flat } = require('./base');

// https://stackoverflow.com/questions/37579994/generate-permutations-of-javascript-array
function permutations(xs) {
  let ret = [];
  for (let i = 0; i < xs.length; i = i + 1) {
    let rest = permutations(xs.slice(0, i).concat(xs.slice(i + 1)));
    if(!rest.length) {
      ret.push([xs[i]]);
    } else {
      for(let j = 0; j < rest.length; j = j + 1) { ret.push([xs[i]].concat(rest[j]));
      }
    }
  }
  return ret;
};

// https://stackoverflow.com/questions/12303989/cartesian-product-of-multiple-arrays-in-javascript
function cartesian(xs) {
  const f = (a, b) => [].concat(...a.map(d => b.map(e => [].concat(d, e))));
  const cartesian = (a, b, ...c) => (b ? cartesian(f(a, b), ...c) : a);
  return cartesian(...xs);
};

const combine = pipe(
  permutations,
  map(cartesian),
  flat(1),
  map(join(' ')))

module.exports = {
  permutations,
  cartesian,
  combine
};

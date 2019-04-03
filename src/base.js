const k = x => _ => x
const pipe = (...fs) => x => fs.reduce((acc, f) => f(acc), x)
const map = f => xs => xs.map(f)
const not = f => x => !f(x)
const add = x => y => x + y
const len = xs => xs.length
const join = s => xs => xs.join(s)
const flat = n => xs => xs.flat(n)
const id = x => x
const trim = x => x.trim()
const insert = x => xs => [x, ...xs]
const includes = x => xs => xs.indexOf(x) != -1
const filter = f => xs => xs.filter(f)
const assign = o1 => o2 => Object.assign({}, o2, o1)
const reduce = f => z => xs => xs.reduce((acc, x) => f(acc)(x), z)
const max = x => y => x > y ? x : y
const prop = k => o => o[k]
const assoc = k => v => o => Object.assign({}, o, { [k]: v })
const dissoc = k => o => { let x = Object.assign({}, o); delete x[k]; return x; }
const uniq = xs => [...new Set(xs)]
const fill = value => start => end => xs => xs.fill(value, start, end)
const padArrR = x => end => xs =>
  [...xs, ...Array(end - xs.length).fill(x)]
const rpad = n => s => (s.length > n
  ? s.substring(n-2) + '..' // TODO: Clamping should be extracted
  : s + ' '.repeat(n - s.length))
const arrEq = xs => ys => ( // TODO: deprecate in favor of (deep) equals
  xs.map((x, i) => x == ys[i]).reduce((acc, b) => acc && b, true) &&
  ys.map((y, i) => y == xs[i]).reduce((acc, b) => acc && b, true) )
const filterObj = p => o => {
  let r = {}
  for (let k in o) {
    if (p(o[k]))
      r[k] = o[k]
  }
  return r
}
const mapObj = f => o => {
  let r = {}
  for (let k in o) {
    r[k] = f(o[k], k)
  }
  return r
}
const merge = f => x => y => {
  if (
    typeof x === 'object'
    && typeof y === 'object'
    && !Array.isArray(x)
    && !Array.isArray(y)) {
    return Object.keys(x).reduce((acc, key) => {
      if (y.hasOwnProperty(key))
        acc[key] = merge(f)(x[key])(y[key])
      else
        acc[key] = x[key]
      return acc
    }, { ...y })
  } else {
    return f(x)(y)
  }
}
const transpose = xs => {
  let i = 0;
  let result = [];
  while (i < xs.length) {
    let innerlist = xs[i];
    let j = 0;
    while (j < innerlist.length) {
      if (typeof result[j] === 'undefined') {
        result[j] = [];
      }
      result[j].push(innerlist[j]);
      j += 1;
    }
    i += 1;
  }
  return result;
}

module.exports = {
  pipe,
  map,
  not,
  add,
  join,
  flat,
  id,
  trim,
  filter,
  merge,
  reduce,
  max,
  prop,
  assoc,
  dissoc,
  uniq,
  mapObj,
  filterObj,
  k,
  arrEq,
  insert,
  includes,
  fill,
  padArrR,
  rpad,
  len,
  transpose,
}

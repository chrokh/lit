const pipe = (...fs) => x => fs.reduce((acc, f) => f(acc), x);
const map = f => xs => xs.map(f);
const join = s => xs => xs.join(s);
const flat = n => xs => xs.flat(n);
const id = x => x;
const trim = x => x.trim();
const filter = f => xs => xs.filter(f);
const merge = o1 => o2 => Object.assign(o1, o2);
const reduce = f => z => xs => xs.reduce((acc, x) => f(acc)(x), z);
const prop = k => o => o[k];

module.exports = {
  pipe,
  map,
  join,
  flat,
  id,
  trim,
  filter,
  merge,
  reduce,
  prop,
};

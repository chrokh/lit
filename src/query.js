const { prop, mapObj, filterObj } = require('./base')


const many = ids = entity => {
  return filterObj(obj => ids.includes(obj.id))(entity)
}

// TODO: Generalize below to join and group

const into = (name, ours, fk, theirs) => {
  return mapObj(x => ({
    ...x,
    [name]: filterObj(y => y[fk] == x.id)(theirs)
  }))(ours)
}

const inline = (fk, ours, theirs) => {
  return mapObj(x => {
    return {
      ...x,
      [fk]: theirs[x[fk]],
    }
  })(ours)
}

module.exports = {
  inline,
  into,
  many,
}

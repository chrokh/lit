/*
 * @sig String -> { k: String|Bool }
 * @example
 *   toSetting('--foo')     // { foo: true  }
 *   toSetting('--foo=bar') // { foo: 'bar' }
 */
const toSetting = str => {
  if (str.indexOf('--')) throw `Invalid argument ${str}`

  const eqPos = str.indexOf('=')
  const isBool = eqPos == -1

  const key =
    isBool ?
    str.slice(2) :
    str.slice(2, eqPos)

  const value =
    isBool ?
    true :
    str.slice(eqPos + 1)

  return { [key]: value }
}

const toObj = base => args =>
  args.
    map(toSetting).
    reduce((acc, obj) => Object.assign(acc, obj), base)

module.exports = {
  toObj
}

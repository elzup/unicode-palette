const surrogatePairStart = 0xd800
const surrogatePairEnd = 0xdfff
const unicodeEnd = 0xffff

const allUnicodes = () => {
  let s = ''

  for (let i = 0; i < surrogatePairStart; i++) {
    s += String.fromCharCode(i)
    if (s.length % 64 === 0) {
      console.log(s)
      s = ''
    }
  }
  console.log(s)
  s = ''
  for (let i = surrogatePairEnd + 1; i <= unicodeEnd; i++) {
    s += String.fromCharCode(i)
    if (s.length % 64 === 0) {
      console.log(s)
      s = ''
    }
  }
  console.log(s)
  s = ''
  return s
}

console.log(allUnicodes().replace(/(.{64})/gm, '$1\n'))

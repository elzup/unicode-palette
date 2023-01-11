const surrogatePairStart = 0xd800
const surrogatePairEnd = 0xdfff

export const allSpUnicodes = () => {
  let s = ''

  for (let i = surrogatePairStart; i <= surrogatePairEnd; i++) {
    for (let j = surrogatePairStart; j <= surrogatePairEnd; j++) {
      s += String.fromCharCode(i, j)
      if (s.length % 64 === 0) {
        console.log(s)
        s = ''
      }
    }
  }

  console.log(s)
  s = ''
  return s
}

console.log(allSpUnicodes())

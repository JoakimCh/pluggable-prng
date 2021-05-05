/*
Xmur3 was developed by Bryc:
https://github.com/bryc/code/blob/master/jshash/PRNGs.md
*/

/**
 * This is the Xmur3 algorithm encased in a class compatible with `pluggable-prng` as the `seedGenerator`. It's compatible with any `randomGenerator` requiring unsigned 32-bit integers as seeds, e.g. Mulberry32.
 */
export class Xmur3 {
  /*
  function xmur3(str) {
    let h = 1779033703 ^ str.length
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353)
      h = h << 13 | h >>> 19
    }
    return function () {
      h = Math.imul(h ^ h >>> 16, 2246822507)
      h = Math.imul(h ^ h >>> 13, 3266489909)
      return (h ^= h >>> 16) >>> 0
    }
  }
  */
  constructor(seed) {
    const seedString = seed.toString()
    this.state = 1779033703 ^ seedString.length
    for (let i=0; i < seedString.length; i++) {
      this.state = Math.imul(this.state ^ seedString.charCodeAt(i), 3432918353)
      this.state = this.state << 13 | this.state >>> 19
    }
  }
  seed() {
    this.state = Math.imul(this.state ^ this.state >>> 16, 2246822507)
    this.state = Math.imul(this.state ^ this.state >>> 13, 3266489909)
    return (this.state ^= this.state >>> 16) >>> 0
  }
}

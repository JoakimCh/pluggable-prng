/*
Xmur3 was developed by Bryc and is in the "public domain":
https://github.com/bryc/code/blob/master/jshash/PRNGs.md
*/

/**
 * Bryc's algorithm to hash a seed into unsigned integers, call `next()` to get as many as needed.
 */
export class Xmur3 {
  constructor(seed) {
    const seedString = seed.toString()
    this.state = 1779033703 ^ seedString.length
    for (let i=0; i < seedString.length; i++) {
      this.state = Math.imul(this.state ^ seedString.charCodeAt(i), 3432918353)
      this.state = this.state << 13 | this.state >>> 19
    }
  }
  next() {
    this.state = Math.imul(this.state ^ this.state >>> 16, 2246822507)
    this.state = Math.imul(this.state ^ this.state >>> 13, 3266489909)
    return (this.state ^= this.state >>> 16) >>> 0
  }
}

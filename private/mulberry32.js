/*
Mulberry32 was developed by Tommy Ettinger and is in the "public domain":
https://gist.github.com/tommyettinger/46a874533244883189143505d203312c
*/

/**
 * This is the Mulberry32 PRNG algorithm encased in a class compatible with `pluggable-prng` as the `randomGenerator`. It's compatible with any `seedGenerator` returning unsigned 32-bit integers, e.g. Xmur3.
 */
export class Mulberry32 {
  /*
  function mulberry32(a) {
    return function() {
      a |= 0; a = a + 0x6D2B79F5 | 0
      var t = Math.imul(a ^ a >>> 15, 1 | a)
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
      return ((t ^ t >>> 14) >>> 0) / 4294967296
    }
  }
  */
  constructor(integerSeed) {
    this.state = integerSeed >>> 0
  }
  /* Original C code: https://gist.github.com/tommyettinger/46a874533244883189143505d203312c
  uint32_t x; // The state can be seeded with any value.
  uint32_t next(void) { // Call next() to get 32 pseudo-random bits, call it again to get more bits.
    uint32_t z = (x += 0x6D2B79F5UL);
    z = (z ^ (z >> 15)) * (z | 1UL);
    z ^= z + (z ^ (z >> 7)) * (z | 61UL);
    return z ^ (z >> 14);
  }
*/
  random() {
    /* From https://github.com/bryc/code/blob/master/jshash/PRNGs.md (seems he changed it from the original code)
    this.state |= 0
    this.state = this.state + 0x6D2B79F5 | 0
    let t = Math.imul(this.state ^ this.state >>> 15, 1 | this.state)
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
    return ((t ^ t >>> 14) >>> 0) / 4294967296
    */
    // From https://github.com/michaeldzjap/rand-seed/blob/develop/src/Algorithms/Mulberry32.ts (exact copy of original)
    // >>> is a bitshift which returns an unsigned 32-bit integer
    let z = (this.state += 0x6D2B79F5)
    z = Math.imul(z ^ (z >>> 15), z | 1)
    z ^= z + Math.imul(z ^ (z >>> 7), z | 61)
    return ((z ^ (z >>> 14)) >>> 0) / 0x100000000 // dividing the integer by 0x100000000 makes it a float from 0 to 1
  }
  importState(state) {
    this.state = state >>> 0
  }
  exportState() {
    return this.state
  }
}

/*
Mulberry32 was developed by Tommy Ettinger and is in the "public domain":
https://gist.github.com/tommyettinger/46a874533244883189143505d203312c
*/

/**
 * A `RandomGenerator` using the Mulberry32 algorithm. It's compatible with any `SeedInitializer` returning unsigned 32-bit integers, e.g. `SeedInitializer_Uint32`.
 */
export class RandomGenerator_Mulberry32 {
  constructor(uint32seed) {
    if (!Number.isInteger(uint32seed)) throw Error('Mulberry32 requires an integer seed, instead received: '+uint32seed)
    this.state = uint32seed >>> 0
  }
  randomUint32() {
    // >>> is a bitshift which returns an unsigned 32-bit integer
    let z = (this.state += 0x6D2B79F5)
    z = Math.imul(z ^ (z >>> 15), z | 1)
    z ^= z + Math.imul(z ^ (z >>> 7), z | 61)
    return (z ^ (z >>> 14)) >>> 0
  }
  importState(state) {
    this.state = state >>> 0
  }
  exportState() {
    return this.state
  }
}

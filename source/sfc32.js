/*
Sfc32 was developed by Chris Doty-Humphrey and is in the "public domain":
http://pracrand.sourceforge.net/license.txt
*/

/**
 * A `RandomGenerator` using the Sfc32 algorithm. It's compatible with any `SeedInitializer` returning unsigned 32-bit integers, e.g. `SeedInitializer_Uint32`.
 */
export class RandomGenerator_Sfc32 {
  #a; #b; #c; #counter // where the state is kept
  static seedsNeeded = 3 // tell the SeedInitializer to call the constructor with 3 seeds (instead of the default 1)
  constructor(uint32_a, uint32_b, uint32_c) {
    if (arguments.length != 3) throw Error('Sfc32 require 3 integer seeds.')
    if (!Number.isInteger(uint32_a)) throw Error('Sfc32 require integer seeds, this is not an integer: '+uint32_a)
    this.#a = uint32_a >>> 0
    this.#b = uint32_b >>> 0
    this.#c = uint32_c >>> 0
    this.#counter = 1
    this.randomUint32(); this.randomUint32() // get to a good state
  }
  randomUint32() { // PluggablePRNG will implement the other variants
    let result = (this.#a + this.#b + this.#counter++) >>> 0
    this.#a = (this.#b ^ (this.#b >>> 9)) >>> 0
    this.#b = (this.#c + (this.#c  << 3)) >>> 0
    this.#c = (result + ((this.#c << 21) | (this.#c >>> 11))) >>> 0
    return result
  }
  exportState() {
    return [this.#a, this.#b, this.#c, this.#counter]
  }
  importState(state) {
    [this.#a, this.#b, this.#c, this.#counter] = state
  }
}

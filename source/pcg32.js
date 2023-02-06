/*
Original code: https://www.pcg-random.org/download.html
*Really* minimal PCG32 code / (c) 2014 M.E. O'Neill / pcg-random.org
Licensed under Apache License 2.0 (NO WARRANTY, etc. see website)
*/

import {Uint64} from './uint64.js'

/**
 * A `RandomGenerator` using the PCG32 algorithm. It's compatible with any `SeedInitializer` returning unsigned integers or BigInts up to 64 bits. This implementation is using native BigInts and is therefore a bit slow (because BigInt arithmetics are). It's mainly meant as a demonstration on how to do 64-bit arithmetics in JavaScript.
 */
 export class RandomGenerator_Pcg32_alt_bigint {
  #state; #variant
  static seedsNeeded = 2
  constructor(state, variant) {
    if (arguments.length != 2) throw Error('Pcg32 require 2 integer seeds.')
    this.#state   = typeof state   == 'bigint' ? state  : BigInt(state)
    this.#variant = typeof variant == 'bigint' ? variant: BigInt(variant)
    this.#state   = BigInt.asUintN(64,  this.#state)
    this.#variant = BigInt.asUintN(64, (this.#variant << 1n) | 1n)
    this.randomUint32(); this.randomUint32() // get to a functional state
  }
  randomUint32() {
    const oldstate = this.#state
    this.#state = ((oldstate * 6364136223846793005n) + this.#variant) & 0xFFFF_FFFF_FFFF_FFFFn
    // some performance improvement when converting small enough values to Number instead
    const xorshifted = Number((((oldstate >> 18n) ^ oldstate) >> 27n) & 0xFFFF_FFFFn)
    const rot = Number(oldstate >> 59n)
    return ((xorshifted >>> rot) | (xorshifted << ((-rot) & 31))) >>> 0
    // return Number((((xorshifted >> rot) | (xorshifted << ((-rot) & 31n))) & 0xFFFF_FFFFn))
    // return Number(BigInt.asUintN(32, (xorshifted >> rot) | (xorshifted << ((-rot) & 31n))))
  }
  exportState() {
    return [this.#state, this.#variant]
  }
  importState(state) {
    [this.#state, this.#variant] = state
  }
}

/**
 * A `RandomGenerator` using the PCG32 algorithm. It's compatible with any `SeedInitializer` returning unsigned integers or BigInts up to 64 bits. It's not as fast as some other PRNGs (because JavaScript can't natively do 64-bit arithmetics). This implementation is using uint64.js which is faster than using native BigInts.
 */
export class RandomGenerator_Pcg32 {
  #state; #variant
  #magicNumber = new Uint64(0x5851_F42D, 0x4C95_7F2D)
  static seedsNeeded = 2
  constructor(state, variant) {
    if (arguments.length != 2) throw Error('Pcg32 require 2 integer seeds.')
    this.#state   = typeof state   === 'bigint' ? state  : BigInt(state)
    this.#variant = typeof variant === 'bigint' ? variant: BigInt(variant)
    this.#state   = new Uint64(BigInt.asUintN(64,  this.#state))
    this.#variant = new Uint64(BigInt.asUintN(64, (this.#variant << 1n) | 1n))
    this.randomUint32(); this.randomUint32() // get to a functional state
  }
  randomUint32() {
    // With help from Jaemin Noh's code: https://gist.github.com/Snack-X/2547242e16bca29a0b00
    const oldstate = this.#state;
    this.#state = oldstate.copy().mul(this.#magicNumber).add(this.#variant)
    const xorshifted = oldstate.copy().rshift(18).xor(oldstate).rshift(27).toUint32()//and(0xFFFF_FFFF)
    const rot = oldstate.copy().rshift(59)._w00
    return ((xorshifted >>> rot) | (xorshifted << ((-rot) & 31))) >>> 0
    // const result = xorshifted.rshift(rot).or(xorshifted.copy().lshift((-rot) & 31))
    // return result.toUint32()
  }
  exportState() {
    return [this.#state.copy(), this.#variant.copy()]
  }
  importState(state) {
    this.#state   = state[0].copy()
    this.#variant = state[1].copy()
  }
}

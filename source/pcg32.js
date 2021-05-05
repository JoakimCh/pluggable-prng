/*
Original code: https://www.pcg-random.org/download.html
*Really* minimal PCG32 code / (c) 2014 M.E. O'Neill / pcg-random.org
Licensed under Apache License 2.0 (NO WARRANTY, etc. see website)

I've written 3 different JavaScript implementations of the same algorithm. This was because I wanted to figure out how to achieve the best possible performance when doing 64-bit arithmetics in JavaScript (which is not natively supported in the language). What I learned is that BigInts are very slow and that you can optimize your code a lot by doing some small changes... That using BigInts are straight foward and is a good idea to keep as a reference implementation to test your faster implementations against to nail out any bugs.
*/

import * as longfn from './longfn.js'
import {Uint64} from './uint64.js'

/**
 * A `RandomGenerator` using the PCG32 algorithm. It's compatible with any `SeedInitializer` returning unsigned integers or BigInts up to 64 bits. This implementation is mainly meant as a demonstration on how to do 64-bit arithmetics in JavaScript using BigInts and is therefore very slow (because BigInt arithmetics are).
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
 * A `RandomGenerator` using the PCG32 algorithm. It's compatible with any `SeedInitializer` returning unsigned integers or BigInts up to 64 bits. It's not as fast as some other PRNGs (because JavaScript can't natively do 64-bit arithmetics). This implementation is more than 2x faster than the BigInt implementation, but still a tiny bit slower than the `longfn` implementation.
 */
export class RandomGenerator_Pcg32_alt {
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

/**
 * A `RandomGenerator` using the PCG32 algorithm. It's compatible with any `SeedInitializer` returning unsigned integers or BigInts up to 64 bits. It's not as fast as some other PRNGs (because JavaScript can't natively do 64-bit arithmetics), but this is the fastest JS implementation that I know of (made possible by using the `longfn` library).
 */
export class RandomGenerator_Pcg32 {
  #state; #variant
  #magicNumber = longfn.fromBigInt(0x5851_F42D_4C95_7F2Dn, true)
  // #mask32 = longfn.fromNumber(0xFFFF_FFFF)
  static seedsNeeded = 2
  constructor(state, variant) {
    if (arguments.length != 2) throw Error('Pcg32 require 2 integer seeds.')
    this.#state   = typeof state   === 'bigint' ? state  : BigInt(state)
    this.#variant = typeof variant === 'bigint' ? variant: BigInt(variant)
    this.#state   = longfn.fromBigInt(BigInt.asUintN(64,  this.#state), true)
    this.#variant = longfn.fromBigInt(BigInt.asUintN(64, (this.#variant << 1n) | 1n), true)
    this.randomUint32(); this.randomUint32() // get to a functional state
  }
  randomUint32() {
    const oldstate = longfn.copy(this.#state, {})
    longfn.mul(oldstate, this.#magicNumber, this.#state)
    longfn.add(this.#state, this.#variant, this.#state)
    let xorshifted = longfn.shru(oldstate, 18, {})
    longfn.xor(xorshifted, oldstate, xorshifted)
    longfn.shru(xorshifted, 27, xorshifted)
    //longfn.and(xorshifted, this.#mask32, xorshifted)
    xorshifted = longfn.toInt(xorshifted)
    const rot = longfn.toInt(longfn.shru(oldstate, 59, oldstate))
    return ((xorshifted >>> rot) | (xorshifted << ((-rot) & 31))) >>> 0
    // const result = longfn.or(longfn.shru(xorshifted, rot, {}), longfn.shl(xorshifted, (-rot) & 31, {}), {})
    // return longfn.toInt(result)
  }
  exportState() {
    return [longfn.copy(this.#state, {}), longfn.copy(this.#variant, {})]
  }
  importState(state) {
    longfn.copy(state[0], this.#state)
    longfn.copy(state[1], this.#variant)
  }
}

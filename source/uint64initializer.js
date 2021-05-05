
/**
 * A minor modification by me of the 32-bit variant, probably not very good, but it works very well for my usage in SeedInitializer_Uint64.
 */
class RandomGenerator_Pcg64 {
  #state; #variant
  constructor(state, variant) {
    this.#state = state
    this.#variant = variant << 1n
    this.randomUint64()
    this.randomUint64()
  }
  randomUint64() {
    const oldstate = this.#state
    this.#state = ((oldstate * 6364136223846793005n) & 0xFFFF_FFFF_FFFF_FFFFn) + (this.#variant | 1n)
    const xorshifted = ((oldstate >> 18n) ^ oldstate) >> 27n
    const rot = oldstate >> 59n
    return (xorshifted >> rot) | (xorshifted << ((-rot) & 31n))
  }
}

/**
 * A `SeedInitializer` compatible with any `RandomGenerator` requiring unsigned 64-bit `BigInt` as seeds, `seed` can be called several times to generate more seeds from its input seed.
 */
export class SeedInitializer_Uint64 {
  constructor(seed) {
    if (seed == undefined) seed = +new Date // "random seed"
    let nextState = 123456n, pcg
    for (let char of seed.toString()) {
      pcg = new RandomGenerator_Pcg64(nextState, BigInt(char.codePointAt(0)))
      nextState = pcg.randomUint64()
    }
    pcg = new RandomGenerator_Pcg64(nextState, 0n)
    this.seed = pcg.randomUint64.bind(pcg)
  }
}

// IronWellons32 is an algorithm based on the MurmurHash3 32-bit finalizer. MurmurHash3 was created by Austin Appleby
// (aappleby), and has been released into the public domain. See https://github.com/aappleby/smhasher
// The constants in the original algorithm (16‒0x85ebca6b‒13‒0xc2b2ae35‒16) were replaced by new constants
// (16‒0x21f0aaad‒15‒0x735a2d97‒15) found by TheIronBorn using a tool created by Christopher Wellons (skeeto). See
// https://github.com/skeeto/hash-prospector/issues/19
// The JavaScript version was contributed by Pimm Hogeling.

/**
 * A `RandomGenerator` using the IronWellons32 algorithm. It's compatible with any `SeedInitializer` returning unsigned
 * 32-bit integers, e.g. `SeedInitializer_Uint32`.
 */
export class RandomGenerator_IronWellons32 {
  constructor(seed) {
    if (typeof seed != 'number') {
      throw new Error('IronWellons32 requires a numeric seed, instead received: ' + seed)
    }
    Object.assign(
      this,
      {
        randomUint32() {
          seed = Math.imul(
            seed ^ seed >>> 16,
            0x21f0aaad
          )
          seed = Math.imul(
            seed ^ seed >>> 15,
            0x735a2d97
          )
          seed =
            (seed ^ seed >>> 15)
              >>> 0
          return seed
        },
        importState(state) {
          seed = state >>> 0
        },
        exportState() {
          return seed
        }
      }
    )
  }
}

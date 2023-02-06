/*
IronWellons32 is an algorithm based on the MurmurHash3 32-bit finalizer. MurmurHash3 was created by Austin Appleby (aappleby), and has been released into the public domain. See https://github.com/aappleby/smhasher

The constants in the original algorithm (16 85ebca6b 13 c2b2ae35 16) were replaced by new constants (16 21f0aaad 15 735a2d97 15) found by TheIronBorn using a tool created by Christopher Wellons (skeeto). See https://github.com/skeeto/hash-prospector/issues/19

The JavaScript version was contributed by Pimm Hogeling (https://github.com/Pimm).
*/

/** A `RandomGenerator` using the ["IronWellons32" algorithm](https://github.com/skeeto/hash-prospector/issues/19#issuecomment-1120105785). It's compatible with any `SeedInitializer` returning unsigned 32-bit integers, e.g. `SeedInitializer_Uint32`. */
export class RandomGenerator_IronWellons32 {
  constructor(uint32seed) {
    if (!Number.isInteger(uint32seed)) throw Error('IronWellons32 requires an integer seed, instead received: '+uint32seed)
    this.state = uint32seed >>> 0
  }
  randomUint32() {
    this.state = Math.imul(this.state ^ this.state >>> 16, 0x21f0aaad)
    this.state = Math.imul(this.state ^ this.state >>> 15, 0x735a2d97)
    this.state = (this.state ^ this.state >>> 15) >>> 0
    return this.state
  }
  importState(state) {
    this.state = state >>> 0
  }
  exportState() {
    return this.state
  }
}

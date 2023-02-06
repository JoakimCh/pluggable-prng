
/** A `RandomGenerator` using Christopher Wellons [triple32](https://github.com/skeeto/hash-prospector#three-round-functions) algorithm. It's compatible with any `SeedInitializer` returning unsigned 32-bit integers, e.g. `SeedInitializer_Uint32`. */
export class RandomGenerator_WellonsTriple32 {
  constructor(uint32seed) {
    if (!Number.isInteger(uint32seed)) throw Error('WellonsTriple32 requires an integer seed, instead received: '+uint32seed)
    this.state = uint32seed >>> 0
  }
  randomUint32() {
    this.state = Math.imul(this.state ^ this.state >>> 17, 0xed5ad4bb)
    this.state = Math.imul(this.state ^ this.state >>> 11, 0xac4c1b51)
    this.state = Math.imul(this.state ^ this.state >>> 15, 0x31848bab)
    this.state = (this.state ^ this.state >>> 14) >>> 0
    return this.state
  }
  importState(state) {
    this.state = state >>> 0
  }
  exportState() {
    return this.state
  }
}

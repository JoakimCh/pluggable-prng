
import {Xmur3} from './xmur3.js'

/**
 * A `SeedInitializer` using the `Xmur3` algorithm. It's compatible with any `RandomGenerator` requiring unsigned 32-bit integers as seeds, e.g. Mulberry32 and Sfc32. `seed()` can be called several times to generate more seeds from its input seed.
 */
export class SeedInitializer_Uint32 {
  constructor(seed) {
    if (seed == undefined) seed = +new Date // "random seed"
    this.xmur3 = new Xmur3(seed)
    this.seed = this.xmur3.next.bind(this.xmur3)
  }
}

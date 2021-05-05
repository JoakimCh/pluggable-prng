/**
 * @module pluggable-prng
 */
export {RandomGenerator_Alea, SeedInitializer_Alea, Mash} from './alea&mash.js'
export {RandomGenerator_Sfc32} from './sfc32.js'
export {RandomGenerator_Pcg32, RandomGenerator_Pcg32_alt, RandomGenerator_Pcg32_alt_bigint} from './pcg32.js'
export {RandomGenerator_Mulberry32} from './mulberry32.js'
export {SeedInitializer_Uint32} from './uint32initializer.js'
export {SeedInitializer_Uint64} from './uint64initializer.js'
export {RandomGenerator_WebCrypto, SeedInitializer_WebCrypto} from './webCrypto.js'
export {Xmur3} from './xmur3.js'
export * as longfn from './longfn.js'
export {Uint64} from './uint64.js'

function mandatory(name) {throw Error('`'+name+'` is a mandatory parameter.')}
const notReadyError = () => {throw Error('A `readyPromise` property was set on the `PluggablePRNG` instance, but was not awaited before you tried to use it (hence this error message).')}

/**
 * Plug in the `seed`, `RandomGenerator` and `SeedInitializer` you want to use in this PRNG instance. Has methods for getting any random number you could want.
 */
export class PluggablePRNG {
  #SeedInitializer; #RandomGenerator; #initialState
  #isAsync = false
  #seedGenIsAsync = false
  /**
   * @param {Object} options An object with the options to use.
   * @param {*} [options.seed] The seed to initialize the `RandomGenerator` with. If used together with a `SeedInitializer` it can usually be any string or number which the `SeedInitializer` will convert into the proper format required by the `RandomGenerator` (if the `RandomGenerator` is designed to be compatible with it).
   * @param {*} options.RandomGenerator A class implementing the PRNG algorithm to use.
   * @param {*} [options.SeedInitializer] If the `RandomGenerator` needs the seed to go through a special algorithm to convert it into the required format then supply a "seed initializer" class here.
   */
  constructor({seed = undefined, RandomGenerator, SeedInitializer = undefined}) {
    this.#SeedInitializer = SeedInitializer
    this.#RandomGenerator = RandomGenerator
    
    /**
     * If this is different from `undefined` then the PRNG has an async initialization and you would need to await this `Promise` before you can use the PRNG.
     */
    this.readyPromise = undefined

    let readyPromiseResolve, notReady = false
    const setNotReady = () => {
      if (notReady) return // do not run twice
      notReady = true
      this.readyPromise = new Promise(resolve => readyPromiseResolve = resolve)
    }

    // Check if the random generator is async.
    const rndGenInit = (randomGenerator) => {
      this.randomUint32 = randomGenerator.randomUint32.bind(randomGenerator)
      this.exportState = randomGenerator.exportState?.bind(randomGenerator)
      this.importState = randomGenerator.importState?.bind(randomGenerator)

      const value = randomGenerator.randomUint32()
      if (value instanceof Promise) { // then it is async
        this.#isAsync = true
        setNotReady()
        value.then(() => {  // when value is ready
          this.#initialState = randomGenerator.exportState?.()
          readyPromiseResolve()
        })
        //#region async implementation
        this.randomBytes = async function(numBytes = mandatory('numBytes')) {
          const intsToGet = Math.ceil(numBytes / 4)
          const uint32array = new Uint32Array(intsToGet)
          for (let i=0; i<intsToGet; i++) {
            uint32array[i] = await this.randomUint32()
          }
          return new Uint8Array(uint32array.buffer, uint32array.byteOffset, numBytes)
        }
        this.skipAhead = async function(times=1) {
          for (let i=0; i<times; i++) await this.randomUint32()
        }
        this.randomInteger = async function(min = mandatory('min'), max = mandatory('max')) {
          if (min > max) {const pMin = min; min = max; max = pMin}
          const range = max - min
          if (range > Number.MAX_SAFE_INTEGER) throw Error('The difference between min and max must not be more than Number.MAX_SAFE_INTEGER.')
          let randomInt = await this.randomUint32()
          if (range > 0xFFFF_FFFF) randomInt += (await this.randomUint32() >>> 11) * 2**32
          return min + (randomInt > range ? randomInt % (range+1) : randomInt)
        }
        this.randomFloat32 = async function(minOrMax, max) {
          if (minOrMax == undefined) return Math.fround(await this.randomUint32() * 2**-32)
          // else randomFloat64 is used for best scaling
          return Math.fround(await this.randomFloat64(...arguments)) // round to a float32
        }
        this.randomFloat64 = async function(minOrMax, max) {
          let min = minOrMax
          // this creates a float from 0 to 0.9999999999999999 (where every bit in the mantissa has a potential to be set)
          const rndFloat = (await this.randomUint32() + (await this.randomUint32() >>> 11) * 2**32) * 2**-53
          /* The mathematical significand of an IEEE-754 64-bit binary floating-point object has 53 bits. It is encoded with the combination of a 52-bit field exclusively for the significand and some information from the exponent field that indicates whether the 53rd bit is 0 or 1. */ // From: https://stackoverflow.com/questions/18409496/is-it-52-or-53-bits-of-floating-point-precision
          switch (arguments.length) {
            case 0: return rndFloat
            case 1: max = minOrMax; min = 0; break
            case 2: if (minOrMax > max) {min = max; max = minOrMax}; break
          }
          return min + rndFloat * (max-min)
        }
        //#endregion
      } else {
        this.#initialState = randomGenerator.exportState?.()
        //#region sync implementation
        this.randomBytes = function(numBytes = mandatory('numBytes')) {
          const intsToGet = Math.ceil(numBytes / 4)
          const uint32array = new Uint32Array(intsToGet)
          for (let i=0; i<intsToGet; i++) {
            uint32array[i] = this.randomUint32()
          }
          return new Uint8Array(uint32array.buffer, uint32array.byteOffset, numBytes)
        }
        this.skipAhead = function(times=1) {
          for (let i=0; i<times; i++) this.randomUint32()
        }
        this.randomInteger = function(min = mandatory('min'), max = mandatory('max')) {
          if (min > max) {const pMin = min; min = max; max = pMin}
          const range = max - min
          if (range > Number.MAX_SAFE_INTEGER) throw Error('The difference between min and max must not be more than Number.MAX_SAFE_INTEGER.')
          let randomInt = this.randomUint32()
          if (range > 0xFFFF_FFFF) randomInt += (this.randomUint32() >>> 11) * 2**32
          return min + (randomInt > range ? randomInt % (range+1) : randomInt)
        }
        this.randomFloat32 = function(minOrMax, max) {
          if (minOrMax == undefined) return Math.fround(this.randomUint32() * 2**-32)
          // else randomFloat64 is used for best scaling
          return Math.fround(this.randomFloat64(...arguments)) // round to a float32
        }
        this.randomFloat64 = function(minOrMax, max) {
          let min = minOrMax
          // this creates a float from 0 to 0.9999999999999999 (where every bit in the mantissa has a potential to be set)
          const rndFloat = (this.randomUint32() + (this.randomUint32() >>> 11) * 2**32) * 2**-53
          /* The mathematical significand of an IEEE-754 64-bit binary floating-point object has 53 bits. It is encoded with the combination of a 52-bit field exclusively for the significand and some information from the exponent field that indicates whether the 53rd bit is 0 or 1. */ // From: https://stackoverflow.com/questions/18409496/is-it-52-or-53-bits-of-floating-point-precision
          switch (arguments.length) {
            case 0: return rndFloat
            case 1: max = minOrMax; min = 0; break
            case 2: if (minOrMax > max) {min = max; max = minOrMax}; break
          }
          return min + rndFloat * (max-min)
        }
        //#endregion
        if (notReady) readyPromiseResolve()
      }
    }

    let randomGenerator
    if (this.#SeedInitializer) {
      const seedInitializer = new this.#SeedInitializer(seed)
      const generatedSeed = seedInitializer.seed()
      if (generatedSeed instanceof Promise) {
        this.#seedGenIsAsync = true
        setNotReady()
        generatedSeed.then(async seed => {
          const seeds = [seed]
          if (this.#RandomGenerator.seedsNeeded) {
            for (let i=1; i<this.#RandomGenerator.seedsNeeded; i++) {
              seeds.push(await seedInitializer.seed())
            }
          }
          randomGenerator = new this.#RandomGenerator(...seeds)
          rndGenInit(randomGenerator)
        })
      } else {
        const seeds = [generatedSeed]
        if (this.#RandomGenerator.seedsNeeded) {
          for (let i=1; i<this.#RandomGenerator.seedsNeeded; i++) {
            seeds.push(seedInitializer.seed())
          }
        }
        randomGenerator = new this.#RandomGenerator(...seeds)
      }
    } else {
      randomGenerator = new this.#RandomGenerator(seed)
    }

    if (notReady == false) rndGenInit(randomGenerator)
  }

  /**
   * Check if the PRNG is async, meaning calls to it will return promises which you can resolve with `await`. 
   * 
   * E.g. `await prng.randomFloat32()`. 
   */
  get isAsync() {
    return this.#isAsync
  }

  /**
   * Get a random integer from min to max. Internally it's using 1 call to `randomUint32` if the difference between `min` and `max` is less than 4_294_967_296 (0xFFFF_FFFF), else 2 calls.
   * @param {number} min The minimum value.
   * @param {number} max The maximum value.
   * @returns {number} An integer.
   */
  randomInteger(min, max){notReadyError()}

  /**
   * Get a random float from 0 to 1 with 32-bit (single) precision. Optionally change this range by providing `max` or `min, max`. Internally it's using 1 call to `randomUint32` if not given any parameters, else 2 calls.
   * @param {number} [minOrMax] The minimum value OR the maximum value if used alone.
   * @param {number} [max] The maximum value.
   * @returns {number} A 32-bit float.
   */
  randomFloat32(minOrMax, max){notReadyError()}

  /**
   * Get a random float from 0 to 1 with 64-bit (double) precision. Optionally change this range by providing `max` or `min, max`. Internally it's using 2 calls to `randomUint32`.
   * @param {number} [minOrMax] The minimum value OR the maximum value if used alone.
   * @param {number} [max] The maximum value.
   * @returns {number} A 64-bit float.
   */
  randomFloat64(minOrMax, max){notReadyError()}

  /**
   * Request a certain number of random bytes.
   * @param {number} numBytes The amount of bytes wanted.
   * @returns {Uint8Array} A Uint8Array with the bytes.
   */
  randomBytes(numBytes){notReadyError()}

  /**
   * Get an unsigned 32-bit integer directly from the `RandomGenerator`. This is the source of random bits used by all the other functions.
   * @returns {number} A 32-bit unsigned integer.
   */
  randomUint32(){notReadyError()}

  /**
   * Skip the `RandomGenerator` ahead this number of calls to `randomUint32`, this can be used to keep two PRNGs in sync.
   * @param {number} numCalls
   */
  skipAhead(numCalls){notReadyError()}

  /**
   * Export the current state of the `RandomGenerator`. You can then later rewind back to this state by importing it with `importState`, or send it to another PluggablePRNG instance using the same `RandomGenerator` to synchronize two instances.
   * @returns {*} A value representing the current state of the PRNG.
   */
  exportState(){notReadyError()}

  /**
   * Import a known state into the `RandomGenerator` to resume from that state.
   * @param {*} state A value representing a state of the PRNG.
   */
  importState(){notReadyError()}

  /**
   * Reset the PRNG to its initial state. It "rewinds" itself back to the start so that it can be used to generate the same numbers again.
   */
  reset() {
    this.importState(this.#initialState)
  }

  /**
   * This function allows you to change the seed without having to create a new `PluggablePRNG` instance. Returns a promise if the `readyPromise` property is different from `undefined` (which would need to be resolved before the seed change is complete).
   * @param {*} seed A seed compatible with the `SeedInitializer` (if used) or else the `RandomGenerator` directly.
   */
  changeSeed(seed) {
    const newPrng = new PluggablePRNG({
      seed,
      SeedInitializer: this.#SeedInitializer,
      RandomGenerator: this.#RandomGenerator
    })
    if (this.#seedGenIsAsync || this.#isAsync) {
      return new Promise(async resolve => {
        await newPrng.readyPromise
        this.importState(newPrng.exportState())
        resolve()
      })
    } else {
      this.importState(newPrng.exportState())
    }
  }
}

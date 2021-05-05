/*
does not provide cryptographically secure random numbers
*/

export class PluggablePRNG {
  #SeedGenerator; #RandomGenerator; #initialState; #random
  /**
   * @param {Object} options An object with the options to use.
   * @param {*} [options.seed] The seed to initialize the PRNG with. If used together with a `SeedGenerator` it can usually be any string or number which the `SeedGenerator` will convert into the required format.
   * @param {*} options.RandomGenerator A class implementing the PRNG algorithm to use.
   * @param {*} [options.SeedGenerator] If the PRNG needs the seed to go through a special algorithm then supply a SeedGenerator class here.
   */
  constructor({seed = undefined, RandomGenerator, SeedGenerator = undefined}) {
    this.#SeedGenerator = SeedGenerator
    this.#RandomGenerator = RandomGenerator

    const seedGenerator = this.#SeedGenerator ? new this.#SeedGenerator(seed) : undefined
    const randomGenerator = new this.#RandomGenerator(seedGenerator ? seedGenerator.seed() : seed)
    this.#initialState = randomGenerator.exportState()
    
    // randomGenerator.random must behave just like Math.random
    this.#random     = randomGenerator.random.bind(randomGenerator)
    this.exportState = randomGenerator.exportState.bind(randomGenerator)
    this.importState = randomGenerator.importState.bind(randomGenerator)
  }
  /**
   * This function allows you to change the seed without having to create a new PluggablePRNG instance.
   * @param {*} seed 
   */
  changeSeed(seed) {
    const seedGenerator = this.#SeedGenerator ? new this.#SeedGenerator(seed) : undefined
    const randomGenerator = new this.#RandomGenerator(seedGenerator ? seedGenerator.seed() : seed)
    this.importState(randomGenerator.exportState())
  }
  /**
   * Get a random integer. Optionally contrain it to a certain size by providing a `max` or a `min, max`.
   * @param {number} [minOrMax] The minimum value OR the maximum value if used alone.
   * @param {number} [max] The maximum value.
   * @returns {number} An integer.
   */
  randomInteger(minOrMax, max) {
    switch (arguments.length) {
      case 0: return this.#random() * 0x100000000 // 2^32 (makes an int from a 0 to 1 float)
      case 1: max = minOrMax; minOrMax = 0
    }
    return Math.floor(this.#random() * (max-minOrMax+1)) + minOrMax
  }
  /**
   * Get a random float. Optionally contrain it to a certain size by providing a `max` or a `min, max`.
   * @param {number} [minOrMax] The minimum value OR the maximum value if used alone.
   * @param {number} [max] The maximum value.
   * @returns {number} A float.
   */
  randomFloat(minOrMax, max) {
    switch (arguments.length) { // x | 0 explained: https://stackoverflow.com/a/7488075/4216153
      case 0: return this.#random() + (this.#random() * 0x200000 | 0) * 1.1102230246251565e-16 // 2^-53
      case 1: max = minOrMax; minOrMax = 0
    }
    return this.#random() * (max-minOrMax) + minOrMax
  }
  /**
   * Reset the PRNG to its initial state. It "rewinds" it back to start so that it can be used to generate the same numbers again.
   */
  reset() {
    this.importState(this.#initialState)
  }
  /**
   * Skip the generator ahead
   * @param {*} numbersToSkip 
   */
  skipAhead(numbersToSkip=1) {
    for (let i=0; i<numbersToSkip; i++) this.#random()
  }
}

export function numberToFraction(number) {
  const numDigits = Math.ceil(Math.log10(number+1))
  return number / Math.pow(10, numDigits)
}

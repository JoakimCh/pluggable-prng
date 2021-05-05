/*
Alea and Mash was developed by Johannes Baagøe:
https://web.archive.org/web/20120125044127/http://baagoe.org/en/wiki/Better_random_numbers_for_javascript
https://web.archive.org/web/20120303015224/http://baagoe.org/en/wiki/Mash
https://web.archive.org/web/20120303015325/http://baagoe.org/en/wiki/Alea

So here is a copy of the MIT license bound to his work:
Copyright (C) 2010 by Johannes Baagøe <baagoe@baagoe.org>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

/**
 * A `RandomGenerator` using the extremely fast Alea algorithm. Designed to be used with `SeedInitializer_Alea`.
 */
export class RandomGenerator_Alea {
  constructor(seedArray) {
    this.importState(seedArray)
  }
  randomUint32() { // Alea 0.9
    // c is an int32, this makes it a float (same as c / 0x100000000)
    const t = (this.s0 * 2091639) + (this.c * 2**-32) // float + float
    this.s0 = this.s1  //2097152 == 2**21, it's close to setting all bits in the mantissa then?
    this.s1 = this.s2
    this.s2 = t - (this.c = t | 0) // t | 0 makes an int32, see: https://stackoverflow.com/a/7488075/4216153
    // return this.s2 // this is the original behaviour, but we don't want a float
    return (this.s2 * 2**32) >>> 0 // turns the float s2 into an uint32
  }
  exportState() {
    return [this.s0, this.s1, this.s2, this.c]
  }
  importState(stateArray) {
    if (!Array.isArray(stateArray) || stateArray.length != 4) throw Error('Invalid state-array ('+stateArray+'), correct `SeedInitializer` not used?')
    ;[this.s0, this.s1, this.s2, this.c] = stateArray
  }
}

/**
 * A `SeedInitializer` designed to be used with `RandomGenerator_Alea`, internally it's using the `Mash` algorithm.
 */
export class SeedInitializer_Alea {
  constructor(seedArray) {
    if (seedArray == undefined || seedArray.length == 0) {
      seedArray = [+new Date] // "random seed"
    } else if (!Array.isArray(seedArray)) {
      seedArray = [seedArray]
    }
    const mash = new Mash()
    let s0 = mash.next(' ') // these must be from 0 to <1
    let s1 = mash.next(' ')
    let s2 = mash.next(' ')
    let c = 1 // this one seems to be any positive integer
    for (const seed of seedArray) {
      s0 -= mash.next(seed)
      if (s0 < 0) s0 += 1
      s1 -= mash.next(seed)
      if (s1 < 0) s1 += 1
      s2 -= mash.next(seed)
      if (s2 < 0) s2 += 1
    }
    this.seed = () => [s0, s1, s2, c]
  }
}

/**
 * Johannes Baagøe's hashing algorithm. Converts any input data to a string (`data.toString()`) and creates a hash from that where `next(data)` results in a floating point number less than 1 (which is also affected by any previous calls).
 */
export class Mash { // Mash 0.9
  #n = 0xEFC8249D
  next(data) {
    data = data.toString()
    for (let i=0; i < data.length; i++) {
      this.#n += data.charCodeAt(i)
      let h = 0.02519603282416938 * this.#n
      this.#n = h >>> 0
      h -= this.#n
      h *= this.#n
      this.#n = h >>> 0
      h -= this.#n
      this.#n += h * 2**32
      // h * 2**32 expands the float h into an integer part up to 32 bits (if from 0 to less than 1), but still allows a fractional part
    }
    return (this.#n >>> 0) * 2**-32 // uint32 to float less than 1
  }
}

# pluggable-prng

### Description
An [ES module](https://flaviocopes.com/es-modules/) providing a [Pseudo-random number generator](https://en.wikipedia.org/wiki/Pseudorandom_number_generator) which is "pluggable", meaning you can plug-in any PRNG algorithm.

It's also ["seedable"](https://en.wikipedia.org/wiki/Random_seed) meaning that it can have a reproducible ([deterministic](https://en.wikipedia.org/wiki/Deterministic_algorithm)) output based on its starting seed.

The module includes plugins for some fast and good (insecure) PRNGs ([Alea](https://github.com/nquinlan/better-random-numbers-for-javascript-mirror#alea), [Sfc32](http://pracrand.sourceforge.net/RNG_engines.txt), [Mulberry32](https://gist.github.com/tommyettinger/46a874533244883189143505d203312c), [Pcg32](https://www.pcg-random.org/download.html), [IronWellons32](https://github.com/skeeto/hash-prospector/issues/19#issuecomment-1120105785) and [WellonsTriple32](https://github.com/skeeto/hash-prospector#three-round-functions)).

But also a fast [cryptographically secure PRNG](https://en.wikipedia.org/wiki/Cryptographically-secure_pseudorandom_number_generator) which is using the [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API). It's compatible with Node.js, [Deno](https://deno.land) and the browser.

### Funding

If you find this useful then please consider helping me out (I'm jobless and sick). For more information visit my [GitHub profile](https://github.com/JoakimCh).

### Some features

* Very easy to use API.
* Supports both sync and [async](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) `RandomGenerator` and `SeedInitializer` (it auto-detects it).
* The pluggable `RandomGenerator` algorithm only needs to be able to output random `Uint32` numbers, `PluggablePRNG` will derive any numbers from them (signed, unsigned, single and double precision floats).

### Function list (class PluggablePRNG)

* `constructor({[seed], RandomGenerator, [SeedInitializer]})`
* `randomInteger([minOrMax], [max])`
* `randomFloat32([minOrMax], [max])`
* `randomFloat64([minOrMax], [max])`
* `randomUint32()`
* `randomBytes(count)`
* `skipAhead(times)`
* `reset()`
* `exportState()`
* `importState(state)`
* `changeSeed(seed)`

### Export list (module pluggable-prng)

* `PluggablePRNG`
* `RandomGenerator_Alea`
* `RandomGenerator_Sfc32`
* `RandomGenerator_Pcg32`
* `RandomGenerator_Mulberry32`
* `RandomGenerator_IronWellons32`
* `RandomGenerator_WellonsTriple32`
* `RandomGenerator_WebCrypto`
* `SeedInitializer_Alea`
* `SeedInitializer_Uint32`
* `SeedInitializer_Uint64`
* `SeedInitializer_WebCrypto`
* `Xmur3` The hash function used in `SeedInitializer_Uint32`.
* `Mash` The hash function used in `SeedInitializer_Alea`.
* `Uint64` A 64-bit arithmetic library (faster than using BigInts).

The 3 last exports in this list are used internally but was made available to anyone wanting to do whatever with them.

### Performance

On my `Intel® Core™ i5-10210U CPU @ 1.60GHz × 8` this is a typical result:
```
Iterations: 400000
Alea: 670ms
Mulberry32: 653ms
Sfc32: 927ms
Pcg32: 1532ms
Pcg32 (BigInt reference impl.): 2843ms
WebCrypto: 1363ms
IronWellons32: 666ms
WellonsTriple32: 684ms
```

### How to use

#### Install using [NPM](https://www.npmjs.com/)

```shell
npm i pluggable-prng
```

#### Import the ES module into Node.js

```js
import {the, exports, you, want} from 'pluggable-prng'
```
Got problems using ES modules? [Click here](https://stackoverflow.com/questions/45854169/how-can-i-use-an-es6-import-in-node-js/56350495#56350495) or [read this](https://nodejs.org/api/esm.html).

#### Import the ES module into the browser or Deno

```js
import {the, exports, you, want} from '/node_modules/pluggable-prng/source/pluggablePrng.js'
```

### Example

```js
import {
  PluggablePRNG,
  RandomGenerator_Alea,
  SeedInitializer_Alea
} from 'pluggable-prng'

const log = console.log
const wideNumber = new Intl.NumberFormat('fullwide', {maximumSignificantDigits: 21})

await prngDemoOutput(new PluggablePRNG({
  seed: 'Hello World',
  RandomGenerator: RandomGenerator_Alea,
  SeedInitializer: SeedInitializer_Alea
}))

async function prngDemoOutput(prng, iterations=5) {
  await prng.readyPromise // if set (will be set when using async RandomGenerator or SeedInitializer)
  log('\nrandomFloat32()')
  for (let i=0; i<iterations; i++) {
    let n = await prng.randomFloat32() // await is only needed if the RandomGenerator is async
    log(wideNumber.format(n), n.toString(2))
  }
  log('\nrandomFloat32(4)')
  for (let i=0; i<iterations; i++) {
    let n = await prng.randomFloat32(4)
    log(wideNumber.format(n), n.toString(2))
  }
  log('\nrandomFloat32(5,7)')
  for (let i=0; i<iterations; i++) {
    let n = await prng.randomFloat32(5,7)
    log(wideNumber.format(n), n.toString(2))
  }
  
  log('\nrandomFloat64()')
  for (let i=0; i<iterations; i++) {
    let n = await prng.randomFloat64()
    log(wideNumber.format(n), n.toString(2))
  }
  log('\nrandomFloat64(4)')
  for (let i=0; i<iterations; i++) {
    let n = await prng.randomFloat64(4)
    log(wideNumber.format(n), n.toString(2))
  }
  log('\nrandomFloat64(5,7)')
  for (let i=0; i<iterations; i++) {
    let n = await prng.randomFloat64(5,7)
    log(wideNumber.format(n), n.toString(2))
  }
  
  log('\nrandomInteger(-0xFFFF_FFFF, 0xFFFF_FFFF)')
  for (let i=0; i<iterations; i++) {
    let n = await prng.randomInteger(-0xFFFF_FFFF, 0xFFFF_FFFF)
    log(n)
  }
  log('\nrandomInteger(0, 4)')
  for (let i=0; i<iterations; i++) {
    let n = await prng.randomInteger(0, 4)
    log(n)
  }
  log('\nrandomInteger(0, Number.MAX_SAFE_INTEGER)')
  log(integerToHex(2**53-1, 8), '== 53 bits all set (Number.MAX_SAFE_INTEGER)')
  for (let i=0; i<iterations; i++) {
    let n = await prng.randomInteger(0, Number.MAX_SAFE_INTEGER)
    log(integerToHex(n, 8))
  }
  log('\nrandomInteger(0, FF_FFFF_FFFF)')
  for (let i=0; i<iterations; i++) {
    let n = await prng.randomInteger(0, 0xFF_FFFF_FFFF)
    log(integerToHex(n, 8))
  }
  log('\nrandomInteger(FFFF_FFFF_0000, FFFF_FFFF_FFFF)')
  for (let i=0; i<iterations; i++) {
    let n = await prng.randomInteger(0xFFFF_FFFF_0000, 0xFFFF_FFFF_FFFF)
    log(integerToHex(n, 8))
  }
  log('\nrandomBytes(100)')
  log(await prng.randomBytes(100))
}

function integerToHex(integer, paddingByteSize = 4, grouping = 4) {
  let hex = integer.toString(16).toUpperCase()
  if (hex.length < paddingByteSize*2)
    hex = '0'.repeat((paddingByteSize*2) - hex.length) + hex
  if (grouping) {
    let result = ''
    if (hex.length % grouping) result += hex.slice(0, hex.length % grouping) + '_'
    for (let i=hex.length % grouping; i<hex.length; i+=grouping) {
      result += hex.slice(i, i+grouping) + '_'
    }
    hex = result.slice(0, -1)
  }
  return hex
}
```

#### Console output from example:

```
randomFloat32()
0.40236979722976685 0.011001110000000110110101
0.665740430355072 0.101010100110110111110111
0.8638420104980469 0.110111010010010011
0.3918175995349884 0.0110010001001110001010001
0.6584303379058838 0.1010100010001110111001

randomFloat32(4)
3.8685505390167236 11.1101111001011001010101
1.3849899768829346 1.0110001010001110101101
3.5557355880737305 11.10001110010001001011
1.9126533269882202 1.11101001101000111010011
2.8120803833007812 10.11001111111001001

randomFloat32(5,7)
6.76179838180542 110.110000110000010100111
5.768731594085693 101.110001001100101110011
5.725522041320801 101.10111001101110111101
6.2515740394592285 110.010000000110011100101
5.0234503746032715 101.000001100000000011011

randomFloat64()
0.690803412413217 0.1011000011011000011111100001000001000111101010111111
0.11257452328114703 0.0001110011010001101011110001011111011010111101100001
0.7540652142135055 0.11000001000010100110101011111010000110010010011001001
0.1101138829540963 0.00011100001100000110110001100110000111111001100000101
0.9723450582551325 0.111110001110101110011011000100011010001000001100111

randomFloat64(4)
1.4401003736030833 1.011100001010101001101011000001111001010100100110111
3.822690506829564 11.11010010100110111101100001010101100100000000100101
2.8196269628488606 10.11010001110100110001001010011000010110110000110011
1.8257031653043914 1.1101001101100001010010000101101100101111101000001
0.04597539088946645 0.000010111100010100001011000100000100101010000011111

randomFloat64(5,7)
5.916290461635426 101.11101010100100100000001011111110010111000110001111
5.595896881361192 101.10011000100011001011001010110001001111000001011
5.998995254544729 101.1111111110111110001001110010101100100000111110011
6.927475819224875 110.11101101011011110000111000100111011001101101001001
6.469594235393646 110.01111000001101110101001111101011011001111110010011

randomInteger(-0xFFFF_FFFF, 0xFFFF_FFFF)
-929633365
1560369360
-1435113722
-2519637442
-1282205992

randomInteger(0, 4)
0
4
1
2
2

randomInteger(0, Number.MAX_SAFE_INTEGER)
001F_FFFF_FFFF_FFFF == 53 bits all set (Number.MAX_SAFE_INTEGER)
000C_D943_882C_47C5
000E_E298_5576_D500
0004_7F7A_09A6_5F8B
0004_31EA_E617_4A81
0008_9221_89A0_FE6E

randomInteger(0, FF_FFFF_FFFF)
0000_00A0_4ED6_D5DE
0000_009C_7602_F5D1
0000_00CE_2800_08B7
0000_0034_C35B_D273
0000_006F_972C_022A

randomInteger(FFFF_FFFF_0000, FFFF_FFFF_FFFF)
0000_FFFF_FFFF_F919
0000_FFFF_FFFF_1F12
0000_FFFF_FFFF_46E9
0000_FFFF_FFFF_E02C
0000_FFFF_FFFF_EBEC

randomBytes(100)
Uint8Array(100) [
   84,  51,  40, 249, 106,  90,  31, 200, 190,  78,  49,  41,
   25,  27, 199, 199,  86, 251,  44, 162, 103,  57,   0, 193,
   81, 149,  94,  36,  15,  89,  40, 240, 219,  12,  32, 223,
  113, 130,  90, 113, 188, 164, 254,  76, 164,  24,  73, 146,
  195, 189,  24,  56,  43, 141, 196, 127, 150, 245, 101, 204,
  121, 176, 163, 171,  92, 235, 162,  37, 140,  50,  26, 243,
  203,  29,  38, 199, 201, 229,  22, 234,  70,  40,  90,  18,
   48, 182, 166,   5, 114,  94,  30, 146, 181, 227,  79, 209,
    9, 218, 216,  18
]
```

### Example on how to implement a `RandomGenerator`

```js
/**
 * A `RandomGenerator` using the Sfc32 algorithm. It's compatible with any `SeedInitializer` returning unsigned 32-bit integers, e.g. `SeedInitializer_Uint32`.
 */
export class RandomGenerator_Sfc32 {
  #a; #b; #c; #counter // where the state is kept
  static seedsNeeded = 3 // tell the SeedInitializer to call the constructor with 3 seeds (instead of the default 1)
  constructor(uint32_a, uint32_b, uint32_c) {
    if (arguments.length != 3) throw Error('Sfc32 require 3 integer seeds.')
    if (typeof uint32_a != 'number' || !Number.isInteger(uint32_a)) throw Error('Sfc32 require integer seeds, this is not an integer: '+uint32_a)
    this.#a = uint32_a >>> 0
    this.#b = uint32_b >>> 0
    this.#c = uint32_c >>> 0
    this.#counter = 1
    this.randomUint32(); this.randomUint32() // forward to a good state
  }
  randomUint32() { // PluggablePRNG will implement the other variants
    let result = (this.#a + this.#b + this.#counter++) >>> 0
    this.#a = (this.#b ^ (this.#b >>> 9)) >>> 0
    this.#b = (this.#c + (this.#c  << 3)) >>> 0
    this.#c = (result + ((this.#c << 21) | (this.#c >>> 11))) >>> 0
    return result
  }
  exportState() {
    return [this.#a, this.#b, this.#c, this.#counter]
  }
  importState(state) {
    [this.#a, this.#b, this.#c, this.#counter] = state
  }
}
```

### Example on how to implement a `SeedInitializer`

```js
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
```

# Auto-generated API documentation (from JSDoc)

<a name="module_pluggable-prng"></a>

## pluggable-prng

* [pluggable-prng](#module_pluggable-prng)
    * [.PluggablePRNG](#module_pluggable-prng.PluggablePRNG)
        * [new exports.PluggablePRNG(options)](#new_module_pluggable-prng.PluggablePRNG_new)
        * [.readyPromise](#module_pluggable-prng.PluggablePRNG+readyPromise)
        * [.isAsync](#module_pluggable-prng.PluggablePRNG+isAsync)
        * [.randomInteger([minOrMax], [max])](#module_pluggable-prng.PluggablePRNG+randomInteger) ⇒ <code>number</code>
        * [.randomFloat32([minOrMax], [max])](#module_pluggable-prng.PluggablePRNG+randomFloat32) ⇒ <code>number</code>
        * [.randomFloat64([minOrMax], [max])](#module_pluggable-prng.PluggablePRNG+randomFloat64) ⇒ <code>number</code>
        * [.randomBytes(numBytes)](#module_pluggable-prng.PluggablePRNG+randomBytes) ⇒ <code>Uint8Array</code>
        * [.randomUint32()](#module_pluggable-prng.PluggablePRNG+randomUint32) ⇒ <code>number</code>
        * [.skipAhead(numCalls)](#module_pluggable-prng.PluggablePRNG+skipAhead)
        * [.exportState()](#module_pluggable-prng.PluggablePRNG+exportState) ⇒ <code>\*</code>
        * [.importState(state)](#module_pluggable-prng.PluggablePRNG+importState)
        * [.reset()](#module_pluggable-prng.PluggablePRNG+reset)
        * [.changeSeed(seed)](#module_pluggable-prng.PluggablePRNG+changeSeed)

<a name="module_pluggable-prng.PluggablePRNG"></a>

### pluggable-prng.PluggablePRNG
Plug in the `seed`, `RandomGenerator` and `SeedInitializer` you want to use in this PRNG instance. Has methods for getting any random number you could want.

**Kind**: static class of [<code>pluggable-prng</code>](#module_pluggable-prng)  

* [.PluggablePRNG](#module_pluggable-prng.PluggablePRNG)
    * [new exports.PluggablePRNG(options)](#new_module_pluggable-prng.PluggablePRNG_new)
    * [.readyPromise](#module_pluggable-prng.PluggablePRNG+readyPromise)
    * [.isAsync](#module_pluggable-prng.PluggablePRNG+isAsync)
    * [.randomInteger([minOrMax], [max])](#module_pluggable-prng.PluggablePRNG+randomInteger) ⇒ <code>number</code>
    * [.randomFloat32([minOrMax], [max])](#module_pluggable-prng.PluggablePRNG+randomFloat32) ⇒ <code>number</code>
    * [.randomFloat64([minOrMax], [max])](#module_pluggable-prng.PluggablePRNG+randomFloat64) ⇒ <code>number</code>
    * [.randomBytes(numBytes)](#module_pluggable-prng.PluggablePRNG+randomBytes) ⇒ <code>Uint8Array</code>
    * [.randomUint32()](#module_pluggable-prng.PluggablePRNG+randomUint32) ⇒ <code>number</code>
    * [.skipAhead(numCalls)](#module_pluggable-prng.PluggablePRNG+skipAhead)
    * [.exportState()](#module_pluggable-prng.PluggablePRNG+exportState) ⇒ <code>\*</code>
    * [.importState(state)](#module_pluggable-prng.PluggablePRNG+importState)
    * [.reset()](#module_pluggable-prng.PluggablePRNG+reset)
    * [.changeSeed(seed)](#module_pluggable-prng.PluggablePRNG+changeSeed)

<a name="new_module_pluggable-prng.PluggablePRNG_new"></a>

#### new exports.PluggablePRNG(options)

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | An object with the options to use. |
| [options.seed] | <code>\*</code> | The seed to initialize the `RandomGenerator` with. If used together with a `SeedInitializer` it can usually be any string or number which the `SeedInitializer` will convert into the proper format required by the `RandomGenerator` (if the `RandomGenerator` is designed to be compatible with it). |
| options.RandomGenerator | <code>\*</code> | A class implementing the PRNG algorithm to use. |
| [options.SeedInitializer] | <code>\*</code> | If the `RandomGenerator` needs the seed to go through a special algorithm to convert it into the required format then supply a "seed initializer" class here. |

<a name="module_pluggable-prng.PluggablePRNG+readyPromise"></a>

#### pluggablePRNG.readyPromise
If this is different from `undefined` then the PRNG has an async initialization and you would need to await this `Promise` before you can use the PRNG.

**Kind**: instance property of [<code>PluggablePRNG</code>](#module_pluggable-prng.PluggablePRNG)  
<a name="module_pluggable-prng.PluggablePRNG+isAsync"></a>

#### pluggablePRNG.isAsync
Check if the PRNG is async, meaning calls to it will return promises which you can resolve with `await`. This must be checked after readyPromise has been awaited (if readyPromise is not undefined).

E.g. `await prng.randomFloat32()`.

**Kind**: instance property of [<code>PluggablePRNG</code>](#module_pluggable-prng.PluggablePRNG)  
<a name="module_pluggable-prng.PluggablePRNG+randomInteger"></a>

#### pluggablePRNG.randomInteger([minOrMax], [max]) ⇒ <code>number</code>
Get a random integer from min to max. Internally it's using 1 call to `randomUint32` if the difference between `min` and `max` is less than 4_294_967_296 (0xFFFF_FFFF), else 2 calls. If no arguments are supplied then it will pick an integer from 0x00 to 0xFFFF_FFFF.

**Kind**: instance method of [<code>PluggablePRNG</code>](#module_pluggable-prng.PluggablePRNG)  
**Returns**: <code>number</code> - An integer.  

| Param | Type | Description |
| --- | --- | --- |
| [minOrMax] | <code>number</code> | The minimum value. |
| [max] | <code>number</code> | The maximum value. |

<a name="module_pluggable-prng.PluggablePRNG+randomFloat32"></a>

#### pluggablePRNG.randomFloat32([minOrMax], [max]) ⇒ <code>number</code>
Get a random float from 0 to 1 with 32-bit (single) precision. Optionally change this range by providing `max` or `min, max`. Internally it's using 1 call to `randomUint32` if not given any parameters, else 2 calls.

**Kind**: instance method of [<code>PluggablePRNG</code>](#module_pluggable-prng.PluggablePRNG)  
**Returns**: <code>number</code> - A 32-bit float.  

| Param | Type | Description |
| --- | --- | --- |
| [minOrMax] | <code>number</code> | The minimum value OR the maximum value if used alone. |
| [max] | <code>number</code> | The maximum value. |

<a name="module_pluggable-prng.PluggablePRNG+randomFloat64"></a>

#### pluggablePRNG.randomFloat64([minOrMax], [max]) ⇒ <code>number</code>
Get a random float from 0 to 1 with 64-bit (double) precision. Optionally change this range by providing `max` or `min, max`. Internally it's using 2 calls to `randomUint32`.

**Kind**: instance method of [<code>PluggablePRNG</code>](#module_pluggable-prng.PluggablePRNG)  
**Returns**: <code>number</code> - A 64-bit float.  

| Param | Type | Description |
| --- | --- | --- |
| [minOrMax] | <code>number</code> | The minimum value OR the maximum value if used alone. |
| [max] | <code>number</code> | The maximum value. |

<a name="module_pluggable-prng.PluggablePRNG+randomBytes"></a>

#### pluggablePRNG.randomBytes(numBytes) ⇒ <code>Uint8Array</code>
Request a certain number of random bytes.

**Kind**: instance method of [<code>PluggablePRNG</code>](#module_pluggable-prng.PluggablePRNG)  
**Returns**: <code>Uint8Array</code> - A Uint8Array with the bytes.  

| Param | Type | Description |
| --- | --- | --- |
| numBytes | <code>number</code> | The amount of bytes wanted. |

<a name="module_pluggable-prng.PluggablePRNG+randomUint32"></a>

#### pluggablePRNG.randomUint32() ⇒ <code>number</code>
Get an unsigned 32-bit integer directly from the `RandomGenerator`. This is the source of random bits used by all the other functions.

**Kind**: instance method of [<code>PluggablePRNG</code>](#module_pluggable-prng.PluggablePRNG)  
**Returns**: <code>number</code> - A 32-bit unsigned integer.  
<a name="module_pluggable-prng.PluggablePRNG+skipAhead"></a>

#### pluggablePRNG.skipAhead(numCalls)
Skip the `RandomGenerator` ahead this number of calls to `randomUint32`, this can be used to keep two PRNGs in sync.

**Kind**: instance method of [<code>PluggablePRNG</code>](#module_pluggable-prng.PluggablePRNG)  

| Param | Type |
| --- | --- |
| numCalls | <code>number</code> | 

<a name="module_pluggable-prng.PluggablePRNG+exportState"></a>

#### pluggablePRNG.exportState() ⇒ <code>\*</code>
Export the current state of the `RandomGenerator`. You can then later rewind back to this state by importing it with `importState`, or send it to another PluggablePRNG instance using the same `RandomGenerator` to synchronize two instances.

**Kind**: instance method of [<code>PluggablePRNG</code>](#module_pluggable-prng.PluggablePRNG)  
**Returns**: <code>\*</code> - A value representing the current state of the PRNG.  
<a name="module_pluggable-prng.PluggablePRNG+importState"></a>

#### pluggablePRNG.importState(state)
Import a known state into the `RandomGenerator` to resume from that state.

**Kind**: instance method of [<code>PluggablePRNG</code>](#module_pluggable-prng.PluggablePRNG)  

| Param | Type | Description |
| --- | --- | --- |
| state | <code>\*</code> | A value representing a state of the PRNG. |

<a name="module_pluggable-prng.PluggablePRNG+reset"></a>

#### pluggablePRNG.reset()
Reset the PRNG to its initial state. It "rewinds" itself back to the start so that it can be used to generate the same numbers again.

**Kind**: instance method of [<code>PluggablePRNG</code>](#module_pluggable-prng.PluggablePRNG)  
<a name="module_pluggable-prng.PluggablePRNG+changeSeed"></a>

#### pluggablePRNG.changeSeed(seed)
This function allows you to change the seed without having to create a new `PluggablePRNG` instance. Returns a promise if the `readyPromise` property is different from `undefined` (which would need to be resolved before the seed change is complete).

**Kind**: instance method of [<code>PluggablePRNG</code>](#module_pluggable-prng.PluggablePRNG)  

| Param | Type | Description |
| --- | --- | --- |
| seed | <code>\*</code> | A seed compatible with the `SeedInitializer` (if used) or else the `RandomGenerator` directly. |


### End of readme
```
Your consciousness is not a creation of your brain, it's the opposite.
Remember who you are, you have every answer inside of you.
```

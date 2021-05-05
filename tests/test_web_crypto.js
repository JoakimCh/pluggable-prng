
import {
  PluggablePRNG,
  RandomGenerator_WebCrypto,
  SeedInitializer_WebCrypto
} from '../source/pluggablePrng.js'

import {assert, assertMoreOrEqual, assertLessOrEqual} from './shared.js'

if (globalThis.Deno?.version?.deno) {
  console.log('Deno doesn\'t support the Web Crypto API, at least not when I wrote this test...')
} else {
  await prngOutputTest(new PluggablePRNG({
    seed: {seed: 0, salt: 'Data to secure the random generator output when a weak (as in short or easy to guess) seed is used.'},
    RandomGenerator: RandomGenerator_WebCrypto,
    SeedInitializer: SeedInitializer_WebCrypto
  }), 5_000)
}

async function prngOutputTest(prng, iterations) {
  await prng.readyPromise // if set
  for (let i=0; i<iterations; i++) {
    let n = await prng.randomFloat32()
    assertMoreOrEqual(n, 0); assertLessOrEqual(n, 1)
  }
  for (let i=0; i<iterations; i++) {
    let n = await prng.randomFloat32(4)
    assertLessOrEqual(n, 4)
  }
  for (let i=0; i<iterations; i++) {
    let n = await prng.randomFloat32(5,7)
    assertMoreOrEqual(n, 5); assertLessOrEqual(n, 7)
  }
  
  for (let i=0; i<iterations; i++) {
    let n = await prng.randomFloat64()
    assertMoreOrEqual(n, 0); assertLessOrEqual(n, 1)
  }
  for (let i=0; i<iterations; i++) {
    let n = await prng.randomFloat64(4)
    assertLessOrEqual(n, 4)
  }
  for (let i=0; i<iterations; i++) {
    let n = await prng.randomFloat64(5,7)
    assertMoreOrEqual(n, 5); assertLessOrEqual(n, 7)
  }
  
  for (let i=0; i<iterations; i++) {
    let n = await prng.randomInteger(-0xFFFF_FFFF, 0xFFFF_FFFF)
    assert(Number.isInteger(n))
    assertMoreOrEqual(n, -0xFFFF_FFFF); assertLessOrEqual(n, 0xFFFF_FFFF)
  }
  for (let i=0; i<iterations; i++) {
    let n = await prng.randomInteger(0, 4)
    assert(Number.isInteger(n))
    assertMoreOrEqual(n, 0); assertLessOrEqual(n, 4)
  }
  for (let i=0; i<iterations; i++) {
    let n = await prng.randomInteger(0, Number.MAX_SAFE_INTEGER)
    assert(Number.isSafeInteger(n))
    assertMoreOrEqual(n, 0)//; assertLessOrEqual(n, Number.MAX_SAFE_INTEGER)
  }
  for (let i=0; i<iterations; i++) {
    let n = await prng.randomInteger(0, 0xFF_FFFF_FFFF)
    assert(Number.isSafeInteger(n))
    assertMoreOrEqual(n, 0); assertLessOrEqual(n, 0xFF_FFFF_FFFF)
  }
  for (let i=0; i<iterations; i++) {
    let n = await prng.randomInteger(0xFFFF_FFFF_0000, 0xFFFF_FFFF_FFFF)
    assert(Number.isSafeInteger(n))
    assertMoreOrEqual(n, 0xFFFF_FFFF_0000); assertLessOrEqual(n, 0xFFFF_FFFF_FFFF)
  }
}

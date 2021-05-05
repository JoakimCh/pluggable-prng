
import {
  PluggablePRNG,
  RandomGenerator_Alea,
  SeedInitializer_Alea,
  RandomGenerator_Mulberry32,
  RandomGenerator_Sfc32,
  RandomGenerator_Pcg32,
  SeedInitializer_Uint32,
  SeedInitializer_Uint64
} from '../source/pluggablePrng.js'

import {assert, assertMoreOrEqual, assertLessOrEqual} from './shared.js'

const prngs = [
  [
    'Alea',
    RandomGenerator_Alea,
    SeedInitializer_Alea
  ], [
    'Mulberry32',
    RandomGenerator_Mulberry32,
    SeedInitializer_Uint32
  ], [
    'Sfc32',
    RandomGenerator_Sfc32,
    SeedInitializer_Uint32
  ], [
    'Pcg32',
    RandomGenerator_Pcg32,
    SeedInitializer_Uint64
  ]
]

for (const p of prngs) {
  const prng = new PluggablePRNG({
    seed: 'test',
    RandomGenerator: p[1],
    SeedInitializer: p[2]
  })
  await prngOutputTest(p[0], prng, 200_000)
}

async function prngOutputTest(title, prng, iterations) {
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

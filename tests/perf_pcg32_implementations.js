
import {
  PluggablePRNG,
  RandomGenerator_Pcg32,
  RandomGenerator_Pcg32_alt,
  RandomGenerator_Pcg32_alt_bigint,
  SeedInitializer_Uint64,
} from '../source/pluggablePrng.js'

import {assert, assertMoreOrEqual, assertLessOrEqual} from './shared.js'

const prngs = [
  [
    'Pcg32_longfn',
    RandomGenerator_Pcg32
  ], [
    'Pcg32_Uint64',
    RandomGenerator_Pcg32_alt
  ], [
    'Pcg32_BigInt',
    RandomGenerator_Pcg32_alt_bigint
  ]
]

// Through these iterations you'll notice how the JS optimizer will eventually make some of the code much faster.
for (const iterations of [10_000, 10_000, 20_000, 20_000, 30_000, 30_000, 200_000, 200_000, 400_000, 400_000]) {
  console.log('Iterations:', iterations)
  const syncCheck = []
  for (const p of prngs) {
    const prng = new PluggablePRNG({
      seed: 'test',
      RandomGenerator: p[1],
      SeedInitializer: SeedInitializer_Uint64
    })
    await prngOutputTest(p[0], prng, iterations)
    syncCheck.push(await prng.randomUint32())
  }
  const firstValue = syncCheck[0]
  for (let i=1; i<syncCheck.length; i++) {
    if (syncCheck[i] != firstValue) throw Error('PRNG out of sync')
  }
  console.log()
}

async function prngOutputTest(title, prng, iterations) {
  await prng.readyPromise // if set
  console.time(title)
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
  console.timeEnd(title)
}

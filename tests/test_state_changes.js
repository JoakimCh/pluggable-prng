
import {
  PluggablePRNG,
  RandomGenerator_Alea,
  SeedInitializer_Alea,
  RandomGenerator_Mulberry32,
  RandomGenerator_Sfc32,
  RandomGenerator_Pcg32,
  RandomGenerator_Pcg32_alt,
  RandomGenerator_Pcg32_alt_bigint,
  SeedInitializer_Uint32,
  SeedInitializer_Uint64,
  RandomGenerator_WebCrypto,
  SeedInitializer_WebCrypto
} from '../source/pluggablePrng.js'

import {assert} from './shared.js'

const prngs = [
  [
    RandomGenerator_Alea,
    SeedInitializer_Alea
  ], [
    RandomGenerator_Mulberry32,
    SeedInitializer_Uint32
  ], [
    RandomGenerator_Sfc32,
    SeedInitializer_Uint32
  ], [
    RandomGenerator_Pcg32,
    SeedInitializer_Uint64
  ], [
    RandomGenerator_Pcg32_alt,
    SeedInitializer_Uint64
  ], [
    RandomGenerator_Pcg32_alt_bigint,
    SeedInitializer_Uint64
  ], [
    RandomGenerator_WebCrypto,
    SeedInitializer_WebCrypto
  ]
]

for (const p of prngs) {
  const prng = new PluggablePRNG({
    seed: p[0] != RandomGenerator_WebCrypto ? 'test' : {seed: 'test', salt: 'A secure salt so that we are OK with the weak seed...'},
    RandomGenerator: p[0],
    SeedInitializer: p[1]
  })
  await prngStateTest(prng, p[0])
}

async function prngStateTest(prng, rg) {
  await prng.readyPromise // if set
  let previousFloat, savedState = prng.exportState()
  for (let t=0; t<4; t++) {
    const float = await prng.randomFloat64()
    // console.log(float)
    assert(float != await prng.randomFloat64())
    if (previousFloat != undefined) assert(float, previousFloat)
    previousFloat = float
    switch (t) {
      case 0: prng.reset(); break
      case 1: prng.importState(savedState); break
      case 2: await prng.changeSeed(rg != RandomGenerator_WebCrypto ? 'test' : {seed: 'test', salt: 'A secure salt so that we are OK with the weak seed...'}); break
    }
  }
}

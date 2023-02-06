
import {
  PluggablePRNG,
  RandomGenerator_Pcg32,
  RandomGenerator_Pcg32_alt_bigint,
  SeedInitializer_Uint64
} from '../source/pluggablePrng.js'

const seedGen = new PluggablePRNG({
  RandomGenerator: RandomGenerator_Pcg32,
  SeedInitializer: SeedInitializer_Uint64
})

for (let i=0; i<50_000; i++) {
  const seed = await seedGen.randomUint32()
  const pcg32_uint64 = new PluggablePRNG({
    seed,
    RandomGenerator: RandomGenerator_Pcg32,
    SeedInitializer: SeedInitializer_Uint64
  })
  const pcg32_bigint = new PluggablePRNG({
    seed,
    RandomGenerator: RandomGenerator_Pcg32_alt_bigint,
    SeedInitializer: SeedInitializer_Uint64
  })
  const correct = await pcg32_bigint.randomUint32()
  const  uint64 = await pcg32_uint64.randomUint32()
  if (uint64 != correct) throw Error(`${correct} != ${uint64} (uint64)`)
}

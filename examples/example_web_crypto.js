
import {
  PluggablePRNG,
  RandomGenerator_WebCrypto, SeedInitializer_WebCrypto
} from 'pluggable-prng'

const log = console.log
const wideNumber = new Intl.NumberFormat('fullwide', {maximumSignificantDigits: 21})

if (globalThis.Deno?.version?.deno) {
  log('Deno doesn\'t support the Web Crypto API, at least not when I wrote this example...')
} else {
  await prngDemoOutput(new PluggablePRNG({
    seed: {seed: 0, salt: 'Data to secure the random generator output when a weak (as in short or easy to guess) seed is used.'},
    RandomGenerator: RandomGenerator_WebCrypto,
    SeedInitializer: SeedInitializer_WebCrypto
  }))
}

async function prngDemoOutput(prng, iterations=5) {
  await prng.readyPromise // if set
  log('\nrandomFloat32()')
  for (let i=0; i<iterations; i++) {
    let n = await prng.randomFloat32()
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

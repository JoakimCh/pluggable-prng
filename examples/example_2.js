
import {PluggablePRNG} from 'pluggable-prng'

const log = console.log
const wideNumber = new Intl.NumberFormat('fullwide', {maximumSignificantDigits: 21})

// A dummy generator
function d(...values) {
  let i = 0
  return new PluggablePRNG({
    RandomGenerator: class {
      randomUint32() {
        if (i == 0) {i++; return 0} // init
        if (i == values.length) i = 0
        return values[i++] >>> 0
      }
    },
  })
}

log('These functions are ran 3 times with this internal output from a dummy PRNG: [0, 0xFFFF_FFFF/2, 0xFFFF_FFFF]')
log('randomInteger(-0xFFFF_FFFF, 0)')
log(d(0).randomInteger(-0xFFFF_FFFF, 0))
log(d(0xFFFF_FFFF/2).randomInteger(-0xFFFF_FFFF, 0))
log(d(0xFFFF_FFFF).randomInteger(-0xFFFF_FFFF, 0))
log('randomInteger(0, 1)')
log(d(0).randomInteger(0, 1))
log(d(0xFFFF_FFFF/2).randomInteger(0, 1))
log(d(0xFFFF_FFFF).randomInteger(0, 1))
log('randomInteger(-2147483648, 2147483647)')
log(d(0).randomInteger(-2147483648, 2147483647))
log(d(0xFFFF_FFFF/2).randomInteger(-2147483648, 2147483647))
log(d(0xFFFF_FFFF).randomInteger(-2147483648, 2147483647))
log('randomFloat32/64(-0xFFFF_FFFF, 0)')
log(wideNumber.format(d(0).randomFloat32(-0xFFFF_FFFF, 0)))
log(wideNumber.format(d(0).randomFloat64(-0xFFFF_FFFF, 0)))
log(wideNumber.format(d(0xFFFF_FFFF/2).randomFloat32(-0xFFFF_FFFF, 0)))
log(wideNumber.format(d(0xFFFF_FFFF/2).randomFloat64(-0xFFFF_FFFF, 0)))
log(wideNumber.format(d(0xFFFF_FFFF).randomFloat32(-0xFFFF_FFFF, 0)))
log(wideNumber.format(d(0xFFFF_FFFF).randomFloat64(-0xFFFF_FFFF, 0)))
log('randomFloat32/64()')
log(wideNumber.format(d(0).randomFloat32()))
log(wideNumber.format(d(0).randomFloat64()))
log(wideNumber.format(d(0xFFFF_FFFF/2).randomFloat32()))
log(wideNumber.format(d(0xFFFF_FFFF/2).randomFloat64()))
log(wideNumber.format(d(0xFFFF_FFFF).randomFloat32()))
log(wideNumber.format(d(0xFFFF_FFFF).randomFloat64()))
log('randomFloat32/64(0, 1)')
log(wideNumber.format(d(0).randomFloat32(0, 1)))
log(wideNumber.format(d(0).randomFloat64(0, 1)))
log(wideNumber.format(d(0xFFFF_FFFF/2).randomFloat32(0, 1)))
log(wideNumber.format(d(0xFFFF_FFFF/2).randomFloat64(0, 1)))
log(wideNumber.format(d(0xFFFF_FFFF).randomFloat32(0, 1)))
log(wideNumber.format(d(0xFFFF_FFFF).randomFloat64(0, 1)))
log('randomFloat32/64(1, 2)')
log(wideNumber.format(d(0).randomFloat32(1, 2)))
log(wideNumber.format(d(0).randomFloat64(1, 2)))
log(wideNumber.format(d(0xFFFF_FFFF/2).randomFloat32(1, 2)))
log(wideNumber.format(d(0xFFFF_FFFF/2).randomFloat64(1, 2)))
log(wideNumber.format(d(0xFFFF_FFFF).randomFloat32(1, 2)))
log(wideNumber.format(d(0xFFFF_FFFF).randomFloat64(1, 2)))
log('randomBytes(4*3).reverse().buffer (ran with [0xCAFE_BABE, 0xFA51_F00D, 0xDEAD_BEEF])')
log(d(0xCAFE_BABE, 0xFA51_F00D, 0xDEAD_BEEF).randomBytes(4*3).reverse().buffer)

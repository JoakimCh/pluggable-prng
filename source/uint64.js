/*
I found this at: https://gist.github.com/Snack-X/2547242e16bca29a0b00
But I guess the original is from Google: https://github.com/google/closure-library/blob/master/closure/goog/math/long.js
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0

Additional versions found:
https://www.npmjs.com/package/long
https://www.npmjs.com/package/longfn

I (Joakim L. Christiansen) did optimize the Jaemin Noh version of this library and did a few changes, it's now contained in the class below. I couldn't make it faster than the longfn version (by Martin Heidegger), but it's API is much more comfortable. I keep it here mainly for performance comparison.

This library is not complete though...
*/
/**
 * A slower and not totally complete alternative to `longfn`...
 */
export class Uint64 {
  constructor(hiOrA=0, loOrB=0, c, d) {
    if (typeof hiOrA === 'bigint') {
      loOrB = Number( hiOrA         & 0xFFFF_FFFFn)
      hiOrA = Number((hiOrA >> 32n) & 0xFFFF_FFFFn)
    } else if (arguments.length === 1) {
      loOrB = hiOrA
      hiOrA = 0
    }
    if (typeof c === 'undefined') { // lo, hi
      this._w48 = (hiOrA >> 16) & 0xFFFF
      this._w32 =  hiOrA        & 0xFFFF
      this._w16 = (loOrB >> 16) & 0xFFFF
      this._w00 =  loOrB        & 0xFFFF
    } else {
      this._w48 = hiOrA
      this._w32 = loOrB
      this._w16 = c
      this._w00 = d
    }
  }

  // returns a copy of this instance, e.g. to not change the original
  copy() {
    return new Uint64(
      this._w48,
      this._w32,
      this._w16,
      this._w00
    )
  }

  or(other) {
    if (arguments.length === 2) {
      other = new Uint64(...arguments)
    } else if (!(other instanceof Uint64)) {
      other = new Uint64(0, other)
    }
    this._w48 |= other._w48
    this._w32 |= other._w32
    this._w16 |= other._w16
    this._w00 |= other._w00
    return this
  }

  xor(other) {
    if (arguments.length === 2) {
      other = new Uint64(...arguments)
    } else if (!(other instanceof Uint64)) {
      other = new Uint64(0, other)
    }
    this._w48 ^= other._w48
    this._w32 ^= other._w32
    this._w16 ^= other._w16
    this._w00 ^= other._w00
    return this
  }

  and(other) {
    if (arguments.length === 2) {
      other = new Uint64(...arguments)
    } else if (!(other instanceof Uint64)) {
      other = new Uint64(0, other)
    }
    this._w48 &= other._w48
    this._w32 &= other._w32
    this._w16 &= other._w16
    this._w00 &= other._w00
    return this
  }

  add(other) {
    if (arguments.length === 2) {
      other = new Uint64(...arguments)
    } else if (!(other instanceof Uint64)) {
      other = new Uint64(0, other)
    }
    this._w00 += other._w00
    this._w16 += other._w16 + (this._w00 >> 16)
    this._w32 += other._w32 + (this._w16 >> 16)
    this._w48 += other._w48 + (this._w32 >> 16)
    this._w48 &= 0xFFFF
    this._w32 &= 0xFFFF
    this._w16 &= 0xFFFF
    this._w00 &= 0xFFFF
    return  this
  }

  rshift(bits) {
    if (bits <=  0) return this//new Uint64(this._w48, this._w32, this._w16, this._w00)
    if (bits === 16) {
      this._w48 = 0
      this._w32 = this._w48
      this._w16 = this._w32
      this._w00 = this._w16
      return this//new Uint64(0, this._w48, this._w32, this._w16)
    }
    if (bits === 32) {
      this._w48 = 0
      this._w32 = 0
      this._w16 = this._w48
      this._w00 = this._w32
      return this//return new Uint64(0, 0, this._w48, this._w32)
    }
    if (bits === 48) {
      this._w48 = 0
      this._w32 = 0
      this._w16 = 0
      this._w00 = this._w48
      return this//return new Uint64(0, 0, 0, this._w48)
    }
    if (bits >= 64) {
      this._w48 = 0
      this._w32 = 0
      this._w16 = 0
      this._w00 = 0
      return this//return new Uint64(0, 0, 0, 0)
    }

    const _bits = bits % 16
    const a = (this._w48 >> _bits) & 0xFFFF
    const b = (((this._w48 & mask[_bits]) << (16 - _bits)) | (this._w32 >> _bits)) & 0xFFFF
    const c = (((this._w32 & mask[_bits]) << (16 - _bits)) | (this._w16 >> _bits)) & 0xFFFF
    const d = (((this._w16 & mask[_bits]) << (16 - _bits)) | (this._w00 >> _bits)) & 0xFFFF

    if (bits < 16) {
      this._w48 = a
      this._w32 = b
      this._w16 = c
      this._w00 = d
      return this//new Uint64(a, b, c, d)
    }
    if (bits < 32) {
      this._w48 = 0
      this._w32 = a
      this._w16 = b
      this._w00 = c
      return this//return new Uint64(0, a, b, c)
    }
    if (bits < 48) {
      this._w48 = 0
      this._w32 = 0
      this._w16 = a
      this._w00 = b
      return this//return new Uint64(0, 0, a, b)
    }
    this._w48 = 0
    this._w32 = 0
    this._w16 = 0
    this._w00 = a
    return this//return new Uint64(0, 0, 0, a)
  }

  lshift(bits) {
    if (bits <=  0) return new Uint64(this._w48, this._w32, this._w16, this._w00)
    if (bits === 16) return new Uint64(this._w32, this._w16, this._w00, 0)
    if (bits === 32) return new Uint64(this._w16, this._w00, 0, 0)
    if (bits === 48) return new Uint64(this._w00, 0, 0, 0)
    if (bits >= 64) return new Uint64(0, 0, 0, 0)

    const _bits = bits % 16
    const a = ((this._w48 << _bits) | (this._w32 >> (16 - _bits))) & 0xFFFF
    const b = ((this._w32 << _bits) | (this._w16 >> (16 - _bits))) & 0xFFFF
    const c = ((this._w16 << _bits) | (this._w00 >> (16 - _bits))) & 0xFFFF
    const d = ( this._w00 << _bits) & 0xFFFF

    if (bits < 16) return new Uint64(a, b, c, d)
    if (bits < 32) return new Uint64(b, c, d, 0)
    if (bits < 48) return new Uint64(c, d, 0, 0)
                   return new Uint64(d, 0, 0, 0)
  }

  mul(other) {
    if (arguments.length === 2) {
      other = new Uint64(...arguments)
    } else if (!(other instanceof Uint64)) {
      other = new Uint64(0, other)
    }
    // todo: check if small enough for normal mul
    const c00 = this._w00 * other._w00

    let c16 = c00 >>> 16
    c16 += this._w00 * other._w16
    let c32 = c16 >>> 16
    c16 &= 0xFFFF
    c16 += this._w16 * other._w00

    c32 += c16 >>> 16
    c32 += this._w00 * other._w32
    let c48 = c32 >>> 16
    c32 &= 0xFFFF
    c32 += this._w16 * other._w16
    c48 += c32 >>> 16
    c32 &= 0xFFFF
    c32 += this._w32 * other._w00

    c48 += c32 >>> 16
    // c48 += this._w00 * other._w48 
    //     +  this._w16 * other._w32
    //     +  this._w32 * other._w16
    //     +  this._w48 * other._w00
    c48 += this._w00 * other._w48; c48 &= 0xFFFF
    c48 += this._w16 * other._w32; c48 &= 0xFFFF
    c48 += this._w32 * other._w16; c48 &= 0xFFFF
    c48 += this._w48 * other._w00

    this._w48 = c48 & 0xFFFF
    this._w32 = c32 & 0xFFFF
    this._w16 = c16 & 0xFFFF
    this._w00 = c00 & 0xFFFF
    return this
  }

  toBigInt() {
    return BigInt((this._w00 | (this._w16 << 16)) >>> 0) | (BigInt((this._w32 | (this._w48 << 16)) >>> 0) << 32n)
  }

  toUint32(lo = true) {
    if (lo) return (this._w00 | (this._w16 << 16)) >>> 0
    return (this._w32 | (this._w48 << 16)) >>> 0
  }
}

const mask = { // used by Uint64
  1: 0x0001,
  2: 0x0003,
  3: 0x0007,
  4: 0x000f,
  5: 0x001f,
  6: 0x003f,
  7: 0x007f,
  8: 0x00ff,
  9: 0x01ff,
 10: 0x03ff,
 11: 0x07ff,
 12: 0x0fff,
 13: 0x1fff,
 14: 0x3fff,
 15: 0x7fff,
 16: 0xffff,
 32: 0xffffffff
}

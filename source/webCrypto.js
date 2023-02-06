
if (globalThis.process?.versions?.node && !('crypto' in globalThis)) {
	// this if done if the node.js version is less than 19
	globalThis['crypto'] = (await import('node:crypto')).webcrypto
	globalThis['CryptoKey'] = crypto.CryptoKey
}

/**
 * A cryptographically secure `RandomGenerator` using the Web Crypto API's AES-CTR encryption to achieve this. Designed to be used with `SeedInitializer_WebCrypto` for the generation of a secure encryption key used as its input seed. Compared to the other PRNGs it's extremely slow, depending on your usage this might be OK or NOT. Use cases could be card and casino games, etc.
 */
const bufferSize = 200_000 // buffered random uint32's
// const zeroedData = new Uint32Array(bufferSize) // no performance gain in doing this
export class RandomGenerator_WebCrypto {
	#key
  #iv = new Uint32Array(4) // 4x4 = 16 = 128-bits
  #bufferIndex = bufferSize // indicating end of buffer (forcing it to refill)
  #bufferedUint32s
  #stateJustImported
	constructor(key) {
    if (!(key instanceof CryptoKey)) throw Error('The seed must be an instance of a CryptoKey (AES-CTR).')
		this.#key = key
	}
  async #bufferRandomData(incrementCounter = true) {
    if (incrementCounter && this.#iv[0]++ == 0xFFFF_FFFF) { // increment our 128-bit counter
      this.#iv[0] = 0
      if (this.#iv[1]++ == 0xFFFF_FFFF) {
        this.#iv[1] = 0
        if (this.#iv[2]++ == 0xFFFF_FFFF) {
          this.#iv[2] = 0
          if (this.#iv[3]++ == 0xFFFF_FFFF) {
            this.#iv[3] = 0
          }
        }
      }
    }
    const encrypted = await crypto.subtle.encrypt({
      name: 'AES-CTR',
      counter: this.#iv, // the rightmost length bits of this block are used for the counter, and the rest is used for the nonce
      length: 64 // then the first half of counter is the nonce and the second half is used for the counter
    }, this.#key, new Uint32Array(bufferSize) /* zeroedData */) // encrypt zeroed data
    this.#bufferedUint32s = new Uint32Array(encrypted)
  }
	async randomUint32() {
    if (this.#bufferIndex == bufferSize) { // if more random uint32s are needed
      await this.#bufferRandomData()
      this.#bufferIndex = 0
      this.#stateJustImported = false
    } else if (this.#stateJustImported) {
      this.#stateJustImported = false
      await this.#bufferRandomData(false) // does not increment the counter in the IV
    }
    return this.#bufferedUint32s[this.#bufferIndex++]
	}
	exportState() {
		return [
      this.#key,
      new Uint32Array(this.#iv.buffer.slice(0)), // slice creates a copy
      this.#bufferIndex
    ]
	}
	importState(state) {
		this.#key = state[0]
    this.#iv = new Uint32Array(state[1].buffer.slice(0))
    this.#bufferIndex = state[2]
    this.#stateJustImported = true // so this doesn't have to be async
	}
}

/**
 * A `SeedInitializer` converting an input seed into a cryptographically secure encryption key (256-bit AES-CTR) using the Web Crypto API. Designed to be used with any `RandomGenerator` requiring such a key as its seed, mainly `RandomGenerator_WebCrypto`.
 */
export class SeedInitializer_WebCrypto {
	#seed; #salt

	constructor({seed, salt} = {}) {
		if (typeof arguments[0] != 'object') {
			this.#seed = arguments[0]
		} else {
			if (seed == undefined) throw Error('Seed must be an object like {seed, salt}.')
			this.#seed = seed
		}
		this.#salt = salt
		if (this.#seed == undefined && this.#salt == undefined) {
      this.#seed = crypto.getRandomValues(new Uint8Array(32))
		}
	}

	async seed() {
		if (typeof this.#seed == 'string') this.#seed = new TextEncoder().encode(this.#seed)
		if (typeof this.#salt == 'string') this.#salt = new TextEncoder().encode(this.#salt)
		if (typeof this.#seed == 'number') {
			if (this.#salt == undefined) {
				throw Error('If you want your seed to be a number then also include a (>= 256-bit) `salt` to ensure cryptographically secure random values. E.g. {seed, salt}.')
			}
			this.#seed = new Int32Array([(this.#seed - (this.#seed | 0)) * 2**-32, this.#seed | 0])
		} else if (this.#seed.byteLength < 32) {
			if (this.#salt == undefined) {
				throw Error('If you want to use a seed with less than 256 bits of data then also include a (>= 256-bit) `salt` to ensure cryptographically secure random values. E.g. {seed, salt}. Bits given: '+this.#seed.byteLength*8)
			}
		}
		if (this.#salt == undefined) { // if the seed is deemed secure enough and no salt was provided
			this.#salt = this.#seed // then this should be safe
		} else if (this.#salt.byteLength < 32) {
			throw Error('The salt needs to contain at least 256 bits of data to ensure cryptographically secure random values, bits given: '+this.#salt.byteLength*8)
		}
    
		const seedKey = await crypto.subtle.importKey(
			'raw', this.#seed, 'HKDF', false, ['deriveKey', 'deriveBits']
		)
		
		const salt = await crypto.subtle.deriveBits({
			name: 'HKDF',
			hash: 'SHA-256',
			salt: this.#salt,
			info: new Uint8Array()
		}, seedKey, 16)

		const cryptoKey = await crypto.subtle.deriveKey({
			name: 'HKDF',
			hash: 'SHA-256',
		  salt,
			info: new Uint8Array()
		}, seedKey, {
			name: 'AES-CTR',
			length: 256
		}, true, ['encrypt'])

		return cryptoKey
	}
}

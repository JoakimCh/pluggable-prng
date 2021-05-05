
const nodejs = (globalThis.Buffer && globalThis.process) ? process.version : undefined
if (nodejs) globalThis['crypto'] = (await import('crypto')).webcrypto

/**
 * A cryptographically secure `RandomGenerator` using the Web Crypto API's AES-CTR encryption to achieve this. Designed to be used with `SeedInitializer_WebCrypto` for the generation of a secure encryption key used as its input seed. Compared to the other PRNGs it's extremely slow, depending on your usage this might be OK or NOT. Use cases could be card and casino games, etc.
 */
export class RandomGenerator_WebCrypto {
	#key; #counter; #prevValue // these keeps the state
	constructor(key) {
    if (nodejs) {
      if (!(key instanceof crypto.CryptoKey)) throw Error('The seed must be an instance of a CryptoKey (AES-CTR).')
    } else {
      if (!(key instanceof CryptoKey)) throw Error('The seed must be an instance of a CryptoKey (AES-CTR).')
    }
		this.#key = key
		this.#counter = new Uint32Array(4)
	}
	async randomUint32() {
		// Good luck getting it to repeat, even if it does the usage of #prevValue keeps this PRNG secure.
		if (this.#counter[0]++ == 0xFFFF_FFFF) {
			this.#counter[0] = 0
			if (this.#counter[1]++ == 0xFFFF_FFFF) this.#counter[1] = 0
		}
		const encrypted = await crypto.subtle.encrypt({
			name: 'AES-CTR',
			counter: this.#counter, // (a BufferSource)
			length: this.#counter.byteLength * 8
		}, this.#key, this.#prevValue || new Uint32Array(1))

		this.#prevValue = encrypted
		return new Uint32Array(encrypted)[0]
	}
	exportState() {
		return [
      this.#key, 
      new Uint32Array(this.#counter.buffer.slice(0)), // slice creates a copy
      this.#prevValue
    ]
	}
	importState(state) {
		this.#key       = state[0]
    this.#counter   = new Uint32Array(state[1].buffer.slice(0))
    this.#prevValue = state[2]
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

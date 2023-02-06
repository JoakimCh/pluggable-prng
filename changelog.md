# Changelog

Changelog for the [pluggable-prng](https://www.npmjs.com/package/pluggable-prng) NPM package.

## v2.1.0 - 2023.02.06:

### Added

* `RandomGenerator_IronWellons32`. [More info here.](https://github.com/skeeto/hash-prospector#two-round-functions) A contribution by [Pimm](https://github.com/Pimm).

* `RandomGenerator_WellonsTriple32`. [More info here.](https://github.com/skeeto/hash-prospector#three-round-functions).

### Fixed

* `RandomGenerator_WebCrypto` now works with Node.js >= v19.

### Changed

* A backwards compatible change to `randomInteger` now allows it to be used similar to `randomFloat` with all arguments optional. If supplied just one argument it will now be used as the max integer size; meaning it will generate an integer from 0 up to that size.

### Removed

* The PCG32 implementation using `longfn.js` since the `uint64.js` version is just as fast.
* The `longfn.js` library (which was 28 KB we didn't need).

## v2.0.0 - 2021.09.06:

### Changed

* Optimized the performance of `RandomGenerator_WebCrypto` by encrypting more data at each call to `crypto.subtle.encrypt` and buffering it for later calls to `randomUint32`. It's now 5110% faster! This change makes it incompatible with previously exported states, hence I upped the version number to 2.0.0.

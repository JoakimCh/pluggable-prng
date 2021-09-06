# Changelog

Changelog for the [pluggable-prng](https://www.npmjs.com/package/pluggable-prng) NPM package.

## v2.0.0 - 2021.09.06:

### Changed

* Optimized the performance of `RandomGenerator_WebCrypto` by encrypting more data at each call to `crypto.subtle.encrypt` and buffering it for later calls to `randomUint32`. It's now 5110% faster! This change makes it incompatible with previously exported states, hence I upped the version number to 2.0.0.

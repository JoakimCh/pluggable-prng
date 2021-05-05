
export const nodejs = (globalThis.Buffer && globalThis.process) ? process.version : undefined
export const deno = globalThis.Deno?.version?.deno
export const browser = globalThis.navigator?.userAgent

export const platform = (()=>{
  if (deno) return 'Deno'
  if (browser) return 'Browser'
  if (nodejs) return 'Node.js'
})()
export const platformVersion = deno || browser || nodejs

export function assert(...arg) {
  switch (arg.length) {
    case 1: if (!arg[0]) throw Error('Assertion failed!'); break
    case 2:
    case 3: if (arg[0] !== arg[1]) throw Error(arg[0]+' !== '+arg[1]+' '+(arg[2] || 'Assertion failed!')); break
  }
}
export function assertMore(v, t) {
  if (!(v > t)) throw Error(v+' is not more than '+t)
}
export function assertLess(v, t) {
  if (!(v < t)) throw Error(v+' is not less than '+t)
}
export function assertMoreOrEqual(v, t) {
  if (!(v >= t)) throw Error(v+' is not more than '+t)
}
export function assertLessOrEqual(v, t) {
  if (!(v <= t)) throw Error(v+' is not less than '+t)
}

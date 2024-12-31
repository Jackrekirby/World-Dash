import { warnOnce } from './single_log'

export const WeightedRandom = (r: number, weights: number[]): number => {
  let t = 0
  for (let i = 0; i < weights.length; i++) {
    t += weights[i]
    if (r < t) {
      return i
    }
  }
  return weights.length
}

export const WeightedRandomCallbacks = (
  r: number,
  weightedCallbacks: { weight: number; callback: () => void }[]
): void => {
  let t = 0
  for (let i = 0; i < weightedCallbacks.length; i++) {
    const wc = weightedCallbacks[i]
    t += wc.weight
  }
  if (t.toFixed(3) !== '1.000') {
    warnOnce(
      'WeightedRandomCallbacks',
      `total weights not equal to 1.000: ${t}`
    )
  }
  t = 0
  for (let i = 0; i < weightedCallbacks.length; i++) {
    const wc = weightedCallbacks[i]
    t += wc.weight
    if (r < t) {
      wc.callback()
      return
    }
  }
  weightedCallbacks.at(-1)?.callback()
}

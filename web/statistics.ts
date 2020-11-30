import * as stats from 'simple-statistics'

const DEFAULT_CONFIDENCE: number = 0.95
const memoizedZ: number = stats.probit(1-(1-DEFAULT_CONFIDENCE)/2);

// https://medium.com/@gattermeier/calculating-better-rating-scores-for-things-voted-on-7fa3f632c79d
export function lower_bound_wilson(upvotes: number, n: number = 0, confidence: number = 0.95): number {
  if (n === 0) return 0

  // for performance purposes you might consider memoize the calcuation for z
  // const z = stats.probit(1-(1-confidence)/2)
  const z = memoizedZ

  // p̂, the fraction of upvotes
  const phat = 1.0 * upvotes / n

  return (phat + z*z / (2*n) - z * Math.sqrt((phat * (1 - phat) + z*z / (4*n)) / n)) / (1 + z*z/n)
}

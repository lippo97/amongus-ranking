import stats from 'simple-statistics'

function lower_bound_wilson(upvotes, n = 0, confidence = 0.95):number {
  if (n === 0) return 0

  // for performance purposes you might consider memoize the calcuation for z
  const z = stats.probit(1-(1-confidence)/2)

  // p̂, the fraction of upvotes
  const phat = 1.0 * upvotes / n

  return (phat + z*z / (2*n) - z * Math.sqrt((phat * (1 - phat) + z*z / (4*n)) / n)) / (1 + z*z/n)
}
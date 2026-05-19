export interface ForecastPoint {
  year: number
  amount: number
  invested: number
  gains: number
}

/**
 * Calculates wealth forecast based on compound interest.
 * 
 * @param startAmount Initial balance
 * @param monthlyAddition Amount added every month
 * @param annualReturn Annual percentage return (e.g., 15 for 15%)
 * @param years Number of years to forecast
 * @param inflation Annual inflation rate (optional, defaults to 0)
 * @returns Array of forecast points for each year
 */
export function calculateWealthForecast(
  startAmount: number,
  monthlyAddition: number,
  annualReturn: number,
  years: number,
  inflation: number = 0
): ForecastPoint[] {
  const points: ForecastPoint[] = []
  let currentBalance = startAmount
  let totalInvested = startAmount
  
  const monthlyRate = annualReturn / 100 / 12
  const monthlyInflation = inflation / 100 / 12

  // Initial state (Year 0)
  points.push({
    year: 0,
    amount: Math.round(currentBalance),
    invested: Math.round(totalInvested),
    gains: 0
  })

  for (let y = 1; y <= years; y++) {
    for (let m = 0; m < 12; m++) {
      // Compound monthly
      currentBalance = (currentBalance + monthlyAddition) * (1 + monthlyRate)
      
      // Adjust for inflation if needed (real wealth)
      if (inflation > 0) {
        currentBalance = currentBalance / (1 + monthlyInflation)
      }
      
      totalInvested += monthlyAddition
    }

    points.push({
      year: y,
      amount: Math.round(currentBalance),
      invested: Math.round(totalInvested),
      gains: Math.round(currentBalance - totalInvested)
    })
  }

  return points
}

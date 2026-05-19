export function calculateScore(uom: string, target: number, actual: number): number {
  if (actual === undefined || actual === null) return 0;
  
  let score = 0;
  switch (uom) {
    case 'Numeric_Min':
    case 'Percent_Min':
      // Higher is better: Achievement / Target
      score = target > 0 ? (actual / target) * 100 : 0;
      break;
    case 'Numeric_Max':
    case 'Percent_Max':
      // Lower is better: Target / Achievement
      score = actual > 0 ? (target / actual) * 100 : (actual === 0 && target >= 0 ? 100 : 0);
      break;
    case 'Zero':
      // Zero is success
      score = actual === 0 ? 100 : 0;
      break;
    default:
      // Fallback for Timeline (mocked as percentage completion for now)
      score = actual > 100 ? 100 : actual; 
  }
  return Math.min(Math.max(Math.round(score), 0), 100);
}

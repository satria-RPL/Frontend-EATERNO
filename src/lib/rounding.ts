export function calculateRounding(baseTotal: number, step = 500) {
  if (!Number.isFinite(baseTotal) || !Number.isFinite(step) || step <= 0) {
    return { roundedTotal: baseTotal, rounding: 0 };
  }
  const roundedTotal = Math.round(baseTotal / step) * step;
  return {
    roundedTotal,
    rounding: roundedTotal - baseTotal,
  };
}

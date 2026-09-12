export function estimatedWattage(cpuTdp: number, gpuTdp: number): number {
  return Math.ceil((cpuTdp + gpuTdp + 150) * 1.3);
}

export function recommendedPsu(watt: number): number {
  const sizes = [450, 550, 650, 750, 850, 1000];
  return sizes.find((s) => s >= watt) ?? 1000;
}

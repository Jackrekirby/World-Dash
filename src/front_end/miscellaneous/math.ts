export const clamp = (min: number, max: number, value: number) => {
  return Math.max(min, Math.min(max, value))
}

export const linInterp = (
  i0: number,
  i1: number,
  v0: number,
  v1: number,
  v: number
) => {
  return i0 + (i1 - i0) * ((v - v0) / (v1 - v0))
}

export const GenIntsToFloat = (f: number): number[] => {
  const values: number[] = []
  for (let x = 0; x < f; x++) {
    values.push(x)
  }
  values.push(f)
  return values
}

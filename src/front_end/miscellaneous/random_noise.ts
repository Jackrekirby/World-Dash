import { Pos2D } from './types'

export const CreateRandomNoise2D = (): ((p: Pos2D) => number) => {
  const values: number[] = []
  const n = 64
  for (let y = -n; y < n; y++) {
    for (let x = -n; x < n; x++) {
      values.push(Math.random())
    }
  }

  return (p: Pos2D): number => {
    return values[p.x + n + (p.y + n) * (2 * n)]
  }
}

// singleton...
export const SurfaceNoise = CreateRandomNoise2D()

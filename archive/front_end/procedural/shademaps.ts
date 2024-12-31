import { Pos2D, Pos3D } from '../miscellaneous/types'

export const RunShadeMap = () => {
  ShadeMap()
}

const ShadeMap = () => {
  const shademap: number[][] = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  ]
  if (shademap.length !== 17) {
    throw new Error('Shademap must be 17 in height')
  }
  for (const row of shademap) {
    if (row.length !== 16) {
      throw new Error('Shademap must be 16 in width')
    }
  }
}

export const PixelMapManager = () => {
  const [w, h] = [16, 17]

  const FormatPixelMap = (map: number[][]): number[] => {
    if (map.length !== h) {
      throw new Error('map must be 17 in height')
    }
    for (const row of map) {
      if (row.length !== w) {
        throw new Error('map must be 16 in width')
      }
    }
    return map.flat()
  }

  const pixelMapZ = FormatPixelMap(
    (() => {
      const a = 10
      return [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, a, a, a, a, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, a, a, a, a, a, a, a, a, 0, 0, 0, 0],
        [0, 0, a, a, a, a, a, a, a, a, a, a, a, a, 0, 0],
        [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a],
        [9, 9, a, a, a, a, a, a, a, a, a, a, a, a, 9, 9],
        [8, 8, 9, 9, a, a, a, a, a, a, a, a, 9, 9, 8, 8],
        [7, 7, 8, 8, 9, 9, a, a, a, a, 9, 9, 8, 8, 7, 7],
        [6, 6, 7, 7, 8, 8, 9, 9, 9, 9, 8, 8, 7, 7, 6, 6],
        [5, 5, 6, 6, 7, 7, 8, 8, 8, 8, 7, 7, 6, 6, 5, 5],
        [4, 4, 5, 5, 6, 6, 7, 7, 7, 7, 6, 6, 5, 5, 4, 4],
        [3, 3, 4, 4, 5, 5, 6, 6, 6, 6, 5, 5, 4, 4, 3, 3],
        [2, 2, 3, 3, 4, 4, 5, 5, 5, 5, 4, 4, 3, 3, 2, 2],
        [1, 1, 2, 2, 3, 3, 4, 4, 4, 4, 3, 3, 2, 2, 1, 1],
        [0, 0, 1, 1, 2, 2, 3, 3, 3, 3, 2, 2, 1, 1, 0, 0],
        [0, 0, 0, 0, 1, 1, 2, 2, 2, 2, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0]
      ]
    })()
  )

  const pixelMapXY = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 1, 2, 2, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 0, 0, 0, 0],
    [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 0, 0],
    [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8],
    [1, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 8, 8],
    [1, 2, 3, 4, 5, 5, 6, 6, 7, 7, 8, 8, 8, 8, 8, 8],
    [1, 2, 3, 4, 5, 6, 7, 7, 8, 8, 8, 8, 8, 8, 8, 8],
    [1, 2, 3, 4, 5, 6, 7, 8, 8, 8, 8, 8, 8, 8, 8, 8],
    [1, 2, 3, 4, 5, 6, 7, 8, 8, 8, 8, 8, 8, 8, 8, 8],
    [1, 2, 3, 4, 5, 6, 7, 8, 8, 8, 8, 8, 8, 8, 8, 8],
    [1, 2, 3, 4, 5, 6, 7, 8, 8, 8, 8, 8, 8, 8, 8, 8],
    [1, 2, 3, 4, 5, 6, 7, 8, 8, 8, 8, 8, 8, 8, 8, 8],
    [1, 2, 3, 4, 5, 6, 7, 8, 8, 8, 8, 8, 8, 8, 8, 8],
    [0, 0, 3, 4, 5, 6, 7, 8, 8, 8, 8, 8, 8, 8, 0, 0],
    [0, 0, 0, 0, 5, 6, 7, 8, 8, 8, 8, 8, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 7, 8, 8, 8, 0, 0, 0, 0, 0, 0]
  ]

  const pixelMapX = FormatPixelMap(pixelMapXY)
  // Y map is a reflection of X along the vertical axis
  const pixelMapY = FormatPixelMap(pixelMapXY.map(row => row.slice().reverse()))

  const GetMatchingPositions = ({
    x = [],
    y = [],
    z = []
  }: {
    x: number[]
    y: number[]
    z: number[]
  }): Pos2D[] => {
    // find positions that contain indexes along each axis
    const n = w * h
    const matchingPixels: boolean[] = Array(n).fill(true)
    const AddMatchingPixels = (indices: number[], pixelMap: number[]) => {
      if (indices.length === 0) {
        return
      }
      for (let i = 0; i < n; i++) {
        const w = pixelMap[i]
        if (!indices.includes(w)) {
          matchingPixels[i] = false
        }
      }
    }
    AddMatchingPixels(x, pixelMapX)
    AddMatchingPixels(y, pixelMapY)
    AddMatchingPixels(z, pixelMapZ)

    const matchingPositions: Pos2D[] = []
    for (let i = 0; i < n; i++) {
      if (matchingPixels[i]) {
        matchingPositions.push({ x: i % w, y: Math.floor(i / w) })
      }
    }
    return matchingPositions
  }

  const GetPixelPositions = (): Pos3D[] => {
    const n = w * h
    const p: Pos3D[] = []
    for (let i = 0; i < n; i++) {
      p.push({ x: pixelMapX[i], y: pixelMapY[i], z: pixelMapZ[i] })
    }
    return p
  }

  const GetPixelMapX = (): number[] => {
    return pixelMapX
  }
  const GetPixelMapY = (): number[] => {
    return pixelMapY
  }

  const GetPixelMapZ = (): number[] => {
    return pixelMapZ
  }

  return {
    // GetMatchingPositions,
    GetPixelPositions
    // GetPixelMapX,
    // GetPixelMapY,
    // GetPixelMapZ
  }
}

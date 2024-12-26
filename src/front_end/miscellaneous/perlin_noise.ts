export interface PerlinNoise {
  noise: ({
    x,
    y,
    octaves
  }: {
    x: number
    y: number
    octaves?: number
  }) => number
}

export const CreatePerlinNoise = (): PerlinNoise => {
  const _p: number[] = []
  const _permutation: number[] = []

  const initialise = () => {
    // Initialize the permutation table
    for (let i = 0; i < 256; i++) {
      _p[i] = Math.floor(Math.random() * 256)
    }

    // Duplicate the permutation table
    for (let i = 0; i < 256; i++) {
      _permutation[i] = _p[i % 256]
    }
  }

  // Fade function to smooth the interpolation
  const fade = (t: number): number => {
    return t * t * t * (t * (t * 6 - 15) + 10)
  }

  // Dot product of the gradient and the distance vector
  const grad = (hash: number, x: number, y: number): number => {
    const h = hash & 15 // Determine which gradient to use
    const u = h < 8 ? x : y
    const v = h < 4 ? y : h === 12 || h === 14 ? x : 0
    return (h & 1 ? -u : u) + (h & 2 ? -v : v)
  }

  const lerp = (a: number, b: number, t: number): number => {
    return a + t * (b - a)
  }

  const noise = (x: number, y: number): number => {
    const X = Math.floor(x) & 255 // Calculate grid cell coordinates
    const Y = Math.floor(y) & 255
    x -= Math.floor(x) // Relative position in grid cell
    y -= Math.floor(y)
    const u = fade(x) // Fade the x coordinate
    const v = fade(y) // Fade the y coordinate

    // Hash coordinates of the 4 corners
    const a = _permutation[X] + Y
    const aa = _permutation[a]
    const ab = _permutation[a + 1]
    const b = _permutation[X + 1] + Y
    const ba = _permutation[b]
    const bb = _permutation[b + 1]

    // Interpolate between gradients at the four corners
    const x1 = lerp(grad(aa, x, y), grad(ba, x - 1, y), u)
    const x2 = lerp(grad(ab, x, y - 1), grad(bb, x - 1, y - 1), u)
    return lerp(x1, x2, v) // Final interpolation
  }

  const layeredNoise = ({
    x,
    y,
    octaves = 1
  }: {
    x: number
    y: number
    octaves?: number
  }): number => {
    let total = 0
    let frequency = 1
    let amplitude = 1

    for (let i = 0; i < octaves; i++) {
      total += noise(x * frequency, y * frequency) * amplitude
      frequency *= 2
      amplitude *= 0.5
    }
    return total
  }

  initialise()

  return {
    noise: layeredNoise
  }
}

export const NoiseManager = () => {
  const noiseCollection: Map<string, PerlinNoise> = new Map([])

  const GetNoise = (key: string): PerlinNoise => {
    if (!noiseCollection.has(key)) {
      noiseCollection.set(key, CreatePerlinNoise())
    }
    return noiseCollection.get(key) as PerlinNoise
  }

  return {
    GetNoise
  }
}

// singleton...
export const NOISE_MANAGER = NoiseManager()

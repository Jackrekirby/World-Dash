console.log('Isometric')

interface Elements {
  canvas: HTMLCanvasElement
  toggleGrid: HTMLDivElement
}

interface Position {
  x: number
  y: number
}

const elementIds: (keyof Elements)[] = ['canvas', 'toggleGrid']

const GetElements = (): Elements => {
  const elements: { [key: string]: HTMLElement | null } = Object.fromEntries(
    elementIds.map(id => [id, document.getElementById(id)])
  )
  const nullElements = Object.keys(elements).filter(id => elements[id] === null)
  if (nullElements.length > 0) {
    throw new Error(`Failed to find all elements by id ${nullElements}`)
  }
  return elements as unknown as Elements
}

const LoadImage = async (src: string): Promise<HTMLImageElement> => {
  const image = new Image()
  image.src = src

  return new Promise((resolve, reject) => {
    image.onload = () => resolve(image)
    image.onerror = err => reject(new Error(`Failed to load image at ${src}`))
  })
}

class PerlinNoise {
  private p: number[]
  private permutation: number[]

  constructor () {
    // Initialize the permutation table
    this.p = []
    for (let i = 0; i < 256; i++) {
      this.p[i] = Math.floor(Math.random() * 256)
    }

    // Duplicate the permutation table
    this.permutation = []
    for (let i = 0; i < 256; i++) {
      this.permutation[i] = this.p[i % 256]
    }
  }

  // Fade function to smooth the interpolation
  private fade (t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10)
  }

  // Dot product of the gradient and the distance vector
  private grad (hash: number, x: number, y: number): number {
    const h = hash & 15 // Determine which gradient to use
    const u = h < 8 ? x : y
    const v = h < 4 ? y : h === 12 || h === 14 ? x : 0
    return (h & 1 ? -u : u) + (h & 2 ? -v : v)
  }

  // Perlin noise function for 2D
  public noise (x: number, y: number): number {
    const X = Math.floor(x) & 255 // Calculate grid cell coordinates
    const Y = Math.floor(y) & 255
    x -= Math.floor(x) // Relative position in grid cell
    y -= Math.floor(y)
    const u = this.fade(x) // Fade the x coordinate
    const v = this.fade(y) // Fade the y coordinate

    // Hash coordinates of the 4 corners
    const a = this.permutation[X] + Y
    const aa = this.permutation[a]
    const ab = this.permutation[a + 1]
    const b = this.permutation[X + 1] + Y
    const ba = this.permutation[b]
    const bb = this.permutation[b + 1]

    // Interpolate between gradients at the four corners
    const x1 = this.lerp(this.grad(aa, x, y), this.grad(ba, x - 1, y), u)
    const x2 = this.lerp(
      this.grad(ab, x, y - 1),
      this.grad(bb, x - 1, y - 1),
      u
    )
    return this.lerp(x1, x2, v) // Final interpolation
  }

  // Linear interpolation function
  private lerp (a: number, b: number, t: number): number {
    return a + t * (b - a)
  }

  public noise2 = (x: number, y: number): number => {
    const octaves = 4
    let total = 0
    let frequency = 1
    let amplitude = 1

    for (let i = 0; i < octaves; i++) {
      total += this.noise(x * frequency, y * frequency) * amplitude
      frequency *= 2
      amplitude *= 0.5
    }
    return total
  }
}

const Renderer = async () => {
  const canvas = elements.canvas

  // Initialise
  const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Failed to get 2D context')
  }

  const [width, height] = [canvas.width, canvas.height]

  ctx.imageSmoothingEnabled = false

  const scale = 4
  const sts = 16 // source tile size
  const dts = sts * scale // destination tile size

  const image = await LoadImage('assets/Isometric_MedievalFantasy_Tiles.png')
  const entities = await LoadImage(
    'assets/IsometricTRPGAssetPack_OutlinedEntities.png'
  )
  const mapIndicators = await LoadImage(
    'assets/IsometricTRPGAssetPack_MapIndicators2.png'
  )

  // Member Functions

  const DrawLine = (x0: number, y0: number, x1: number, y1: number) => {
    ctx.beginPath()
    ctx.moveTo(x0, y0)
    ctx.lineTo(x1, y1)
    ctx.stroke()
  }

  const DrawIsometricGrid = () => {
    ctx.lineWidth = 1

    ctx.strokeStyle = 'hsla(0, 0%, 50%, 0.5)'
    for (let x = 0; x < width; x += dts) {
      DrawLine(x, 0, x, height)
    }
    for (let y = 0; y < height; y += dts) {
      DrawLine(0, y, width, y)
    }

    ctx.strokeStyle = 'hsl(0, 0%, 100%, 0.5)'
    for (let x = dts / 2; x < width; x += dts) {
      DrawLine(x, 0, x, height)
    }
    for (let y = dts / 2; y < height; y += dts) {
      DrawLine(0, y, width, y)
    }

    for (let y = -dts; y < height; y += dts) {
      for (let x = -dts; x < width; x += dts) {
        ctx.strokeStyle = 'hsla(200, 100%, 80%, 0.5)'
        DrawLine(x, y, x + 2 * dts, y + dts)

        ctx.strokeStyle = 'hsla(100, 100%, 80%, 0.5)'
        DrawLine(x, y + dts, x + 2 * dts, y)
      }
    }
  }

  const heightOverflow = 1 // pixel

  const WorldToCanvasPosition = ({
    x,
    y,
    z
  }: {
    x: number
    y: number
    z: number
  }): { x: number; y: number } => {
    const p0 = {
      // destination x & y origin (centre)
      x: (width - dts) / 2,
      y: (height - dts) / 2 - heightOverflow * scale
    }
    const p = {
      x: p0.x - (x * dts) / 2 + (y * dts) / 2,
      y: p0.y + (x * dts) / 4 + (y * dts) / 4 - (z * dts) / 2
    }
    return p
  }

  const CanvasToWorldPosition = ({
    cx,
    cy,
    wz
  }: {
    cx: number
    cy: number
    wz: number // must specify world z
  }): { x: number; y: number } => {
    // EQ.1
    // _x =  p0.x - (x * dts) / 2 + (y * dts) / 2,
    // 2/dts * (_x - p0.x)  = - x + y

    // EQ.2
    // _y = p0.y + (x * dts) / 4 + (y * dts) / 4 - (z * dts) / 2
    // 4/dts * (_y - p0.y) + 2*z = x + y

    // 2*y = EQ.1 + EQ.2
    // 2*y = 2/dts * (_x - p0.x) + 4/dts * (_y - p0.y) + 2*z
    // y =  1/dts * (_x - p0.x) + 2/dts * (_y - p0.y) + z
    // y = 1/dts * (_x - p0.x + 2 * (_y - p0.y)) + z

    // 2*x = - EQ.1 + EQ.2
    // 2*x = - 2/dts * (_x - p0.x) + 4/dts * (_y - p0.y) + 2*z
    // x = - 1/dts * (_x - p0.x) + 2/dts * (_y - p0.y) + z
    // x = 1/dts * (p0.x - _x + 2 * (_y - p0.y)) + z

    const [sw, sh] = [sts, sts + heightOverflow]

    cx = cx - dts / 2
    cy = cy - dts / 2

    const p0 = {
      // destination x & y origin (centre)
      x: (width - dts) / 2,
      y: (height - dts) / 2 - heightOverflow * scale
    }
    const p = {
      x: (1 / dts) * (p0.x - cx + 2 * (cy - p0.y)) + wz + 0.5,
      y: (1 / dts) * (cx - p0.x + 2 * (cy - p0.y)) + wz + 0.5
    }

    return p
  }

  const DrawIsometricTile = (
    wx: number,
    wy: number,
    wz: number,
    ti: number,
    tj: number,
    image: HTMLImageElement
  ) => {
    //  /  \
    // x    y
    // w = world x, y & z
    // ti, tj = tile index in x & y

    const [sw, sh] = [sts, sts + heightOverflow] // source width & height (+1 = tile overflow)
    const [sx, sy] = [ti * sw, tj * sh] // source x & y
    const [dw, dh] = [sw * scale, sh * scale] // destination width & height

    const [dx0, dy0] = [
      // destination x & y origin (centre)
      (width - dts) / 2,
      (height - dts) / 2 - heightOverflow * scale
    ]

    const [dx, dy] = [
      // destination x & y
      dx0 - (wx * dts) / 2 + (wy * dts) / 2,
      dy0 + (wx * dts) / 4 + (wy * dts) / 4 - (wz * dts) / 2
    ]

    const d = WorldToCanvasPosition({ x: wx, y: wy, z: wz })

    ctx.drawImage(image, sx, sy, sw, sh, d.x, d.y, dw, dh)
  }

  interface Tile {
    position: Position
    z: number
    tx: number
    ty: number
  }

  interface TileMap {
    dirt: Position
    grass: Position
    stone: Position
    sand: Position
    water: Position
    plant: Position
    cactus: Position
    log: Position
    canopy: Position
    dryGrass: Position
    smallStones: Position
    largeStones: Position
    lava: Position
  }

  const tileMap: TileMap = {
    dirt: { x: 0, y: 0 },
    grass: { x: 1, y: 0 },
    stone: { x: 2, y: 0 },
    sand: { x: 3, y: 0 },
    water: { x: 7, y: 0 },
    plant: { x: 10, y: 0 },
    cactus: { x: 8, y: 1 },
    log: { x: 8, y: 3 },
    canopy: { x: 7, y: 3 },
    dryGrass: { x: 3, y: 2 },
    smallStones: { x: 8, y: 0 },
    largeStones: { x: 9, y: 0 },
    lava: { x: 2, y: 3 }
  }

  const GenerateTiles = (): Tile[] => {
    const perlin = new PerlinNoise()
    const perlin2 = new PerlinNoise()

    const n = 12
    const positions: Position[] = []
    for (let y = -n; y <= n; y += 1) {
      for (let x = -n; x <= n; x += 1) {
        positions.push({ x, y })
      }
    }
    // console.log(positions)

    positions.sort((a, b) => {
      const aw = a.x + a.y
      const bw = b.x + b.y
      return aw - bw
    })

    const tiles: Tile[] = []

    const offset = n
    for (const p of positions) {
      let frequency = 16
      const z = perlin.noise2(
        (p.x + offset) / frequency,
        (p.y + offset) / frequency
      )

      frequency = 8
      const z2 = perlin2.noise2(
        (p.x + offset) / frequency,
        (p.y + offset) / frequency
      )

      let tilename: keyof TileMap = 'grass'

      //   console.log(z)
      const borderDistance = 8 + z2
      if (Math.abs(p.x) > borderDistance || Math.abs(p.y) > borderDistance) {
        tilename = 'water'
      } else if (z < -0.2) {
        tilename = 'water'
      } else if (z < -0.1) {
        tilename = 'sand'
      } else if (z < 0) {
        tilename = 'dirt'
      } else if (z < 0.2) {
        tilename = 'dryGrass'
      } else if (z < 0.4) {
        tilename = 'grass'
      } else if (z < 0.7) {
        tilename = 'stone'
      } else if (z < 1.0) {
        tilename = 'lava'
      }

      let t = tileMap[tilename]

      // const z = Math.floor(Math.random() < 1.0 ? 0 : 1)
      //   const tx = Math.floor(
      //     Math.pow((perlin.noise2(p.x / n, p.y / n) + 1) / 2, 2) * 5
      //   )
      //   const z = 1 + Math.floor(perlin.noise2(p.x / n + 1, p.y / n + 1))
      // console.log(p.x, p.y, )
      //   const tx = Math.floor(Math.pow(Math.random(), 3) * 5)
      let wz = 0
      if (tilename === 'water') {
        wz = 0
      } else if (z < 0.2) {
        wz = 0
      } else if (z < 0.4) {
        wz = 1
      } else if (z < 1.0) {
        wz = 2
      }
      for (let zz = 0; zz <= wz; zz++) {
        tiles.push({ position: p, z: zz, tx: t.x, ty: t.y })
      }

      if (tilename === 'grass') {
        const r = Math.random()
        if (r < 0.1) {
          t = tileMap['plant']
          tiles.push({ position: p, z: wz + 1, tx: t.x, ty: t.y })
        } else if (r < 0.15) {
          t = tileMap['log']
          tiles.push({ position: p, z: wz + 1, tx: t.x, ty: t.y })
          t = tileMap['canopy']
          tiles.push({ position: p, z: wz + 2, tx: t.x, ty: t.y })
        } else if (z > 0.3 && Math.random() > 0.9) {
          t = tileMap['smallStones']
          tiles.push({ position: p, z: wz + 1, tx: t.x, ty: t.y })
        }
      } else if (tilename === 'sand' && Math.random() > 0.9) {
        t = tileMap['cactus']
        tiles.push({ position: p, z: wz + 1, tx: t.x, ty: t.y })
      } else if (tilename === 'stone' && Math.random() > 0.95) {
        t = tileMap['largeStones']
        tiles.push({ position: p, z: wz + 1, tx: t.x, ty: t.y })
      }
    }

    // console.log(tiles)

    return tiles
  }

  let cursorWorldPosition: { x: number; y: number; z: number } | null = null

  const RenderLoop = (time: DOMHighResTimeStamp, tiles: Tile[]) => {
    ctx.clearRect(0, 0, width, height)

    for (const t of tiles) {
      DrawIsometricTile(t.position.x, t.position.y, t.z, t.tx, t.ty, image)
    }

    if (cursorWorldPosition !== null) {
      //   console.log('here2', cursorWorldPosition)
      //   console.log(cursorWorldPosition)
      DrawIsometricTile(
        cursorWorldPosition.x,
        cursorWorldPosition.y,
        cursorWorldPosition.z,
        0,
        0,
        mapIndicators
      )
    }

    DrawIsometricTile(0, 0, 1, time % 1000 < 500 ? 0 : 1, 0, entities)

    // DrawIsometricTile(0, 0, 0, 0, 0, image)

    if (showGrid) {
      DrawIsometricGrid()
    }

    requestAnimationFrame(time => {
      RenderLoop(time, tiles)
    })
  }

  const tiles: Tile[] = GenerateTiles()

  canvas.addEventListener('mousemove', (event: MouseEvent) => {
    const m = { x: event.offsetX, y: event.offsetY }

    cursorWorldPosition = null
    for (let wz = 1; wz >= 0; wz--) {
      let w = CanvasToWorldPosition({ cx: m.x, cy: m.y, wz })
      //   console.log(w.x, w.y)
      w = { x: Math.round(w.x), y: Math.round(w.y) }

      const tile: Tile | undefined = tiles.find(
        tile =>
          tile.position.x === w.x && tile.position.y === w.y && tile.z === wz
      )
      if (tile !== undefined) {
        // console.log(w.x, w.y, wz)
        cursorWorldPosition = { x: w.x, y: w.y, z: wz }
        break
      }
    }
  })

  let showGrid = true
  //   elements.toggleGrid.onclick = () => {
  //     showGrid = !showGrid
  //   }

  CyclicButtonManager(
    ['Grid On', 'Grid Off'],
    'Grid On',
    'toggleGrid',
    (value: string) => {
      showGrid = value === 'Grid On'
      console.log(value, showGrid)
    }
  )

  requestAnimationFrame(time => {
    RenderLoop(time, tiles)
  })
}

const GetLocalStorageItem = (key: string, defaultValue: string): string => {
  const value = localStorage.getItem(key)
  if (value === null) {
    localStorage.setItem(key, defaultValue)
    return defaultValue
  } else {
    return value
  }
}

const CyclicButtonManager = (
  values: string[],
  defaultValue: string,
  name: keyof Elements,
  onChangeCallback: (value: string) => void
) => {
  const element = elements[name] as HTMLElement // also display element

  const storageKey = name

  const Initialise = () => {
    const value = GetLocalStorageItem(storageKey, defaultValue)
    element.textContent = value
    onChangeCallback(value)
  }
  Initialise()

  const CycleCounter = () => {
    let value = element.textContent
    const index = values.findIndex(other => other === value)
    const nextIndex = (index + 1) % values.length
    value = values[nextIndex]

    element.textContent = value
    localStorage.setItem(storageKey, value)
    onChangeCallback(value)
  }

  element.onclick = () => CycleCounter()
}

const elements = GetElements()
const main = async () => {
  const canvas = elements.canvas
  canvas.width = 512
  canvas.height = 512

  const renderer = Renderer()
}

main()

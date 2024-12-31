import { elements } from '../dom/elements'
import { Pos2D } from '../miscellaneous/types'
import { LoadImage } from '../renderer/main'
import { PixelMapManager } from './shademaps'

const WeightedRandom = (r: number, weights: number[]): number => {
  let t = 0
  for (let i = 0; i < weights.length; i++) {
    t += weights[i]
    if (r < t) {
      return i
    }
  }
  return weights.length
}

export const GenerateProceduralGrassTextures = () => {
  const canvas: HTMLCanvasElement = elements.canvas

  const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Failed to get 2D context')
  }

  const [width, height] = [canvas.width, canvas.height]

  const numOfTiles = 2
  const tilesize = 16
  const unscaledHeight = tilesize * numOfTiles
  const scale = 512 / unscaledHeight

  const [w, h] = [width / scale, height / scale]

  const ClearCanvas = (): void => {
    ctx.clearRect(0, 0, width, height)
  }

  ClearCanvas()

  ctx.fillStyle = 'hsla(89, 53%, 44%, 1)'
  ctx.fillRect(0, 0, width, height)

  const world: number[] = Array(w * h).fill(0)

  const setPixelIfNoNeighbours = (ps: Pos2D[], i: number) => {
    const neighbours = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: -1 }
    ]
    for (const p of ps) {
      for (const n of neighbours) {
        const other = world[p.x + n.x + (p.y + n.y) * w]
        if (other === i) {
          return
        }
      }
    }
    const clrs = ['', 'hsla(130, 37%, 35%, 1)', 'hsla(72, 65%, 54%, 1)']
    ctx.fillStyle = clrs[i]

    for (const p of ps) {
      world[p.x + p.y * w] = i
      ctx.fillRect(p.x * scale, p.y * scale, 1 * scale, 1 * scale)
    }
  }

  for (let i = 0; i < w * h * 0.3; i++) {
    // i = number of grass strands
    const p: Pos2D = {
      x: Math.floor(Math.random() * w),
      y: Math.floor(Math.random() * h)
    }

    // if (Math.random() < 0.5) {
    //   ctx.fillStyle = 'hsla(130, 37%, 35%, 1)'
    // } else {
    //   ctx.fillStyle = 'hsla(72, 65%, 54%, 1)'
    // }

    const r = Math.random()
    const ri = WeightedRandom(r, [0.5, 0.2, 0.2, 0.1])
    let ps: Pos2D[] = []
    if (ri == 0) {
      ps = [p, { x: p.x, y: p.y - 1 }]
    } else if (ri == 1) {
      ps = [p, { x: p.x, y: p.y - 1 }, { x: p.x, y: p.y - 2 }]
    } else if (ri == 2) {
      ps = [p, { x: p.x, y: p.y - 1 }, { x: p.x + 1, y: p.y }]
    } else if (ri == 3) {
      ps = [p]
    }

    setPixelIfNoNeighbours(ps, Math.round(Math.random() + 1))
  }

  //   let hueIndex = 0
  //   for (let xi = 0; xi <= numOfTiles * 2; xi += 1) {
  //     let dy: number
  //     if (xi % 2 === 1) {
  //       dy = 4
  //     } else {
  //       dy = 0
  //     }
  //     const x = (xi * tilesize) / 2
  //     for (let y = 0; y <= unscaledHeight; y++) {
  //       const ly = y % 7
  //       const ai = Math.abs(ly - 3)
  //       const w = tilesize - ai * 4
  //       const h = 1
  //       const dx = (tilesize - w) / 2

  //       //   console.log({ x, y, w, h })
  //       const hue = (Math.floor(hueIndex) * 60) % 360
  //       ctx.fillStyle = `hsla(${hue}, 100%, 50%, 0.5)`
  //       ctx.fillRect((x + dx) * scale, (y + dy) * scale, w * scale, h * scale)
  //       hueIndex += 1 / 7
  //       if (Math.floor(hueIndex) == 1) {
  //         return
  //       }
  //     }
  //   }

  const weights = [
    [6, 2],
    [4, 4],
    [2, 6],
    [0, 8],
    [2, 6],
    [4, 4],
    [6, 2],
    [8, 0]
  ]

  for (let y = 0; y < height / scale; y++) {
    const yi = y % 8
    const [w1, w2] = weights[yi]

    for (let x = 0; x < width / scale; x++) {
      const xi = x % (w1 + w2)
      const xn = Math.floor(x / (w1 + w2))

      let clr: string
      if (xn % 2 == 0) {
        clr = xi < w1 ? `hsla(0, 0%, 0%, 0.05)` : `hsla(0, 0%, 100%, 0.05)`
      } else {
        clr = xi < w2 ? `hsla(0, 0%, 100%, 0.05)` : `hsla(0, 0%, 0%, 0.05)`
      }

      ctx.fillStyle = clr
      ctx.fillRect(x * scale, y * scale, 1 * scale, 1 * scale)
    }
  }
}

export const GenerateProceduralConnectedTextures = async () => {
  const canvas: HTMLCanvasElement = elements.canvas

  const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Failed to get 2D context')
  }

  const [w, h] = [16, 16]
  const scale = 1
  canvas.width = w * scale
  canvas.height = h * scale
  ctx.imageSmoothingEnabled = false

  const ClearCanvas = (): void => {
    ctx.clearRect(0, 0, w * scale, h * scale)
  }

  ClearCanvas()

  const images = {
    grass: await LoadImage('assets/grass_block.png'),
    dirt: await LoadImage('assets/dirt_block.png'),
    fade: await LoadImage('assets/fade_map_py.png')
  }

  // ctx.drawImage(images.grass, 0, 0, w, h, 0, 0, w * scale, h * scale)

  const help = () => {
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx2: CanvasRenderingContext2D | null = canvas.getContext('2d')
    if (!ctx2) {
      throw new Error('Failed to get 2D context')
    }
    ctx2.drawImage(images.fade, 0, 0)

    const clrs: number[] = []
    const rs = []
    const data = ctx2.getImageData(0, 0, 16, 16)
    for (let i = 0; i < data.data.length; i += 4) {
      const r: number = data.data[i]
      let j = clrs.findIndex(c => c === r)
      if (j === -1) {
        clrs.push(r)
        j = clrs.findIndex(c => c === r)
      }
      rs.push(j)
    }
    // console.log(rs)
    let s = ''
    for (let y = 0; y < h; y++) {
      s += rs.slice(y * w, (y + 1) * w).join(' ')
      s += '\n'
    }
    console.log(s)
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const v = rs[x + y * w]

        if (v === 0) {
          continue
        }
        const a2 = [0.2, 0.6, 0.8]
        ctx.globalAlpha = a2[v]
        const w2 = [0.8, 0.6, 0.4]
        if (Math.random() > w2[v]) {
          continue
        }
        ctx.drawImage(
          images.dirt,
          x,
          y,
          1,
          1,
          x * scale,
          y * scale,
          1 * scale,
          1 * scale
        )
      }
    }
  }
  help()
  const link = document.createElement('a') // Create an <a> element
  link.download = 'canvas-image.png' // Set the download attribute
  link.href = canvas.toDataURL() // Convert canvas to data URL
  link.click() // Simulate a click to trigger the download
}

const BooleansToNumber = (booleans: boolean[]): number => {
  return booleans.reduce((acc, val, index) => {
    // Shift the accumulator left and add the current value as a bit
    return (acc << 1) | (val ? 1 : 0)
  }, 0)
}

const GenerateBooleanCombinations = (n: number): boolean[][] => {
  // The result array to hold all combinations
  const result: boolean[][] = []

  // Total number of combinations is 2^n
  const totalCombinations = 1 << n

  for (let i = 0; i < totalCombinations; i++) {
    const combination: boolean[] = []

    for (let j = 0; j < n; j++) {
      // Use bitwise AND to determine if the j-th bit in i is set
      combination.push((i & (1 << j)) !== 0)
    }

    result.push(combination)
  }

  return result
}

const ScaleCanvas = (
  canvas: HTMLCanvasElement,
  scaleFactor: number
): HTMLCanvasElement => {
  const [w, h] = [canvas.width, canvas.height]

  const otherCanvas = document.createElement('canvas')
  const otherCtx = otherCanvas.getContext('2d')

  if (!otherCtx) {
    throw new Error('Offscreen canvas context could not be retrieved.')
  }

  otherCanvas.width = w * scaleFactor
  otherCanvas.height = h * scaleFactor

  otherCtx.imageSmoothingEnabled = false

  otherCtx.drawImage(canvas, 0, 0, w * scaleFactor, h * scaleFactor)

  return otherCanvas
}

const SetCanvasContent = (
  targetCanvas: HTMLCanvasElement,
  sourceCanvas: HTMLCanvasElement
): void => {
  const targetContext = targetCanvas.getContext('2d')
  const sourceContext = sourceCanvas.getContext('2d')

  if (!targetContext || !sourceContext) {
    throw new Error(
      'Unable to retrieve the 2D rendering context for one of the canvases.'
    )
  }

  targetContext.imageSmoothingEnabled = false
  sourceContext.imageSmoothingEnabled = false

  // Match the target canvas size to the source canvas size
  targetCanvas.width = sourceCanvas.width
  targetCanvas.height = sourceCanvas.height

  // Copy the content from the source canvas to the target canvas
  targetContext.drawImage(sourceCanvas, 0, 0)
}

export const GenerateProceduralConnectedTextures2 = async ({
  innerMinAlpha = 0.3,
  innerMaxAlpha = 0.8,
  innerPixelChance = 0.5,
  outerMinAlpha = 0.1,
  outerMaxAlpha = 0.5,
  outerPixelChance = 0.25
}: {
  innerMinAlpha?: number
  innerMaxAlpha?: number
  innerPixelChance?: number
  outerMinAlpha?: number
  outerMaxAlpha?: number
  outerPixelChance?: number
} = {}) => {
  const scale = 4
  const [w, h] = [16, 16]
  const a = w * h
  const canvas = document.createElement('canvas')
  canvas.width = w * scale
  canvas.height = h * scale

  const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Failed to get 2D context')
  }
  ctx.imageSmoothingEnabled = false

  const ClearCanvas = (): void => {
    ctx.clearRect(0, 0, w * scale, h * scale)
  }

  ClearCanvas()

  // const image = await LoadImage('assets/dirt_block.png')
  // const mask2 = await LoadImage('assets/mask.png')

  // ctx.drawImage(image, 0, 0, w * scale, h * scale)

  // ctx.globalCompositeOperation = 'destination-in'
  // ctx.drawImage(mask2, 0, 0, w * scale, h * scale)
  // ctx.globalCompositeOperation = 'source-over'

  const pixelMapManager = PixelMapManager()
  const pixelPositions = pixelMapManager.GetPixelPositions()

  const combos = GenerateBooleanCombinations(4) // 4^2 = 16
  for (let i = 0; i < 16; i++) {
    const combo = combos[i]

    const CreateMask = (offset: number) => {
      const xs: number[] = []
      const ys: number[] = []
      if (combo[0]) {
        xs.push(1 + offset)
      }
      if (combo[1]) {
        xs.push(8 - offset)
      }
      if (combo[2]) {
        ys.push(1 + offset)
      }
      if (combo[3]) {
        ys.push(8 - offset)
      }
      const mask: boolean[] = pixelPositions.map(p => {
        return p.z === 10 && (xs.includes(p.x) || ys.includes(p.y))
      })
      return mask
    }
    const outerMask: boolean[] = CreateMask(0)
    const innerMask: boolean[] = CreateMask(1)

    const p = { x: i % 4, y: Math.floor(i / 4) }
    for (let j = 0; j < a; j++) {
      if (outerMask[j] && Math.random() < outerPixelChance) {
        const alpha =
          outerMinAlpha + Math.random() * (outerMaxAlpha - outerMinAlpha)
        ctx.fillStyle = `hsla(0, 100%, 100%, ${alpha})`
        ctx.fillRect(p.x * w + (j % w), p.y * h + Math.floor(j / w), 1, 1)
      }
      if (innerMask[j] && Math.random() < innerPixelChance) {
        const alpha =
          innerMinAlpha + Math.random() * (innerMaxAlpha - innerMinAlpha)
        ctx.fillStyle = `hsla(0, 100%, 100%, ${alpha})`
        ctx.fillRect(p.x * w + (j % w), p.y * h + Math.floor(j / w), 1, 1)
      }
    }
  }

  SetCanvasContent(elements.canvas, ScaleCanvas(canvas, 10))

  elements.randomiseWorld.onclick = () => {
    const link = document.createElement('a')
    link.download = 'edge_masks.png'
    link.href = canvas.toDataURL()
    link.click()
  }
}
const IndexToPos2D = (i: number, w: number): Pos2D => {
  return { x: i % w, y: Math.floor(i / w) }
}

export const ConnectedTextureManager = async () => {
  const mask = await LoadImage('assets/edge_masks.png')

  const [w, h] = [16, 16]

  const cache: Map<string, HTMLCanvasElement> = new Map()

  const GetConnectedTexture = ({
    name,
    image,
    px,
    nx,
    py,
    ny
  }: {
    name: string
    image: HTMLImageElement
    px: boolean
    nx: boolean
    py: boolean
    ny: boolean
  }) => {
    const key: string = `${name}_${px ? 'px' : ''}${py ? 'py' : ''}${
      nx ? 'nx' : ''
    }${ny ? 'ny' : ''}`

    const cachedCanvas: HTMLCanvasElement | undefined = cache.get(key)
    if (cachedCanvas !== undefined) {
      return cachedCanvas
    }

    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Failed to get 2D context')
    }
    ctx.imageSmoothingEnabled = false

    ctx.drawImage(image, 0, 0, w, h)

    // px nx py ny
    const comboId = BooleansToNumber([px, nx, py, ny])
    const c = IndexToPos2D(comboId, 4)

    ctx.globalCompositeOperation = 'destination-in'
    ctx.drawImage(mask, c.x * w, c.y * h, w, h, 0, 0, w, h)
    ctx.globalCompositeOperation = 'source-over'

    cache.set(key, canvas)

    return canvas
  }

  return { GetConnectedTexture }
}

export const GenerateProceduralConnectedTextures3 = async () => {
  const m = await ConnectedTextureManager()

  const block = await LoadImage('assets/grass_block.png')

  const canvas = m.GetConnectedTexture({
    name: 'grass',
    image: block,
    px: true,
    py: true,
    nx: false,
    ny: false
  })

  SetCanvasContent(elements.canvas, ScaleCanvas(canvas, 20))

  elements.randomiseWorld.onclick = () => {
    const link = document.createElement('a')
    link.download = 'edge_masks.png'
    link.href = canvas.toDataURL()
    link.click()
  }
}

export const RenderPixelMap = () => {
  const canvas: HTMLCanvasElement = elements.canvas

  const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Failed to get 2D context')
  }

  const [w, h] = [16, 16]
  const scale = 20
  canvas.width = w * scale * 2
  canvas.height = h * scale * 2
  ctx.imageSmoothingEnabled = false

  const ClearCanvas = (): void => {
    ctx.clearRect(0, 0, w * scale * 2, h * scale * 2)
  }

  ClearCanvas()

  const DrawMap = (
    offset: Pos2D,
    pixelMap: number[],
    hue: number,
    alpha: number = 1
  ) => {
    const maxValue: number = Math.max(...pixelMap.flat()) + 2
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const k: number = (pixelMap[x + y * w] / maxValue) * 100
        ctx.fillStyle = `hsla(${hue}, 100%, ${k}%, ${alpha})`
        ctx.fillRect(offset.x + x * scale, offset.y + y * scale, scale, scale)
      }
    }
    ctx.fillStyle = 'hsla(0, 0%, 0, 0)'
  }

  const pixelMapManager = PixelMapManager()
  const pixelPositions = pixelMapManager.GetPixelPositions()

  DrawMap(
    { x: w * scale, y: h * scale },
    pixelPositions.map(p => p.z),
    0
  )
  DrawMap(
    { x: w * scale, y: 0 },
    pixelPositions.map(p => p.x),
    200
  )
  DrawMap(
    { x: 0, y: h * scale },
    pixelPositions.map(p => p.y),
    100
  )
  DrawMap(
    { x: 0, y: 0 },
    pixelPositions.map(p => {
      if (p.z === 10 && ([1, 8].includes(p.x) || [1, 8].includes(p.y))) {
        return 1
      } else {
        return 0
      }
    }),
    300
  )
}

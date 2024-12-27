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

  const [w, h] = [16, 17]
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
    const data = ctx2.getImageData(0, 0, 16, 17)
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

export const RenderPixelMap = () => {
  const canvas: HTMLCanvasElement = elements.canvas

  const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Failed to get 2D context')
  }

  const [w, h] = [16, 17]
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
  // const ps: Pos2D[] = pixelMapManager.GetMatchingPositions({
  //   x: [8],
  //   y: [],
  //   z: [10]
  // })
  // console.log(ps)

  // for (const p of ps) {
  //   ctx.fillStyle = `hsla(${300}, 100%, ${50}%, ${1})`
  //   ctx.fillRect(p.x * scale, p.y * scale, scale, scale)
  // }

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

  // DrawMap({ x: w * scale, y: h * scale }, PixelMapZ(), 0, 0.33)
  // DrawMap({ x: w * scale, y: h * scale }, PixelMapX(), 200, 0.33)
  // DrawMap({ x: w * scale, y: h * scale }, PixelMapY(), 100, 0.33)

  // const setX = GetPositionsInPixelMap(
  //   PixelMapX(),
  //   (value: number) => value === 8
  // )

  // const setZ = GetPositionsInPixelMap(
  //   PixelMapZ(),
  //   (value: number) => value === 10
  // )

  // console.log(setX, setZ)
  // const validPositions: Pos2D[] = []

  // for (const p of setX) {
  //   if (setZ.find(p1 => p1.x === p.x && p1.y === p.y)) {
  //     validPositions.push(p)
  //   }
  // }

  // for (const p of Array.from(validPositions)) {
  //   ctx.fillStyle = `hsla(${300}, 100%, ${50}%, ${1})`
  //   ctx.fillRect((w + p.x) * scale, (h + p.y) * scale, scale, scale)
  // }

  // for (const p of Array.from(setZ)) {
  //   ctx.fillStyle = `hsla(${200}, 100%, ${50}%, ${1})`
  //   ctx.fillRect((w + p.x) * scale, (h + p.y) * scale, scale, scale)
  // }
}

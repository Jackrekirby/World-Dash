import { elements } from '../dom/elements'
import { Pos2D, Pos3D } from '../miscellaneous/types'
import { Renderer, RenderTile, TileSet } from './types'

export const LoadImage = async (src: string): Promise<HTMLImageElement> => {
  const image = new Image()
  image.src = src

  return new Promise((resolve, reject) => {
    image.onload = () => resolve(image)
    image.onerror = err => reject(new Error(`Failed to load image at ${src}`))
  })
}

export const CreateRenderer = async (): Promise<Renderer> => {
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
  const heightOverflow = 1 // pixel

  const tileSets: Map<TileSet, HTMLImageElement> = new Map([
    [
      TileSet.tiles,
      await LoadImage('assets/Isometric_MedievalFantasy_Tiles.png')
    ],
    [
      TileSet.entities,
      await LoadImage('assets/IsometricTRPGAssetPack_OutlinedEntities.png')
    ],
    [
      TileSet.mapIndicators,
      await LoadImage('assets/IsometricTRPGAssetPack_MapIndicators2.png')
    ]
  ])

  // Member Functions

  const DrawLine = (x0: number, y0: number, x1: number, y1: number) => {
    ctx.beginPath()
    ctx.moveTo(x0, y0)
    ctx.lineTo(x1, y1)
    ctx.stroke()
  }

  const DrawIsometricGrid = (): void => {
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

  const DrawIsometricTile = (tile: RenderTile) => {
    //  /  \
    // x    y
    // w = world x, y & z
    // ti, tj = tile index in x & y

    const [sw, sh] = [sts, sts + heightOverflow] // source width & height (+1 = tile overflow)
    const [sx, sy] = [tile.tileIndex.x * sw, tile.tileIndex.y * sh] // source x & y
    const [dw, dh] = [sw * scale, sh * scale] // destination width & height

    const [dx0, dy0] = [
      // destination x & y origin (centre)
      (width - dts) / 2,
      (height - dts) / 2 - heightOverflow * scale
    ]

    const [dx, dy] = [
      // destination x & y
      dx0 - (tile.worldPosition.x * dts) / 2 + (tile.worldPosition.y * dts) / 2,
      dy0 +
        (tile.worldPosition.x * dts) / 4 +
        (tile.worldPosition.y * dts) / 4 -
        (tile.worldPosition.z * dts) / 2
    ]

    const d = WorldToCanvasPosition(tile.worldPosition)
    const image = tileSets.get(tile.tileset) as HTMLImageElement
    ctx.drawImage(image, sx, sy, sw, sh, d.x, d.y, dw, dh)
  }

  const CanvasToWorldPosition = ({
    canvasPosition,
    wz
  }: {
    canvasPosition: Pos2D
    wz: number // must specify world z
  }): Pos3D => {
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

    canvasPosition.x = canvasPosition.x - dts / 2
    canvasPosition.y = canvasPosition.y - dts / 2

    const p0 = {
      // destination x & y origin (centre)
      x: (width - dts) / 2,
      y: (height - dts) / 2 - heightOverflow * scale
    }
    const p = {
      x:
        (1 / dts) * (p0.x - canvasPosition.x + 2 * (canvasPosition.y - p0.y)) +
        wz +
        0.5,
      y:
        (1 / dts) * (canvasPosition.x - p0.x + 2 * (canvasPosition.y - p0.y)) +
        wz +
        0.5,
      z: wz
    }

    return p
  }

  const ClearCanvas = (): void => {
    ctx.clearRect(0, 0, width, height)
  }

  return {
    CanvasToWorldPosition,
    ClearCanvas,
    DrawIsometricTile,
    DrawIsometricGrid
  }
}

import { elements } from '../dom/elements'
import { Pos2dScalarOperation } from '../miscellaneous/pos_2d'
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

const GetContext = (canvas: HTMLCanvasElement): CanvasRenderingContext2D => {
  let newCtx: CanvasRenderingContext2D | null = canvas.getContext('2d')
  if (newCtx === null) {
    throw new Error('Failed to get 2D context')
  }
  return newCtx
}

const lowestPowerOf2 = (num: number) => {
  const lower = 2 ** Math.floor(Math.log2(num))
  return lower
}

export const CreateRenderer = async (): Promise<Renderer> => {
  const canvas = elements.canvas

  // Initialise

  let ctx: CanvasRenderingContext2D = GetContext(canvas)

  let [width, height] = [0, 0]

  const sizeCanvas = () => {
    // console.log('canvas onresize')
    canvas.width = lowestPowerOf2(canvas.clientWidth) //512 // Math.floor(canvas.clientWidth / 16) * 16
    canvas.height = canvas.width
    width = canvas.width
    height = canvas.height

    // console.log({ width, height })

    ctx = GetContext(canvas)

    ctx.imageSmoothingEnabled = false
  }

  sizeCanvas()
  window.addEventListener('resize', sizeCanvas)

  const SetScale = (scale: number): void => {
    _scale = scale
    _dts = sts * _scale
  }

  let _scale = 4
  const sts = 16 // source tile size
  let _dts = sts * _scale // destination tile size

  const tileSets: Map<TileSet, HTMLImageElement> = new Map([
    [TileSet.main, await LoadImage('assets/tileset.png')]
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

    ctx.strokeStyle = 'hsla(0, 0%, 80%, 0.5)'
    for (let x = 0; x < width; x += _dts) {
      DrawLine(x, 0, x, height)
    }
    for (let y = 0; y < height; y += _dts) {
      DrawLine(0, y, width, y)
    }

    ctx.strokeStyle = 'hsl(0, 100%, 100%, 0.5)'
    for (let x = _dts / 2; x < width; x += _dts) {
      DrawLine(x, 0, x, height)
    }
    for (let y = _dts / 2; y < height; y += _dts) {
      DrawLine(0, y, width, y)
    }

    for (let y = -_dts; y < height; y += _dts) {
      for (let x = -_dts; x < width; x += _dts) {
        ctx.strokeStyle = 'hsla(200, 100%, 80%, 0.6)'
        DrawLine(x, y, x + 2 * _dts, y + _dts)

        ctx.strokeStyle = 'hsla(100, 100%, 80%, 0.6)'
        DrawLine(x, y + _dts, x + 2 * _dts, y)
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
      x: (width - _dts) / 2,
      y: (height - _dts) / 2
    }
    const p = {
      x: p0.x - (x * _dts) / 2 + (y * _dts) / 2,
      y: p0.y + (x * _dts) / 4 + (y * _dts) / 4 - (z * _dts) / 2
    }
    return p
  }

  const DrawIsometricTile = (tile: RenderTile) => {
    //  /  \
    // x    y
    // w = world x, y & z
    // ti, tj = tile index in x & y

    const [sw, sh] = [sts, sts] // source width & height
    const [sx, sy] = [tile.tileIndex.x * sw, tile.tileIndex.y * sh] // source x & y
    const [dw, dh] = [sw * _scale, sh * _scale] // destination width & height

    const [dx0, dy0] = [
      // destination x & y origin (centre)
      (width - _dts) / 2,
      (height - _dts) / 2
    ]

    const [dx, dy] = [
      // destination x & y
      dx0 -
        (tile.worldPosition.x * _dts) / 2 +
        (tile.worldPosition.y * _dts) / 2,
      dy0 +
        (tile.worldPosition.x * _dts) / 4 +
        (tile.worldPosition.y * _dts) / 4 -
        (tile.worldPosition.z * _dts) / 2
    ]

    const d = Pos2dScalarOperation(
      WorldToCanvasPosition(tile.worldPosition),
      Math.floor
    )

    const image: HTMLImageElement | undefined = tileSets.get(tile.tileset)
    if (image === undefined) {
      throw new Error(`Tileset undefined ${tile.tileset}`)
    }
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

    const cx = canvasPosition.x - _dts / 2
    const cy = canvasPosition.y - _dts / 2

    const p0 = {
      // destination x & y origin (centre)
      x: (width - _dts) / 2,
      y: (height - _dts) / 2
    }
    // console.log(canvasPosition, p0)
    const p = {
      x: (1 / _dts) * (p0.x - cx + 2 * (cy - p0.y)) + wz + 1,
      y: (1 / _dts) * (cx - p0.x + 2 * (cy - p0.y)) + wz + 1,
      z: wz
    }

    return p
  }

  const ClearCanvas = (): void => {
    ctx.clearRect(0, 0, width, height)
  }

  const FillCanvas = (fillStyle: string): void => {
    ctx.fillStyle = fillStyle
    ctx.fillRect(0, 0, width, height)
  }

  return {
    CanvasToWorldPosition,
    ClearCanvas,
    FillCanvas,
    DrawIsometricTile,
    DrawIsometricGrid,
    SetScale
  }
}

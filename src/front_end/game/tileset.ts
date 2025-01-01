import { SurfaceNoise } from '../miscellaneous/random_noise'
import { warnOnce } from '../miscellaneous/single_log'
import { Pos2D, Pos3D } from '../miscellaneous/types'
import { TILENAME_TO_TILESET_INDEX_MAP } from '../renderer/tileset'
import { RenderTile } from '../renderer/types'
import { CreateRenderTile } from '../renderer/utils'
import { WorldTile } from '../world/main'
import { TileType } from '../world/types'
import { DisplayMode, Game } from './types'

const worldToRenderTileName: Map<TileType, string> = new Map([
  [TileType.grass, 'grass'],
  [TileType.dryGrass, 'dry_grass'],
  [TileType.dirt, 'dirt'],
  [TileType.stone, 'stone'],
  [TileType.lava, 'lava'],
  [TileType.sand, 'sand'],
  [TileType.plant, 'flower_a'],
  [TileType.cactus, 'flowering_small_cactus'],
  [TileType.smallStones, 'small_stones'],
  [TileType.tinyStones, 'tiny_stones'],
  [TileType.largeStones, 'large_stones'],
  [TileType.shortGrass, 'short_grass'],
  [TileType.shortDryGrass, 'short_dry_grass'],
  [TileType.longDryGrass, 'long_dry_grass'],
  [TileType.longGrass, 'long_grass'],
  [TileType.oakTrunk, 'oak_trunk'],
  [TileType.poppy, 'poppy'],
  [TileType.daisies, 'daisies'],
  [TileType.smallBush, 'small_bush'],
  [TileType.mediumBush, 'medium_bush'],
  [TileType.sunflowers, 'sunflowers']
])

const worldToRenderMultiTileName: Map<TileType, string> = new Map([
  [TileType.oakTree, 'oak_tree'],
  [TileType.palmTree, 'palm_tree']
])

const GetTileVariant = ({
  name,
  p,
  blockParts = [],
  onlyParts = []
}: {
  name: string
  p: Pos2D
  blockParts?: string[]
  onlyParts?: string[]
}) => {
  const n = SurfaceNoise(p)
  const variants = Object.keys(TILENAME_TO_TILESET_INDEX_MAP).filter(key => {
    const parts: string[] = key.split(':')
    const hasBlockedParts: boolean = blockParts.some(blockPart =>
      parts.some(part => part.startsWith(blockPart))
    )
    if (hasBlockedParts) return false

    const hasOnlyParts: boolean = onlyParts.every(onlyPart =>
      parts.some(part => part.startsWith(onlyPart))
    )
    if (!hasOnlyParts) return false
    return parts[0] === name
  })

  if (variants.length === 0) {
    throw new Error(`Cannot find variant ${name}`)
  }

  const chosenVariant = variants[Math.floor(variants.length * n)]
  return chosenVariant
}

const GetAnimatedFrame = (
  framePeriods: number[],
  time: DOMHighResTimeStamp,
  p: Pos2D
): number => {
  const n = SurfaceNoise(p)
  let totalPeriod: number = 0
  for (let i = 0; i < framePeriods.length; i++) {
    totalPeriod += framePeriods[i]
  }
  let wrappedTime = (time + Math.floor(n * totalPeriod)) % totalPeriod
  for (let i = 0; i < framePeriods.length; i++) {
    wrappedTime -= framePeriods[i]
    if (wrappedTime <= 0) {
      return i
    }
  }
  console.log('GetAnimatedFrame got to end of loop without selecting a frame')
  return framePeriods.length - 1
}

const CreateMultiTileRenderTiles = ({
  name,
  worldPosition
}: {
  name: string
  worldPosition: Pos3D
}): RenderTile[] => {
  const rTiles: RenderTile[] = []
  const relTilePositions: Pos2D[] = Object.keys(TILENAME_TO_TILESET_INDEX_MAP)
    .filter(key => {
      const parts: string[] = key.split(':')
      return parts[0] === name
    })
    .map(key => {
      const parts: string[] = key.split(':')
      const subpart = parts.find(part => part.startsWith('sub-'))
      if (subpart === undefined) {
        throw new Error(`Expected ${name} to be multiple tiles ${key}`)
      }
      const [x, y] = subpart.slice(4).split('_')
      return { x: Number(x), y: Number(y) }
    })

  let maxP: Pos2D = { x: 0, y: 0 }
  for (const p of relTilePositions) {
    if (maxP.y < p.y) {
      maxP.y = p.y
    }
    if (maxP.x < p.x) {
      maxP.x = p.x
    }
  }

  // assumes multi-tile has origin at horizontal centre
  // and vertically at bottom
  const xOffset = Math.floor(maxP.x / 2)
  for (const p of relTilePositions) {
    const subKey = `sub-${p.x}_${p.y}`
    rTiles.push(
      CreateRenderTile({
        worldPosition: {
          x: worldPosition.x + xOffset - p.x,
          y: worldPosition.y - xOffset + p.x,
          z: worldPosition.z + maxP.y - p.y - 1
        },
        tilename: GetTileVariant({
          name,
          p: worldPosition,
          onlyParts: [subKey]
        })
      })
    )
  }
  return rTiles
}

export const GenerateRenderTiles = ({
  worldTiles,
  time,
  game
}: {
  worldTiles: WorldTile[]
  time: DOMHighResTimeStamp
  game: Game
}): RenderTile[] => {
  const rTiles: RenderTile[] = [] // render tiles

  for (const wTile of worldTiles) {
    if (worldToRenderTileName.has(wTile.tileType)) {
      const name = worldToRenderTileName.get(wTile.tileType) as string
      rTiles.push(
        CreateRenderTile({
          worldPosition: wTile.p,
          tilename: GetTileVariant({
            name,
            p: wTile.p,
            blockParts: ['edge-']
          })
        })
      )
    } else if (wTile.tileType === TileType.water) {
      rTiles.push(
        CreateRenderTile({
          worldPosition: wTile.p,
          tilename: `water:frame-${GetAnimatedFrame(
            [8000, 8000, 8000],
            time,
            wTile.p
          )}`
        })
      )
    } else if (wTile.tileType === TileType.orchid) {
      const frameKey = `frame-${GetAnimatedFrame([20000, 2000], time, wTile.p)}`
      rTiles.push(
        CreateRenderTile({
          worldPosition: wTile.p,
          tilename: GetTileVariant({
            name: 'orchid',
            p: wTile.p,
            onlyParts: [frameKey]
          })
        })
      )
    } else if (
      wTile.tileType.split(':').some(part => part.startsWith('edge-'))
    ) {
      const parts = wTile.tileType.split(':')
      const edgeKey = parts.find(part => part.startsWith('edge-')) as string
      rTiles.push(
        CreateRenderTile({
          worldPosition: wTile.p,
          tilename: GetTileVariant({
            name: parts[0],
            p: wTile.p,
            onlyParts: [edgeKey]
          })
        })
      )
    } else if (worldToRenderMultiTileName.has(wTile.tileType)) {
      rTiles.push(
        ...CreateMultiTileRenderTiles({
          name: worldToRenderMultiTileName.get(wTile.tileType) as string,
          worldPosition: wTile.p
        })
      )
    } else {
      warnOnce(
        `missing-tile-type-${wTile.tileType}`,
        `This tile type is not being rendered ${wTile.tileType}`
      )
    }
  }

  if (game.displayMode === DisplayMode.Debug) {
    const debugTiles: RenderTile[] = []
    const uniquePositions: Set<string> = new Set()
    for (let rTile of rTiles) {
      const p = rTile.worldPosition
      uniquePositions.add(`${p.x} ${p.y} ${p.z}`)
    }
    for (const pStr of uniquePositions) {
      const [x, y, z] = pStr.split(' ').map(Number)
      const p: Pos3D = { x, y, z }
      // console.log(rTile.worldPosition.z)
      const variant = p.z < 0 ? 5 + (Math.floor(p.z) % 5) : Math.floor(p.z) % 5
      debugTiles.push(
        CreateRenderTile({
          worldPosition: p,
          tilename: `debug:mvar-${variant}`
        })
      )
    }

    rTiles.push(...debugTiles)
  }

  return rTiles
}

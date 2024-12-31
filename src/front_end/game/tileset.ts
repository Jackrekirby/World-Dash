import { SurfaceNoise } from '../miscellaneous/random_noise'
import { Pos2D } from '../miscellaneous/types'
import { TILENAME_TO_TILESET_INDEX_MAP } from '../renderer/tileset'
import { RenderTile } from '../renderer/types'
import { CreateRenderTile } from '../renderer/utils'
import { WorldTile } from '../world/main'
import { TileType } from '../world/types'

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
  [TileType.largeStones, 'large_stones'],
  [TileType.shortGrass, 'short_grass'],
  [TileType.shortDryGrass, 'short_dry_grass'],
  [TileType.poppy, 'poppy']
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

export const GenerateRenderTiles = ({
  worldTiles,
  time
}: {
  worldTiles: WorldTile[]
  time: DOMHighResTimeStamp
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
    } else if (wTile.tileType === TileType.palmTree) {
      const pUp = { x: wTile.p.x, y: wTile.p.y, z: wTile.p.z + 1 }

      rTiles.push(
        ...[
          CreateRenderTile({
            worldPosition: pUp,
            tilename: GetTileVariant({
              name: 'palm_top',
              p: pUp
            })
          }),
          CreateRenderTile({
            worldPosition: wTile.p,
            tilename: GetTileVariant({
              name: 'palm_bottom',
              p: wTile.p
            })
          })
        ]
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
    } else {
      // console.warn(`This tile type is not being rendered ${wTile.tileType}`)
    }
  }

  return rTiles
}

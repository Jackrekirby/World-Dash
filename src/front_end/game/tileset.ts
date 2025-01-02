import { SurfaceNoise } from '../miscellaneous/random_noise'
import { warnOnce } from '../miscellaneous/single_log'
import { Pos2D, Pos3D } from '../miscellaneous/types'
import { RenderTile, TileSet } from '../renderer/types'
import { GetTileVariants } from '../renderer/utils'
import { TileType, WorldTile } from '../world/types'
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
      const variants = GetTileVariants({ name })

      const n = SurfaceNoise(wTile.p)
      const variant = variants[Math.floor(variants.length * n)]

      const rTile: RenderTile = {
        worldPosition: wTile.p,
        tileIndex: variant.tilesetIndex,
        tileset: TileSet.main
      }

      rTiles.push(rTile)
    } else if (wTile.tileType === TileType.water) {
      const frame: number = GetAnimatedFrame([8000, 8000, 8000], time, wTile.p)
      const variants = GetTileVariants({ name: 'water', frame: [frame] })
      const n = SurfaceNoise(wTile.p)
      const variant = variants[Math.floor(variants.length * n)]
      const rTile: RenderTile = {
        worldPosition: wTile.p,
        tileIndex: variant.tilesetIndex,
        tileset: TileSet.main
      }
      rTiles.push(rTile)
    } else if (wTile.tileType === TileType.orchid) {
      const frame: number = GetAnimatedFrame([20000, 2000], time, wTile.p)
      const variants = GetTileVariants({ name: 'orchid', frame: [frame] })
      const n = SurfaceNoise(wTile.p)
      const variant = variants[Math.floor(variants.length * n)]
      const rTile: RenderTile = {
        worldPosition: wTile.p,
        tileIndex: variant.tilesetIndex,
        tileset: TileSet.main
      }
      rTiles.push(rTile)
    } else if (
      wTile.tileType.split(':').some(part => part.startsWith('edge-'))
    ) {
      const name: string = wTile.tileType.replace(':', '_').replace('-', '_')
      const variants = GetTileVariants({ name })
      const n = SurfaceNoise(wTile.p)
      const variant = variants[Math.floor(variants.length * n)]
      const rTile: RenderTile = {
        worldPosition: wTile.p,
        tileIndex: variant.tilesetIndex,
        tileset: TileSet.main
      }
      rTiles.push(rTile)
    } else if (worldToRenderMultiTileName.has(wTile.tileType)) {
      const name = worldToRenderMultiTileName.get(wTile.tileType) as string
      const variants = GetTileVariants({ name })

      let maxP: Pos2D = { x: 0, y: 0 }
      for (const v of variants) {
        if (maxP.y < v.worldOffset.y) {
          maxP.y = v.worldOffset.y
        }
        if (maxP.x < v.worldOffset.x) {
          maxP.x = v.worldOffset.x
        }
      }

      // assumes multi-tile has origin at horizontal centre
      // and vertically at bottom
      const xOffset = Math.floor(maxP.x / 2)
      for (const v of variants) {
        const worldPosition = {
          x: wTile.p.x + xOffset - v.worldOffset.x,
          y: wTile.p.y - xOffset + v.worldOffset.x,
          z: wTile.p.z + maxP.y - v.worldOffset.y - 1
        }
        const rTile: RenderTile = {
          worldPosition,
          tileIndex: v.tilesetIndex,
          tileset: TileSet.main
        }
        rTiles.push(rTile)
      }
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
      const mvar = p.z < 0 ? 5 + (Math.floor(p.z) % 5) : Math.floor(p.z) % 5
      const variants = GetTileVariants({ name: 'debug', mvar: [mvar] })
      const rTile: RenderTile = {
        worldPosition: p,
        tileIndex: variants[0].tilesetIndex,
        tileset: TileSet.main
      }
      debugTiles.push(rTile)
    }

    rTiles.push(...debugTiles)
  }

  return rTiles
}

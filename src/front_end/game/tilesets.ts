import { Pos2D } from '../miscellaneous/types'
import { RenderTile, TileSet } from '../renderer/types'
import { WorldTile } from '../world/main'
import { TileType } from '../world/types'

const tileMap: Map<TileType, Pos2D> = new Map([
  [TileType.dirt, { x: 0, y: 0 }],
  [TileType.grass, { x: 1, y: 0 }],
  [TileType.stone, { x: 2, y: 0 }],
  [TileType.sand, { x: 3, y: 0 }],
  [TileType.water, { x: 7, y: 0 }],
  [TileType.plant, { x: 10, y: 0 }],
  [TileType.cactus, { x: 8, y: 1 }],
  [TileType.log, { x: 8, y: 3 }],
  [TileType.canopy, { x: 7, y: 3 }],
  [TileType.dryGrass, { x: 3, y: 2 }],
  [TileType.smallStones, { x: 8, y: 0 }],
  [TileType.largeStones, { x: 9, y: 0 }],
  [TileType.lava, { x: 2, y: 3 }]
])

export const GenerateRenderTiles = (tileData: WorldTile[]): RenderTile[] => {
  // TODO move sorting into renderer
  tileData.sort((a, b) => {
    const aw = a.p.x + a.p.y
    const bw = b.p.x + b.p.y
    if (aw === bw) {
      // if tiles on same x,y, render from bottom to top
      return a.p.z - b.p.z
    }
    // render from back to front (negative to positive x, y)
    return aw - bw
  })

  const tiles: RenderTile[] = [] // render tiles

  for (const td of tileData) {
    const t = tileMap.get(td.tileType) as Pos2D

    tiles.push({
      worldPosition: td.p,
      tileIndex: t,
      tileset: TileSet.tiles
    })
  }
  return tiles
}

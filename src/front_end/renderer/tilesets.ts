import { TileData } from '../world/main'
import { Pos2D } from '../miscellaneous/types'
import { Tile, TileSet } from './types'

interface TileMap {
  dirt: Pos2D
  grass: Pos2D
  stone: Pos2D
  sand: Pos2D
  water: Pos2D
  plant: Pos2D
  cactus: Pos2D
  log: Pos2D
  canopy: Pos2D
  dryGrass: Pos2D
  smallStones: Pos2D
  largeStones: Pos2D
  lava: Pos2D
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

export const GenerateRenderTiles = (tileData: TileData[]): Tile[] => {
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

  const tiles: Tile[] = [] // render tiles

  for (const td of tileData) {
    const t = tileMap[td.tileType]

    tiles.push({
      worldPosition: td.p,
      tileIndex: t,
      tileset: TileSet.tiles
    })
  }

  return tiles
}

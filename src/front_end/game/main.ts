import { Pos2D, Pos3D } from '../miscellaneous/types'
import { Renderer, RenderTile, TileSet } from '../renderer/types'
import { WorldTile } from '../world/main'
import { TileType, World } from '../world/types'
import { Game } from './types'

export const RandomisePlayerPosition = (world: World): Pos3D => {
  for (let i = 0; i < 100; i++) {
    const p: Pos2D = {
      x: Math.floor(Math.random() * 6) - 3,
      y: Math.floor(Math.random() * 6) - 3
    }
    const tile: WorldTile | undefined = world.GetSurfaceTile(p)
    if (tile !== undefined && tile.tileType !== TileType.water) {
      return { x: tile.p.x, y: tile.p.y, z: tile.p.z + 1 }
    }
  }
  console.warn('Failed to find valid tile for player to stand on')
  return { x: 0, y: 0, z: 0 }
}

export const Render = (
  time: DOMHighResTimeStamp,
  renderer: Renderer,
  world: World,
  tiles: RenderTile[],
  game: Game
): void => {
  renderer.ClearCanvas()

  // draw tiles
  for (const t of tiles) {
    renderer.DrawIsometricTile(t)
  }

  // draw cusor
  const cursorWorldPosition = world.GetCursorWorldPosition()
  if (cursorWorldPosition !== null) {
    renderer.DrawIsometricTile({
      worldPosition: cursorWorldPosition,
      tileIndex: { x: 0, y: 0 },
      tileset: TileSet.mapIndicators
    })
  }

  // draw player
  renderer.DrawIsometricTile({
    worldPosition: game.playerPosition,
    tileIndex: { x: time % 1000 < 500 ? 0 : 1, y: 0 },
    tileset: TileSet.entities
  })

  // draw grid
  if (game.showGrid) {
    renderer.DrawIsometricGrid()
  }
}

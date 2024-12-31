import { Pos2D, Pos3D } from '../miscellaneous/types'
import { Renderer, RenderTile } from '../renderer/types'
import { CreateRenderTile } from '../renderer/utils'
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
  const rTiles: RenderTile[] = [...tiles]

  // draw cursor
  const cursorWorldPosition = world.GetCursorWorldPosition()
  if (cursorWorldPosition !== null) {
    const cursorTile: RenderTile = CreateRenderTile({
      worldPosition: cursorWorldPosition,
      tilename: 'cursor'
    })

    rTiles.push(cursorTile)
  }
  // draw player
  const playerTile: RenderTile = CreateRenderTile({
    worldPosition: game.playerPosition,
    tilename: `sword_man:frame-${time % 1000 < 500 ? 0 : 1}`
  })
  rTiles.push(playerTile)

  // sort tiles for render (move into renderer)
  rTiles.sort((a, b) => {
    const aw = a.worldPosition.x + a.worldPosition.y
    const bw = b.worldPosition.x + b.worldPosition.y
    if (aw === bw) {
      // if tiles on same x,y, render from bottom to top
      return a.worldPosition.z - b.worldPosition.z
    }
    // render from back to front (negative to positive x, y)
    return aw - bw
  })

  for (const t of rTiles) {
    renderer.DrawIsometricTile(t)
  }

  // draw grid
  if (game.showGrid) {
    renderer.DrawIsometricGrid()
  }
}

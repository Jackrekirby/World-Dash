import { Renderer, RenderTile, TileSet } from '../renderer/types'
import { World } from '../world/types'
import { Game } from './types'

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

import { elements } from '../dom/elements'
import { Pos3dSubtract } from '../miscellaneous/pos_3d'
import { Pos2D, Pos3D } from '../miscellaneous/types'
import { Renderer, RenderTile, TileSet } from '../renderer/types'
import { GetTileVariants } from '../renderer/utils'
import { TileType, World, WorldTile } from '../world/types'
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

const GetWorldViewPort = (renderer: Renderer, game: Game): Pos2D => {
  const cp = game.camera.GetPosition()
  const [w, h] = [elements.canvas.width, elements.canvas.height]
  const p = renderer.CanvasToWorldPosition({
    canvasPosition: { x: 0, y: 0 },
    wz: 0
  })
  // the distance from the centre
  return { x: -(p.y - p.x) + 2, y: -(p.x + p.y) + 4 }
}

const FilterTilesOutsideViewport = (
  renderer: Renderer,
  game: Game,
  rtiles: RenderTile[]
) => {
  const viewport: Pos2D = GetWorldViewPort(renderer, game)
  return rtiles.filter(rtile => {
    const worldPosition = Pos3dSubtract(
      rtile.worldPosition,
      game.camera.GetPosition()
    )

    const flatWorldPosition: Pos2D = {
      x: worldPosition.x - worldPosition.z,
      y: worldPosition.y - worldPosition.z
    }

    // left (-x, y)
    if (flatWorldPosition.y - flatWorldPosition.x > viewport.x) {
      return false
    }
    // right (x, -y)
    if (flatWorldPosition.y - flatWorldPosition.x < -viewport.x) {
      return false
    }
    // top (-x, -y)
    if (flatWorldPosition.y + flatWorldPosition.x < -viewport.y) {
      return false
    }
    // bottom (+x, +y)
    if (flatWorldPosition.y + flatWorldPosition.x > viewport.y) {
      return false
    }
    return true
  })
}

export const Render = (
  time: DOMHighResTimeStamp,
  renderer: Renderer,
  world: World,
  tiles: RenderTile[],
  game: Game
): void => {
  // renderer.ClearCanvas()
  renderer.FillCanvas('hsl(204, 78%, 85%)')

  // draw tiles
  const rTiles: RenderTile[] = FilterTilesOutsideViewport(renderer, game, tiles)

  // draw cursor
  const cursorWorldPosition = world.GetCursorWorldPosition()
  if (cursorWorldPosition !== null) {
    const variants = GetTileVariants({
      name: 'cursor'
    })
    const cursorTile: RenderTile = {
      worldPosition: cursorWorldPosition,
      tileIndex: variants[0].tilesetIndex,
      tileset: TileSet.main
    }

    rTiles.push(cursorTile)
  }

  // draw player
  const variants = GetTileVariants({
    name: 'sword_man',
    frame: [time % 1000 < 500 ? 0 : 1]
  })
  const playerTile: RenderTile = {
    worldPosition: game.playerPosition,
    tileIndex: variants[0].tilesetIndex,
    tileset: TileSet.main
  }
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
    const worldPosition = Pos3dSubtract(
      t.worldPosition,
      game.camera.GetPosition()
    )

    renderer.DrawIsometricTile({
      worldPosition,
      tileIndex: t.tileIndex,
      tileset: t.tileset
    })
  }

  // draw grid
  if (game.showGrid) {
    renderer.DrawIsometricGrid()
  }
}

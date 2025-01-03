import { Pos3dAdd, Pos3dEquals } from '../miscellaneous/pos_3d'
import { Pos3D } from '../miscellaneous/types'
import { Renderer } from '../renderer/types'
import { SurfaceTiles } from '../world/main'
import { World, WorldTile } from '../world/types'
import { Game } from './types'

const Pos3DToNearestHalfZ = (v: Pos3D) => ({
  x: Math.floor(v.x),
  y: Math.floor(v.y),
  z: Math.floor(v.z * 2)
})

export const CalculateCursorWorldPosition = (
  renderer: Renderer,
  world: World,
  game: Game
): Pos3D | null => {
  const tiles = world.GetTiles()

  for (let wz = 4; wz >= 0; wz -= 0.5) {
    let fw: Pos3D = renderer.CanvasToWorldPosition({
      canvasPosition: game.mouse.GetPosition(),
      wz
    }) // floating point world position
    fw = Pos3dAdd(fw, game.camera.GetPosition())

    const w: Pos3D = Pos3DToNearestHalfZ(fw)

    const tile: WorldTile | undefined = tiles.find(tile =>
      Pos3dEquals(w, Pos3DToNearestHalfZ(tile.p))
    )

    if (tile !== undefined && SurfaceTiles.includes(tile.tileType)) {
      return tile.p
    }
  }
  return null
}

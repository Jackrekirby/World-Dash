import { Pos3dEquals, Pos3dScalarOperation } from '../miscellaneous/pos_3d'
import { Pos2D, Pos3D } from '../miscellaneous/types'
import { Renderer } from '../renderer/types'
import { SurfaceTiles } from '../world/main'
import { World, WorldTile } from '../world/types'

export const CalculateCursorWorldPosition = (
  renderer: Renderer,
  world: World,
  canvasPosition: Pos2D
): Pos3D | null => {
  const tiles = world.GetTiles()
  for (let wz = 4; wz >= 0; wz--) {
    const fw: Pos3D = renderer.CanvasToWorldPosition({
      canvasPosition,
      wz
    }) // floating point world position
    const w: Pos3D = Pos3dScalarOperation(fw, Math.round)

    const tile: WorldTile | undefined = tiles.find(tile =>
      Pos3dEquals(w, Pos3dScalarOperation(tile.p, Math.round))
    )

    if (tile !== undefined && SurfaceTiles.includes(tile.tileType)) {
      return tile.p
    }
  }
  return null
}

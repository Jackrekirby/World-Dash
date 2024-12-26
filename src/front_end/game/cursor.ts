import { Pos2D, Pos3D } from '../miscellaneous/types'
import { Renderer } from '../renderer/types'
import { WorldTile } from '../world/main'
import { World } from '../world/types'

export const CalculateCursorWorldPosition = (
  renderer: Renderer,
  world: World,
  canvasPosition: Pos2D
): Pos3D | null => {
  for (let wz = 4; wz >= 0; wz--) {
    const fw: Pos3D = renderer.CanvasToWorldPosition({
      canvasPosition,
      wz
    }) // floating point world position
    const w: Pos3D = {
      x: Math.round(fw.x),
      y: Math.round(fw.y),
      z: Math.round(fw.z)
    }

    const tile: WorldTile | undefined = world.GetTile(w)

    if (tile !== undefined) {
      return w
    }
  }
  return null
}

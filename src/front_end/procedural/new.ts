import { Pos3D } from '../miscellaneous/types'
import { RenderTile, TileSet } from '../renderer/types'
import { NEW_TILESET_DATA } from './new_tileset'
export const CreateRenderTile = ({
  worldPosition,
  tilename
}: {
  worldPosition: Pos3D
  tilename: string
}): RenderTile => {
  return {
    worldPosition,
    tileIndex: NEW_TILESET_DATA[tilename],
    tileset: TileSet.new
  }
}

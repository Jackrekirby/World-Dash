import { Pos3D } from '../miscellaneous/types'
import { TILENAME_TO_TILESET_INDEX_MAP } from './tileset'
import { RenderTile, TileSet } from './types'
export const CreateRenderTile = ({
  worldPosition,
  tilename
}: {
  worldPosition: Pos3D
  tilename: string
}): RenderTile => {
  if (TILENAME_TO_TILESET_INDEX_MAP[tilename] === undefined) {
    throw new Error(`Invalid tilename ${tilename}`)
  }
  return {
    worldPosition,
    tileIndex: TILENAME_TO_TILESET_INDEX_MAP[tilename],
    tileset: TileSet.main
  }
}

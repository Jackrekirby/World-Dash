import { Pos2dEquals } from '../miscellaneous/pos_2d'
import { Pos2D } from '../miscellaneous/types'
import { TILESET } from './tileset'

export const GetTileVariants = ({
  name,
  mvar = [],
  color = [],
  rot = [],
  frame = [],
  sub = []
}: {
  name: string
  mvar?: number[]
  color?: number[]
  rot?: number[]
  frame?: number[]
  sub?: Pos2D[]
}): { worldOffset: Pos2D; tilesetIndex: Pos2D }[] => {
  const tiles: { worldOffset: Pos2D; tilesetIndex: Pos2D }[] = []
  const mvarTiles = TILESET[name]
  const filteredMvarTiles =
    mvar.length === 0 ? mvarTiles : mvar.map(i => mvarTiles[i])
  for (const colorTiles of filteredMvarTiles) {
    const filteredColorTiles =
      color.length === 0 ? colorTiles : color.map(i => colorTiles[i])
    for (const rotTiles of filteredColorTiles) {
      const filteredRotTiles =
        rot.length === 0 ? rotTiles : rot.map(i => rotTiles[i])
      for (const frameTiles of filteredRotTiles) {
        const filteredFrameTiles =
          frame.length === 0 ? frameTiles : frame.map(i => frameTiles[i])
        for (const subTiles of filteredFrameTiles) {
          for (const [subkey, index] of Object.entries(subTiles)) {
            const [wx, wy] = subkey.split(' ')
            const [tx, ty] = index

            const worldOffset = { x: Number(wx), y: Number(wy) }
            if (
              sub.length === 0 ||
              sub.some(subi => Pos2dEquals(worldOffset, subi))
            ) {
              tiles.push({
                worldOffset,
                tilesetIndex: { x: tx, y: ty }
              })
            }
          }
        }
      }
    }
  }

  return tiles
}

import { Pos2D, Pos3D } from '../miscellaneous/types'

export interface Renderer {
  CanvasToWorldPosition: ({
    canvasPosition,
    wz
  }: {
    canvasPosition: Pos2D
    wz: number // must specify world z
  }) => Pos3D
  ClearCanvas: () => void
  DrawIsometricTile: (tile: Tile) => void
  DrawIsometricGrid: () => void
}

export interface Tile {
  worldPosition: Pos3D
  tileIndex: Pos2D
  tileset: TileSet
}

export enum TileSet {
  tiles = 'tiles',
  entities = 'entities',
  mapIndicators = 'mapIndicators'
}

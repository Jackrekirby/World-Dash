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
  DrawIsometricTile: (tile: RenderTile) => void
  DrawIsometricGrid: () => void
  SetScale: (scale: number) => void
}

export interface RenderTile {
  worldPosition: Pos3D
  tileIndex: Pos2D
  tileset: TileSet
}

export enum TileSet {
  tiles = 'tiles',
  entities = 'entities',
  mapIndicators = 'mapIndicators',
  edges = 'edges'
}

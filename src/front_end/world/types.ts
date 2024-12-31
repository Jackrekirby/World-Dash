import { Pos2D, Pos3D } from '../miscellaneous/types'
import { WorldTile } from './main'

export enum TileType {
  dirt = 'dirt',
  grass = 'grass',
  stone = 'stone',
  sand = 'sand',
  water = 'water',
  plant = 'plant',
  cactus = 'cactus',
  log = 'log',
  canopy = 'canopy',
  dryGrass = 'dryGrass',
  smallStones = 'smallStones',
  largeStones = 'largeStones',
  lava = 'lava',
  orchid = 'orchid',
  poppy = 'poppy',
  palmTree = 'palmTree',
  shortGrass = 'shortGrass',
  shortDryGrass = 'shortDryGrass'
}

export interface World {
  SetCursorWorldPosition: (cursorWorldPosition: Pos3D | null) => void
  GetCursorWorldPosition: () => Pos3D | null
  GetTile: (position: Pos3D) => WorldTile | undefined
  GetTiles: () => WorldTile[]
  GenerateTiles: ({
    landAxialRadius,
    worldAxialRadius
  }: {
    landAxialRadius?: number
    worldAxialRadius?: number
  }) => void
  GetSurfaceTile: (position: Pos2D) => WorldTile | undefined
}

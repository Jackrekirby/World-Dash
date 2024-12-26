import { Pos3D } from '../miscellaneous/types'
import { TileData } from './main'

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
  lava = 'lava'
}

export interface World {
  SetCursorWorldPosition: (cursorWorldPosition: Pos3D | null) => void
  GetCursorWorldPosition: () => Pos3D | null
  GetTile: (position: Pos3D) => TileData | undefined
  GetTiles: () => TileData[]
  GenerateTiles: ({
    landAxialRadius,
    worldAxialRadius
  }: {
    landAxialRadius?: number
    worldAxialRadius?: number
  }) => void
}

import { CreatePerlinNoise } from '../miscellaneous/perlin_noise'
import { Pos2D, Pos3D } from '../miscellaneous/types'
import { TileType, World } from './types'

export interface TileData {
  p: Pos3D
  tileType: TileType
}

export const CreateWorld = (): World => {
  let _cursorWorldPosition: Pos3D | null = null
  let _tiles: TileData[] = []

  const SetCursorWorldPosition = (cursorWorldPosition: Pos3D | null): void => {
    _cursorWorldPosition = null
  }

  const GetCursorWorldPosition = (): Pos3D | null => {
    return _cursorWorldPosition
  }

  const GetTile = (position: Pos3D): TileData | undefined => {
    const tile: TileData | undefined = _tiles.find(
      tile =>
        tile.p.x === position.x &&
        tile.p.y === position.y &&
        tile.p.z === position.z
    )
    return tile
  }
  const GetTiles = () => {
    return _tiles
  }

  const GenerateTiles = ({
    landAxialRadius = 1,
    worldAxialRadius = 12
  }: {
    landAxialRadius?: number
    worldAxialRadius?: number
  } = {}): void => {
    const perlin1 = CreatePerlinNoise()
    const perlin2 = CreatePerlinNoise()

    const positions: Pos2D[] = []
    for (let y = -worldAxialRadius; y <= worldAxialRadius; y += 1) {
      for (let x = -worldAxialRadius; x <= worldAxialRadius; x += 1) {
        positions.push({ x, y })
      }
    }

    const offset = worldAxialRadius // Perlin noise does not like negative numbers
    const octaves = 4
    for (const p of positions) {
      let frequency = 16
      const n1 = perlin1.noise({
        x: (p.x + offset) / frequency,
        y: (p.y + offset) / frequency,
        octaves
      })

      frequency = 8
      const n2 = perlin2.noise({
        x: (p.x + offset) / frequency,
        y: (p.y + offset) / frequency,
        octaves
      })

      let tileType: TileType = TileType.grass

      const borderDistance = landAxialRadius + n2
      if (Math.abs(p.x) > borderDistance || Math.abs(p.y) > borderDistance) {
        tileType = TileType.water
      } else if (n1 < -0.2) {
        tileType = TileType.water
      } else if (n1 < -0.1) {
        tileType = TileType.sand
      } else if (n1 < 0) {
        tileType = TileType.dirt
      } else if (n1 < 0.2) {
        tileType = TileType.dryGrass
      } else if (n1 < 0.4) {
        tileType = TileType.grass
      } else if (n1 < 0.7) {
        tileType = TileType.stone
      } else if (n1 < 1.0) {
        tileType = TileType.lava
      }

      let wz = 0
      if (tileType === TileType.water) {
        wz = 0
      } else if (n1 < 0.2) {
        wz = 0
      } else if (n1 < 0.4) {
        wz = 1
      } else if (n1 < 1.0) {
        wz = 2
      }
      for (let zz = 0; zz <= wz; zz++) {
        _tiles.push({ p: { x: p.x, y: p.y, z: zz }, tileType })
      }

      const AddDecorativeTile = (tileType: TileType, z: number = 1) => {
        _tiles.push({
          p: { x: p.x, y: p.y, z: wz + z },
          tileType: TileType.plant
        })
      }

      const r = Math.random()
      if (tileType === TileType.grass) {
        if (r < 0.1) {
          AddDecorativeTile(TileType.plant)
        } else if (r < 0.15) {
          AddDecorativeTile(TileType.log)
          AddDecorativeTile(TileType.canopy, 1)
        } else if (r < 0.2) {
          AddDecorativeTile(TileType.smallStones)
        }
      } else if (tileType === TileType.sand && r > 0.9) {
        AddDecorativeTile(TileType.cactus)
      } else if (tileType === TileType.stone && r > 0.95) {
        AddDecorativeTile(TileType.largeStones)
      }
    }
  }

  return {
    SetCursorWorldPosition,
    GetCursorWorldPosition,
    GetTile,
    GetTiles,
    GenerateTiles
  }
}

import { CreatePerlinNoise } from '../miscellaneous/perlin_noise'
import { Pos2D, Pos3D } from '../miscellaneous/types'
import { TileType, World } from './types'

export interface WorldTile {
  p: Pos3D
  tileType: TileType
}

export const CreateWorld = (): World => {
  let _cursorWorldPosition: Pos3D | null = null
  let _tiles: WorldTile[] = []

  const SetCursorWorldPosition = (cursorWorldPosition: Pos3D | null): void => {
    _cursorWorldPosition = cursorWorldPosition
  }

  const GetCursorWorldPosition = (): Pos3D | null => {
    return _cursorWorldPosition
  }

  const GetTile = (position: Pos3D): WorldTile | undefined => {
    const tile: WorldTile | undefined = _tiles.find(
      tile =>
        tile.p.x === position.x &&
        tile.p.y === position.y &&
        tile.p.z === position.z
    )
    return tile
  }

  const GetSurfaceTile = (position: Pos2D): WorldTile | undefined => {
    for (let z = 4; z >= 0; z--) {
      const tile: WorldTile | undefined = _tiles.find(
        tile =>
          tile.p.x === position.x && tile.p.y === position.y && tile.p.z === z
      )
      if (tile !== undefined) {
        return tile
      }
    }

    return undefined
  }

  const GetTiles = () => {
    return _tiles
  }

  const camelToSnake = (camelCase: string): string =>
    camelCase.replace(/[A-Z]/g, match => `_${match.toLowerCase()}`)

  const GenerateTiles = ({
    landAxialRadius = 1,
    worldAxialRadius = 12
  }: {
    landAxialRadius?: number
    worldAxialRadius?: number
  } = {}): void => {
    let tiles: WorldTile[] = []
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
        tiles.push({ p: { x: p.x, y: p.y, z: zz }, tileType })
      }

      const AddDecorativeTile = (tileType: TileType, z: number = 1) => {
        tiles.push({
          p: { x: p.x, y: p.y, z: wz + z },
          tileType
        })
      }

      const r = Math.random()
      if (tileType === TileType.grass) {
        if (r < 0.05) {
          AddDecorativeTile(TileType.blueOrchid)
        } else if (r < 0.1) {
          AddDecorativeTile(TileType.rose)
        } else if (r < 0.15) {
          AddDecorativeTile(TileType.log)
          AddDecorativeTile(TileType.canopy, 2)
        } else if (r < 0.2) {
          AddDecorativeTile(TileType.smallStones)
        }
      } else if (tileType === TileType.dryGrass && r < 0.1) {
        AddDecorativeTile(TileType.plant)
      } else if (tileType === TileType.sand) {
        if (r < 0.1) {
          AddDecorativeTile(TileType.cactus)
        } else if (r < 0.15) {
          AddDecorativeTile(TileType.palmTree)
        }
      } else if (tileType === TileType.stone && r > 0.95) {
        AddDecorativeTile(TileType.largeStones)
      }
    }

    _tiles = tiles

    const allowedLavaNeighbours = [TileType.stone, TileType.lava]

    // only allow lava tiles which are surrounded by stone
    for (let tile of _tiles) {
      if (tile.tileType === TileType.lava) {
        const neighbours: { p: Pos3D; tileTypes: (TileType | undefined)[] }[] =
          [
            { p: { x: 0, y: 0, z: 1 }, tileTypes: [undefined] },
            {
              p: { x: 1, y: 0, z: 0 },
              tileTypes: allowedLavaNeighbours
            },
            {
              p: { x: 0, y: 1, z: 0 },
              tileTypes: allowedLavaNeighbours
            },
            {
              p: { x: -1, y: 0, z: 0 },
              tileTypes: allowedLavaNeighbours
            },
            {
              p: { x: 0, y: -1, z: 0 },
              tileTypes: allowedLavaNeighbours
            }
          ]
        for (let neighbour of neighbours) {
          const other: WorldTile | undefined = GetTile({
            x: tile.p.x + neighbour.p.x,
            y: tile.p.y + neighbour.p.y,
            z: tile.p.z + neighbour.p.z
          })

          if (!neighbour.tileTypes.includes(other?.tileType)) {
            tile.tileType = TileType.stone
            break
          }
        }
      }
    }

    const edgedBlocks = [
      TileType.dirt,
      TileType.sand,
      TileType.dryGrass,
      TileType.stone,
      TileType.grass
    ]

    const edgeTiles: WorldTile[] = []
    for (let tile of _tiles) {
      if (!edgedBlocks.includes(tile.tileType)) {
        continue
      }
      const directions = [
        { key: 'nx', dir: { x: -1, y: 0 } },
        { key: 'px', dir: { x: 1, y: 0 } },
        { key: 'py', dir: { x: 0, y: 1 } },
        { key: 'ny', dir: { x: 0, y: -1 } }
      ]
      for (const { key, dir } of directions) {
        const p: Pos3D = {
          x: tile.p.x + dir.x,
          y: tile.p.y + dir.y,
          z: tile.p.z
        }
        const neighbour: WorldTile | undefined = GetTile(p)

        if (
          neighbour &&
          neighbour.tileType !== tile.tileType &&
          edgedBlocks.includes(neighbour.tileType)
        ) {
          const tileEdge: WorldTile = {
            p: tile.p,
            tileType: `${camelToSnake(neighbour.tileType)}_${key}` as TileType // hack for dynamic tiles
          }
          edgeTiles.push(tileEdge)
        }
      }
    }
    console.log('tile length', _tiles.length)
    _tiles.push(...edgeTiles)
  }

  return {
    SetCursorWorldPosition,
    GetCursorWorldPosition,
    GetTile,
    GetTiles,
    GenerateTiles,
    GetSurfaceTile
  }
}

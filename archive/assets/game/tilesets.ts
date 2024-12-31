import { Pos2D, Pos3D } from '../miscellaneous/types'
import { EDGE_TILESET_DATA } from '../procedural/edges'
import { TILENAME_TO_TILESET_INDEX_MAP } from '../renderer/tileset'
import { RenderTile, TileSet } from '../renderer/types'
import { CreateRenderTile } from '../renderer/utils'
import { WorldTile } from '../world/main'
import { TileType } from '../world/types'

interface TileTypeData {
  GetRenderTiles: ({
    worldPosition,
    time
  }: {
    worldPosition: Pos3D
    time: DOMHighResTimeStamp
  }) => RenderTile[]
}

const CreateTileTypeData = ({
  tileIndexesList,
  tileset,
  tileSelector
}: {
  tileIndexesList: Pos2D[][]
  tileset: TileSet
  tileSelector: (worldPosition: Pos3D, time: DOMHighResTimeStamp) => number
}): TileTypeData => {
  const GetRenderTiles = ({
    worldPosition,
    time
  }: {
    worldPosition: Pos3D
    time: DOMHighResTimeStamp
  }): RenderTile[] => {
    return tileIndexesList.map((tileIndexes: Pos2D[], index: number) => {
      const i = tileSelector(worldPosition, time)

      return {
        worldPosition: {
          x: worldPosition.x,
          y: worldPosition.y,
          z: worldPosition.z + index
        },
        tileIndex: tileIndexes[i],
        tileset
      }
    })
  }

  return {
    GetRenderTiles
  }
}

const CreateBasicTileTypeData = ({
  tileIndex,
  tileset = TileSet.tiles
}: {
  tileIndex: Pos2D
  tileset?: TileSet
}) => {
  return CreateTileTypeData({
    tileIndexesList: [[tileIndex]],
    tileset,
    tileSelector: () => 0
  })
}

const CreateRandomisedTileTypeData = ({
  tileIndexes,
  tileset = TileSet.tiles
}: {
  tileIndexes: Pos2D[]
  tileset?: TileSet
}) => {
  return CreateTileTypeData({
    tileIndexesList: [tileIndexes],
    tileset,
    tileSelector: (worldPosition: Pos3D, time: DOMHighResTimeStamp) => {
      const z = SurfaceNoise({ x: worldPosition.x, y: worldPosition.y })
      return Math.floor(z * tileIndexes.length)
    }
  })
}

// TODO Move this somewhere else
const CreateRandomNoise2D = (): ((p: Pos2D) => number) => {
  const values: number[] = []
  const n = 13
  for (let y = -n; y < n; y++) {
    for (let x = -n; x < n; x++) {
      values.push(Math.random())
    }
  }

  return (p: Pos2D): number => {
    return values[p.x + n + (p.y + n) * (2 * n)]
  }
}

const SurfaceNoise = CreateRandomNoise2D()

const tileMap: Map<TileType | string, TileTypeData> = new Map([
  [
    TileType.dirt,
    CreateRandomisedTileTypeData({
      tileIndexes: [
        { x: 5, y: 2 },
        { x: 6, y: 2 }
      ],
      tileset: TileSet.tiles
    })
  ],
  [
    TileType.grass,
    CreateRandomisedTileTypeData({
      tileIndexes: [
        { x: 0, y: 5 },
        { x: 1, y: 5 }
      ],
      tileset: TileSet.tiles
    })
  ],
  [TileType.stone, CreateBasicTileTypeData({ tileIndex: { x: 2, y: 0 } })],
  [TileType.sand, CreateBasicTileTypeData({ tileIndex: { x: 3, y: 0 } })],
  [
    TileType.water,
    CreateTileTypeData({
      tileIndexesList: [
        [
          { x: 5, y: 6 },
          { x: 6, y: 6 },
          { x: 7, y: 6 }
        ]
      ],
      tileset: TileSet.tiles,
      tileSelector: (worldPosition: Pos3D, time: DOMHighResTimeStamp) => {
        const z = SurfaceNoise({ x: worldPosition.x, y: worldPosition.y })
        const period = 20000
        const wrappedTime = (time + z * period) % period
        const i = Math.floor(wrappedTime / (period / 3))
        return i
      }
    })
  ],
  [
    TileType.plant,
    CreateRandomisedTileTypeData({
      tileIndexes: [
        { x: 4, y: 3 },
        { x: 5, y: 3 },
        { x: 6, y: 3 },
        { x: 4, y: 4 },
        { x: 5, y: 4 },
        { x: 6, y: 4 }
      ],
      tileset: TileSet.tiles
    })
  ],
  [TileType.cactus, CreateBasicTileTypeData({ tileIndex: { x: 8, y: 1 } })],
  [TileType.log, CreateBasicTileTypeData({ tileIndex: { x: 8, y: 3 } })],
  [TileType.canopy, CreateBasicTileTypeData({ tileIndex: { x: 7, y: 3 } })],
  [
    TileType.dryGrass,
    CreateRandomisedTileTypeData({
      tileIndexes: [
        { x: 3, y: 2 },
        { x: 4, y: 2 }
      ],
      tileset: TileSet.tiles
    })
  ],
  [
    TileType.smallStones,
    CreateBasicTileTypeData({ tileIndex: { x: 8, y: 0 } })
  ],
  [
    TileType.largeStones,
    CreateBasicTileTypeData({ tileIndex: { x: 9, y: 0 } })
  ],
  [TileType.lava, CreateBasicTileTypeData({ tileIndex: { x: 2, y: 3 } })],
  [
    TileType.orchid,
    CreateTileTypeData({
      tileIndexesList: [
        [
          { x: 10, y: 6 },
          { x: 9, y: 6 }
        ]
      ],
      tileset: TileSet.tiles,
      tileSelector: (worldPosition: Pos3D, time: DOMHighResTimeStamp) => {
        // const perlin = NOISE_MANAGER.GetNoise('plants')
        const z = SurfaceNoise({ x: worldPosition.x, y: worldPosition.y })
        const period = 19000
        const offset = z * period
        const [start, end] = [offset, offset + 1000]
        const wrappedTime = time % period
        // console.log({ start, end, worldPosition, time, z })
        if (start < wrappedTime && wrappedTime < end) {
          return 1
        } else {
          return 0
        }
      }
    })
  ],
  [TileType.poppy, CreateBasicTileTypeData({ tileIndex: { x: 8, y: 6 } })],
  [
    TileType.palmTree,
    CreateTileTypeData({
      tileIndexesList: [[{ x: 10, y: 4 }], [{ x: 10, y: 3 }]],
      tileset: TileSet.tiles,
      tileSelector: (worldPosition: Pos3D, time: DOMHighResTimeStamp) => 0
    })
  ],
  [
    TileType.dirtFrontEdge,
    CreateRandomisedTileTypeData({
      tileIndexes: [
        { x: 0, y: 4 },
        { x: 1, y: 4 },
        { x: 2, y: 4 }
      ],
      tileset: TileSet.tiles
    })
  ]
])

export const InitialiseEdgeTiles = () => {
  for (const [name, p] of Object.entries(EDGE_TILESET_DATA)) {
    tileMap.set(
      name,
      CreateBasicTileTypeData({ tileIndex: p, tileset: TileSet.edges })
    )
  }
}

const MapGet = <K, V>(map: Map<K, V>, key: K): V => {
  const value: V | undefined = map.get(key)
  if (value === undefined) {
    throw Error(`Key ${key} not found in map ${map}`)
  }
  return value
}

const GetTileVariant = ({
  name,
  p,
  blockParts = [],
  onlyParts = []
}: {
  name: string
  p: Pos2D
  blockParts?: string[]
  onlyParts?: string[]
}) => {
  const n = SurfaceNoise(p)
  const variants = Object.keys(TILENAME_TO_TILESET_INDEX_MAP).filter(key => {
    const parts: string[] = key.split(':')
    const hasBlockedParts: boolean = blockParts.some(blockPart =>
      parts.some(part => part.startsWith(blockPart))
    )
    if (hasBlockedParts) return false

    const hasOnlyParts: boolean = onlyParts.every(onlyPart =>
      parts.some(part => part.startsWith(onlyPart))
    )
    if (!hasOnlyParts) return false
    return parts[0] === name
  })

  if (variants.length === 0) {
    throw new Error(`Cannot find variant ${name}`)
  }

  const chosenVariant = variants[Math.floor(variants.length * n)]
  return chosenVariant
}

const GetAnimatedFrame = (
  framePeriods: number[],
  time: DOMHighResTimeStamp,
  p: Pos2D
): number => {
  const n = SurfaceNoise(p)
  let totalPeriod: number = 0
  for (let i = 0; i < framePeriods.length; i++) {
    totalPeriod += framePeriods[i]
  }
  let wrappedTime = (time + Math.floor(n * totalPeriod)) % totalPeriod
  for (let i = 0; i < framePeriods.length; i++) {
    wrappedTime -= framePeriods[i]
    if (wrappedTime <= 0) {
      return i
    }
  }
  console.log('GetAnimatedFrame got to end of loop without selecting a frame')
  return framePeriods.length - 1
}

const worldToRenderTileName: Map<TileType, string> = new Map([
  [TileType.grass, 'grass'],
  [TileType.dryGrass, 'dry_grass'],
  [TileType.dirt, 'dirt'],
  [TileType.stone, 'stone'],
  [TileType.lava, 'lava'],
  [TileType.sand, 'sand'],
  [TileType.plant, 'flower_a'],
  [TileType.cactus, 'flowering_small_cactus'],
  [TileType.smallStones, 'small_stones'],
  [TileType.largeStones, 'large_stones'],
  [TileType.shortGrass, 'short_grass'],
  [TileType.shortDryGrass, 'short_dry_grass'],
  [TileType.poppy, 'poppy']
])

export const GenerateRenderTiles = ({
  worldTiles,
  time
}: {
  worldTiles: WorldTile[]
  time: DOMHighResTimeStamp
}): RenderTile[] => {
  const rTiles: RenderTile[] = [] // render tiles

  for (const wTile of worldTiles) {
    if (worldToRenderTileName.has(wTile.tileType)) {
      const name = worldToRenderTileName.get(wTile.tileType) as string
      rTiles.push(
        CreateRenderTile({
          worldPosition: wTile.p,
          tilename: GetTileVariant({
            name,
            p: wTile.p,
            blockParts: ['edge-']
          })
        })
      )
    } else if (wTile.tileType === TileType.water) {
      rTiles.push(
        CreateRenderTile({
          worldPosition: wTile.p,
          tilename: `water:frame-${GetAnimatedFrame(
            [8000, 8000, 8000],
            time,
            wTile.p
          )}`
        })
      )
    } else if (wTile.tileType === TileType.orchid) {
      const frameKey = `frame-${GetAnimatedFrame([20000, 2000], time, wTile.p)}`
      rTiles.push(
        CreateRenderTile({
          worldPosition: wTile.p,
          tilename: GetTileVariant({
            name: 'orchid',
            p: wTile.p,
            onlyParts: [frameKey]
          })
        })
      )
    } else if (wTile.tileType === TileType.palmTree) {
      const pUp = { x: wTile.p.x, y: wTile.p.y, z: wTile.p.z + 1 }

      rTiles.push(
        ...[
          CreateRenderTile({
            worldPosition: pUp,
            tilename: GetTileVariant({
              name: 'palm_top',
              p: pUp
            })
          }),
          CreateRenderTile({
            worldPosition: wTile.p,
            tilename: GetTileVariant({
              name: 'palm_bottom',
              p: wTile.p
            })
          })
        ]
      )
    } else if (
      wTile.tileType.split(':').some(part => part.startsWith('edge-'))
    ) {
      const parts = wTile.tileType.split(':')
      const edgeKey = parts.find(part => part.startsWith('edge-')) as string
      rTiles.push(
        CreateRenderTile({
          worldPosition: wTile.p,
          tilename: GetTileVariant({
            name: parts[0],
            p: wTile.p,
            onlyParts: [edgeKey]
          })
        })
      )
    } else {
      // console.warn(`This tile type is not being rendered ${wTile.tileType}`)
    }
    // const tileTypeData: TileTypeData | undefined = tileMap.get(wTile.tileType)
    // if (tileTypeData === undefined) {
    //   throw Error(`Tiletype ${wTile.tileType} not in tilemap`)
    // }
    // const rts: RenderTile[] = tileTypeData.GetRenderTiles({
    //   worldPosition: wTile.p,
    //   time
    // })
    // rTiles.push(...rts)
  }

  return rTiles
}

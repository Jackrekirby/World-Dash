import { InitialiseDom } from './dom/main'
import { RandomisePlayerPosition, Render } from './game/main'
import { GenerateRenderTiles } from './game/tileset'
import { Game } from './game/types'
import { CreateRenderer } from './renderer/main'
import { RenderTile } from './renderer/types'
import { CreateWorld, WorldTile } from './world/main'
import { TileType } from './world/types'

console.log('Isometric')

const TestWorld = (): WorldTile[] => {
  return [
    {
      p: { x: 0, y: 0, z: 0.5 },
      tileType: TileType.grass
    },
    {
      p: { x: 0, y: 1, z: 0 },
      tileType: TileType.grass
    }
  ]
}

const main = async () => {
  const world = CreateWorld()
  world.GenerateTiles({ landAxialRadius: 6, worldAxialRadius: 12 })

  const renderer = await CreateRenderer()
  const game: Game = {
    showGrid: false,
    playerPosition: RandomisePlayerPosition(world)
  }

  InitialiseDom(world, renderer, game)

  const RenderLoop = () => {
    requestAnimationFrame((time: DOMHighResTimeStamp) => {
      const rTiles: RenderTile[] = GenerateRenderTiles({
        worldTiles: world.GetTiles(),
        time
      })
      Render(time, renderer, world, rTiles, game)
      RenderLoop()
    })
  }
  RenderLoop()
}

main()

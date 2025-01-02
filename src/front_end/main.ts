import { InitialiseDom } from './dom/main'
import { RandomisePlayerPosition, Render } from './game/main'
import { GenerateRenderTiles } from './game/tileset'
import { DisplayMode, Game } from './game/types'
import { CreateRenderer } from './renderer/main'
import { RenderTile } from './renderer/types'
import { CreateWorld } from './world/main'
import { TileType, WorldTile } from './world/types'

console.log('Isometric')

const TestWorld = (): WorldTile[] => {
  return [
    {
      p: { x: 0, y: 0, z: 0.5 },
      tileType: TileType.grass
    },
    {
      p: { x: 0, y: 0, z: 0 },
      tileType: TileType.grass
    }
  ]
}

const main = async () => {
  const world = CreateWorld()
  // world.SetTiles(TestWorld())
  world.GenerateTiles({ landAxialRadius: 6, worldAxialRadius: 12 })

  const renderer = await CreateRenderer()
  const game: Game = {
    showGrid: false,
    playerPosition: RandomisePlayerPosition(world),
    displayMode: DisplayMode.Normal
  }

  InitialiseDom(world, renderer, game)

  let frameCount = 0
  let lastTime = performance.now()
  let elapsedComputeTime = 0

  const RenderLoop = () => {
    requestAnimationFrame((time: DOMHighResTimeStamp) => {
      const startTime = performance.now()
      frameCount++

      // Calculate elapsed time
      const elapsedTime = time - lastTime
      if (elapsedTime >= 2000) {
        const fps = (frameCount / elapsedTime) * 1000 // Frames per second
        const computeFps = fps * (elapsedTime / elapsedComputeTime)

        console.log('FPS', {
          average: fps.toFixed(2),
          compute: computeFps.toFixed(2)
        })

        frameCount = 0
        lastTime = time
        elapsedComputeTime = 0
      }

      const rTiles: RenderTile[] = GenerateRenderTiles({
        worldTiles: world.GetTiles(),
        time,
        game
      })
      Render(time, renderer, world, rTiles, game)
      RenderLoop()
      const endTime = performance.now()
      elapsedComputeTime += endTime - startTime
    })
  }

  RenderLoop()
}

main()

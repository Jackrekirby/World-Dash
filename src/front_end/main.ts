import { elements } from './dom/elements'
import { InitialiseDom } from './dom/main'
import { RandomisePlayerPosition, Render } from './game/main'
import { GenerateRenderTiles } from './game/tilesets'
import { Game } from './game/types'
import { RenderPixelMap } from './procedural/main'
import { CreateRenderer } from './renderer/main'
import { RenderTile } from './renderer/types'
import { CreateWorld } from './world/main'

console.log('Isometric')

const main = async () => {
  const canvas = elements.canvas
  canvas.width = 512
  canvas.height = 512
  // RunShadeMap()
  RenderPixelMap()
  return

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

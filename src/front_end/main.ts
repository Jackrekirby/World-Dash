import { elements } from './dom/elements'
import { InitialiseDom } from './dom/main'
import { RandomisePlayerPosition, Render } from './game/main'
import { GenerateRenderTiles } from './game/tilesets'
import { Game } from './game/types'
import { GenerateProceduralConnectedTextures3 } from './procedural/main'
import { CreateRenderer } from './renderer/main'
import { RenderTile } from './renderer/types'
import { CreateWorld } from './world/main'

console.log('Isometric')

const main = async () => {
  const canvas = elements.canvas
  canvas.width = 512
  canvas.height = 512
  // RunShadeMap()
  // GenerateProceduralConnectedTextures2({
  //   innerMinAlpha: 1.0,
  //   innerMaxAlpha: 1.0,
  //   innerPixelChance: 1.0,
  //   outerMinAlpha: 1.0,
  //   outerMaxAlpha: 1.0,
  //   outerPixelChance: 1.0
  // })
  GenerateProceduralConnectedTextures3()
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

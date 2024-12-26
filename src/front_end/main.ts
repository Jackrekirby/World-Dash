import { elements } from './dom/elements'
import { InitialiseDom } from './dom/main'
import { Render } from './game/main'
import { Game } from './game/types'
import { CreateRenderer } from './renderer/main'
import { GenerateRenderTiles } from './renderer/tilesets'
import { Tile } from './renderer/types'
import { CreateWorld } from './world/main'

console.log('Isometric')

const main = async () => {
  const canvas = elements.canvas
  canvas.width = 512
  canvas.height = 512

  const world = CreateWorld()
  world.GenerateTiles({ landAxialRadius: 8, worldAxialRadius: 12 })

  const renderer = await CreateRenderer()
  const game: Game = { showGrid: false }

  const rTiles: Tile[] = GenerateRenderTiles(world.GetTiles())
  InitialiseDom(world, renderer, game)

  const RenderLoop = () => {
    requestAnimationFrame((time: DOMHighResTimeStamp) => {
      Render(time, renderer, world, rTiles, game)
      RenderLoop()
    })
  }
  RenderLoop()
}

main()

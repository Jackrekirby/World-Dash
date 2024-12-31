import { InitialiseDom } from './dom/main'
import { RandomisePlayerPosition, Render } from './game/main'
import { InitialiseEdgeTiles } from './game/tilesets'
import { Game } from './game/types'
import { CreateRenderTile } from './procedural/new'
import { CreateRenderer } from './renderer/main'
import { RenderTile } from './renderer/types'
import { CreateWorld } from './world/main'

console.log('Isometric')

const main = async () => {
  // const canvas = elements.canvas
  // canvas.width = 512
  // canvas.height = 512
  // RunShadeMap()
  // GenerateProceduralConnectedTextures2({
  //   innerMinAlpha: 1.0,
  //   innerMaxAlpha: 1.0,
  //   innerPixelChance: 1.0,
  //   outerMinAlpha: 1.0,
  //   outerMaxAlpha: 1.0,
  //   outerPixelChance: 1.0
  // })
  // GenerateProceduralConnectedTextures3()
  // return

  const world = CreateWorld()
  world.GenerateTiles({ landAxialRadius: 6, worldAxialRadius: 12 })

  const renderer = await CreateRenderer()
  const game: Game = {
    showGrid: false,
    playerPosition: RandomisePlayerPosition(world)
  }

  InitialiseDom(world, renderer, game)

  InitialiseEdgeTiles()

  const RenderLoop = () => {
    requestAnimationFrame((time: DOMHighResTimeStamp) => {
      // const rTiles: RenderTile[] = GenerateRenderTiles({
      //   worldTiles: world.GetTiles(),
      //   time
      // })
      const rTiles: RenderTile[] = [
        CreateRenderTile({
          worldPosition: { x: 0, y: 0, z: 0 },
          tilename: 'grass'
        })
      ]

      Render(time, renderer, world, rTiles, game)
      RenderLoop()
    })
  }
  RenderLoop()
}

main()

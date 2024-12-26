import { elements } from './dom/elements'
import { InitialiseDom } from './dom/main'
import { Render } from './game/main'
import { GenerateRenderTiles } from './game/tilesets'
import { Game } from './game/types'
import { Pos2D, Pos3D } from './miscellaneous/types'
import { CreateRenderer } from './renderer/main'
import { RenderTile } from './renderer/types'
import { CreateWorld, WorldTile } from './world/main'
import { TileType } from './world/types'

console.log('Isometric')

const main = async () => {
  const canvas = elements.canvas
  canvas.width = 512
  canvas.height = 512

  const world = CreateWorld()
  world.GenerateTiles({ landAxialRadius: 6, worldAxialRadius: 12 })

  let playerPosition: Pos3D = { x: 0, y: 0, z: 0 }

  for (let i = 0; i < 100; i++) {
    const p: Pos2D = {
      x: Math.floor(Math.random() * 6) - 3,
      y: Math.floor(Math.random() * 6) - 3
    }
    const tile: WorldTile | undefined = world.GetSurfaceTile(p)
    if (tile !== undefined && tile.tileType !== TileType.water) {
      playerPosition = { x: tile.p.x, y: tile.p.y, z: tile.p.z + 1 }
      console.log(playerPosition)
      break
    }
  }

  const renderer = await CreateRenderer()
  const game: Game = { showGrid: false, playerPosition }

  const rTiles: RenderTile[] = GenerateRenderTiles(world.GetTiles())
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

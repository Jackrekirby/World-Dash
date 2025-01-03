import { CreateKeyboard } from './dom/keyboard'
import { InitialiseDom } from './dom/main'
import { CreateMouse } from './dom/mouse'
import { CreateCamera } from './game/camera'
import { CalculateCursorWorldPosition } from './game/cursor'
import { RandomisePlayerPosition, Render } from './game/main'
import { GenerateRenderTiles } from './game/tileset'
import { DisplayMode, Game } from './game/types'
import { Pos3dZero } from './miscellaneous/pos_3d'
import { Pos3D } from './miscellaneous/types'
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
  world.GenerateTiles({ landAxialRadius: 24, worldAxialRadius: 32 })

  const renderer = await CreateRenderer()
  const game: Game = {
    showGrid: false,
    playerPosition: RandomisePlayerPosition(world),
    displayMode: DisplayMode.Normal,
    camera: CreateCamera({ acceleration: 1.5, maxSpeed: 20, friction: 0.08 }),
    mouse: CreateMouse()
  }

  const keyboard = CreateKeyboard()

  InitialiseDom(world, renderer, game)

  let frameCount = 0
  let lastTime = performance.now()
  let elapsedComputeTime = 0

  const cameraMovementSpeed: number = 1

  const RenderLoop = (previousTime: DOMHighResTimeStamp) => {
    requestAnimationFrame((time: DOMHighResTimeStamp) => {
      const deltaTime = (time - previousTime) / 1000

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

      const force = Pos3dZero()
      if (keyboard.IsKeyPressed('W')) {
        force.x -= cameraMovementSpeed
      }
      if (keyboard.IsKeyPressed('S')) {
        force.x += cameraMovementSpeed
      }
      if (keyboard.IsKeyPressed('A')) {
        force.y -= cameraMovementSpeed
      }
      if (keyboard.IsKeyPressed('D')) {
        force.y += cameraMovementSpeed
      }
      if (keyboard.IsKeyPressed('C')) {
        force.z -= cameraMovementSpeed
      }
      if (keyboard.IsKeyPressed(' ')) {
        force.z += cameraMovementSpeed
      }

      game.camera.Update(deltaTime, force)

      const worldPosition: Pos3D | null = CalculateCursorWorldPosition(
        renderer,
        world,
        game
      )

      world.SetCursorWorldPosition(worldPosition)

      const rTiles: RenderTile[] = GenerateRenderTiles({
        worldTiles: world.GetTiles(),
        time,
        game
      })
      Render(time, renderer, world, rTiles, game)
      const endTime = performance.now()
      elapsedComputeTime += endTime - startTime
      RenderLoop(time)
    })
  }

  RenderLoop(performance.now())
}

main()

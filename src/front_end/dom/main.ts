import { CalculateCursorWorldPosition } from '../game/cursor'
import { RandomisePlayerPosition } from '../game/main'
import { Game } from '../game/types'
import { Pos2D, Pos3D } from '../miscellaneous/types'
import { Renderer } from '../renderer/types'
import { World } from '../world/types'
import { CyclicButtonManager } from './cyclicButtonManager'
import { elements } from './elements'

export const InitialiseDom = (world: World, renderer: Renderer, game: Game) => {
  CyclicButtonManager({
    values: ['Grid On', 'Grid Off'],
    defaultValue: 'Grid On',
    name: 'toggleGrid',
    OnChangeCallback: (value: string) => {
      const showGrid = value === 'Grid On'
      game.showGrid = showGrid
    }
  })

  CyclicButtonManager({
    values: [1, 2, 4, 8],
    defaultValue: 4,
    name: 'tileScale',
    OnChangeCallback: (scale: number) => {
      renderer.SetScale(scale)
    },
    ToString: String,
    FromString: Number
  })

  elements.canvas.addEventListener('mousemove', (event: MouseEvent) => {
    const canvasPosition: Pos2D = { x: event.offsetX, y: event.offsetY }
    const worldPosition: Pos3D | null = CalculateCursorWorldPosition(
      renderer,
      world,
      canvasPosition
    )
    world.SetCursorWorldPosition(worldPosition)
  })

  elements.randomiseWorld.onclick = () => {
    world.GenerateTiles({ landAxialRadius: 6, worldAxialRadius: 12 })
    game.playerPosition = RandomisePlayerPosition(world)
  }
}

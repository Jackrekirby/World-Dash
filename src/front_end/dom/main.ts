import { CalculateCursorWorldPosition } from '../game/cursor'
import { Game } from '../game/types'
import { Pos2D, Pos3D } from '../miscellaneous/types'
import { Renderer } from '../renderer/types'
import { World } from '../world/types'
import { CyclicButtonManager } from './cyclicButtonManager'
import { elements } from './elements'

export const InitialiseDom = (world: World, renderer: Renderer, game: Game) => {
  CyclicButtonManager(
    ['Grid On', 'Grid Off'],
    'Grid On',
    'toggleGrid',
    (value: string) => {
      const showGrid = value === 'Grid On'
      game.showGrid = showGrid
    }
  )

  elements.canvas.addEventListener('mousemove', (event: MouseEvent) => {
    const canvasPosition: Pos2D = { x: event.offsetX, y: event.offsetY }
    const worldPosition: Pos3D | null = CalculateCursorWorldPosition(
      renderer,
      world,
      canvasPosition
    )
    world.SetCursorWorldPosition(worldPosition)
  })
}

import { RandomisePlayerPosition } from '../game/main'
import { DisplayMode, Game } from '../game/types'
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

  CyclicButtonManager({
    values: ['Normal', 'Debug'],
    defaultValue: 'Normal',
    name: 'displayMode',
    OnChangeCallback: (value: string) => {
      game.displayMode = value as DisplayMode
    }
  })

  elements.randomiseWorld.onclick = () => {
    world.GenerateTiles({ landAxialRadius: 24, worldAxialRadius: 32 })
    game.playerPosition = RandomisePlayerPosition(world)
  }
}

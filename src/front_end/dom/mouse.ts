import { Mouse } from '../game/types'
import { Pos2dZero } from '../miscellaneous/pos_2d'
import { Pos2D } from '../miscellaneous/types'
import { elements } from './elements'

export const CreateMouse = (): Mouse => {
  let _position: Pos2D = Pos2dZero()

  elements.canvas.addEventListener('mousemove', (event: MouseEvent) => {
    const rect = elements.canvas.getBoundingClientRect()
    const canvasPosition: Pos2D = {
      x: (event.offsetX / rect.width) * elements.canvas.width,
      y: (event.offsetY / rect.height) * elements.canvas.height
    }
    _position = canvasPosition
  })

  const GetPosition = () => {
    return _position
  }

  return {
    GetPosition
  }
}

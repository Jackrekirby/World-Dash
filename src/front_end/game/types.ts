import { Pos3D } from '../miscellaneous/types'

export enum DisplayMode {
  Normal = 'Normal',
  Debug = 'Debug'
}

export interface Game {
  showGrid: boolean
  playerPosition: Pos3D
  displayMode: DisplayMode
}

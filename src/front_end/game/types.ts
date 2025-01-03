import { Pos2D, Pos3D } from '../miscellaneous/types'

export enum DisplayMode {
  Normal = 'Normal',
  Debug = 'Debug'
}

export interface Mouse {
  GetPosition: () => Pos2D
}

export interface Camera {
  GetPosition: () => Pos3D
  Update: (deltaTime: number, force: Pos3D) => void
}

export interface Game {
  showGrid: boolean
  playerPosition: Pos3D
  displayMode: DisplayMode
  camera: Camera
  mouse: Mouse
}

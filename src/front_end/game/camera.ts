import {
  Pos3dAdd,
  Pos3dDivide,
  Pos3dMultiply,
  Pos3dScalarOperation
} from '../miscellaneous/pos_3d'
import { Pos3D } from '../miscellaneous/types'
import { Camera } from './types'

export const CreateCamera = ({
  acceleration,
  maxSpeed,
  friction
}: {
  acceleration: number
  maxSpeed: number
  friction: number
}): Camera => {
  let velocity: Pos3D = { x: 0, y: 0, z: 0 }
  let position: Pos3D = { x: 0, y: 0, z: 0 }

  let _acceleration = acceleration // How fast the camera accelerates
  let _maxSpeed = maxSpeed // Maximum speed of the camera
  let _friction = friction // Deceleration when no key is pressed

  const Update = (deltaTime: number, force: Pos3D): void => {
    // Normalize the input vector for diagonal movement
    const inputMagnitude = Math.hypot(force.x, force.y, force.z)
    if (inputMagnitude > 0) {
      force = Pos3dDivide(force, inputMagnitude)
    }

    // Apply acceleration to velocity
    velocity = Pos3dAdd(velocity, Pos3dMultiply(force, _acceleration))

    // Clamp velocity to maxSpeed
    const velocityMagnitude = Math.hypot(velocity.x, velocity.y, velocity.z)
    if (velocityMagnitude > _maxSpeed) {
      velocity = Pos3dMultiply(velocity, _maxSpeed / velocityMagnitude)
    }

    // Apply friction
    velocity = Pos3dMultiply(velocity, 1 - _friction)

    // Update camera position
    position = Pos3dAdd(position, Pos3dMultiply(velocity, deltaTime))

    velocity = Pos3dScalarOperation(velocity, (v: number) =>
      Math.abs(v) < 0.5 ? 0 : v
    )
  }

  const GetPosition = (): Pos3D => {
    return position
  }

  return {
    GetPosition,
    Update
  }
}

import { Pos3D } from './types'

export const Pos3dZero = (): Pos3D => {
  return Pos3dFromScalar(0)
}

export const Pos3dFromScalar = (scalar: number): Pos3D => {
  return { x: scalar, y: scalar, z: scalar }
}

export const Pos3dScalarOperation = <T>(
  p: Pos3D,
  operation: (v: number) => T
): { x: T; y: T; z: T } => {
  return { x: operation(p.x), y: operation(p.y), z: operation(p.z) }
}

export const Pos3dAdd = (a: Pos3D, b: Pos3D | number): Pos3D => {
  if (typeof b === 'number') {
    return { x: a.x + b, y: a.y + b, z: a.z + b }
  } else {
    return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z }
  }
}

export const Pos3dSubtract = (a: Pos3D, b: Pos3D | number): Pos3D => {
  if (typeof b === 'number') {
    return { x: a.x - b, y: a.y - b, z: a.z - b }
  } else {
    return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z }
  }
}

export const Pos3dMultiply = (a: Pos3D, b: Pos3D | number): Pos3D => {
  if (typeof b === 'number') {
    return { x: a.x * b, y: a.y * b, z: a.z * b }
  } else {
    return { x: a.x * b.x, y: a.y * b.y, z: a.z * b.z }
  }
}

export const Pos3dDivide = (a: Pos3D, b: Pos3D | number): Pos3D => {
  if (typeof b === 'number') {
    return { x: a.x / b, y: a.y / b, z: a.z / b }
  } else {
    return { x: a.x / b.x, y: a.y / b.y, z: a.z / b.z }
  }
}

export const Pos3dDistanceBetween = (a: Pos3D, b: Pos3D): number =>
  Math.sqrt(
    Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2) + Math.pow(b.z - a.z, 2)
  )

export const Pos3dMagnitude = (p: Pos3D): number =>
  Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z)

export const Pos3dNormalize = (p: Pos3D): Pos3D => {
  const mag = Pos3dMagnitude(p)
  return mag === 0 ? Pos3dZero() : Pos3dDivide(p, mag)
}

export const Pos3dEquals = (a: Pos3D, b: Pos3D): boolean =>
  a.x === b.x && a.y === b.y && a.z === b.z

export const Pos3dDotProduct = (a: Pos3D, b: Pos3D): number =>
  a.x * b.x + a.y * b.y + a.z * b.z

export const Pos3dCrossProduct = (a: Pos3D, b: Pos3D): Pos3D => {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x
  }
}

export const Pos3dLerp = (a: Pos3D, b: Pos3D, t: number): Pos3D => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
  z: a.z + (b.z - a.z) * t
})

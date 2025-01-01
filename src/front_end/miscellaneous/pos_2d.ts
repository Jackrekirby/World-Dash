import { Pos2D } from './types'

export const Pos2dZero = (): Pos2D => {
  return Pos2dFromScalar(0)
}

export const Pos2dFromScalar = (scalar: number): Pos2D => {
  return { x: scalar, y: scalar }
}

export const Pos2dScalarOperation = <T>(
  p: Pos2D,
  operation: (v: number) => T
): { x: T; y: T } => {
  return { x: operation(p.x), y: operation(p.y) }
}

export const Pos2dAdd = (a: Pos2D, b: Pos2D | number): Pos2D => {
  if (typeof b === 'number') {
    return { x: a.x + b, y: a.y + b }
  } else {
    return { x: a.x + b.x, y: a.y + b.y }
  }
}

export const Pos2dSubtract = (a: Pos2D, b: Pos2D | number): Pos2D => {
  if (typeof b === 'number') {
    return { x: a.x - b, y: a.y - b }
  } else {
    return { x: a.x - b.x, y: a.y - b.y }
  }
}

export const Pos2dMultiply = (a: Pos2D, b: Pos2D | number): Pos2D => {
  if (typeof b === 'number') {
    return { x: a.x * b, y: a.y * b }
  } else {
    return { x: a.x * b.x, y: a.y * b.y }
  }
}

export const Pos2dDivide = (a: Pos2D, b: Pos2D | number): Pos2D => {
  if (typeof b === 'number') {
    return { x: a.x / b, y: a.y / b }
  } else {
    return { x: a.x / b.x, y: a.y / b.y }
  }
}

export const Pos2dDistanceBetween = (a: Pos2D, b: Pos2D): number =>
  Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2))

export const Pos2dMagnitude = (p: Pos2D): number =>
  Math.sqrt(p.x * p.x + p.y * p.y)

export const Pos2dNormalize = (p: Pos2D): Pos2D => {
  const mag = Pos2dMagnitude(p)
  return mag === 0 ? Pos2dZero() : Pos2dDivide(p, mag)
}

export const Pos2dEquals = (a: Pos2D, b: Pos2D): boolean =>
  a.x === b.x && a.y === b.y

export const Pos2dDotProduct = (a: Pos2D, b: Pos2D): number =>
  a.x * b.x + a.y * b.y

export const Pos2dRotate = (pos: Pos2D, angle: number): Pos2D => {
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  return {
    x: pos.x * cos - pos.y * sin,
    y: pos.x * sin + pos.y * cos
  }
}

export const Pos2dLerp = (a: Pos2D, b: Pos2D, t: number): Pos2D => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t
})

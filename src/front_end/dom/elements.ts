import { Elements } from './types'

const elementIds: (keyof Elements)[] = ['canvas', 'toggleGrid']

const GetElements = (): Elements => {
  const elements: { [key: string]: HTMLElement | null } = Object.fromEntries(
    elementIds.map(id => [id, document.getElementById(id)])
  )
  const nullElements = Object.keys(elements).filter(id => elements[id] === null)
  if (nullElements.length > 0) {
    throw new Error(`Failed to find all elements by id ${nullElements}`)
  }
  return elements as unknown as Elements
}

export const elements = GetElements()

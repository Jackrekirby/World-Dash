import { elements } from './elements'
import { GetLocalStorageItem } from './localStorage'
import { Elements } from './types'

// TODO: add back reset local storage callback
export const CyclicButtonManager = (
  values: string[],
  defaultValue: string,
  name: keyof Elements,
  onChangeCallback: (value: string) => void
): void => {
  const element = elements[name] as HTMLElement // also display element

  const storageKey = name

  const Initialise = () => {
    const value = GetLocalStorageItem(storageKey, defaultValue)
    element.textContent = value
    onChangeCallback(value)
  }
  Initialise()

  const CycleCounter = () => {
    let value = element.textContent
    const index = values.findIndex(other => other === value)
    const nextIndex = (index + 1) % values.length
    value = values[nextIndex]

    element.textContent = value
    localStorage.setItem(storageKey, value)
    onChangeCallback(value)
  }

  element.onclick = () => CycleCounter()
}

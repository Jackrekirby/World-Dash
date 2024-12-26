import { elements } from './elements'
import { GetLocalStorageItem } from './localStorage'
import { Elements } from './types'

// TODO: add back reset local storage callback
export const CyclicButtonManager = <T>({
  values,
  defaultValue,
  name,
  ToString = String, // toString is a built in js method
  FromString = (value: string) => value as T,
  OnChangeCallback = () => {}
}: {
  values: T[]
  defaultValue: T
  name: keyof Elements
  ToString?: (value: T) => string
  FromString?: (value: string) => T
  OnChangeCallback?: (value: T) => void
}): void => {
  const element = elements[name] as HTMLElement // also display element

  const storageKey = name

  const Initialise = () => {
    const value = GetLocalStorageItem(storageKey, ToString(defaultValue))
    element.textContent = value
    OnChangeCallback(FromString(value))
  }
  Initialise()

  const CycleCounter = () => {
    let valueStr: string =
      element.textContent === null
        ? ToString(defaultValue)
        : element.textContent
    let value = FromString(valueStr)
    const index = values.findIndex(other => other === value)
    const nextIndex = (index + 1) % values.length

    value = values[nextIndex]
    valueStr = ToString(value)

    element.textContent = valueStr
    localStorage.setItem(storageKey, valueStr)
    OnChangeCallback(value)
  }

  element.onclick = () => CycleCounter()
}

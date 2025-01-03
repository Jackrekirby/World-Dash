type Key = 'W' | 'A' | 'S' | 'D' | ' ' | 'C'

export const CreateKeyboard = () => {
  // A map to store the pressed state of each key
  const keys: Record<Key, boolean> = {
    W: false,
    A: false,
    S: false,
    D: false,
    ' ': false,
    C: false
  }

  // Event listener for keydown
  window.addEventListener('keydown', event => {
    const key = event.key.toUpperCase()
    // console.log(`key '${key}'`)
    if (key in keys) {
      keys[key as Key] = true
    }
  })

  // Event listener for keyup
  window.addEventListener('keyup', event => {
    const key = event.key.toUpperCase()
    if (key in keys) {
      keys[key as Key] = false
    }
  })

  const IsKeyPressed = (key: Key): boolean => {
    return keys[key]
  }

  return {
    IsKeyPressed
  }
}

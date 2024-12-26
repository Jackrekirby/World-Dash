export const GetLocalStorageItem = (
  key: string,
  defaultValue: string
): string => {
  const value = localStorage.getItem(key)
  if (value === null) {
    localStorage.setItem(key, defaultValue)
    return defaultValue
  } else {
    return value
  }
}

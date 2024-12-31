const WARNINGS = new Set()
const LOGS = new Set()
export const warnOnce = (key: string, ...data: any[]): void => {
  if (!WARNINGS.has(key)) {
    WARNINGS.add(key)
    console.warn(...data)
  }
}

export const logOnce = (key: string, ...data: any[]): void => {
  if (!LOGS.has(key)) {
    LOGS.add(key)
    console.log(...data)
  }
}

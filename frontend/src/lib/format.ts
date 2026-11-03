export const money = (n: number) => {
  const sign = Number(n) < 0 ? '-' : ''
  return sign + '$' + Math.abs(Number(n)).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export const pct = (n: number, digits = 1) => `${n.toFixed(digits)}%`

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

export const nowUTC = () =>
  new Date().toISOString().slice(0, 19).replace('T', ' ')

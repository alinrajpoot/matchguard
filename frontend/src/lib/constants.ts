import { seedTitles } from '@/mock/seed'

export function titleForPath(pathname: string) {
  if (pathname.startsWith('/review')) return 'Match Review'
  const key = pathname.split('/')[1] ?? 'dashboard'
  return seedTitles[key] ?? 'Dashboard'
}

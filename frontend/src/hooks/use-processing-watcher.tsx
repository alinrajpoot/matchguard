import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { RunStatus } from '@/schemas/domain'
import { queryKeys, useRuns } from './queries'

export function ProcessingWatcher() {
  const qc = useQueryClient()
  const { data: runs } = useRuns()
  const previous = useRef<Map<string, RunStatus>>(new Map())

  useEffect(() => {
    if (!runs) return
    let resolved = false
    for (const run of runs) {
      const before = previous.current.get(run.id)
      if (before === 'processing' && run.status !== 'processing') resolved = true
      previous.current.set(run.id, run.status)
    }
    if (resolved) {
      qc.invalidateQueries({ queryKey: queryKeys.queue })
      qc.invalidateQueries({ queryKey: queryKeys.dashboard })
      qc.invalidateQueries({ queryKey: queryKeys.audit })
      qc.invalidateQueries({ queryKey: queryKeys.notifications })
      qc.invalidateQueries({ queryKey: queryKeys.invoices })
    }
  }, [runs, qc])

  return null
}

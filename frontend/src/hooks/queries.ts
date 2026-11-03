import { useQuery } from '@tanstack/react-query'
import {
  fetchAssistantTools, fetchAudit, fetchDashboard, fetchDocuments, fetchInfra,
  fetchInvoices, fetchMe, fetchNotifications, fetchPolicy, fetchQueue, fetchReview,
  fetchRun, fetchRuns, fetchSearchIndex,
} from '@/mock/api'

export const queryKeys = {
  me: ['me'] as const,
  dashboard: ['dashboard'] as const,
  documents: ['documents'] as const,
  invoices: ['invoices'] as const,
  runs: ['runs'] as const,
  run: (id: string) => ['runs', id] as const,
  queue: ['queue'] as const,
  review: (id: string) => ['review', id] as const,
  policy: ['policy'] as const,
  audit: ['audit'] as const,
  notifications: ['notifications'] as const,
  infra: ['infra'] as const,
  assistantTools: ['assistant-tools'] as const,
  searchIndex: ['search-index'] as const,
}

const ACTIVE_DOC_STATUSES = ['Uploading', 'IDP extraction', 'Indexing']

export const useMe = () => useQuery({ queryKey: queryKeys.me, queryFn: fetchMe })
export const useDashboard = () => useQuery({ queryKey: queryKeys.dashboard, queryFn: fetchDashboard })
export const useInvoices = () => useQuery({ queryKey: queryKeys.invoices, queryFn: fetchInvoices })
export const useQueue = () => useQuery({ queryKey: queryKeys.queue, queryFn: fetchQueue })
export const usePolicy = () => useQuery({ queryKey: queryKeys.policy, queryFn: fetchPolicy })
export const useAudit = () => useQuery({ queryKey: queryKeys.audit, queryFn: fetchAudit })
export const useNotifications = () => useQuery({ queryKey: queryKeys.notifications, queryFn: fetchNotifications })
export const useInfra = () => useQuery({ queryKey: queryKeys.infra, queryFn: fetchInfra })
export const useAssistantTools = () => useQuery({ queryKey: queryKeys.assistantTools, queryFn: fetchAssistantTools })
export const useSearchIndex = () => useQuery({ queryKey: queryKeys.searchIndex, queryFn: fetchSearchIndex })

export function useDocuments() {
  return useQuery({
    queryKey: queryKeys.documents,
    queryFn: fetchDocuments,
    refetchInterval: (query) =>
      query.state.data?.some((doc) => ACTIVE_DOC_STATUSES.includes(doc.status)) ? 700 : false,
  })
}

export function useRuns() {
  return useQuery({
    queryKey: queryKeys.runs,
    queryFn: fetchRuns,
    refetchInterval: (query) =>
      query.state.data?.some((run) => run.status === 'processing') ? 700 : false,
  })
}

export const useRun = (id: string) =>
  useQuery({ queryKey: queryKeys.run(id), queryFn: () => fetchRun(id), enabled: Boolean(id) })

export const useReview = (id: string) =>
  useQuery({ queryKey: queryKeys.review(id), queryFn: () => fetchReview(id), enabled: Boolean(id) })

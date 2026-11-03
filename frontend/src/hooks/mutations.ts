import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { PolicyDraft, Preferences } from '@/schemas/domain'
import {
  decideReview, deleteDocuments, discardPolicy, loadSampleBatch,
  markAllNotificationsRead, markNotificationRead, publishPolicy,
  resetDemo, runMatch, updatePolicyDraft, updatePreferences, updateProfile,
  uploadDocuments,
} from '@/mock/api'
import { queryKeys } from './queries'

export function useUploadDocuments() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: uploadDocuments,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.documents })
      qc.invalidateQueries({ queryKey: queryKeys.invoices })
      qc.invalidateQueries({ queryKey: queryKeys.searchIndex })
    },
  })
}

export function useLoadSampleBatch() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: loadSampleBatch,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.documents })
      qc.invalidateQueries({ queryKey: queryKeys.invoices })
      qc.invalidateQueries({ queryKey: queryKeys.searchIndex })
    },
  })
}

export function useDeleteDocuments() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteDocuments,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.documents })
      qc.invalidateQueries({ queryKey: queryKeys.searchIndex })
    },
  })
}

export function useRunMatch() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: runMatch,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.invoices })
      qc.invalidateQueries({ queryKey: queryKeys.runs })
    },
  })
}

export function useDecideReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: { matchId: string; decision: 'approve' | 'reject'; reason: string }) =>
      decideReview(input.matchId, input.decision, input.reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.queue })
      qc.invalidateQueries({ queryKey: queryKeys.runs })
      qc.invalidateQueries({ queryKey: queryKeys.audit })
      qc.invalidateQueries({ queryKey: queryKeys.dashboard })
      qc.invalidateQueries({ queryKey: queryKeys.notifications })
    },
  })
}

export function useUpdatePolicyDraft() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (draft: PolicyDraft) => updatePolicyDraft(draft),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.policy })
      qc.invalidateQueries({ queryKey: queryKeys.queue })
    },
  })
}

export function usePublishPolicy() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (draft: PolicyDraft) => publishPolicy(draft),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.policy })
      qc.invalidateQueries({ queryKey: queryKeys.queue })
      qc.invalidateQueries({ queryKey: queryKeys.audit })
      qc.invalidateQueries({ queryKey: queryKeys.notifications })
    },
  })
}

export function useDiscardPolicy() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: discardPolicy,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.policy }),
  })
}

export function useMarkNotificationRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notifications })
      qc.invalidateQueries({ queryKey: queryKeys.dashboard })
    },
  })
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notifications })
      qc.invalidateQueries({ queryKey: queryKeys.dashboard })
    },
  })
}

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.me }),
  })
}

export function useUpdatePreferences() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (preferences: Preferences) => updatePreferences(preferences),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.me }),
  })
}

export function useResetDemo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: resetDemo,
    onSuccess: () => qc.invalidateQueries(),
  })
}

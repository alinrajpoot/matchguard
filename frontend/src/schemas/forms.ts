import { z } from 'zod'
import { PolicyDraftSchema } from './domain'

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})
export type LoginValues = z.infer<typeof loginSchema>

export const reviewDecisionSchema = z.object({
  decision: z.enum(['approve', 'reject']),
  reason: z.string(),
}).superRefine((value, ctx) => {
  if (value.decision === 'approve' && value.reason.trim().length < 10) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['reason'],
      message: 'Enter a reason with at least 10 characters to approve.',
    })
  }
})
export type ReviewDecisionValues = z.infer<typeof reviewDecisionSchema>

export const policyFormSchema = PolicyDraftSchema
export type PolicyFormValues = z.infer<typeof policyFormSchema>

export const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  tz: z.string().min(1),
})
export type ProfileValues = z.infer<typeof profileSchema>

export const preferencesSchema = z.object({
  escalation: z.boolean(),
  slaWarning: z.boolean(),
  weeklyDigest: z.boolean(),
})
export type PreferencesValues = z.infer<typeof preferencesSchema>

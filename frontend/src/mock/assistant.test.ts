import { beforeEach, describe, expect, it } from 'vitest'
import { resetDb } from './db'
import { askAssistant, routePrompt } from './assistant'

beforeEach(() => resetDb())

describe('assistant routing', () => {
  it('routes keywords to tool names', () => {
    expect(routePrompt('Show pipeline health')).toBe('get_pipeline_health')
    expect(routePrompt('Why was MR-2025-1042 escalated?')).toBe('get_match_trace')
    expect(routePrompt('Show documents missing a GRN')).toBe('get_invoice_links')
    expect(routePrompt('Raise variance threshold to 4%')).toBe('propose_policy_change')
    expect(routePrompt('Summarize this month')).toBe('get_dashboard_stats')
    expect(routePrompt('Tell me a joke')).toBeNull()
  })

  it('returns a typed widget reply', async () => {
    const reply = await askAssistant('Show pipeline health', 'Dashboard')
    expect(reply.widget?.kind).toBe('pipeline_health')
  })

  it('falls back to a text answer', async () => {
    const reply = await askAssistant('Tell me a joke', 'Dashboard')
    expect(reply.text).toContain('I can search documents')
    expect(reply.widget).toBeUndefined()
  })
})

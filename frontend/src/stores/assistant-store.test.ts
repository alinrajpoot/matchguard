import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAssistantStore } from './assistant-store'

vi.mock('@/mock/assistant', () => ({
  askAssistant: vi.fn(async () => ({ text: 'Mocked answer' })),
}))

beforeEach(() => useAssistantStore.getState().reset())

describe('assistant store', () => {
  it('appends the user message and the assistant reply', async () => {
    await useAssistantStore.getState().send('hello')
    const messages = useAssistantStore.getState().messages
    expect(messages.some((m) => m.role === 'user' && m.text === 'hello')).toBe(true)
    expect(messages.some((m) => m.role === 'assistant' && m.text === 'Mocked answer')).toBe(true)
  })
})

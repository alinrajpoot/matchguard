import { create } from 'zustand'
import type { AssistantWidget } from '@/schemas/domain'
import { askAssistant } from '@/mock/assistant'

export interface AssistantMessage {
  id: string
  role: 'user' | 'assistant'
  text?: string
  widget?: AssistantWidget
}

interface AssistantState {
  messages: AssistantMessage[]
  typing: boolean
  context: string
  setContext: (context: string) => void
  send: (text: string) => Promise<void>
  reset: () => void
}

const initialMessage: AssistantMessage = {
  id: 'assistant-welcome',
  role: 'assistant',
  text: 'Hi Priya. I can search documents, trace a match, explain guardrail decisions, show audit history, check pipeline health, and draft policy changes. Every tool call is logged.',
}

const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `msg-${Date.now()}-${Math.random()}`

export const useAssistantStore = create<AssistantState>((set, get) => ({
  messages: [initialMessage],
  typing: false,
  context: 'Dashboard',
  setContext: (context) => set({ context }),
  send: async (text) => {
    const trimmed = text.trim()
    if (!trimmed || get().typing) return
    set((s) => ({
      messages: [...s.messages, { id: newId(), role: 'user', text: trimmed }],
      typing: true,
    }))
    const reply = await askAssistant(trimmed, get().context)
    set((s) => ({
      messages: [
        ...s.messages,
        { id: newId(), role: 'assistant', text: reply.text, widget: reply.widget },
      ],
      typing: false,
    }))
  },
  reset: () => set({ messages: [initialMessage], typing: false }),
}))

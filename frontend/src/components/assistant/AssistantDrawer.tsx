import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet, SheetContent, SheetDescription, SheetTitle,
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { useAssistantStore } from '@/stores/assistant-store'
import { useUiStore } from '@/stores/ui-store'
import { Sparkles, Wrench } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ToolsPanel } from './ToolsPanel'
import { AssistantWidget } from './widgets'

const SUGGESTIONS = [
  'Show documents missing a GRN',
  'Why was MR-2025-1042 escalated?',
  'Open the evidence for HS-88421',
  'Show pipeline health',
  'Raise variance threshold to 4%',
  'Summarize this month',
]

export function AssistantDrawer() {
  const open = useUiStore((state) => state.assistantOpen)
  const setOpen = useUiStore((state) => state.setAssistantOpen)
  const toolsOpen = useUiStore((state) => state.toolsOpen)
  const toggleTools = useUiStore((state) => state.toggleTools)

  const messages = useAssistantStore((state) => state.messages)
  const typing = useAssistantStore((state) => state.typing)
  const context = useAssistantStore((state) => state.context)
  const send = useAssistantStore((state) => state.send)

  const [text, setText] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ block: 'end' })
  }, [messages, typing, toolsOpen])

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    void send(trimmed)
    setText('')
  }

  const tryTool = (prompt: string) => {
    void send(prompt)
    if (toolsOpen) toggleTools()
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        className="w-[620px] max-w-full gap-0 p-0 sm:max-w-none max-[640px]:w-full"
      >
        <div className="flex h-14 flex-none items-center gap-2.5 border-b px-4 pr-12">
          <div className="flex size-8 flex-none items-center justify-center rounded-md bg-accent text-accent-foreground">
            <Sparkles className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <SheetTitle className="text-[15px] font-bold leading-[1.2]">Assistant</SheetTitle>
            <SheetDescription className="sr-only">
              Chat with the MatchGuard assistant and its workspace tools.
            </SheetDescription>
            <div className="mt-px flex items-center gap-1.5">
              <Badge variant="success">
                <span className="size-1.5 rounded-full bg-success" />
                Connected
              </Badge>
              <span className="truncate text-[12px] text-muted-foreground/70">Context: {context}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="iconSm"
            aria-label={toolsOpen ? 'Hide tools' : 'Show tools'}
            onClick={toggleTools}
          >
            <Wrench />
          </Button>
        </div>

        <ScrollArea className="min-h-0 flex-1 bg-muted/30">
          <div className="p-3.5">
            {toolsOpen && <ToolsPanel onTry={tryTool} />}

            <div className="grid gap-3">
              {messages.map((message) => (
                message.role === 'user' ? (
                  <div key={message.id} className="flex justify-end">
                    <div className="max-w-[86%] rounded-[10px_10px_3px_10px] bg-primary px-3 py-2 text-[13.5px] leading-[1.5] text-primary-foreground shadow-sm">
                      {message.text}
                    </div>
                  </div>
                ) : (
                  <div key={message.id} className="flex items-start gap-2.5">
                    <div className="mt-px flex size-6 flex-none items-center justify-center rounded-md bg-accent text-accent-foreground">
                      <Sparkles className="size-3.5" />
                    </div>
                    <div className="min-w-0 flex-1 text-[13.5px] leading-[1.55]">
                      {message.text && <p className="text-muted-foreground">{message.text}</p>}
                      {message.widget && <AssistantWidget widget={message.widget} />}
                    </div>
                  </div>
                )
              ))}

              {typing && (
                <div className="flex items-start gap-2.5">
                  <div className="mt-px flex size-6 flex-none items-center justify-center rounded-md bg-accent text-accent-foreground">
                    <Sparkles className="size-3.5" />
                  </div>
                  <p className="text-[13.5px] text-muted-foreground">Working…</p>
                </div>
              )}
              <div ref={endRef} />
            </div>
          </div>
        </ScrollArea>

        <div className="flex-none border-t bg-card px-3.5 py-3">
          <div className="mb-2 flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => void send(suggestion)}
                className="rounded-full border bg-card px-3 py-1.5 text-[12.5px] font-medium text-secondary-foreground transition-colors hover:border-primary/40 hover:bg-accent hover:text-accent-foreground"
              >
                {suggestion}
              </button>
            ))}
          </div>
          <form className="flex items-end gap-2" onSubmit={submit}>
            <Textarea
              aria-label="Message the assistant"
              placeholder="Ask about documents, matches, guardrails…"
              value={text}
              onChange={(event) => setText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  event.currentTarget.form?.requestSubmit()
                }
              }}
              className="h-[84px] flex-1 text-[13.5px]"
            />
            <Button type="submit" className="h-9" disabled={!text.trim() || typing}>
              Send
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Sparkles, Wrench } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet, SheetContent, SheetDescription, SheetTitle,
} from '@/components/ui/sheet'
import { useAssistantStore } from '@/stores/assistant-store'
import { useUiStore } from '@/stores/ui-store'
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
        className="w-[420px] max-w-full gap-0 p-0 sm:max-w-none max-[640px]:w-full"
      >
        <div className="flex h-[50px] flex-none items-center gap-2 border-b px-3 pr-10">
          <div className="flex size-7 flex-none items-center justify-center rounded-md bg-accent text-accent-foreground">
            <Sparkles className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <SheetTitle className="text-[12.5px] font-[650] leading-[1.2]">Assistant</SheetTitle>
            <SheetDescription className="sr-only">
              Chat with the MatchGuard assistant and its workspace tools.
            </SheetDescription>
            <div className="mt-px flex items-center gap-1.5">
              <Badge variant="success">
                <span className="size-1.5 rounded-full bg-success" />
                Connected
              </Badge>
              <span className="truncate text-[9px] text-muted-foreground/70">Context: {context}</span>
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

        <ScrollArea className="min-h-0 flex-1 bg-[#fbfbfc]">
          <div className="p-[10px]">
            {toolsOpen && <ToolsPanel onTry={tryTool} />}

            <div className="grid gap-2.5">
              {messages.map((message) => (
                message.role === 'user' ? (
                  <div key={message.id} className="flex justify-end">
                    <div className="max-w-[86%] rounded-[8px_8px_2px_8px] bg-primary px-2.5 py-1.5 text-[11.5px] leading-[1.45] text-primary-foreground">
                      {message.text}
                    </div>
                  </div>
                ) : (
                  <div key={message.id} className="flex items-start gap-[7px]">
                    <div className="mt-px flex size-[22px] flex-none items-center justify-center rounded-md bg-accent text-accent-foreground">
                      <Sparkles className="size-3.5" />
                    </div>
                    <div className="min-w-0 flex-1 text-[11.5px] leading-[1.5]">
                      {message.text && <p className="text-muted-foreground">{message.text}</p>}
                      {message.widget && <AssistantWidget widget={message.widget} />}
                    </div>
                  </div>
                )
              ))}

              {typing && (
                <div className="flex items-start gap-[7px]">
                  <div className="mt-px flex size-[22px] flex-none items-center justify-center rounded-md bg-accent text-accent-foreground">
                    <Sparkles className="size-3.5" />
                  </div>
                  <p className="text-[11.5px] text-muted-foreground">Working…</p>
                </div>
              )}
              <div ref={endRef} />
            </div>
          </div>
        </ScrollArea>

        <div className="flex-none border-t bg-card px-[10px] py-[9px]">
          <div className="mb-[7px] flex flex-wrap gap-1">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => void send(suggestion)}
                className="rounded-full border bg-card px-2 py-[3px] text-[9.5px] font-medium text-secondary-foreground hover:border-[#c7d2fe] hover:bg-[#f8f8ff] hover:text-accent-foreground"
              >
                {suggestion}
              </button>
            ))}
          </div>
          <form className="flex gap-[5px]" onSubmit={submit}>
            <Input
              aria-label="Message the assistant"
              placeholder="Ask about documents, matches, guardrails…"
              value={text}
              onChange={(event) => setText(event.target.value)}
              className="h-[31px] flex-1 text-[11px]"
            />
            <Button type="submit" size="sm" className="h-[31px]" disabled={!text.trim() || typing}>
              Send
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}

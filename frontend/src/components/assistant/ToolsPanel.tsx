import { Button } from '@/components/ui/button'
import { useAssistantTools } from '@/hooks/queries'

export function ToolsPanel({ onTry }: { onTry: (prompt: string) => void }) {
  const { data } = useAssistantTools()

  return (
    <div className="mb-2 overflow-hidden rounded-[7px] border bg-card">
      {data?.map((tool) => (
        <div
          key={tool.name}
          className="flex items-center gap-[7px] border-b px-2 py-1.5 text-[10.5px] last:border-0"
        >
          <span className="mono text-[9.5px] font-semibold text-accent-foreground">{tool.name}</span>
          <span className="min-w-0 flex-1 truncate text-muted-foreground">{tool.desc}</span>
          <Button size="xs" variant="outline" className="flex-none" onClick={() => onTry(tool.prompt)}>
            Try
          </Button>
        </div>
      ))}
    </div>
  )
}

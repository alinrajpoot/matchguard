import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-2 py-16 text-center text-[13px] text-muted-foreground">
      <AlertCircle className="size-6 text-danger" />
      <div>Something went wrong loading this screen.</div>
      <Button variant="outline" size="xs" onClick={onRetry}>Retry</Button>
    </div>
  )
}

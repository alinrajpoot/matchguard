import { useState } from 'react'
import { RefreshCw, Upload, UploadCloud } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function UploadDropzone({ onFiles, onBrowse, onLoadSample, sampleLoading = false }: {
  onFiles: (files: File[]) => void
  onBrowse: () => void
  onLoadSample: () => void
  sampleLoading?: boolean
}) {
  const [dragging, setDragging] = useState(false)

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault()
        setDragging(false)
        onFiles(Array.from(event.dataTransfer.files))
      }}
      className={cn(
        'rounded-lg border-[1.5px] border-dashed bg-card px-3.5 py-3.5 text-center transition-colors',
        dragging ? 'border-primary bg-accent/40' : 'border-input hover:border-primary/60 hover:bg-accent/20',
      )}
    >
      <button type="button" onClick={onBrowse} className="mx-auto block w-full rounded-md">
        <span className="mx-auto mb-[7px] flex size-[34px] items-center justify-center rounded-lg bg-accent text-primary">
          <UploadCloud className="size-5" />
        </span>
        <span className="block text-[15px] font-semibold">Drop files here, or click to browse</span>
        <span className="mt-0.5 block text-[13px] text-muted-foreground">
          Single or batch upload · PDF, XLSX, CSV, HTML, PNG · max 20 MB each
        </span>
      </button>
      <div className="mt-[9px] flex flex-wrap justify-center gap-1.5">
        <Button size="xs" onClick={onBrowse}>
          <Upload />Upload files
        </Button>
        <Button variant="outline" size="xs" disabled={sampleLoading} onClick={onLoadSample}>
          <RefreshCw />Load sample batch
        </Button>
        <span className="self-center text-[12.5px] text-muted-foreground">or drag and drop</span>
      </div>
    </div>
  )
}

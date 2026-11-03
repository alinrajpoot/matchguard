import { useRef, type ChangeEvent } from 'react'
import { Cloud, Database, Eye, Upload } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { LoadingState } from '@/components/shared/LoadingState'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { TypeBadge } from '@/components/shared/TypeBadge'
import { useLoadSampleBatch, useUploadDocuments } from '@/hooks/mutations'
import { useDocuments } from '@/hooks/queries'
import { s3Key } from '@/lib/s3'
import { cn } from '@/lib/utils'
import type { Document } from '@/schemas/domain'
import { useUiStore } from '@/stores/ui-store'
import { DocumentDialog } from './DocumentDialog'
import { OrphansTab } from './OrphansTab'
import { UploadDropzone } from './UploadDropzone'

const HEAD = 'text-[9px] uppercase tracking-[0.04em] text-muted-foreground'
const STAGES = ['Uploading', 'IDP extraction', 'Indexing'] as const
const ACTIVE_STATUSES = new Set<string>(STAGES)

function StageDots({ status }: { status: Document['status'] }) {
  const currentIndex = STAGES.indexOf(status as (typeof STAGES)[number])
  return (
    <span className="flex items-center gap-1">
      {STAGES.map((stage, index) => (
        <span
          key={stage}
          className={cn(
            'size-[5px] rounded-full',
            index < currentIndex ? 'bg-emerald-500' : index === currentIndex ? 'bg-sky-500' : 'bg-border',
          )}
        />
      ))}
    </span>
  )
}

export default function DocumentsPage() {
  const { data, isLoading, isError, refetch } = useDocuments()
  const [searchParams, setSearchParams] = useSearchParams()
  const upload = useUploadDocuments()
  const sample = useLoadSampleBatch()
  const openInfra = useUiStore((state) => state.openInfra)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const updateParams = (patch: Record<string, string | null>) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      for (const [key, value] of Object.entries(patch)) {
        if (value === null) next.delete(key)
        else next.set(key, value)
      }
      return next
    }, { replace: true })
  }

  if (isLoading) return <LoadingState />
  if (isError || !data) return <ErrorState onRetry={() => refetch()} />

  const documents = data
  const repoDocs = documents.filter((doc) => !doc.orphan)
  const orphanDocs = documents.filter((doc) => doc.orphan)
  const activeDocs = repoDocs.filter((doc) => ACTIVE_STATUSES.has(doc.status))

  const openDoc = documents.find((doc) => doc.id === searchParams.get('doc')) ?? null
  const tab = searchParams.get('tab') === 'orphans' || openDoc?.orphan ? 'orphans' : 'repo'
  const query = (searchParams.get('q') ?? '').trim().toLowerCase()
  const filteredDocs = repoDocs.filter((doc) =>
    !query || `${doc.file} ${doc.vendor} ${doc.docNo} ${doc.type}`.toLowerCase().includes(query),
  )

  const queueFiles = (files: File[]) => {
    if (!files.length) return
    upload.mutate(files.map((file) => ({ name: file.name })), {
      onSuccess: () => {
        const count = files.length
        toast(`${count} file${count === 1 ? '' : 's'} queued for S3 upload and IDP/NER extraction.`)
      },
      onError: (error) => toast(error.message),
    })
  }

  const handleFileInput = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ''
    queueFiles(files)
  }

  const browse = () => fileInputRef.current?.click()

  const loadSample = () => {
    sample.mutate(undefined, {
      onSuccess: (created) => {
        const count = created.length
        toast(`${count} file${count === 1 ? '' : 's'} queued for S3 upload and IDP/NER extraction.`)
      },
      onError: (error) => toast(error.message),
    })
  }

  const viewDoc = (doc: Document) => {
    updateParams(doc.orphan ? { doc: doc.id, tab: 'orphans' } : { doc: doc.id })
  }

  return (
    <>
      <PageHeader
        title="Documents"
        subtitle="One repository for every file. IDP/NER detects the type, resolves the vendor, and links PO + GRN automatically."
        chips={['s3', 'bedrock', 'pinecone']}
        actions={<Button size="xs" onClick={browse}><Upload />Upload files</Button>}
      />

      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        aria-label="Upload document files"
        onChange={handleFileInput}
      />

      <Tabs
        value={tab}
        onValueChange={(value) => updateParams({ tab: value === 'orphans' ? 'orphans' : null })}
        className="gap-[9px]"
      >
        <TabsList>
          <TabsTrigger value="repo">
            Repository
            <span className="rounded bg-background/70 px-1 text-[9.5px] tabular-nums">{repoDocs.length}</span>
          </TabsTrigger>
          <TabsTrigger value="orphans">
            Orphans
            <span className="rounded bg-background/70 px-1 text-[9.5px] tabular-nums">{orphanDocs.length}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="repo">
          <div className="mb-[9px] grid grid-cols-[minmax(0,1fr)_320px] gap-[9px] max-[900px]:grid-cols-1">
            <UploadDropzone
              onFiles={queueFiles}
              onBrowse={browse}
              onLoadSample={loadSample}
              sampleLoading={sample.isPending}
            />

            <div className="rounded-lg border bg-card">
              <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
                <h3 className="text-[12.5px] font-semibold">Processing</h3>
                <Badge variant={activeDocs.length ? 'info' : 'neutral'}>{activeDocs.length} active</Badge>
              </div>
              <div className="p-3">
                {activeDocs.length === 0 ? (
                  <EmptyState title="No files processing." hint="Uploads run S3 → IDP/NER → Pinecone." />
                ) : (
                  <div className="grid gap-[6px]">
                    {activeDocs.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center gap-[7px] border-b pb-[5px] text-[10.5px] last:border-0 last:pb-0"
                      >
                        <span className="min-w-0 flex-1 truncate">{doc.file}</span>
                        <StageDots status={doc.status} />
                        <span className="text-muted-foreground">{doc.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border bg-card">
            <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
              <div className="flex items-center gap-1.5">
                <h3 className="text-[12.5px] font-semibold">Repository</h3>
                <Badge variant="neutral">{filteredDocs.length}</Badge>
              </div>
              <Input
                aria-label="Filter documents"
                placeholder="Filter documents"
                value={searchParams.get('q') ?? ''}
                onChange={(event) => updateParams({ q: event.target.value || null })}
                className="h-7 w-[180px] text-[11px]"
              />
            </div>

            <Table className="text-[11px]">
              <TableHeader>
                <TableRow>
                  <TableHead className={HEAD}>File</TableHead>
                  <TableHead className={HEAD}>Detected</TableHead>
                  <TableHead className={HEAD}>Vendor</TableHead>
                  <TableHead className={HEAD}>Document #</TableHead>
                  <TableHead className={HEAD}>Links</TableHead>
                  <TableHead className={HEAD}>Uploaded</TableHead>
                  <TableHead className={HEAD}>Status</TableHead>
                  <TableHead className={`${HEAD} text-right`}>Evidence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="p-0">
                      <EmptyState title="No documents match this filter." />
                    </TableCell>
                  </TableRow>
                )}
                {filteredDocs.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div className="font-semibold">{doc.file}</div>
                      <div className="mt-px text-[10px] text-muted-foreground">
                        {doc.id}{doc.matchId ? ` · ${doc.matchId}` : ''}
                      </div>
                    </TableCell>
                    <TableCell><TypeBadge type={doc.type} /></TableCell>
                    <TableCell>{doc.vendor}</TableCell>
                    <TableCell className="tabular-nums">{doc.docNo || <span className="text-muted-foreground">—</span>}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {doc.po && <Badge variant="info">{doc.po}</Badge>}
                        {doc.grn && <Badge variant="warning">{doc.grn}</Badge>}
                        {!doc.po && !doc.grn && <span className="text-muted-foreground">—</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{doc.uploaded}</TableCell>
                    <TableCell><StatusBadge status={doc.status} /></TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="outline"
                          size="iconSm"
                          aria-label={`View ${doc.file}`}
                          title="View document"
                          onClick={() => viewDoc(doc)}
                        >
                          <Eye />
                        </Button>
                        <Button
                          variant="outline"
                          size="iconSm"
                          aria-label={`View ${doc.file} on S3`}
                          title="View on S3"
                          onClick={() => openInfra('s3', s3Key(doc))}
                        >
                          <Cloud />
                        </Button>
                        <Button
                          variant="outline"
                          size="iconSm"
                          aria-label={`View Pinecone vectors for ${doc.file}`}
                          title="View Pinecone vectors"
                          onClick={() => openInfra('pinecone', `idx-matchguard-docs · ${doc.file} · ${doc.pinecone} vectors`)}
                        >
                          <Database />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="orphans">
          <OrphansTab docs={orphanDocs} onView={viewDoc} />
        </TabsContent>
      </Tabs>

      <DocumentDialog doc={openDoc} onOpenChange={(open) => { if (!open) updateParams({ doc: null }) }} />
    </>
  )
}

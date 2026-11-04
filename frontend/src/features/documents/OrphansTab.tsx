import { useState } from 'react'
import { CircleAlert, Cloud, Eye, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { EmptyState } from '@/components/shared/EmptyState'
import { TypeBadge } from '@/components/shared/TypeBadge'
import { useDeleteDocuments } from '@/hooks/mutations'
import { s3Key } from '@/lib/s3'
import type { Document } from '@/schemas/domain'
import { useUiStore } from '@/stores/ui-store'

const HEAD = 'text-[12px] uppercase tracking-[0.05em] text-muted-foreground'

export function OrphansTab({ docs, onView }: { docs: Document[]; onView: (doc: Document) => void }) {
  const [selected, setSelected] = useState<string[]>([])
  const [pending, setPending] = useState<string[] | null>(null)
  const deleteDocuments = useDeleteDocuments()
  const openInfra = useUiStore((state) => state.openInfra)

  const requestDelete = (ids: string[]) => {
    if (!ids.length) {
      toast('Select at least one orphan document.')
      return
    }
    setPending(ids)
  }

  const confirmDelete = () => {
    if (!pending) return
    const ids = pending
    deleteDocuments.mutate(ids, {
      onSuccess: () => {
        const count = ids.length
        toast(`${count} orphan document${count === 1 ? '' : 's'} deleted from S3 and Pinecone.`)
        setSelected((current) => current.filter((id) => !ids.includes(id)))
        setPending(null)
      },
      onError: (error) => {
        toast(error.message)
        setPending(null)
      },
    })
  }

  return (
    <>
      <div className="mb-[9px] flex items-start gap-2 rounded-lg border border-warning/30 bg-warning-bg/60 px-3.5 py-3 text-[13px] text-warning">
        <CircleAlert className="mt-px size-4 shrink-0" />
        <div>
          <b>Orphan documents</b> are files that never linked to an invoice, PO or GRN. They stay in
          S3 and Pinecone until you remove them. Deleting removes the S3 object and its vectors.
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="flex items-center justify-between gap-2 border-b px-4 py-2.5">
          <div className="flex items-center gap-1.5">
            <h3 className="text-[15px] font-semibold">Orphans</h3>
            <Badge variant="warning">{docs.length}</Badge>
          </div>
          <Button variant="outline" size="xs" onClick={() => requestDelete(selected)}>
            <Trash2 />Delete selected
          </Button>
        </div>

        <Table className="text-[13px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-8" />
              <TableHead className={HEAD}>File</TableHead>
              <TableHead className={HEAD}>Detected</TableHead>
              <TableHead className={HEAD}>Vendor</TableHead>
              <TableHead className={HEAD}>Why orphan</TableHead>
              <TableHead className={`${HEAD} text-right`}>Confidence</TableHead>
              <TableHead className={HEAD}>Uploaded</TableHead>
              <TableHead className={`${HEAD} text-right`}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {docs.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="p-0">
                  <EmptyState title="No orphan documents. Everything is linked." />
                </TableCell>
              </TableRow>
            )}
            {docs.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell>
                  <Checkbox
                    aria-label={`Select ${doc.file}`}
                    checked={selected.includes(doc.id)}
                    onCheckedChange={(checked) => setSelected((current) => (
                      checked ? [...current, doc.id] : current.filter((id) => id !== doc.id)
                    ))}
                  />
                </TableCell>
                <TableCell>
                  <div className="font-semibold">{doc.file}</div>
                  <div className="mt-px text-[12.5px] text-muted-foreground">{doc.id}</div>
                </TableCell>
                <TableCell><TypeBadge type={doc.type} /></TableCell>
                <TableCell>{doc.vendor}</TableCell>
                <TableCell>
                  <Badge variant="warning">{doc.reason || 'Unlinked'}</Badge>
                </TableCell>
                <TableCell className="text-right tabular-nums">{Math.round(doc.confidence * 100)}%</TableCell>
                <TableCell className="text-muted-foreground">{doc.uploaded}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="outline"
                      size="iconSm"
                      aria-label={`View ${doc.file}`}
                      title="View document"
                      onClick={() => onView(doc)}
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
                      className="text-danger"
                      aria-label={`Delete ${doc.file}`}
                      title="Delete orphan"
                      onClick={() => requestDelete([doc.id])}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={pending !== null} onOpenChange={(open) => { if (!open) setPending(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete orphan documents?</AlertDialogTitle>
            <AlertDialogDescription>
              {pending?.length ?? 0} document{(pending?.length ?? 0) === 1 ? '' : 's'} will be
              removed from S3 and their Pinecone vectors deleted. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

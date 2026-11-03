import { Cloud, Download, ExternalLink, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { KeyValueList } from '@/components/shared/KeyValueList'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { TypeBadge } from '@/components/shared/TypeBadge'
import { money } from '@/lib/format'
import { mimeOf, s3Key } from '@/lib/s3'
import { seedLines } from '@/mock/seed'
import type { Document } from '@/schemas/domain'
import { useUiStore } from '@/stores/ui-store'

const S3_CONSOLE_URL = 'https://s3.console.aws.amazon.com/s3/buckets/matchguard-demo-documents'

const TYPE_LABEL: Record<Document['type'], string> = {
  PO: 'Purchase order',
  GRN: 'Goods receipt note',
  INV: 'Vendor invoice',
  Unknown: 'Unclassified',
}

const DOC_TITLE: Record<Document['type'], string> = {
  PO: 'PURCHASE ORDER',
  GRN: 'GOODS RECEIPT NOTE',
  INV: 'INVOICE',
  Unknown: 'UNCLASSIFIED DOCUMENT',
}

function PreviewPaper({ doc }: { doc: Document }) {
  const vendor = doc.vendor && doc.vendor !== 'Unresolved' ? doc.vendor : 'Unresolved vendor'
  const docNo = doc.docNo || '—'
  const buyer = 'Northgate Industrial Supply'
  const partyLabel = doc.type === 'INV' ? 'Bill to' : doc.type === 'GRN' ? 'Received from' : 'Vendor'
  const party = doc.type === 'INV'
    ? [buyer, 'Attn: AP Operations']
    : [vendor, 'Attn: Receiving']
  const letterhead = doc.type === 'INV'
    ? [vendor, 'No. 88 Gongye 3rd Road, Xitun District, Taichung City, Taiwan']
    : [buyer, '4120 Westfield Industrial Parkway, Columbus, OH 43228']

  return (
    <div className="mx-auto max-w-[700px] border border-[#d0d5dd] bg-white px-[30px] py-[26px] font-serif text-[10.5px] text-[#111] shadow-[0_8px_24px_-16px_rgba(0,0,0,0.3)]">
      <div className="mb-[9px] flex justify-between gap-5 border-b-2 border-[#333] pb-2">
        <div>
          <h4 className="m-0 text-[16px] tracking-[0.06em]">{letterhead[0]}</h4>
          <div className="mt-[3px] text-[9px]">{letterhead[1]}</div>
        </div>
        <div className="text-right text-[9.5px] leading-[1.5]">
          <b>{DOC_TITLE[doc.type]}</b>
          <br />
          {docNo}
          <br />
          {doc.uploaded}
        </div>
      </div>

      <div className="my-2 grid grid-cols-2 gap-[9px] text-[9.5px] leading-[1.45]">
        <div className="border border-[#999] px-[7px] py-1.5">
          <b>{partyLabel}</b>
          <div>{party[0]}</div>
          <div>{party[1]}</div>
        </div>
        <div className="border border-[#999] px-[7px] py-1.5">
          <b>References</b>
          <div>PO: {doc.po || '—'}</div>
          <div>GRN: {doc.grn || '—'}</div>
          <div>Currency: USD</div>
        </div>
      </div>

      <table className="my-2 w-full border-collapse text-[9.5px]">
        <thead>
          <tr>
            <th className="border border-[#999] bg-[#eee] px-[5px] py-[3px] text-left">#</th>
            <th className="border border-[#999] bg-[#eee] px-[5px] py-[3px] text-left">SKU</th>
            <th className="border border-[#999] bg-[#eee] px-[5px] py-[3px] text-left">Description</th>
            <th className="border border-[#999] bg-[#eee] px-[5px] py-[3px] text-right">Qty</th>
            <th className="border border-[#999] bg-[#eee] px-[5px] py-[3px] text-right">Unit price</th>
            <th className="border border-[#999] bg-[#eee] px-[5px] py-[3px] text-right">Line total</th>
          </tr>
        </thead>
        <tbody>
          {seedLines.map((line, index) => {
            const qty = doc.type === 'GRN' ? line.grnQty : line.invQty
            const price = doc.type === 'INV' ? line.invPrice : line.poPrice
            return (
              <tr key={line.sku}>
                <td className="border border-[#999] px-[5px] py-[3px]">{index + 1}</td>
                <td className="border border-[#999] px-[5px] py-[3px]">{line.sku}</td>
                <td className="border border-[#999] px-[5px] py-[3px]">{line.desc}</td>
                <td className="border border-[#999] px-[5px] py-[3px] text-right">{qty}</td>
                <td className="border border-[#999] px-[5px] py-[3px] text-right">{money(price)}</td>
                <td className="border border-[#999] px-[5px] py-[3px] text-right">{money(qty * price)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <table className="my-1 ml-auto w-[44%] border-collapse text-[9.5px]">
        <tbody>
          <tr>
            <td className="border border-[#999] px-[5px] py-[3px]">Subtotal</td>
            <td className="border border-[#999] px-[5px] py-[3px] text-right">{money(24585)}</td>
          </tr>
          <tr>
            <td className="border border-[#999] px-[5px] py-[3px]">Tax (16%)</td>
            <td className="border border-[#999] px-[5px] py-[3px] text-right">{money(3933.6)}</td>
          </tr>
          <tr>
            <td className="border border-[#999] px-[5px] py-[3px]"><b>Grand total</b></td>
            <td className="border border-[#999] px-[5px] py-[3px] text-right"><b>{money(28518.6)}</b></td>
          </tr>
        </tbody>
      </table>

      <div className="mt-2.5 border-t border-[#999] pt-[5px] text-[8.5px] text-[#555]">
        Synthetic demo document · MatchGuard IDP extraction preview · No legal or financial value.
      </div>
    </div>
  )
}

export function DocumentDialog({ doc, onOpenChange }: {
  doc: Document | null
  onOpenChange: (open: boolean) => void
}) {
  const openInfra = useUiStore((state) => state.openInfra)

  return (
    <Dialog open={Boolean(doc)} onOpenChange={onOpenChange}>
      {doc && (
        <DialogContent className="max-h-[90vh] gap-0 overflow-hidden p-0 sm:max-w-[860px]">
          <DialogHeader className="flex-row flex-wrap items-center gap-2 border-b px-4 py-3 pr-10">
            <DialogTitle className="flex items-center gap-2 text-[13px] font-semibold">
              <FileText className="size-4" />
              {doc.file}
            </DialogTitle>
            <TypeBadge type={doc.type} />
            <StatusBadge status={doc.status} />
          </DialogHeader>
          <DialogDescription className="sr-only">
            Preview, extracted fields, and raw JSON for {doc.file}.
          </DialogDescription>

          <div className="min-h-0 overflow-y-auto p-4">
            <Tabs defaultValue="preview">
              <TabsList>
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="fields">Extracted fields</TabsTrigger>
                <TabsTrigger value="json">Raw JSON</TabsTrigger>
              </TabsList>

              <TabsContent value="preview" className="pt-1">
                <PreviewPaper doc={doc} />
              </TabsContent>

              <TabsContent value="fields" className="pt-1">
                <div className="rounded-lg border bg-card">
                  <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
                    <h3 className="text-[12.5px] font-semibold">NER / IDP extraction</h3>
                    <Badge variant={doc.confidence > 0.85 ? 'success' : 'warning'}>
                      {Math.round(doc.confidence * 100)}% confidence
                    </Badge>
                  </div>
                  <div className="p-3">
                    <KeyValueList items={[
                      ['Document type', TYPE_LABEL[doc.type]],
                      ['Vendor', doc.vendor],
                      ['Document number', doc.docNo || '—'],
                      ['PO reference', doc.po || '—'],
                      ['GRN reference', doc.grn || '—'],
                      ['Extraction confidence', `${Math.round(doc.confidence * 100)}%`],
                      ['Pinecone chunks', doc.pinecone],
                      ['Linked match', doc.matchId || '—'],
                      ['S3 object', <span key="s3" className="mono text-[10px]">{s3Key(doc)}</span>],
                      ['SHA-256', <span key="sha" className="mono text-[10px]">9f2c…{doc.id.slice(-4)}</span>],
                      ['MIME', mimeOf(doc.file)],
                    ]} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="json" className="pt-1">
                <pre className="mono overflow-auto rounded-md bg-[#0f172a] p-2.5 text-[10px] leading-[1.5] whitespace-pre-wrap text-[#e2e8f0]">
                  {JSON.stringify({
                    id: doc.id,
                    file: doc.file,
                    type: doc.type,
                    vendor: doc.vendor,
                    doc_no: doc.docNo,
                    po_ref: doc.po,
                    grn_ref: doc.grn,
                    confidence: doc.confidence,
                    s3: s3Key(doc),
                    mime: mimeOf(doc.file),
                    pinecone_chunks: doc.pinecone,
                    linked_match: doc.matchId,
                    extractor: 'amazon.nova-lite-v1:0',
                  }, null, 2)}
                </pre>
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter className="flex-row flex-wrap items-center justify-end gap-1.5 border-t px-4 py-2.5">
            <Button
              variant="outline"
              size="xs"
              onClick={() => toast(`Downloading ${doc.file} · synthetic demo document.`)}
            >
              <Download />Download
            </Button>
            <Button variant="outline" size="xs" onClick={() => openInfra('s3', s3Key(doc))}>
              <Cloud />S3 evidence
            </Button>
            <Button variant="outline" size="xs" asChild>
              <a href={S3_CONSOLE_URL} target="_blank" rel="noopener noreferrer">
                <ExternalLink />Open S3 console
              </a>
            </Button>
            <Button size="xs" onClick={() => onOpenChange(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  )
}

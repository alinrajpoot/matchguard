import { DocumentSpine } from '@/components/shared/DocumentSpine'
import { InfraChip } from '@/components/shared/InfraChip'
import type { Invoice } from '@/schemas/domain'

export function InvoiceChain({ invoice }: { invoice: Invoice }) {
  return (
    <div className="px-3 py-2.5">
      <div className="mb-[7px] flex flex-wrap items-center justify-between gap-2">
        <span className="text-[12px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
          Three-way link
        </span>
        <span className="text-[12.5px] text-muted-foreground">
          linked by PO reference + vendor + amount
        </span>
      </div>

      <DocumentSpine invoice={invoice.no} po={invoice.po} grn={invoice.grn} />

      <div className="mt-[7px] flex flex-wrap gap-1.5">
        <InfraChip
          service="s3"
          resource={`s3://matchguard-demo-documents/invoices/${invoice.no}.pdf`}
          label="S3 original"
        />
        <InfraChip
          service="pinecone"
          resource={`idx-matchguard-docs · ${invoice.no} · 9 vectors`}
          label="Pinecone vectors"
        />
        <InfraChip
          service="postgres"
          resource={`invoice_links · ${invoice.no} · ${invoice.id}`}
          label="invoice_links"
        />
        <InfraChip
          service="bedrock"
          resource="amazon.nova-lite-v1:0 · IDP extraction"
          label="IDP extraction"
        />
      </div>
    </div>
  )
}

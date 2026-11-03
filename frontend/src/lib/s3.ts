import type { Document } from '@/schemas/domain'

export function s3Key(doc: Document) {
  const folder = doc.type === 'INV' ? 'invoices'
    : doc.type === 'GRN' ? 'receipts'
      : doc.type === 'PO' ? 'purchase-orders'
        : 'unclassified'
  return `s3://matchguard-demo-documents/${folder}/${doc.file}`
}

export function mimeOf(file: string) {
  if (/\.html?$/i.test(file)) return 'text/html'
  if (/\.csv$/i.test(file)) return 'text/csv'
  if (/\.xlsx?$/i.test(file)) return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  if (/\.png$/i.test(file)) return 'image/png'
  if (/\.pdf$/i.test(file)) return 'application/pdf'
  return 'application/octet-stream'
}

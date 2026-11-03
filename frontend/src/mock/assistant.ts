import { AssistantReplySchema } from '@/schemas/domain'
import type { AssistantReply, AssistantWidget } from '@/schemas/domain'
import { db } from './db'
import { ASSISTANT_MS, sleep } from './delay'

export function routePrompt(prompt: string): string | null {
  const s = prompt.toLowerCase()
  if (/health|pipeline|infra|bedrock|pinecone|s3/.test(s)) return 'get_pipeline_health'
  if (/audit|history/.test(s)) return 'get_audit_events'
  if (/trace|why|escalat|langgraph/.test(s)) return 'get_match_trace'
  if (/guardrail.*result|results.*guardrail/.test(s)) return 'get_guardrail_results'
  if (/missing.*grn|missing.*po|linked|link status|fully linked/.test(s)) return 'get_invoice_links'
  if (/evidence|open document|open the evidence/.test(s)) return 'get_document'
  if (/search|find documents|documents for|po-70418/.test(s)) return 'search_documents'
  if (/raise|threshold|variance.*4|policy/.test(s)) return 'propose_policy_change'
  if (/report|export|csv/.test(s)) return 'run_report'
  if (/vendor|risk/.test(s)) return 'list_vendors'
  if (/stats|overview|summar/.test(s)) return 'get_dashboard_stats'
  if (/queue|review|workload/.test(s)) return 'get_queue_summary'
  return null
}

const TRACE = [
  { name: 'retrieve', meta: 'Pinecone top-k 8', ms: 312 },
  { name: 'compare', meta: 'Nova Lite line diff', ms: 1200 },
  { name: 'guardrail', meta: `Policy v${db.policies.version}`, ms: 420 },
  { name: 'decide', meta: 'HITL threshold', ms: 980 },
]

function buildWidget(tool: string, prompt: string): AssistantWidget | null {
  if (tool === 'get_queue_summary') {
    return { kind: 'queue_summary', count: db.queue.length, items: db.queue.slice(0, 3) }
  }
  if (tool === 'get_dashboard_stats') {
    return {
      kind: 'dashboard_stats',
      tiles: [
        { k: 'Matches', v: '1,284' }, { k: 'Auto-approved', v: '86.2%' },
        { k: 'HITL', v: '177' }, { k: 'Rejected', v: '38' },
        { k: 'Value', v: '$4.2M' }, { k: 'Cycle time', v: '2h 14m' },
      ],
    }
  }
  if (tool === 'list_vendors') {
    return { kind: 'vendors', vendors: db.vendors.slice(0, 3) }
  }
  if (tool === 'propose_policy_change') {
    const current = db.policies.draft.priceTolerance
    const proposed = current >= 4 ? 5.0 : 4.0
    const projected = Math.round(177 * (3 / proposed) * (db.policies.draft.guardrails.priceVariance.on ? 1 : 0.9))
    return { kind: 'policy_change', current, proposed, projected }
  }
  if (tool === 'run_report') {
    return { kind: 'report', filename: 'vendor-variance-2025-03.csv', rows: 1284, size: '24 KB' }
  }
  if (tool === 'search_documents') {
    return {
      kind: 'search_documents',
      query: 'PO-70418',
      results: [
        { docId: 'DOC-1042', file: 'PO-70418.pdf', type: 'PO', meta: 'p.1 · score .94', s3: 's3://matchguard-demo-documents/purchase-orders/PO-70418.pdf', chunk: 'po_70418#1/4' },
        { docId: 'DOC-1043', file: 'GRN-30917.pdf', type: 'GRN', meta: 'p.1 · score .91', s3: 's3://matchguard-demo-documents/receipts/GRN-30917.pdf', chunk: 'grn_30917#1/3' },
        { docId: 'DOC-1044', file: 'HS-88421.pdf', type: 'INV', meta: 'p.2 · score .89', s3: 's3://matchguard-demo-documents/invoices/HS-88421.pdf', chunk: 'inv_88421#2/8' },
      ],
    }
  }
  if (tool === 'get_document') {
    const doc = db.documents.find((d) => d.file === 'HS-88421.pdf') ?? db.documents[0]
    return { kind: 'document', doc }
  }
  if (tool === 'get_invoice_links') {
    const invoice = db.invoices.find((i) => i.no === (/missing.*grn/.test(prompt.toLowerCase()) ? 'HS-88433' : 'HS-88421')) ?? db.invoices[0]
    return {
      kind: 'invoice_links',
      invoice,
      missing: !invoice.po ? 'PO' : !invoice.grn ? 'GRN' : null,
      matched: invoice.matchId,
    }
  }
  if (tool === 'get_match_trace') {
    return {
      kind: 'match_trace',
      matchId: 'MR-2025-1042',
      reason: 'MR-2025-1042 was escalated because invoice line HS-MB-4402 is 5.1% over the PO against a 3.0% threshold.',
      trace: TRACE,
    }
  }
  if (tool === 'get_guardrail_results') {
    return {
      kind: 'guardrail_results',
      policyVersion: db.policies.version,
      rows: [
        { name: 'Price variance', observed: '5.1%', threshold: '3.0%', result: 'fail' },
        { name: 'Quantity', observed: '0 units', threshold: '0 units', result: 'pass' },
        { name: 'Tax (IVA 16%)', observed: '16.0%', threshold: '16.0%', result: 'pass' },
        { name: 'Evidence grounding', observed: '4/4 cited', threshold: '≥1/line', result: 'pass' },
        { name: 'Duplicate invoice', observed: 'No', threshold: '90 days', result: 'pass' },
      ],
    }
  }
  if (tool === 'get_audit_events') {
    return {
      kind: 'audit_events',
      object: 'MR-2025-1042',
      events: db.audit.filter((event) => event.object === 'MR-2025-1042').slice(0, 4),
    }
  }
  if (tool === 'get_pipeline_health') {
    return {
      kind: 'pipeline_health',
      services: [
        { name: 'S3', meta: '1,865 objects', key: 's3' },
        { name: 'Pinecone', meta: '1.84M vectors', key: 'pinecone' },
        { name: 'Bedrock', meta: 'p95 412 ms', key: 'bedrock' },
        { name: 'PostgreSQL', meta: '18.4k audit rows', key: 'postgres' },
        { name: 'GlassFlow Rius', meta: 'trace ingest ok', key: 'glassflow' },
        { name: 'ECR / EC2', meta: 'matchguard-api:1.4.2', key: 'ecr' },
      ],
    }
  }
  return null
}

export async function askAssistant(prompt: string, _context: string): Promise<AssistantReply> {
  await sleep(ASSISTANT_MS)
  const tool = routePrompt(prompt)
  if (!tool) {
    return AssistantReplySchema.parse({
      text: 'I can search documents, trace matches, explain guardrails, show audit history, check pipeline health, and draft policy changes. Try a suggestion below.',
    })
  }
  const widget = buildWidget(tool, prompt)
  return AssistantReplySchema.parse(widget ? { widget } : {
    text: 'I do not have a tool for that yet.',
  })
}

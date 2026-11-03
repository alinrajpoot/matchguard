import type {
  ActivityItem, AuditEvent, DashboardData, DemoUser, Document, DocType,
  Guardrail, InfraService, Invoice, InvoiceStatus, LineItem, NotificationItem,
  Policy, QueueItem, Run, RunStatus, Vendor,
} from '@/schemas/domain'
import type { AssistantTool } from '@/schemas/domain'

const D = (
  id: string, file: string, type: DocType, vendor: string,
  docNo: string | null, po: string | null, grn: string | null,
  matchId: string | null, uploaded: string, status: Document['status'],
  confidence: number, pinecone: number, orphan = false, reason: string | null = null,
): Document => ({ id, file, type, vendor, docNo, po, grn, matchId, uploaded, status, confidence, pinecone, orphan, reason })

const I = (
  id: string, no: string, vendor: string, date: string, due: string,
  amount: number, po: string | null, grn: string | null,
  status: InvoiceStatus, variance: number, confidence: number,
): Invoice => ({ id, no, vendor, date, due, amount, po, grn, status, variance, confidence, hidden: false, matchId: null })

const R = (
  id: string, invoice: string, po: string, grn: string, vendor: string,
  amount: number, variance: number, confidence: number,
  status: RunStatus, duration: string, age: string,
): Run => ({ id, invoice, po, grn, vendor, amount, variance, confidence, status, duration, age })

const Q = (
  id: string, invoice: string, vendor: string, amount: number,
  variance: number, risk: QueueItem['risk'], waiting: string, sla: string,
): QueueItem => ({ id, invoice, vendor, amount, variance, risk, waiting, sla })

export const seedUser: DemoUser = {
  name: 'Priya Raman',
  initials: 'PR',
  email: 'priya.raman@northgate.example',
  tz: 'Central Time (US)',
  preferences: { escalation: true, slaWarning: true, weeklyDigest: false },
}

export const seedDocuments: Document[] = [
  D('DOC-1042','PO-70418.pdf','PO','Hacienda Precision Parts','PO-70418','PO-70418',null,'MR-2025-1042','Today 09:12','Indexed',.99,12),
  D('DOC-1043','GRN-30917.pdf','GRN','Hacienda Precision Parts','GRN-30917','PO-70418','GRN-30917','MR-2025-1042','Today 09:14','Indexed',.98,8),
  D('DOC-1044','HS-88421.pdf','INV','Hacienda Precision Parts','HS-88421','PO-70418','GRN-30917','MR-2025-1042','Today 09:20','Indexed',.97,11),
  D('DOC-1045','PO-70410.pdf','PO','Hacienda Precision Parts','PO-70410','PO-70410',null,'MR-2025-1041','Today 08:55','Indexed',.99,10),
  D('DOC-1046','GRN-30912.pdf','GRN','Hacienda Precision Parts','GRN-30912','PO-70410','GRN-30912','MR-2025-1041','Today 08:58','Indexed',.98,7),
  D('DOC-1047','HS-88377.pdf','INV','Hacienda Precision Parts','HS-88377','PO-70410','GRN-30912','MR-2025-1041','Today 09:02','Indexed',.98,9),
  D('DOC-1048','PO-70391.pdf','PO','Tornillos Norte S.A.','PO-70391','PO-70391',null,'MR-2025-1039','Yesterday 15:10','Indexed',.97,11),
  D('DOC-1049','GRN-30905.pdf','GRN','Tornillos Norte S.A.','GRN-30905','PO-70391','GRN-30905','MR-2025-1039','Yesterday 15:22','Indexed',.96,6),
  D('DOC-1050','TN-2204-118.pdf','INV','Tornillos Norte S.A.','TN-2204-118','PO-70391','GRN-30905','MR-2025-1039','Yesterday 15:30','Indexed',.95,10),
  D('DOC-1051','PO-70381.pdf','PO','Aceros del Bajío','PO-70381','PO-70381',null,'MR-2025-1037','Yesterday 11:04','Indexed',.99,9),
  D('DOC-1052','GRN-30898.pdf','GRN','Aceros del Bajío','GRN-30898','PO-70381','GRN-30898','MR-2025-1037','Yesterday 11:12','Indexed',.98,7),
  D('DOC-1053','AB-9917.pdf','INV','Aceros del Bajío','AB-9917','PO-70381','GRN-30898','MR-2025-1037','Yesterday 11:20','Indexed',.97,8),
  D('DOC-1054','PO-70388.pdf','PO','Rhein Dichtungen GmbH','PO-70388','PO-70388',null,'MR-2025-1038','Yesterday 09:40','Indexed',.98,8),
  D('DOC-1055','GRN-30901.pdf','GRN','Rhein Dichtungen GmbH','GRN-30901','PO-70388','GRN-30901','MR-2025-1038','Yesterday 09:46','Indexed',.97,6),
  D('DOC-1056','RD-55210.pdf','INV','Rhein Dichtungen GmbH','RD-55210','PO-70388','GRN-30901','MR-2025-1038','Yesterday 09:52','Indexed',.96,9),
  D('DOC-1057','PO-70402.pdf','PO','Cobre Industrial','PO-70402','PO-70402',null,'CI-4482','Today 10:02','Indexed',.98,7),
  D('DOC-1058','GRN-30928.pdf','GRN','Cobre Industrial','GRN-30928','PO-70402','GRN-30928','CI-4482','Today 10:05','Processing',.82,0),
  D('DOC-1059','CI-4482.pdf','INV','Cobre Industrial','CI-4482','PO-70402','GRN-30928','CI-4482','Today 10:08','Processing',.79,0),
  D('DOC-1099','scan_20250316_1142.pdf','Unknown','Unresolved',null,null,null,null,'Today 11:42','Needs review',.41,0,true,'Unrecognized vendor · confidence 0.41'),
  D('DOC-1100','invoice_unknown_8841.pdf','INV','Unresolved','INV-UNK-8841',null,null,null,'Today 10:18','Indexed',.73,6,true,'No PO reference found'),
  D('DOC-1101','GRN-30931.pdf','GRN','Hacienda Precision Parts','GRN-30931',null,null,null,'Yesterday 16:05','Indexed',.94,5,true,'No matching PO · unmatched receipt'),
]

export const seedInvoices: Invoice[] = [
  I('INV-88421','HS-88421','Hacienda Precision Parts','2025-03-14','2025-04-13',25055.00,'PO-70418','GRN-30917','ready',5.1,91),
  I('INV-88377','HS-88377','Hacienda Precision Parts','2025-03-10','2025-04-09',8420.50,'PO-70410','GRN-30912','ready',0.0,99),
  I('INV-118','TN-2204-118','Tornillos Norte S.A.','2025-03-12','2025-04-11',31240.00,'PO-70391','GRN-30905','ready',4.2,88),
  I('INV-9917','AB-9917','Aceros del Bajío','2025-03-11','2025-04-10',18400.00,'PO-70381','GRN-30898','ready',0.1,99),
  I('INV-55210','RD-55210','Rhein Dichtungen GmbH','2025-03-09','2025-04-08',6715.25,'PO-70388','GRN-30901','ready',0.0,98),
  I('INV-4471','CI-4471','Cobre Industrial','2025-03-08','2025-04-07',4310.80,'PO-70355','GRN-30887','ready',0.3,97),
  I('INV-1182','FA-1182','Fundición Altamira','2025-03-07','2025-04-06',12980.00,'PO-70340','GRN-30880','ready',3.3,90),
  I('INV-88433','HS-88433','Hacienda Precision Parts','2025-03-15','2025-04-14',9870.00,'PO-70360',null,'missing_grn',4.8,86),
  I('INV-7720','MR-7720','Maquinados Reyna','2025-03-13','2025-04-12',22950.00,'PO-70377',null,'missing_grn',7.8,74),
  I('INV-121','TN-2204-121','Tornillos Norte S.A.','2025-03-15','2025-04-14',3140.00,null,'GRN-30920','missing_po',0,0),
  I('INV-9923','AB-9923','Aceros del Bajío','2025-03-16','2025-04-15',7810.00,null,'GRN-30922','missing_po',0,0),
  I('INV-4482','CI-4482','Cobre Industrial','2025-03-16','2025-04-15',15620.00,'PO-70402','GRN-30928','processing',0,0),
]

export const seedRuns: Run[] = [
  R('MR-2025-1042','HS-88421','PO-70418','GRN-30917','Hacienda Precision Parts',25055.00,5.1,91,'hitl','1m 12s','2h ago'),
  R('MR-2025-1041','HS-88377','PO-70410','GRN-30912','Hacienda Precision Parts',8420.50,0.0,99,'auto','48s','3h ago'),
  R('MR-2025-1040','CI-4470','PO-70402','GRN-30899','Cobre Industrial',12980.00,0.3,97,'auto','54s','5h ago'),
  R('MR-2025-1039','TN-2204-118','PO-70391','GRN-30905','Tornillos Norte S.A.',31240.00,4.2,88,'hitl','1m 21s','6h ago'),
  R('MR-2025-1038','RD-55210','PO-70388','GRN-30901','Rhein Dichtungen GmbH',6715.25,0.0,98,'auto','39s','8h ago'),
  R('MR-2025-1037','AB-9917','PO-70381','GRN-30898','Aceros del Bajío',18400.00,0.1,99,'auto','44s','1d ago'),
  R('MR-2025-1036','AB-9908','PO-70377','GRN-30896','Aceros del Bajío',22950.00,3.6,86,'hitl','1m 05s','1d ago'),
  R('MR-2025-1033','MR-7715','PO-70360','GRN-30890','Maquinados Reyna',9870.00,7.8,72,'rej','1m 33s','1d ago'),
  R('MR-2025-1032','CI-4468','PO-70355','GRN-30887','Cobre Industrial',4310.80,0.0,99,'auto','36s','2d ago'),
  R('MR-2025-1030','RD-55198','PO-70349','GRN-30881','Rhein Dichtungen GmbH',15620.00,0.0,96,'auto','41s','2d ago'),
]

export const seedQueue: QueueItem[] = [
  Q('MR-2025-1042','HS-88421','Hacienda Precision Parts',25055.00,5.1,'High','2h 14m','5h 46m'),
  Q('MR-2025-1039','TN-2204-118','Tornillos Norte S.A.',31240.00,4.2,'High','3h 40m','4h 20m'),
  Q('MR-2025-1036','AB-9908','Aceros del Bajío',22950.00,3.6,'Medium','5h 05m','2h 55m'),
  Q('MR-2025-1031','MR-7715','Maquinados Reyna',9870.00,7.8,'High','6h 22m','1h 38m'),
  Q('MR-2025-1027','FA-1176','Fundición Altamira',14210.00,3.3,'Medium','7h 51m','0h 09m'),
]

export const seedVendors: Vendor[] = [
  { name: 'Hacienda Precision Parts', matches: 214, variance: 4.1, exposure: 184200, risk: 'High' },
  { name: 'Tornillos Norte S.A.', matches: 188, variance: 3.8, exposure: 132400, risk: 'High' },
  { name: 'Maquinados Reyna', matches: 96, variance: 3.2, exposure: 48900, risk: 'Medium' },
  { name: 'Aceros del Bajío', matches: 241, variance: 2.4, exposure: 221700, risk: 'Low' },
  { name: 'Rhein Dichtungen GmbH', matches: 77, variance: 1.1, exposure: 37600, risk: 'Low' },
]

export const seedActivity: ActivityItem[] = [
  { tone: 'ok', text: 'Invoice HS-88377 approved automatically', time: '4 min ago' },
  { tone: 'warn', text: 'Guardrail triggered on MR-2025-1042: unit price variance', time: '2h ago' },
  { tone: 'info', text: 'GRN-30928 indexed; 2 of 3 documents linked for CI-4482', time: '2h ago' },
  { tone: 'ok', text: 'You approved MR-2025-1034 with an override reason', time: '3h ago' },
  { tone: 'bad', text: 'MR-2025-1029 rejected: duplicate invoice', time: '5h ago' },
  { tone: 'info', text: 'GitHub Actions run #218 deployed matchguard-api:1.4.2 to EC2', time: '6h ago' },
]

export const seedNotifications: NotificationItem[] = [
  { id: 'N1', icon: 'shield-alert', tone: 'warn', title: 'MR-2025-1042 needs review', body: 'Unit price on HS-MB-4402 is 5.1% over the PO.', time: '2h ago', unread: true, target: 'review', match: 'MR-2025-1042' },
  { id: 'N2', icon: 'clock', tone: 'bad', title: 'SLA breach in 9 minutes', body: 'MR-2025-1027 (Fundición Altamira) is about to miss its 8h SLA.', time: '12 min ago', unread: true, target: 'queue' },
  { id: 'N3', icon: 'sliders-horizontal', tone: 'acc', title: 'Policy v13 is active', body: 'Variance threshold 3.0% · HITL SLA 8 business hours.', time: 'Mar 14', unread: true, target: 'policies' },
  { id: 'N4', icon: 'file-warning', tone: 'warn', title: 'IDP extraction needs review', body: 'scan_20250316_1142.pdf could not resolve a vendor.', time: 'Today 11:42', unread: true, target: 'documents' },
  { id: 'N5', icon: 'check-circle-2', tone: 'ok', title: 'HS-88377 auto-approved', body: 'Clean match: 0.0% variance, 99% confidence.', time: 'Today 09:20', unread: false, target: 'runs' },
  { id: 'N6', icon: 'rocket', tone: 'info', title: 'Deployment complete', body: 'GitHub Actions run #218 deployed matchguard-api:1.4.2 to EC2.', time: 'Today 08:04', unread: false, target: 'settings' },
]

export const seedAudit: AuditEvent[] = [
  { id: 'AUD-001', ts: '2025-03-18 11:42:07', actor: 'You', action: 'Viewed match MR-2025-1042', object: 'MR-2025-1042', evidence: { actor: 'priya.raman', action: 'view_match', match_id: 'MR-2025-1042', request_id: 'req_7f3a91c2', source: 'web' } },
  { id: 'AUD-002', ts: '2025-03-18 09:21:44', actor: 'MatchGuard System', action: 'Escalated MR-2025-1042: variance 5.1%', object: 'MR-2025-1042', evidence: { match_id: 'MR-2025-1042', decision: 'HOLD', reason: 'unit_price_variance_exceeds_threshold', variance_pct: 5.1, threshold_pct: 3.0, confidence: 0.91 } },
  { id: 'AUD-003', ts: '2025-03-18 09:21:41', actor: 'MatchGuard System', action: 'Guardrail triggered: unit price variance', object: 'MR-2025-1042', evidence: { guardrail: 'price_variance', line: 'HS-MB-4402', observed: 19.34, po_price: 18.40, delta: 470.00, severity: 'Block' } },
  { id: 'AUD-004', ts: '2025-03-18 08:55:12', actor: 'You', action: 'Approved invoice HS-88377 with override', object: 'MR-2025-1041', evidence: { match_id: 'MR-2025-1041', decision: 'RELEASE', override: true, reason: 'Vendor price list revised 03/14; amendment on file.' } },
  { id: 'AUD-005', ts: '2025-03-18 08:30:03', actor: 'MatchGuard System', action: 'Auto-approved invoice HS-88377', object: 'MR-2025-1041', evidence: { match_id: 'MR-2025-1041', decision: 'AUTO_APPROVE', variance_pct: 0.0, confidence: 0.99 } },
  { id: 'AUD-006', ts: '2025-03-17 17:12:58', actor: 'You', action: 'Rejected MR-2025-1029: duplicate invoice', object: 'MR-2025-1029', evidence: { match_id: 'MR-2025-1029', decision: 'REJECT', reason: 'duplicate_invoice', lookback_days: 90 } },
  { id: 'AUD-007', ts: '2025-03-17 16:40:21', actor: 'MatchGuard System', action: 'Guardrail triggered: tax rate mismatch', object: 'MR-2025-1029', evidence: { guardrail: 'tax_compliance', expected_rate: 0.16, observed_rate: 0.08, severity: 'Block' } },
  { id: 'AUD-008', ts: '2025-03-17 15:02:09', actor: 'You', action: 'Uploaded PO-70410', object: 'DOC-1045', evidence: { document_id: 'DOC-1045', s3_key: 's3://matchguard-demo-documents/purchase-orders/PO-70410.pdf', size: 142000 } },
  { id: 'AUD-009', ts: '2025-03-17 14:18:30', actor: 'MatchGuard System', action: 'Auto-approved invoice HS-88351', object: 'MR-2025-1038', evidence: { match_id: 'MR-2025-1038', decision: 'AUTO_APPROVE', variance_pct: 0.0, confidence: 0.98 } },
  { id: 'AUD-010', ts: '2025-03-17 10:07:46', actor: 'You', action: 'Published policy v13', object: 'POL-VAR', evidence: { policy_version: 13, price_variance_pct: 3.0, hitl_sla_hours: 8, previous_version: 12 } },
]

const guardrails: Record<string, Guardrail> = {
  priceVariance: { on: true, param: 3.0, suffix: '%', step: '0.5', control: 'range', severity: 'Block', triggers: 64, name: 'Price variance', desc: 'Invoice unit price may not exceed the PO by more than the tolerance.' },
  quantityMatch: { on: true, param: 0, suffix: 'units', step: '1', severity: 'Block', triggers: 31, name: 'Quantity match', desc: 'Invoice quantity must not exceed the GRN received quantity.' },
  taxCompliance: { on: true, param: 16.0, suffix: '% IVA', step: '0.1', severity: 'Block', triggers: 18, name: 'Tax compliance', desc: 'Tax rate must match the vendor tax profile.' },
  evidenceGrounding: { on: true, param: 1, suffix: 'citation', step: '1', severity: 'Block', triggers: 12, name: 'Evidence grounding', desc: 'Every extracted value must cite a source chunk.' },
  duplicateInvoice: { on: true, param: 90, suffix: 'days', step: '1', severity: 'Block', triggers: 9, name: 'Duplicate invoice', desc: 'Block invoices already paid within the lookback window.' },
  vendorBankChange: { on: true, param: null, paramLabel: 'Block', severity: 'Block', triggers: 0, name: 'Vendor bank change', desc: 'Block payments when bank details changed within 30 days.' },
  fxDrift: { on: true, param: 1.5, suffix: '%', step: '0.1', severity: 'Warn', triggers: 3, name: 'Currency / FX drift', desc: 'Warn when FX drift exceeds tolerance on non-USD invoices.' },
  partialDelivery: { on: true, param: null, paramLabel: 'Warn', severity: 'Warn', triggers: 7, name: 'Partial delivery', desc: 'Warn when the GRN shows a backorder or short shipment.' },
  missingLinkage: { on: true, param: null, paramLabel: 'Block', severity: 'Block', triggers: 7, name: 'Missing PO / GRN linkage', desc: 'Block matching until invoice, PO and GRN are linked.' },
  promptInjection: { on: true, param: null, paramLabel: 'Block', severity: 'Block', triggers: 2, name: 'Prompt-injection detection', desc: 'Reject documents containing instructions aimed at the model.' },
  piiRedaction: { on: true, param: null, paramLabel: 'Redact', severity: 'Redact', triggers: 0, name: 'PII redaction', desc: 'Redact bank and tax identifiers before embedding.' },
  extractionFloor: { on: true, param: 85, suffix: '%', step: '1', severity: 'Block', triggers: 6, name: 'Extraction confidence floor', desc: 'Send low-confidence extractions to review.' },
  citationRequired: { on: true, param: null, paramLabel: 'Block', severity: 'Block', triggers: 12, name: 'Citation-required grounding', desc: 'Reject output that lacks a citation for each line.' },
  hallucinationBlock: { on: true, param: null, paramLabel: 'Block', severity: 'Block', triggers: 4, name: 'Hallucinated line item block', desc: 'Reject line items not present in any source document.' },
  unsupportedFile: { on: true, param: null, paramLabel: 'Block', severity: 'Block', triggers: 1, name: 'Unsupported file type', desc: 'Reject files outside PDF, XLSX, CSV, HTML and PNG.' },
  autoLink: { on: true, param: null, paramLabel: 'PO ref', severity: 'Automation', triggers: 0, name: 'Auto-link documents by PO reference', desc: 'Link invoices and GRNs when the PO reference matches.' },
  autoApproveClean: { on: true, param: null, paramLabel: 'On', severity: 'Automation', triggers: 0, name: 'Auto-approve clean matches', desc: 'Release matches with zero variance and full grounding.' },
  autoRelease: { on: false, param: 500, suffix: '$', step: '50', severity: 'Automation', triggers: 0, name: 'Auto-release under cap', desc: 'Release low-value matches without human review.' },
}

export const seedPolicies: Policy = {
  version: 13,
  published: 'Mar 14',
  dirty: false,
  baseEnabled: 17,
  snapshot: null,
  draft: {
    priceTolerance: 3.0,
    quantityTolerance: 0,
    extractionConfidence: 85,
    matchConfidence: 90,
    hitlAmount: 10000,
    autoReleaseCap: 500,
    hitlSla: 8,
    duplicateLookback: 90,
    guardrails,
  },
  history: [
    { v: 13, note: 'Variance 3.0%', date: 'Mar 14' },
    { v: 12, note: 'SLA 8 business hours', date: 'Feb 02' },
    { v: 11, note: 'Tax guardrail added', date: 'Jan 19' },
  ],
}

export const seedLines: LineItem[] = [
  { sku: 'HS-MB-4402', desc: 'Aluminum mounting bracket, 4-bolt, anodized', poQty: 500, poPrice: 18.40, grnQty: 500, invQty: 500, invPrice: 19.34, conf: 94, flag: true },
  { sku: 'HS-FL-1120', desc: 'Steel flange 2", ASME B16.5', poQty: 200, poPrice: 31.25, grnQty: 200, invQty: 200, invPrice: 31.25, conf: 97, flag: false },
  { sku: 'HS-BR-3307', desc: 'Bronze bushing 25 mm, sintered', poQty: 1200, poPrice: 4.85, grnQty: 1200, invQty: 1200, invPrice: 4.85, conf: 98, flag: false },
  { sku: 'HS-GK-0915', desc: 'Gasket kit, EPDM, 150 mm', poQty: 150, poPrice: 22.10, grnQty: 150, invQty: 150, invPrice: 22.10, conf: 96, flag: false },
]

export const seedInfra: Record<string, InfraService> = {
  s3: { name: 'Amazon S3', chip: 'S3 bucket', icon: 'cloud', res: 's3://matchguard-demo-documents', region: 'us-east-1', req: 'req_7f3a91c2', url: 'https://s3.console.aws.amazon.com/s3/buckets/matchguard-demo-documents', note: 'Original uploads with object versioning and SSE-S3.' },
  pinecone: { name: 'Pinecone', chip: 'Pinecone index', icon: 'database', res: 'idx-matchguard-docs · namespace northgate-prod', region: 'us-east-1', req: 'pc_9d2b41e8', url: 'https://app.pinecone.io/', note: 'Titan Embeddings V2 vectors; metadata filters on vendor, PO and date.' },
  bedrock: { name: 'Amazon Bedrock', chip: 'Bedrock IDP', icon: 'brain-circuit', res: 'amazon.nova-lite-v1:0 · IDP extraction', region: 'us-east-1', req: 'br_41c8e2a7', url: 'https://console.aws.amazon.com/bedrock/home?region=us-east-1', note: 'Nova Lite extraction and reasoning; Titan Embeddings V2 for chunk vectors.' },
  postgres: { name: 'PostgreSQL', chip: 'Postgres', icon: 'database', res: 'matchguard@postgres:5432 · audit_log', region: 'us-east-1', req: 'pg_18f4a9c1', url: 'http://localhost:8000/docs', note: 'Persistent conversation memory, HITL interrupts and append-only audit log.' },
  glassflow: { name: 'GlassFlow Rius', chip: 'GlassFlow trace', icon: 'activity', res: 'trace MR-2025-1042 · run 7f3a91', region: 'us-east-1', req: 'gf_7f3a91c2', url: 'https://www.glassflow.dev/', note: 'Full lineage from decision to retrieved source chunk.' },
  github: { name: 'GitHub Actions', chip: 'CI/CD pipeline', icon: 'github', res: 'matchguard-ap-rag · workflow deploy.yml · run #218', region: 'us-east-1', req: 'gh_218_9f4c', url: 'https://github.com/features/actions', note: 'Build, test, push to ECR and deploy to EC2 on every main merge.' },
  ecr: { name: 'Amazon ECR', chip: 'ECR image', icon: 'container', res: 'matchguard-api:1.4.2 · sha 7f3a91c', region: 'us-east-1', req: 'ecr_1f4a2c9', url: 'https://console.aws.amazon.com/ecr/repositories', note: 'Container image consumed by the EC2 deployment.' },
  ec2: { name: 'Amazon EC2', chip: 'EC2 host', icon: 'server', res: 'i-0a73c9e4f1 · m7g.large · us-east-1', region: 'us-east-1', req: 'ec2_0a73c9e4', url: 'https://console.aws.amazon.com/ec2/home?region=us-east-1', note: 'Docker Compose stack: API, frontend, Postgres and observability sidecar.' },
  fastapi: { name: 'FastAPI', chip: 'REST API', icon: 'zap', res: 'http://localhost:8000 · /api/v1', region: 'local', req: 'api_3c91a7', url: 'http://localhost:8000/docs', note: 'Typed REST endpoints with OpenAPI docs for policy, audit and match actions.' },
  docker: { name: 'Docker Compose', chip: 'Docker stack', icon: 'box', res: 'infra/docker-compose.yaml · 5 services', region: 'local', req: 'dc_5c2a8e', url: 'https://docs.docker.com/compose/', note: 'Reproducible local stack for the API, UI, Postgres and workers.' },
  langgraph: { name: 'LangGraph', chip: 'LangGraph state', icon: 'workflow', res: 'checkpoint thread MR-2025-1042', region: 'us-east-1', req: 'lg_3e7a10b', url: 'https://langchain-ai.github.io/langgraph/', note: 'Persisted graph state so HITL reviews can resume days later.' },
}

export const seedNav: { id: string; label: string; icon: string; group: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard', group: 'Workspace' },
  { id: 'documents', label: 'Documents', icon: 'files', group: 'Workspace' },
  { id: 'invoices', label: 'Invoices', icon: 'receipt-text', group: 'Workspace' },
  { id: 'runs', label: 'Match Runs', icon: 'git-compare', group: 'Workspace' },
  { id: 'queue', label: 'Review Queue', icon: 'user-check', group: 'Workspace' },
  { id: 'policies', label: 'Policy & Guardrails', icon: 'sliders-horizontal', group: 'Governance' },
  { id: 'audit', label: 'Audit Log', icon: 'scroll-text', group: 'Governance' },
]

export const seedTitles: Record<string, string> = {
  dashboard: 'Dashboard',
  documents: 'Documents',
  invoices: 'Invoices',
  runs: 'Match Runs',
  queue: 'Review Queue',
  policies: 'Policy & Guardrails',
  audit: 'Audit Log',
  notifications: 'Notifications',
  settings: 'Settings',
  review: 'Match Review',
}

export const seedAssistantTools: AssistantTool[] = [
  { name: 'get_queue_summary', desc: 'Queue snapshot', prompt: 'Show reviewer queue' },
  { name: 'get_dashboard_stats', desc: 'KPI tile grid', prompt: 'Summarize this month' },
  { name: 'list_vendors', desc: 'Vendor risk list', prompt: 'Show vendor risk' },
  { name: 'propose_policy_change', desc: 'Policy change approval', prompt: 'Raise variance threshold to 4%' },
  { name: 'run_report', desc: 'Report download', prompt: 'Generate vendor variance report' },
  { name: 'search_documents', desc: 'Retrieval results', prompt: 'Find documents for PO-70418' },
  { name: 'get_document', desc: 'Evidence viewer', prompt: 'Open the evidence for HS-88421' },
  { name: 'get_invoice_links', desc: 'Invoice linkage', prompt: 'Is HS-88421 fully linked?' },
  { name: 'get_match_trace', desc: 'LangGraph trace', prompt: 'Why was MR-2025-1042 escalated?' },
  { name: 'get_guardrail_results', desc: 'Guardrail results', prompt: 'Show guardrail results for MR-2025-1042' },
  { name: 'get_audit_events', desc: 'Audit timeline', prompt: 'Show audit history for MR-2025-1042' },
  { name: 'get_pipeline_health', desc: 'Pipeline health', prompt: 'Show pipeline health' },
]

const DAYS = Array.from({ length: 30 }, (_, i) => 'Mar ' + (i + 1))
function fit(arr: number[], target: number) {
  let diff = target - arr.reduce((a, b) => a + b, 0)
  let i = 0
  while (diff !== 0) {
    const step = diff > 0 ? 1 : -1
    arr[i % arr.length] += step
    diff -= step
    i++
  }
  return arr
}
const autoDaily = fit([33,35,37,36,30,38,39,35,41,37,40,38,31,36,34,42,39,37,41,33,36,38,40,37,35,39,30,37,36,34], 1107)
const hitlDaily = fit([4,5,4,5,3,4,5,4,4,5,4,4,6,4,4,5,4,4,5,5,4,4,5,4,4,5,4,4,5,4], 139)
const rejDaily = [1,2,1,1,2,1,1,2,1,1,2,1,1,1,2,1,1,2,1,1,2,1,1,2,1,1,1,2,1,1]
const str = DAYS.map((_, i) => 85 + Math.sin(i / 3.1) * 1.6 + (i % 4) * 0.15)
str[str.length - 1] = 86.2

export const seedDashboard: DashboardData = {
  kpis: [
    { label: 'Matches processed', value: '1,284', delta: '12.4%', note: 'vs last period', spark: [30,38,34,42,39,47,44,51] },
    { label: 'Auto-approved', value: '86.2%', delta: '1.8 pts', note: '1,107 straight-through', spark: [84,85,84.5,85.6,86,85.8,86.2,86.2] },
    { label: 'HITL escalated', value: '177', delta: '13.8%', note: 'of matches', spark: [7,5,6,4,5,3,4,4] },
    { label: 'Rejected after review', value: '38', delta: '21.5%', note: 'of HITL decisions', neg: true, spark: [2,1,2,1,1,2,1,1] },
    { label: 'Value reviewed', value: '$4.2M', delta: '9.1%', note: 'across 177 matches', spark: [3.6,3.7,3.9,3.8,4.0,4.1,4.15,4.2] },
    { label: 'Avg cycle time', value: '2h 14m', delta: '18 min', note: 'faster than last period', neg: true, spark: [150,146,148,140,138,136,134,134] },
  ],
  outcomes: DAYS.map((d, i) => ({ d, a: autoDaily[i], h: hitlDaily[i], r: rejDaily[i] })),
  str,
  guardrailFailures: ([['Price variance',64],['Quantity',31],['Tax',18],['Grounding',12],['Duplicate',9],['Missing GRN',7]] as const).map(([name, value]) => ({ name, value })),
  pipeline: [
    { label: 'Indexed', value: 1842, color: '#10b981' },
    { label: 'Processing', value: 14, color: '#0ea5e9' },
    { label: 'Orphans', value: 3, color: '#f59e0b' },
    { label: 'Failed', value: 6, color: '#f43f5e' },
  ],
  slaAging: [
    { label: '<1h', count: 2, tone: 'bad' },
    { label: '1–4h', count: 3, tone: 'warn' },
    { label: '4–8h', count: 4, tone: 'info' },
    { label: '>8h', count: 1, tone: 'neutral' },
  ],
  vendors: seedVendors,
  queue: seedQueue,
  activity: seedActivity,
  infraHealth: [
    { key: 's3', name: 'Amazon S3', res: '1,865 objects', icon: 'cloud' },
    { key: 'pinecone', name: 'Pinecone', res: '1.84M vectors', icon: 'database' },
    { key: 'bedrock', name: 'Bedrock', res: 'p95 412 ms', icon: 'brain-circuit' },
    { key: 'postgres', name: 'PostgreSQL', res: '18.4k audit rows', icon: 'database' },
    { key: 'glassflow', name: 'GlassFlow Rius', res: 'trace ingest ok', icon: 'activity' },
    { key: 'github', name: 'GitHub Actions', res: 'run #218 green', icon: 'github' },
    { key: 'ec2', name: 'EC2', res: '2/2 healthy', icon: 'server' },
  ],
}

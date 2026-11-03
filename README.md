# MatchGuard

> **A production RAG system for accounts payable three-way matching — built on LangGraph with real interrupt/resume, a versioned policy engine, and an append-only audit trail.**

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-31DAFB?logo=react&logoColor=black)](https://react.dev/)
[![LangGraph](https://img.shields.io/badge/LangGraph-orchestration-1C3C3C)](https://langchain-ai.github.io/langgraph/)
[![AWS Bedrock](https://img.shields.io/badge/AWS-Bedrock-FF9900?logo=amazonaws&logoColor=white)](https://aws.amazon.com/bedrock/)
[![Pinecone](https://img.shields.io/badge/Pinecone-vector%20DB-000000)](https://www.pinecone.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-compose-2496ED?logo=docker&logoColor=white)](https://docs.docker.com/compose/)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions%20→%20ECR%20→%20EC2-2088FF?logo=githubactions&logoColor=white)](https://github.com/features/actions)

---

## Overview

MatchGuard reconciles **Purchase Orders (PO)**, **Goods Receipt Notes (GRN)**, and **Vendor Invoices** for accounts payable. It extracts structured line items from PDFs, grounds every comparison in retrieved source chunks, and stops its own workflow when a variance or confidence threshold is breached — routing the exact discrepancy to a human approver before any payment is released.

Every recommendation, retrieval, human decision, and override is recorded in an append-only audit log.

The system is designed around three principles:

1. **The workflow is the product.** The language model proposes; policy and humans decide.
2. **State survives process death.** A paused match is a real workflow state persisted in PostgreSQL, not an in-memory demo.
3. **Every decision is traceable.** Retrieved evidence, model confidence, policy version, human reason, and timestamp are recorded together.

---

## Verification

The system is designed to pass three integration tests. These are the acceptance criteria for the project.

### 1. Restart test
Start a match that escalates to human review. Stop the backend process. Restart it. Resume the same match by `thread_id`. The graph continues from the interrupted node and completes.

This requires LangGraph's `PostgresSaver` checkpointer, not `InMemorySaver`. The pause must survive process death.

### 2. Policy test
Run a match with 5.1% variance under policy v1 (3.0% tolerance). It escalates to human review. Publish policy v2 (6.0% tolerance). Run the same invoice again. It auto-approves. The audit log shows which policy version evaluated each run.

This requires a real policy engine invoked on every graph run, not a hardcoded threshold.

### 3. Audit test
After one full match, query `audit_log` by `match_id`. Expect at least six rows — `retrieved`, `compared`, `guardrail_evaluated`, `escalated` or `auto_approved`, `human_decision`, `completed` — each with a JSONB evidence payload and a server-side timestamp.

This requires each graph node to write its own structured audit event.

If any of these three tests fails in the running application, the project is not considered complete.

---

## Architecture

```text
┌─────────────┐    ┌────────────────┐    ┌──────────────┐
│  S3 Upload  │───▶│    Docling     │───▶│   Pinecone   │
│  PO/GRN/Inv │    │  + Nova Lite   │    │ line-scoped  │
└─────────────┘    └────────────────┘    │  embeddings  │
                                         └──────────────┘
                                                 │
                                                 ▼
┌──────────────────────────────────────────────────────────────┐
│                  LangGraph workflow                          │
│                                                              │
│  retrieve ─▶ compare ─▶ guardrail ─▶ decide ──┐              │
│                                                │             │
│                              ┌─────────────────┴─────────┐   │
│                              ▼                           ▼   │
│                       auto_approve               interrupt() │
│                              │                           │   │
│                              │                    ┌──────▼──┐│
│                              │                    │ Human   ││
│                              │                    │ review  ││
│                              │                    └──────┬──┘│
│                              │                           │   │
│                              ▼                           ▼   │
│                    audit_node ◀───────────── resume via      │
│                    (every transition)         PostgresSaver  │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────────┐
                    │  PostgreSQL          │
                    │  · checkpoints       │
                    │  · matches + runs    │
                    │  · policy versions   │
                    │  · append-only audit │
                    └──────────────────────┘
```

### Tech stack

| Layer | Technology |
|---|---|
| Document extraction | Docling (primary), Amazon Nova Lite (fallback for missed fields) |
| Embeddings | Titan Embeddings V2 via Amazon Bedrock |
| Vector store | Pinecone, with metadata filters on `po_reference`, `vendor`, `document_type` |
| Workflow orchestration | LangGraph with `PostgresSaver` checkpointer |
| Policy engine | Versioned policy table with an evaluation engine invoked on every run |
| Audit log | PostgreSQL append-only table with JSONB evidence payloads |
| API | FastAPI with Pydantic schemas |
| Frontend | React (Vite) |
| Observability | LangSmith (per-node traces); OpenTelemetry optional |
| Delivery | Docker Compose → GitHub Actions → Amazon ECR → Amazon EC2 |

---

## Repository structure

```text
matchguard/
├── backend/          # FastAPI service, LangGraph workflow, policy engine, audit
│   ├── src/matchguard/
│   │   ├── api/          # REST endpoints
│   │   ├── extraction/   # Docling + Nova Lite extractors
│   │   ├── retrieval/    # Chunking, embeddings, Pinecone client, grounding
│   │   ├── graph/        # LangGraph state, nodes, builder, checkpointer
│   │   ├── policy/       # Versioned policy engine
│   │   ├── audit/        # Append-only audit writer
│   │   ├── storage/      # S3 client
│   │   └── core/         # Config, database, logging
│   ├── alembic/          # Migrations
│   ├── tests/
│   └── scripts/          # seed_demo.py, create_checkpoint_tables.py
├── frontend/         # React app
│   └── src/
│       ├── features/     # dashboard, documents, invoices, runs, review, policies, audit
│       ├── components/   # Spine, GuardrailPanel, EvidenceDrawer, layout
│       └── lib/          # API client and typed schemas
├── infra/            # Docker Compose, GitHub Actions, EC2 bootstrap
├── docs/
│   ├── architecture.md
│   └── demo-script.md
├── Makefile
└── README.md
```

Each folder contains its own `README.md` with design notes and setup instructions.

---

## Prerequisites

- Docker and Docker Compose
- An AWS account with **Amazon Nova Lite** and **Titan Embeddings V2** enabled in Amazon Bedrock (`us-east-1` recommended)
- A Pinecone account with one index: dimension **1024**, metric **cosine**
- An S3 bucket for document storage

---

## Quick start

### 1. Configure

```bash
git clone https://github.com/alinrajpoot/matchguard.git
cd matchguard
cp infra/.env.example infra/.env
```

Fill in `infra/.env`:

```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET=...

PINECONE_API_KEY=...
PINECONE_INDEX=matchguard-docs

POSTGRES_USER=matchguard
POSTGRES_PASSWORD=...
POSTGRES_DB=matchguard

LANGCHAIN_API_KEY=...   # optional, enables LangSmith tracing
```

### 2. Boot the stack

```bash
cd infra
docker compose up --build -d
```

- API → `http://localhost:8000/docs`
- UI → `http://localhost:5173`
- PostgreSQL → `localhost:5432`

### 3. Migrate and seed

```bash
docker compose exec backend alembic upgrade head
docker compose exec backend python -m scripts.create_checkpoint_tables
docker compose exec backend python -m scripts.seed_demo
```

The seed script inserts synthetic vendors, documents, matches, and policy versions so that the dashboard metrics are computed from real SQL aggregations over seeded data.

### 4. Verify

```bash
curl http://localhost:8000/health
```

Open the UI and follow the demo below.

---

## Demo walkthrough

1. **Upload three documents** — a Purchase Order, a Goods Receipt Note, and an invoice containing a line item with 5.1% price variance. Docling extracts line items; Pinecone indexes them with metadata.
2. **Run a match.** LangGraph retrieves PO, GRN, and invoice line items; compares them; evaluates the active policy; escalates because 5.1% > 3.0%.
3. **Refresh the browser.** The match remains in the review queue because the LangGraph checkpoint is in PostgreSQL.
4. **Restart the backend container.** The match remains in the review queue. Resume works.
5. **Open the review.** Line-by-line comparison, guardrail results, per-line evidence citations (document, page, chunk index), and recommended action.
6. **Approve with a reason.** Minimum 10 characters, validated server-side. The graph resumes, completes, and writes the human decision to the audit log.
7. **Open the policy page.** Move variance tolerance to 6.0%. Publish v2.
8. **Run the same invoice again.** It auto-approves. The audit log shows `policy_version: 2` on the new run and `policy_version: 1` on the previous run.
9. **Open the audit log.** Filter by `match_id`. Every transition is present with a JSONB evidence payload. Click any row to inspect it.

Steps 3, 4, 6, 8, and 9 are the acceptance checks.

---

## Design principles

1. **The workflow is the product.** The language model proposes; policy and humans decide.
2. **No silent automation of money.** Any decision that could release payment above a configurable threshold must pass a human approval gate.
3. **State must survive process death.** Paused matches persist in PostgreSQL via the LangGraph checkpointer.
4. **Traceability over cleverness.** Every decision links to retrieved evidence, model output, policy version, human reason, and timestamp.
5. **Fail closed.** If guardrails or retrieval confidence drop below threshold, the workflow stops rather than guessing.
6. **Honesty about scope.** The README describes what is implemented, not what is aspirational.

---

## Known limitations

- **Single workspace.** Multi-tenant isolation (per-vendor Pinecone namespaces, PostgreSQL row-level security) is on the roadmap.
- **File types.** PDF input is fully supported. Scanned images work if Docling can parse them; handwriting recognition is best-effort.
- **Role model.** AP clerk, AP manager, and auditor roles are modeled. SSO and SCIM provisioning are not implemented.
- **Cost controls.** Bedrock token usage is logged per match. Per-tenant budget enforcement is not implemented.
- **Compliance.** The system is designed to support SOC 2 audit requirements — append-only audit log, role-based access, evidence lineage. It is not SOC 2 certified.

---

## Roadmap

- [ ] Extraction pipeline (Docling + Nova Lite fallback)
- [ ] Line-scoped Pinecone indexing with metadata filters
- [ ] LangGraph workflow with `interrupt()` and `PostgresSaver` checkpointer
- [ ] Versioned policy engine with publish and draft states
- [ ] Append-only audit log with JSONB evidence
- [ ] FastAPI endpoints for documents, invoices, matches, policies, and audit
- [ ] React frontend for the seven core screens
- [ ] Docker Compose, GitHub Actions CI, ECR, and EC2 deployment
- [ ] Replay a match under a previous policy version
- [ ] Per-tenant isolation and RBAC hardening
- [ ] Cost-per-match tile from Bedrock token usage
- [ ] SSE progress streaming in place of polling

---

## Author

**Ali Ahmad Rajpoot**
- LinkedIn: `<link>`
- Portfolio: `<link>`
- Email: `<email>`

---

## License

MIT — see `LICENSE`. Sample documents, vendor names, and financials are synthetic and carry no legal or financial value.

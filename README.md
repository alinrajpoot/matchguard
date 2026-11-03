# MatchGuard

> **A production RAG system for accounts payable three-way matching — built on LangGraph with real interrupt/resume, a versioned policy engine, and an append-only audit trail.**

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-latest-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-latest-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![LangGraph](https://img.shields.io/badge/LangGraph-orchestration-1C3C3C)](https://langchain-ai.github.io/langgraph/)
[![AWS Bedrock](https://img.shields.io/badge/AWS-Bedrock-FF9900?logo=amazonaws&logoColor=white)](https://aws.amazon.com/bedrock/)
[![Pinecone](https://img.shields.io/badge/Pinecone-vector%20DB-000000)](https://www.pinecone.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-compose-2496ED?logo=docker&logoColor=white)](https://docs.docker.com/compose/)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions%20%E2%86%92%20ECR%20%E2%86%92%20EC2-2088FF?logo=githubactions&logoColor=white)](https://github.com/features/actions)

---

## Problem

Accounts payable teams reconcile thousands of purchase orders, goods receipt notes, and vendor invoices every month. A three-way match compares what was ordered, what was received, and what is being billed. Any mismatch — quantity, price, tax, terms — is a potential overpayment or fraud signal.

Fully automating this is a financial risk. Leaving it fully manual is a cost and throughput problem. The correct design is a workflow that **auto-approves low-risk matches and routes exceptions to a human with full evidence**, and that produces an audit trail an external auditor can reconstruct.

## Overview

MatchGuard implements that workflow end to end:

- Extracts structured line items from PDFs using **Docling**, with **Amazon Nova Lite** as a fallback extractor for missed fields.
- Indexes line-scoped chunks into **Pinecone** with metadata (`po_reference`, `vendor`, `document_type`) so retrieval returns the exact source for each line.
- Runs a **LangGraph** workflow that retrieves, compares, evaluates guardrails, decides, and interrupts for human review when the policy says so.
- Persists the interrupted state in **PostgreSQL** via `PostgresSaver`, so a paused match survives process death.
- Records every graph transition and every human decision in an **append-only audit log** with JSONB evidence payloads.
- Reads a **versioned policy** on every run, so publishing a new threshold changes behavior on the next match.

Three principles shape the system:

1. **The workflow is the product.** The model proposes; policy and humans decide.
2. **State survives process death.** A paused match is a real workflow state, not an in-memory demo.
3. **Every decision is traceable.** Retrieved evidence, model confidence, policy version, human reason, and timestamp are recorded together.

## Architecture

```
                   ┌─────────────────────────────┐
   S3 upload  ───▶ │ Docling + Nova Lite (IDP)   │
                   └──────────────┬──────────────┘
                                  │
                                  ▼
                   ┌─────────────────────────────┐
                   │ Pinecone (line-scoped       │
                   │ embeddings, metadata        │
                   │ filters on PO / GRN /       │
                   │ vendor / document_type)     │
                   └──────────────┬──────────────┘
                                  │
                                  ▼
   ┌──────────────────────────────────────────────────────────┐
   │                  LangGraph workflow                      │
   │                                                          │
   │  retrieve ─▶ compare ─▶ guardrail ─▶ decide              │
   │                                          │               │
   │                          ┌───────────────┴────────┐      │
   │                          ▼                        ▼      │
   │                   auto_approve              interrupt()  │
   │                          │                        │      │
   │                          │             ┌──────────▼────┐ │
   │                          │             │ Human review  │ │
   │                          │             └──────────┬────┘ │
   │                          │                        │      │
   │                          ▼                        ▼      │
   │                   audit_node ◀─── resume via PostgresSaver│
   │                   (every transition)                     │
   └──────────────────────────────────────────────────────────┘
                                  │
                                  ▼
                    ┌──────────────────────────┐
                    │       PostgreSQL         │
                    │  · checkpoints           │
                    │  · matches + runs        │
                    │  · policy versions       │
                    │  · append-only audit_log │
                    └──────────────────────────┘
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
| Observability | LangSmith per-node traces |
| Delivery | Docker Compose → GitHub Actions → Amazon ECR → Amazon EC2 |

## Verification

Three integration tests encode the acceptance criteria for the project. They live in `backend/tests/integration/` and run in CI.

### Restart test
A match escalates to human review. The backend process is killed and restarted. Resuming the same `thread_id` continues the graph from the interrupted node and completes the match. This requires `PostgresSaver` as the checkpointer, not `InMemorySaver`.

### Policy test
A match with 5.1% variance under policy v1 (3.0% tolerance) escalates. Publishing policy v2 (6.0% tolerance) and running a second match with the same variance profile causes auto-approval. The audit log records the policy version applied to each run.

### Audit test
A full match produces at least six structured rows in `audit_log` — `retrieved`, `compared`, `guardrail_evaluated`, `escalated` or `auto_approved`, `human_decision`, `completed` — each with a JSONB evidence payload and a server-side timestamp.

## Repository structure

```
matchguard/
├── backend/
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
│   └── tests/
├── frontend/
│   └── src/
│       ├── features/     # dashboard, documents, invoices, runs, review, policies, audit
│       ├── components/   # Spine, GuardrailPanel, EvidenceDrawer, layout
│       └── lib/          # API client and typed schemas
├── infra/                # Docker Compose, GitHub Actions, EC2 bootstrap
└── README.md
```

## Prerequisites

- Docker and Docker Compose
- An AWS account with the following enabled in Amazon Bedrock (`us-east-1` recommended):
  - Amazon Nova Lite
  - Titan Embeddings V2
- An S3 bucket in the same region as Bedrock
- A Pinecone account with one index: dimension **1024**, metric **cosine**

## Quick start

### 1. Configure

```bash
git clone https://github.com/alinrajpoot/matchguard.git
cd matchguard
cp infra/.env.example infra/.env
```

Fill in `infra/.env`:

| Variable | Description |
|---|---|
| `AWS_REGION` | Region where Bedrock model access is enabled |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | Credentials with S3 and Bedrock permissions |
| `S3_BUCKET` | Bucket name, same region as Bedrock |
| `PINECONE_API_KEY` | Pinecone API key |
| `PINECONE_INDEX` | Name of the Pinecone index created above |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | Local database credentials |
| `LANGCHAIN_API_KEY` | Optional; enables LangSmith tracing |

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
docker compose exec backend python -m scripts.seed_demo
```

Migrations create all tables, including the LangGraph checkpoint tables. The seed script inserts synthetic vendors, documents, matches, and policy versions.

### 4. Verify

```bash
curl http://localhost:8000/health
```

## Demo walkthrough

1. **Upload three documents** — a purchase order, a goods receipt note, and an invoice with a line item carrying a 5.1% price variance. Docling extracts line items; Pinecone indexes them with metadata.
2. **Run a match.** LangGraph retrieves lines, compares them, evaluates the active policy, and escalates because 5.1% > 3.0%. The API returns a `match_id` and a review URL.
3. **Refresh the browser.** The match remains in the review queue; the checkpoint lives in PostgreSQL.
4. **Restart the backend container.** Open the review queue again by `match_id` or by the notifications badge. The match is still paused.
5. **Open the review.** Line-by-line comparison, guardrail results, per-line evidence citations (document, page, chunk index), and the recommended action.
6. **Approve with a reason.** Minimum 10 characters, validated server-side. The graph resumes, completes, and writes the human decision to `audit_log`.
7. **Open the policy page.** Move variance tolerance to 6.0%. Publish v2.
8. **Upload a second invoice with the same 5.1% variance profile** on a different line item. Run the match. It auto-approves because v2 is active. The audit log records `policy_version: 2` on the new run and `policy_version: 1` on the previous run.
9. **Open the audit log.** Filter by `match_id`. Every transition is present with a JSONB evidence payload. Click any row to inspect it.

## Development

```bash
# Run all tests
docker compose exec backend pytest -v

# Run only integration tests
docker compose exec backend pytest tests/integration -v

# Lint and type-check
docker compose exec backend ruff check src/
docker compose exec backend mypy src/
```

## Troubleshooting

**Bedrock `AccessDeniedException`.** Model access for Nova Lite and Titan Embeddings V2 must be requested in the AWS console under Bedrock → Model access. It is not enabled by default.

**Pinecone `NotFound`.** The index name in `PINECONE_INDEX` must match an existing index with dimension **1024** and metric **cosine**. Titan Embeddings V2 outputs 1024 dimensions by default.

**Checkpoint tables missing.** Run `alembic upgrade head` inside the backend container before starting a match.

## Design principles

1. **The workflow is the product.** The model proposes; policy and humans decide.
2. **No silent automation of money.** Any decision that could release payment above a configurable threshold must pass a human approval gate.
3. **State must survive process death.** Paused matches persist in PostgreSQL via the LangGraph checkpointer.
4. **Traceability over cleverness.** Every decision links to retrieved evidence, model output, policy version, human reason, and timestamp.
5. **Fail closed.** If guardrails or retrieval confidence drop below threshold, the workflow stops rather than guessing.

## Out of scope

Deliberately not implemented, with reasoning:

- **Multi-tenant isolation.** Single workspace assumed. Per-vendor Pinecone namespaces and PostgreSQL row-level security would be the first step.
- **SSO and SCIM.** Role-based access is not implemented; the demo runs single-user.
- **SOC 2 certification.** The system is designed to support SOC 2 audit requirements — append-only log, evidence lineage — but does not hold the attestation.
- **Handwriting and image-only OCR.** Docling handles parsed PDFs; broader OCR robustness is not implemented.
- **Per-tenant budget enforcement.** Bedrock token usage is logged per match; spend limits are not enforced.

## Author

**Ali Ahmad Rajpoot**
- LinkedIn: `<link>`
- Portfolio: `<link>`
- Email: `<email>`

## License

MIT — see `LICENSE`. Sample documents, vendor names, and financials are synthetic and carry no legal or financial value.

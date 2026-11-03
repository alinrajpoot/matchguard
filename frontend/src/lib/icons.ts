import {
  Activity, Box, BrainCircuit, Cloud, Container, Database, GitBranch,
  Server, Workflow, Zap,
  type LucideIcon,
} from 'lucide-react'

export const infraIcons: Record<string, LucideIcon> = {
  s3: Cloud,
  pinecone: Database,
  bedrock: BrainCircuit,
  postgres: Database,
  glassflow: Activity,
  github: GitBranch,
  ecr: Container,
  ec2: Server,
  fastapi: Zap,
  docker: Box,
  langgraph: Workflow,
}

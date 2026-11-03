import { PageHeader } from './PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'

export function PlaceholderPage({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <>
      <PageHeader title={title} subtitle={subtitle} />
      <div className="rounded-lg border bg-card">
        <EmptyState title="This screen is built in a later task." />
      </div>
    </>
  )
}

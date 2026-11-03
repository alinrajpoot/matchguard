import { beforeEach, describe, expect, it } from 'vitest'
import { useUiStore } from './ui-store'

beforeEach(() => useUiStore.setState({ infra: null, assistantOpen: false, sidebarOpen: false }))

describe('ui store', () => {
  it('opens and closes infra evidence', () => {
    useUiStore.getState().openInfra('s3', 's3://bucket/key')
    expect(useUiStore.getState().infra).toEqual({ key: 's3', resource: 's3://bucket/key' })
    useUiStore.getState().closeInfra()
    expect(useUiStore.getState().infra).toBeNull()
  })
})

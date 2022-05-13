import type { StorageFrameworkEntry } from 'storage-framework/src/lib/StorageFrameworkEntry'

export type DeselectionCallback = () => void

export interface SelectedEventDetail {
  entry: StorageFrameworkEntry
  onDeselect?: DeselectionCallback
}

import type { Result, OkOrError } from './utitities'
import type { SFError } from './SFError'
import type { SFFile } from './SFFile'

export interface SFFileSystemProvider {
  // todo: empty?
  open(): Result<SFFileSystemEntry, SFError>
}

export interface SFFileSystemDirectoryEntry extends SFFileSystemEntry {
  readonly isDirectory: true
  readonly isFile: false
  getChildren(): Result<SFFileSystemFileEntry[], SFError>
  createFile(name: string): Result<SFFileSystemFileEntry, SFError>
  createDirectory(name: string): Result<SFFileSystemDirectoryEntry, SFError>
}

interface SFFileSystemEntry {
  // todo: mabye path class
  // todo: last modified
  readonly fullPath: string
  readonly isDirectory: boolean
  readonly isFile: boolean
  readonly name: string
  getParent(): Result<SFFileSystemDirectoryEntry | null, SFError>
  moveTo(directory: SFFileSystemDirectoryEntry): OkOrError<SFError>
  rename(name: string): OkOrError<SFError>
  remove(): OkOrError<SFError>
}

export interface SFFileSystemFileEntry extends SFFileSystemEntry {
  readonly isDirectory: false
  readonly isFile: true
  read(): Result<SFFile, SFError>
  save(file: File): OkOrError<SFError>
}

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { Commit, Tag, CompareResult, DiffFile } from '@api/github'

export type RepoConfig = {
  owner: string
  repo: string
  token?: string
}

export type Branch = {
  name: string
}

export type ContentItem = {
  type: 'file' | 'dir'
  name: string
  path: string
  size?: number
}

export type SelectedFile = {
  path: string
  branch: string
}

export type AppMode = 'branch' | 'commit' | 'tag'

export type CommitComparison = {
  current: Commit
  previous: Commit
  comparison: CompareResult
}

export type TagComparison = {
  baseTag: string
  headTag: string
  comparison: CompareResult
}

export type AppState = {
  repo: RepoConfig
  setRepo: (r: RepoConfig) => void
  
  // Mode selection
  mode: AppMode
  setMode: (m: AppMode) => void
  
  // Branch mode
  branches: Branch[]
  setBranches: (b: Branch[]) => void
  selectedBranch?: string
  setSelectedBranch: (b?: string) => void
  currentPath: string
  setCurrentPath: (p: string) => void
  selectedFile?: SelectedFile
  setSelectedFile: (f?: SelectedFile) => void
  
  // Commit comparison mode
  commitComparison?: CommitComparison
  setCommitComparison: (c?: CommitComparison) => void
  
  // Tag comparison mode
  tags: Tag[]
  setTags: (t: Tag[]) => void
  selectedBaseTag?: string
  setSelectedBaseTag: (t?: string) => void
  selectedHeadTag?: string
  setSelectedHeadTag: (t?: string) => void
  tagComparison?: TagComparison
  setTagComparison: (t?: TagComparison) => void
}

const defaultRepo: RepoConfig = {
  owner: '',
  repo: '',
}

const AppContext = createContext<AppState | null>(null)

export const AppProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [repo, setRepo] = useState<RepoConfig>(() => {
    const fromStorage = localStorage.getItem('repoConfig')
    return fromStorage ? JSON.parse(fromStorage) : defaultRepo
  })
  
  const [mode, setMode] = useState<AppMode>('commit') // Default to commit comparison mode
  
  // Branch mode state
  const [branches, setBranches] = useState<Branch[]>([])
  const [selectedBranch, setSelectedBranch] = useState<string | undefined>(undefined)
  const [currentPath, setCurrentPath] = useState<string>('')
  const [selectedFile, setSelectedFile] = useState<SelectedFile | undefined>(undefined)
  
  // Commit comparison mode state
  const [commitComparison, setCommitComparison] = useState<CommitComparison | undefined>(undefined)
  
  // Tag comparison mode state
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedBaseTag, setSelectedBaseTag] = useState<string | undefined>(undefined)
  const [selectedHeadTag, setSelectedHeadTag] = useState<string | undefined>(undefined)
  const [tagComparison, setTagComparison] = useState<TagComparison | undefined>(undefined)

  // When switching branches (versions/waves), keep the same file path selected
  // and update its branch so viewers reload content accordingly.
  useEffect(() => {
    if (!selectedBranch) return
    if (selectedFile && selectedFile.branch !== selectedBranch) {
      setSelectedFile({ path: selectedFile.path, branch: selectedBranch })
    }
  }, [selectedBranch])

  const value = useMemo<AppState>(() => ({
    repo,
    setRepo: (r) => { localStorage.setItem('repoConfig', JSON.stringify(r)); setRepo(r) },
    
    mode,
    setMode,
    
    branches,
    setBranches,
    selectedBranch,
    setSelectedBranch,
    currentPath,
    setCurrentPath,
    selectedFile,
    setSelectedFile,
    
    commitComparison,
    setCommitComparison,
    
    tags,
    setTags,
    selectedBaseTag,
    setSelectedBaseTag,
    selectedHeadTag,
    setSelectedHeadTag,
    tagComparison,
    setTagComparison,
  }), [
    repo, 
    mode, 
    branches, 
    selectedBranch, 
    currentPath, 
    selectedFile, 
    commitComparison,
    tags,
    selectedBaseTag,
    selectedHeadTag,
    tagComparison,
  ])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

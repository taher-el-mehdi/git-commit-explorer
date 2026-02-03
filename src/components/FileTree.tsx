import React, { useEffect, useState } from 'react'
import { listContents, type ContentItem, type GitHubConfig, GitHubApiError } from '@api/github'
import { useApp } from '@context/AppContext'

function NodeRow({ item, onOpen }: { item: ContentItem; onOpen: (item: ContentItem) => void }) {
  return (
    <button
      className="w-full text-left px-3 py-1 hover:bg-gray-50 flex items-center gap-2"
      onClick={() => onOpen(item)}
    >
      <span className="inline-block w-4 text-gray-500">{item.type === 'dir' ? '📁' : '📄'}</span>
      <span className="truncate" title={item.name}>{item.name}</span>
    </button>
  )
}

export const FileTree: React.FC = () => {
  const { repo, selectedBranch, currentPath, setCurrentPath, setSelectedFile } = useApp()
  const [items, setItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | undefined>()

  useEffect(() => {
    if (!selectedBranch) return
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(undefined)
      try {
        const cfg: GitHubConfig = { owner: repo.owner, repo: repo.repo, token: repo.token }
        const list = await listContents(cfg, currentPath, selectedBranch)
        if (!cancelled) setItems(list)
      } catch (e:any) {
        if (!cancelled) {
          if (e instanceof GitHubApiError && e.status === 403 && e.remaining === 0) {
            const when = e.reset ? new Date(e.reset * 1000).toLocaleString() : 'later'
            setError(`GitHub rate limit exceeded. Add a token in Repository Settings or retry after ${when}.`)
          } else {
            setError(e?.message || 'Failed to load contents')
          }
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [repo.owner, repo.repo, repo.token, selectedBranch, currentPath])

  function open(item: ContentItem) {
    if (item.type === 'dir') {
      setCurrentPath(item.path)
    } else {
      setSelectedFile({ path: item.path, branch: selectedBranch! })
    }
  }

  function up() {
    if (!currentPath) return
    const parts = currentPath.split('/')
    parts.pop()
    setCurrentPath(parts.join('/'))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-medium">Files{currentPath ? `: /${currentPath}` : ''}</h2>
        {currentPath && (
          <button onClick={up} className="text-sm text-blue-600 hover:underline">Up</button>
        )}
      </div>
      {error && <div className="text-xs text-red-600 mb-2">{error}</div>}
      <div className="max-h-96 overflow-y-auto border rounded">
        {loading && <div className="px-3 py-2 text-sm text-gray-500">Loading…</div>}
        {!loading && items.map(i => (
          <NodeRow key={i.path} item={i} onOpen={open} />
        ))}
        {!loading && items.length === 0 && (
          <div className="px-3 py-2 text-sm text-gray-500">Empty.</div>
        )}
      </div>
    </div>
  )
}

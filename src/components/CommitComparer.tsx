import React, { useEffect, useState } from 'react'
import { useApp } from '@context/AppContext'
import { getLatestCommitComparison, GitHubApiError, type GitHubConfig } from '@api/github'

export const CommitComparer: React.FC = () => {
  const { repo, commitComparison, setCommitComparison } = useApp()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | undefined>()

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(undefined)
      try {
        const cfg: GitHubConfig = { owner: repo.owner, repo: repo.repo, token: repo.token }
        const result = await getLatestCommitComparison(cfg)
        if (!cancelled) {
          setCommitComparison(result)
        }
      } catch (e: any) {
        if (!cancelled) {
          if (e instanceof GitHubApiError && e.status === 403 && e.remaining === 0) {
            const when = e.reset ? new Date(e.reset * 1000).toLocaleString() : 'later'
            setError(`GitHub rate limit exceeded. Add a token in Repository Settings or retry after ${when}.`)
          } else {
            setError(e?.message || 'Failed to load commit comparison')
          }
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [repo.owner, repo.repo, repo.token])

  if (loading) {
    return <div className="text-sm text-gray-500 p-4">Loading latest commits...</div>
  }

  if (error) {
    return <div className="text-sm text-red-600 p-4">{error}</div>
  }

  if (!commitComparison) {
    return <div className="text-sm text-gray-500 p-4">No commits found</div>
  }

  const { current, previous, comparison } = commitComparison

  return (
    <div className="space-y-4">
      <div className="border rounded p-4 bg-white">
        <h3 className="font-medium text-sm mb-2">Current Commit (HEAD)</h3>
        <div className="text-xs space-y-1">
          <div className="font-mono text-gray-600">{current.sha.substring(0, 7)}</div>
          <div className="text-gray-800">{current.message.split('\n')[0]}</div>
          <div className="text-gray-500">
            {current.author.name} • {new Date(current.author.date).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="border rounded p-4 bg-white">
        <h3 className="font-medium text-sm mb-2">Previous Commit (HEAD~1)</h3>
        <div className="text-xs space-y-1">
          <div className="font-mono text-gray-600">{previous.sha.substring(0, 7)}</div>
          <div className="text-gray-800">{previous.message.split('\n')[0]}</div>
          <div className="text-gray-500">
            {previous.author.name} • {new Date(previous.author.date).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="border rounded p-4 bg-white">
        <h3 className="font-medium text-sm mb-2">Changes Summary</h3>
        <div className="text-xs space-y-1">
          <div>
            <span className="font-medium">{comparison.files.length}</span> files changed
          </div>
          <div className="flex gap-4">
            <span className="text-green-600">
              +{comparison.files.reduce((sum, f) => sum + f.additions, 0)} additions
            </span>
            <span className="text-red-600">
              -{comparison.files.reduce((sum, f) => sum + f.deletions, 0)} deletions
            </span>
          </div>
        </div>
      </div>

      <div className="border rounded bg-white">
        <h3 className="font-medium text-sm p-4 border-b">Changed Files</h3>
        <div className="max-h-96 overflow-y-auto">
          {comparison.files.map((file) => (
            <div
              key={file.filename}
              className="px-4 py-2 hover:bg-gray-50 border-b last:border-0 flex items-center justify-between"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-xs font-medium px-2 py-0.5 rounded" style={{
                  backgroundColor: file.status === 'added' ? '#dcfce7' :
                    file.status === 'removed' ? '#fee2e2' :
                    file.status === 'modified' ? '#dbeafe' : '#e5e7eb',
                  color: file.status === 'added' ? '#166534' :
                    file.status === 'removed' ? '#991b1b' :
                    file.status === 'modified' ? '#1e40af' : '#374151'
                }}>
                  {file.status}
                </span>
                <span className="text-sm truncate" title={file.filename}>
                  {file.filename}
                </span>
              </div>
              <div className="text-xs text-gray-500 flex gap-2">
                {file.additions > 0 && <span className="text-green-600">+{file.additions}</span>}
                {file.deletions > 0 && <span className="text-red-600">-{file.deletions}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

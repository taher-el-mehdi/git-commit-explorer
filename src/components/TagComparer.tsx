import React, { useEffect, useState } from 'react'
import { useApp } from '@context/AppContext'
import { listAllTags, compareTags, GitHubApiError, type GitHubConfig } from '@api/github'

export const TagComparer: React.FC = () => {
  const { 
    repo, 
    tags, 
    setTags, 
    selectedBaseTag, 
    setSelectedBaseTag,
    selectedHeadTag,
    setSelectedHeadTag,
    tagComparison,
    setTagComparison 
  } = useApp()
  
  const [loading, setLoading] = useState(false)
  const [comparing, setComparing] = useState(false)
  const [error, setError] = useState<string | undefined>()

  // Load tags on mount
  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(undefined)
      try {
        const cfg: GitHubConfig = { owner: repo.owner, repo: repo.repo, token: repo.token }
        const allTags = await listAllTags(cfg)
        if (!cancelled) {
          setTags(allTags)
          // Auto-select the two most recent tags if available
          if (allTags.length >= 2) {
            setSelectedBaseTag(allTags[1].name)
            setSelectedHeadTag(allTags[0].name)
          }
        }
      } catch (e: any) {
        if (!cancelled) {
          if (e instanceof GitHubApiError && e.status === 403 && e.remaining === 0) {
            const when = e.reset ? new Date(e.reset * 1000).toLocaleString() : 'later'
            setError(`GitHub rate limit exceeded. Add a token in Repository Settings or retry after ${when}.`)
          } else {
            setError(e?.message || 'Failed to load tags')
          }
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [repo.owner, repo.repo, repo.token])

  // Compare tags when both are selected
  useEffect(() => {
    if (!selectedBaseTag || !selectedHeadTag) return
    
    let cancelled = false
    async function compare() {
      setComparing(true)
      setError(undefined)
      try {
        const cfg: GitHubConfig = { owner: repo.owner, repo: repo.repo, token: repo.token }
        const result = await compareTags(cfg, selectedBaseTag, selectedHeadTag)
        if (!cancelled) {
          setTagComparison({
            baseTag: selectedBaseTag,
            headTag: selectedHeadTag,
            comparison: result,
          })
        }
      } catch (e: any) {
        if (!cancelled) {
          if (e instanceof GitHubApiError && e.status === 403 && e.remaining === 0) {
            const when = e.reset ? new Date(e.reset * 1000).toLocaleString() : 'later'
            setError(`GitHub rate limit exceeded. Add a token in Repository Settings or retry after ${when}.`)
          } else {
            setError(e?.message || 'Failed to compare tags')
          }
        }
      } finally {
        if (!cancelled) setComparing(false)
      }
    }
    compare()
    return () => { cancelled = true }
  }, [selectedBaseTag, selectedHeadTag, repo.owner, repo.repo, repo.token])

  if (loading) {
    return <div className="text-sm text-gray-500 p-4">Loading tags...</div>
  }

  if (error) {
    return <div className="text-sm text-red-600 p-4">{error}</div>
  }

  if (tags.length === 0) {
    return <div className="text-sm text-gray-500 p-4">No tags found in this repository</div>
  }

  return (
    <div className="space-y-4">
      <div className="border rounded p-4 bg-white">
        <h3 className="font-medium text-sm mb-3">Compare Tags</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-600 block mb-1">Base Tag (older)</label>
            <select
              value={selectedBaseTag || ''}
              onChange={(e) => setSelectedBaseTag(e.target.value)}
              className="w-full px-3 py-2 border rounded text-sm"
            >
              <option value="">Select base tag...</option>
              {tags.map(tag => (
                <option key={tag.name} value={tag.name}>
                  {tag.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="text-xs text-gray-600 block mb-1">Head Tag (newer)</label>
            <select
              value={selectedHeadTag || ''}
              onChange={(e) => setSelectedHeadTag(e.target.value)}
              className="w-full px-3 py-2 border rounded text-sm"
            >
              <option value="">Select head tag...</option>
              {tags.map(tag => (
                <option key={tag.name} value={tag.name}>
                  {tag.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {comparing && (
        <div className="text-sm text-gray-500 p-4">Comparing tags...</div>
      )}

      {tagComparison && !comparing && (
        <>
          <div className="border rounded p-4 bg-white">
            <h3 className="font-medium text-sm mb-2">Comparison</h3>
            <div className="text-xs space-y-1">
              <div>
                <span className="font-medium">From:</span> {tagComparison.baseTag}
              </div>
              <div>
                <span className="font-medium">To:</span> {tagComparison.headTag}
              </div>
            </div>
          </div>

          <div className="border rounded p-4 bg-white">
            <h3 className="font-medium text-sm mb-2">Changes Summary</h3>
            <div className="text-xs space-y-1">
              <div>
                <span className="font-medium">{tagComparison.comparison.commits.length}</span> commits
              </div>
              <div>
                <span className="font-medium">{tagComparison.comparison.files.length}</span> files changed
              </div>
              <div className="flex gap-4">
                <span className="text-green-600">
                  +{tagComparison.comparison.files.reduce((sum, f) => sum + f.additions, 0)} additions
                </span>
                <span className="text-red-600">
                  -{tagComparison.comparison.files.reduce((sum, f) => sum + f.deletions, 0)} deletions
                </span>
              </div>
            </div>
          </div>

          <div className="border rounded bg-white">
            <h3 className="font-medium text-sm p-4 border-b">Changed Files</h3>
            <div className="max-h-96 overflow-y-auto">
              {tagComparison.comparison.files.map((file) => (
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
        </>
      )}
    </div>
  )
}

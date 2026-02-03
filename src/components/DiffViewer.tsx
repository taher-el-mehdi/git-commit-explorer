import React, { useState } from 'react'
import { useApp } from '@context/AppContext'
import type { DiffFile, GitHubConfig } from '@api/github'
import { getFileVersions } from '@api/github'
import * as Diff from 'diff'

interface DiffViewerProps {
  files: DiffFile[]
  baseSha: string
  headSha: string
}

const FileStatus: React.FC<{ status: string }> = ({ status }) => {
  const colors = {
    added: { bg: '#dcfce7', color: '#166534' },
    removed: { bg: '#fee2e2', color: '#991b1b' },
    modified: { bg: '#dbeafe', color: '#1e40af' },
    renamed: { bg: '#fef3c7', color: '#92400e' },
    default: { bg: '#e5e7eb', color: '#374151' }
  }
  
  const style = colors[status as keyof typeof colors] || colors.default
  
  return (
    <span 
      className="text-xs font-medium px-2 py-0.5 rounded uppercase"
      style={{ backgroundColor: style.bg, color: style.color }}
    >
      {status}
    </span>
  )
}

const DiffLine: React.FC<{ line: string }> = ({ line }) => {
  const firstChar = line[0]
  let bgColor = 'transparent'
  let textColor = 'inherit'
  
  if (firstChar === '+') {
    bgColor = '#dcfce7'
    textColor = '#166534'
  } else if (firstChar === '-') {
    bgColor = '#fee2e2'
    textColor = '#991b1b'
  } else if (firstChar === '@') {
    bgColor = '#e0e7ff'
    textColor = '#3730a3'
  }
  
  return (
    <div 
      className="font-mono text-xs px-4 py-0.5 whitespace-pre"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {line}
    </div>
  )
}

const FileDiff: React.FC<{ file: DiffFile; baseSha: string; headSha: string }> = ({ file, baseSha, headSha }) => {
  const { repo } = useApp()
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const [diffLines, setDiffLines] = useState<string[]>([])

  const handleToggle = async () => {
    if (!expanded && diffLines.length === 0) {
      // First time expanding - load the file contents and generate diff
      setLoading(true)
      setError(undefined)
      
      try {
        const cfg: GitHubConfig = { owner: repo.owner, repo: repo.repo, token: repo.token }
        const { oldContent, newContent } = await getFileVersions(
          cfg, 
          file.previous_filename || file.filename, 
          baseSha, 
          headSha
        )
        
        // Generate unified diff
        const patch = Diff.createPatch(
          file.filename,
          oldContent || '',
          newContent || '',
          'Base',
          'Head'
        )
        
        // Split into lines for display
        const lines = patch.split('\n').slice(4) // Skip header lines
        setDiffLines(lines)
      } catch (e: any) {
        setError(e?.message || 'Failed to load file diff')
      } finally {
        setLoading(false)
      }
    }
    setExpanded(!expanded)
  }

  return (
    <div className="border rounded bg-white mb-2">
      <button
        onClick={handleToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 text-left"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <FileStatus status={file.status} />
          <span className="text-sm font-medium truncate" title={file.filename}>
            {file.filename}
          </span>
          {file.previous_filename && (
            <span className="text-xs text-gray-500">
              ← {file.previous_filename}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="text-xs text-gray-500 flex gap-2">
            {file.additions > 0 && (
              <span className="text-green-600 font-medium">+{file.additions}</span>
            )}
            {file.deletions > 0 && (
              <span className="text-red-600 font-medium">-{file.deletions}</span>
            )}
          </div>
          <span className="text-gray-400">{expanded ? '▼' : '▶'}</span>
        </div>
      </button>
      
      {expanded && (
        <div className="border-t max-h-96 overflow-y-auto bg-gray-50">
          {loading && (
            <div className="px-4 py-3 text-sm text-gray-500">Loading diff...</div>
          )}
          {error && (
            <div className="px-4 py-3 text-sm text-red-600">{error}</div>
          )}
          {!loading && !error && diffLines.length > 0 && (
            <div>
              {diffLines.map((line, idx) => (
                <DiffLine key={idx} line={line} />
              ))}
            </div>
          )}
          {!loading && !error && diffLines.length === 0 && (
            <div className="px-4 py-3 text-sm text-gray-500">
              {file.status === 'added' && 'New file (binary or empty)'}
              {file.status === 'removed' && 'File deleted'}
              {file.status === 'renamed' && 'File renamed with no content changes'}
              {!['added', 'removed', 'renamed'].includes(file.status) && 'No changes to display'}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ files, baseSha, headSha }) => {
  const [filter, setFilter] = useState<string>('all')
  
  const filteredFiles = files.filter(file => {
    if (filter === 'all') return true
    return file.status === filter
  })

  const stats = {
    all: files.length,
    added: files.filter(f => f.status === 'added').length,
    modified: files.filter(f => f.status === 'modified').length,
    removed: files.filter(f => f.status === 'removed').length,
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 border-b pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 text-sm rounded ${filter === 'all' ? 'bg-blue-100 text-blue-700 font-medium' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          All ({stats.all})
        </button>
        {stats.modified > 0 && (
          <button
            onClick={() => setFilter('modified')}
            className={`px-3 py-1 text-sm rounded ${filter === 'modified' ? 'bg-blue-100 text-blue-700 font-medium' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Modified ({stats.modified})
          </button>
        )}
        {stats.added > 0 && (
          <button
            onClick={() => setFilter('added')}
            className={`px-3 py-1 text-sm rounded ${filter === 'added' ? 'bg-blue-100 text-blue-700 font-medium' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Added ({stats.added})
          </button>
        )}
        {stats.removed > 0 && (
          <button
            onClick={() => setFilter('removed')}
            className={`px-3 py-1 text-sm rounded ${filter === 'removed' ? 'bg-blue-100 text-blue-700 font-medium' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Removed ({stats.removed})
          </button>
        )}
      </div>

      <div>
        {filteredFiles.map(file => (
          <FileDiff key={file.sha + file.filename} file={file} baseSha={baseSha} headSha={headSha} />
        ))}
        {filteredFiles.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No files match the selected filter
          </div>
        )}
      </div>
    </div>
  )
}

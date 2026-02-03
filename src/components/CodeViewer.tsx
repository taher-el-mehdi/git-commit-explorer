import React, { useEffect, useState } from 'react'
import { getFileContent, type GitHubConfig, GitHubApiError } from '@api/github'
import { useApp } from '@context/AppContext'
// import 'prismjs/components/prism-markup'
// import 'prismjs/components/prism-javascript'
// import 'prismjs/components/prism-typescript'
// import 'prismjs/components/prism-json'
// import 'prismjs/components/prism-yaml'
// import 'prismjs/components/prism-markdown'
// import '@utils/prism-al'

export const CodeViewer: React.FC = () => {
  const { repo, selectedFile } = useApp()
  const [code, setCode] = useState<string>('')
  const [error, setError] = useState<string | undefined>()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!selectedFile) return
    const sf = selectedFile
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(undefined)
      try {
        const cfg: GitHubConfig = { owner: repo.owner, repo: repo.repo, token: repo.token }
        const res = await getFileContent(cfg, sf.path, sf.branch)
        if (!cancelled) setCode(res.content)
      } catch (e:any) {
        if (!cancelled) {
          if (e instanceof GitHubApiError) {
            if (e.status === 404) {
              setError('404: File not found in this branch/version.')
            } else if (e.status === 403 && e.remaining === 0) {
              const when = e.reset ? new Date(e.reset * 1000).toLocaleString() : 'later'
              setError(`GitHub rate limit exceeded. Add a token in Repository Settings or retry after ${when}.`)
            } else {
              setError(e.message || 'Failed to load file')
            }
          } else {
            setError(e?.message || 'Failed to load file')
          }
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [repo.owner, repo.repo, repo.token, selectedFile?.path, selectedFile?.branch])

//   useEffect(() => {
//     Prism.highlightAll()
//   }, [code])

  if (!selectedFile) return null

  function detectLanguage(p: string): string {
    const ext = (p.split('.').pop() || '').toLowerCase()
    switch (ext) {
      case 'ts':
      case 'tsx':
        return 'typescript'
      case 'js':
      case 'jsx':
        return 'javascript'
      case 'json':
        return 'json'
      case 'yml':
      case 'yaml':
        return 'yaml'
      case 'md':
        return 'markdown'
      case 'html':
      case 'xml':
        return 'markup'
      case 'al':
        return 'al'
      default:
        return 'markup'
    }
  }

  const lang = detectLanguage(selectedFile.path)

  return (
    <div className="h-full">
      <div className="border-b px-4 py-2 text-sm text-gray-600 flex justify-between">
        <span title={selectedFile.path}>{selectedFile.branch} • {selectedFile.path}</span>
      </div>
      {loading && <div className="p-4 text-gray-500">Loading…</div>}
      {error && <div className="p-4 text-red-600">{error}</div>}
      {!loading && !error && (
        <pre className="p-4 overflow-auto h-[calc(100%-40px)]"><code className={`language-${lang}`}>{code}</code></pre>
      )}
    </div>
  )}

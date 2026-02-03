import React, { useEffect, useMemo, useState } from 'react'
import { listAllBranches, type Branch as GHBranch, type GitHubConfig, groupBranchName, GitHubApiError } from '@api/github'
import { useApp } from '@context/AppContext'

export const BranchExplorer: React.FC = () => {
  const { repo, branches, setBranches, selectedBranch, setSelectedBranch } = useApp()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(undefined)
      try {
        const cfg: GitHubConfig = { owner: repo.owner, repo: repo.repo, token: repo.token }
        const all: GHBranch[] = await listAllBranches(cfg)
        if (!cancelled) setBranches(all)
      } catch (e:any) {
        if (!cancelled) {
          if (e instanceof GitHubApiError && e.status === 403 && e.remaining === 0) {
            const when = e.reset ? new Date(e.reset * 1000).toLocaleString() : 'later'
            setError(`GitHub rate limit exceeded. Add a token in Repository Settings or retry after ${when}.`)
          } else {
            setError(e?.message || 'Failed to load branches')
          }
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [repo.owner, repo.repo, repo.token])

  const grouped = useMemo(() => {
    const map = new Map<string, { locale: string; items: { version: string; full: string }[] }>()
    for (const b of branches) {
      const g = groupBranchName(b.name)
      const key = g.locale
      if (!map.has(key)) map.set(key, { locale: key, items: [] })
      map.get(key)!.items.push({ version: g.version || b.name, full: b.name })
    }
    // sort locales alphabetically and versions descending (string)
    const entries = Array.from(map.values()).map(v => ({
      locale: v.locale,
      items: v.items.sort((a,b) => b.version.localeCompare(a.version, undefined, { numeric: true, sensitivity: 'base' }))
    }))
    entries.sort((a,b) => a.locale.localeCompare(b.locale))
    return entries
  }, [branches])

  useEffect(() => {
    // auto-expand the locale for the currently selected branch
    if (!selectedBranch) return
    const g = groupBranchName(selectedBranch)
    setExpanded(prev => ({ ...prev, [g.locale]: true }))
  }, [selectedBranch])

  function toggle(locale: string) {
    setExpanded(prev => ({ ...prev, [locale]: !prev[locale] }))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-medium">Localisations & Waves</h2>
        {loading && <span className="text-xs text-gray-500">Loading…</span>}
      </div>
      {error && <div className="text-xs text-red-600 mb-2">{error}</div>}
      <div className="max-h-64 overflow-y-auto border rounded">
        {grouped.map(group => (
          <div key={group.locale} className="border-b last:border-0">
            <button
              className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-50"
              onClick={() => toggle(group.locale)}
              title={group.locale}
            >
              <span className="font-medium">{group.locale.toUpperCase()}</span>
              <span className="text-xs text-gray-600">{group.items.length}</span>
            </button>
            {expanded[group.locale] && (
              <div className="bg-white">
                {group.items.map(it => (
                  <button
                    key={it.full}
                    className={`w-full text-left pl-6 pr-3 py-2 hover:bg-gray-50 ${selectedBranch===it.full ? 'bg-gray-100 font-medium' : ''}`}
                    onClick={() => setSelectedBranch(it.full)}
                    title={it.full}
                  >
                    {it.version}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        {!loading && branches.length === 0 && (
          <div className="px-3 py-2 text-sm text-gray-500">No branches found.</div>
        )}
      </div>
    </div>
  )
}

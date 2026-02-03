import React, { useState } from 'react'
import { useApp } from '@context/AppContext'

export const RepoConfigForm: React.FC = () => {
  const { repo, setRepo } = useApp()
  const [owner, setOwner] = useState(repo.owner)
  const [name, setName] = useState(repo.repo)
  const [token, setToken] = useState(repo.token || '')
  const [show, setShow] = useState(false)

  function save() {
    setRepo({ owner, repo: name, token: token || undefined })
  }

  function clearToken() {
    setToken('')
  }

  return (
    <div className="space-y-2">
      <button
        className="w-full text-left px-3 py-2 border rounded hover:bg-gray-50"
        onClick={() => setShow(s => !s)}
      >
        <div className="flex items-center justify-between">
          <span className="font-medium">Repository Settings</span>
          <span className="text-xs text-gray-500">{show ? 'Hide' : 'Show'}</span>
        </div>
        <div className="text-xs text-gray-600 truncate">{owner}/{name}</div>
      </button>

      {show && (
        <div className="space-y-2 border rounded p-3 bg-gray-50">
          <label className="block text-sm">Owner
            <input className="mt-1 w-full border rounded px-2 py-1" value={owner} onChange={e => setOwner(e.target.value)} />
          </label>
          <label className="block text-sm">Repo
            <input className="mt-1 w-full border rounded px-2 py-1" value={name} onChange={e => setName(e.target.value)} />
          </label>
          <label className="block text-sm">Token (optional)
            <input className="mt-1 w-full border rounded px-2 py-1" value={token} onChange={e => setToken(e.target.value)} placeholder="ghp_..." />
          </label>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={save}>Save</button>
            <button className="px-3 py-1 border rounded" onClick={clearToken}>Clear token</button>
          </div>
          <div className="text-xs text-gray-500">Private repos require a token with <code>repo</code> scope.</div>
        </div>
      )}
    </div>
  )
}

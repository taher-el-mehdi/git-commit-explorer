import React from 'react'
import { useApp } from '@context/AppContext'
import type { AppMode } from '@context/AppContext'

export const ModeSelector: React.FC = () => {
  const { mode, setMode } = useApp()

  const modes: { value: AppMode; label: string; description: string }[] = [
    { value: 'commit', label: 'Latest Commit', description: 'Compare HEAD vs HEAD~1' },
    { value: 'tag', label: 'Version Tags', description: 'Compare between tags (e.g., v26, v27)' },
    { value: 'branch', label: 'Branches', description: 'Browse files by branch' },
  ]

  return (
    <div className="border rounded bg-white p-4">
      <h3 className="font-medium text-sm mb-3">Comparison Mode</h3>
      <div className="space-y-2">
        {modes.map((m) => (
          <button
            key={m.value}
            onClick={() => setMode(m.value)}
            className={`w-full text-left px-3 py-2 rounded border transition-colors ${
              mode === m.value
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="font-medium text-sm">{m.label}</div>
            <div className="text-xs text-gray-500 mt-0.5">{m.description}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

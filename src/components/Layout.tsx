import React from 'react'

export const Layout: React.FC<{ sidebar: React.ReactNode; main: React.ReactNode }> = ({ sidebar, main }) => {
  return (
    <div className="h-screen grid grid-cols-12">
      <aside className="col-span-3 border-r bg-white overflow-y-auto sticky top-0 h-screen p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold">Git Commit Explorer</h1>
        </div>
        {sidebar}
      </aside>
      <main className="col-span-9 overflow-y-auto h-screen">
        {main}
      </main>
    </div>
  )
}

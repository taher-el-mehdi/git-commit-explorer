import { Layout } from '@components/Layout'
import { BranchExplorer } from '@components/BranchExplorer'
import { FileTree } from '@components/FileTree'
import { CodeViewer } from '@components/CodeViewer'
import { CommitComparer } from '@components/CommitComparer'
import { TagComparer } from '@components/TagComparer'
import { DiffViewer } from '@components/DiffViewer'
import { ModeSelector } from '@components/ModeSelector'
import { useApp } from '@context/AppContext'
import { RepoConfigForm } from '@components/RepoConfigForm'

export default function App() {
  const { mode, selectedFile, commitComparison, tagComparison } = useApp()
  
  // Branch mode: show branch explorer and file tree
  const branchModeSidebar = (
    <div className="space-y-4">
      <RepoConfigForm />
      <ModeSelector />
      <BranchExplorer />
      <div className="border-t pt-4">
        <FileTree />
      </div>
    </div>
  )
  
  // Commit comparison mode: show commit comparer
  const commitModeSidebar = (
    <div className="space-y-4">
      <RepoConfigForm />
      <ModeSelector />
      <CommitComparer />
    </div>
  )
  
  // Tag comparison mode: show tag comparer
  const tagModeSidebar = (
    <div className="space-y-4">
      <RepoConfigForm />
      <ModeSelector />
      <TagComparer />
    </div>
  )
  
  return (
    <Layout
      sidebar={
        mode === 'branch' ? branchModeSidebar :
        mode === 'commit' ? commitModeSidebar :
        tagModeSidebar
      }
      main={
        <div className="h-full overflow-auto p-4">
          {mode === 'branch' && (
            selectedFile ? (
              <CodeViewer />
            ) : (
              <div className="text-gray-500 h-full flex items-center justify-center">
                Select a branch and file to view.
              </div>
            )
          )}
          
          {mode === 'commit' && (
            commitComparison ? (
              <div>
                <h2 className="text-lg font-medium mb-4">File Changes</h2>
                <DiffViewer 
                  files={commitComparison.comparison.files} 
                  baseSha={commitComparison.previous.sha}
                  headSha={commitComparison.current.sha}
                />
              </div>
            ) : (
              <div className="text-gray-500 h-full flex items-center justify-center">
                Loading commit comparison...
              </div>
            )
          )}
          
          {mode === 'tag' && (
            tagComparison ? (
              <div>
                <h2 className="text-lg font-medium mb-4">
                  Tag Comparison: {tagComparison.baseTag} → {tagComparison.headTag}
                </h2>
                <DiffViewer 
                  files={tagComparison.comparison.files}
                  baseSha={tagComparison.comparison.base_commit.sha}
                  headSha={tagComparison.comparison.commits[tagComparison.comparison.commits.length - 1]?.sha || tagComparison.comparison.base_commit.sha}
                />
              </div>
            ) : (
              <div className="text-gray-500 h-full flex items-center justify-center">
                Select tags to compare
              </div>
            )
          )}
        </div>
      }
    />
  )
}

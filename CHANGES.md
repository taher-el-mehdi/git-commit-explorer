# Code History Manager - Commit Comparison Feature

## Overview

This application has been enhanced to support multiple comparison modes:
- **Latest Commit Comparison**: Automatically compares HEAD with HEAD~1
- **Tag Comparison**: Compare between version tags (e.g., v26, v27)
- **Branch Explorer**: Original branch-based file browsing

## What's New

### 1. Commit Comparison Mode (Default)
- Automatically loads and compares the latest commit (HEAD) with its predecessor (HEAD~1)
- Displays commit information including:
  - Commit SHA
  - Commit message
  - Author name and timestamp
- Shows a summary of changes:
  - Number of files changed
  - Total additions and deletions
- Lists all changed files with their status (added, modified, removed, renamed)

### 2. Tag Comparison Mode
- Lists all version tags in the repository
- Allows selection of two tags to compare
- Auto-selects the two most recent tags by default
- Shows number of commits between tags
- Displays all file changes between the selected tags

### 3. Lazy-Loading Diff Viewer
- Files are collapsed by default to improve performance
- Click on any file to expand and view the diff
- Diffs are loaded on-demand (only when expanded)
- Color-coded diff display:
  - Green background for additions (+)
  - Red background for deletions (-)
  - Blue background for context lines (@)
- Filter changed files by status:
  - All files
  - Modified only
  - Added only
  - Removed only

### 4. Mode Selector
- Easy switching between comparison modes
- Persistent state within each mode
- Clear visual indication of current mode

## New Components

### CommitComparer.tsx
Handles automatic loading and display of HEAD vs HEAD~1 comparison.

### TagComparer.tsx
Manages tag selection and comparison logic.

### DiffViewer.tsx
Renders file diffs with lazy loading and filtering capabilities.

### ModeSelector.tsx
Provides UI for switching between different comparison modes.

## API Enhancements

New functions added to `github.ts`:

```typescript
// Get a specific commit
getCommit(cfg, ref): Promise<Commit>

// Compare two commits or refs
compareCommits(cfg, base, head): Promise<CompareResult>

// Get latest commit comparison (HEAD vs HEAD~1)
getLatestCommitComparison(cfg): Promise<{current, previous, comparison}>

// List repository tags
listAllTags(cfg): Promise<Tag[]>

// Compare two tags
compareTags(cfg, baseTag, headTag): Promise<CompareResult>

// Get diff for a specific file
getFileDiff(cfg, base, head, filepath): Promise<string | null>
```

## New Types

```typescript
type Commit = {
  sha: string
  message: string
  author: { name: string; email: string; date: string }
  committer: { name: string; email: string; date: string }
}

type DiffFile = {
  sha: string
  filename: string
  status: 'added' | 'removed' | 'modified' | 'renamed' | 'copied' | 'changed' | 'unchanged'
  additions: number
  deletions: number
  changes: number
  patch?: string
  previous_filename?: string
}

type CompareResult = {
  base_commit: { sha: string; commit: {...} }
  commits: Commit[]
  files: DiffFile[]
}

type Tag = {
  name: string
  commit: { sha: string; url: string }
}
```

## Usage

### Default Mode (Commit Comparison)
1. Open the application
2. The latest commit comparison loads automatically
3. View the commit details and file changes
4. Click on any file to see the diff
5. Use filters to narrow down the file list

### Tag Comparison
1. Click "Version Tags" in the mode selector
2. Select a base tag (older version)
3. Select a head tag (newer version)
4. View the comparison results and file changes

### Branch Explorer (Original Mode)
1. Click "Branches" in the mode selector
2. Select a branch/wave
3. Navigate the file tree
4. Click on files to view their content

## Performance Optimizations

- **Lazy Loading**: Diffs are only loaded when files are expanded
- **On-Demand Rendering**: Large file lists don't block the UI
- **Filtered Views**: Reduce visible files by status
- **Efficient API Calls**: Single API call fetches all comparison data

## Configuration

The app uses the same repository configuration as before:
- Owner: Repository owner username
- Repo: Repository name
- Token: GitHub Personal Access Token (optional, but recommended to avoid rate limits)

## GitHub API Rate Limits

- Unauthenticated: 60 requests/hour
- Authenticated: 5,000 requests/hour

To avoid rate limits, add a GitHub token in the Repository Settings.

## Future Enhancements

Potential improvements:
- Compare any two arbitrary commits
- Side-by-side diff view
- Download patches
- Permalink to specific comparisons
- Syntax highlighting in diffs
- Search within diffs
- Blame information

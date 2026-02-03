# Architecture Overview

## Component Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                           App.tsx                                │
│                     (Main Application)                           │
└────────────┬────────────────────────────────────────────────────┘
             │
             ├─── AppContext (State Management)
             │    ├── mode: 'commit' | 'tag' | 'branch'
             │    ├── commitComparison
             │    ├── tagComparison
             │    └── branch data
             │
             ├─── Layout Component
             │    │
             │    ├─── Sidebar
             │    │    ├── RepoConfigForm
             │    │    ├── ModeSelector
             │    │    └── Dynamic Component:
             │    │         ├── CommitComparer (mode='commit')
             │    │         ├── TagComparer (mode='tag')
             │    │         └── BranchExplorer + FileTree (mode='branch')
             │    │
             │    └─── Main Area
             │         ├── DiffViewer (mode='commit' or 'tag')
             │         └── CodeViewer (mode='branch')
             │
             └─── GitHub API (github.ts)
                  ├── getLatestCommitComparison()
                  ├── compareTags()
                  ├── compareCommits()
                  └── Original functions
```

## Data Flow

### Commit Comparison Flow

```
┌──────────────┐
│  App Loads   │
└──────┬───────┘
       │
       ├─ AppContext initializes with mode='commit'
       │
       ▼
┌─────────────────┐
│ CommitComparer  │
│   Component     │
└────────┬────────┘
         │
         ├─ useEffect() triggers on mount
         │
         ▼
┌──────────────────────────┐
│ getLatestCommitComparison│
│     API Call             │
└────────┬─────────────────┘
         │
         ├─ GET /repos/{owner}/{repo}/commits/HEAD
         ├─ GET /repos/{owner}/{repo}/commits/HEAD~1
         └─ GET /repos/{owner}/{repo}/compare/{HEAD~1}...{HEAD}
         │
         ▼
┌─────────────────────┐
│  CompareResult      │
│  {                  │
│    current: {...},  │
│    previous: {...}, │
│    comparison: {    │
│      files: [...]   │
│    }                │
│  }                  │
└─────────┬───────────┘
          │
          ├─ setCommitComparison(result)
          │
          ▼
┌──────────────────┐
│  UI Updates      │
│  ├─ Sidebar:     │
│  │   Commit info │
│  └─ Main:        │
│      DiffViewer  │
└──────────────────┘
```

### Tag Comparison Flow

```
┌──────────────────┐
│ User selects     │
│ "Version Tags"   │
└────────┬─────────┘
         │
         ├─ setMode('tag')
         │
         ▼
┌─────────────────┐
│  TagComparer    │
│   Component     │
└────────┬────────┘
         │
         ├─ Load all tags
         │
         ▼
┌──────────────────┐
│  listAllTags()   │
└────────┬─────────┘
         │
         ├─ GET /repos/{owner}/{repo}/tags
         │
         ▼
┌──────────────────┐
│ Auto-select      │
│ latest 2 tags    │
└────────┬─────────┘
         │
         ├─ setSelectedBaseTag(tags[1])
         ├─ setSelectedHeadTag(tags[0])
         │
         ▼
┌──────────────────┐
│  compareTags()   │
└────────┬─────────┘
         │
         ├─ GET /repos/{owner}/{repo}/compare/{base}...{head}
         │
         ▼
┌──────────────────┐
│  TagComparison   │
│  Result          │
└────────┬─────────┘
         │
         ├─ setTagComparison(result)
         │
         ▼
┌──────────────────┐
│  DiffViewer      │
│  shows results   │
└──────────────────┘
```

### Lazy-Loading Diff Flow

```
┌──────────────────┐
│  DiffViewer      │
│  receives files  │
└────────┬─────────┘
         │
         ├─ Render collapsed file list
         │
         ▼
┌──────────────────┐
│  User clicks     │
│  file            │
└────────┬─────────┘
         │
         ├─ setExpanded(true)
         ├─ setLoaded(true)
         │
         ▼
┌──────────────────┐
│  Diff rendered   │
│  from file.patch │
└────────┬─────────┘
         │
         ├─ Split patch into lines
         ├─ Apply color coding:
         │  • '+' lines → green
         │  • '-' lines → red
         │  • '@' lines → blue
         │
         ▼
┌──────────────────┐
│  Display diff    │
└──────────────────┘
```

## State Management

```
AppContext State Tree:
├── repo
│   ├── owner
│   ├── repo
│   └── token
│
├── mode: 'commit' | 'tag' | 'branch'
│
├── Commit Mode State
│   └── commitComparison
│       ├── current: Commit
│       ├── previous: Commit
│       └── comparison: CompareResult
│
├── Tag Mode State
│   ├── tags: Tag[]
│   ├── selectedBaseTag: string
│   ├── selectedHeadTag: string
│   └── tagComparison
│       ├── baseTag: string
│       ├── headTag: string
│       └── comparison: CompareResult
│
└── Branch Mode State
    ├── branches: Branch[]
    ├── selectedBranch: string
    ├── currentPath: string
    └── selectedFile: SelectedFile
```

## API Endpoints Used

```
GitHub API v3 Endpoints:

1. List Commits
   GET /repos/{owner}/{repo}/commits
   └─ Used by: listCommits()

2. Get Commit
   GET /repos/{owner}/{repo}/commits/{ref}
   └─ Used by: getCommit()

3. Compare Commits
   GET /repos/{owner}/{repo}/compare/{base}...{head}
   └─ Used by: compareCommits(), compareTags(), getLatestCommitComparison()

4. List Tags
   GET /repos/{owner}/{repo}/tags
   └─ Used by: listAllTags()

5. List Branches
   GET /repos/{owner}/{repo}/branches
   └─ Used by: listAllBranches() (existing)

6. Get Contents
   GET /repos/{owner}/{repo}/contents/{path}?ref={ref}
   └─ Used by: listContents(), getFileContent() (existing)
```

## Component Responsibilities

```
┌─────────────────────────────────────────────┐
│           Component Responsibilities         │
├─────────────────────────────────────────────┤
│                                             │
│ ModeSelector                                │
│ ├─ Display mode options                    │
│ ├─ Handle mode switching                   │
│ └─ Visual feedback for current mode        │
│                                             │
│ CommitComparer                              │
│ ├─ Fetch HEAD and HEAD~1                   │
│ ├─ Display commit information               │
│ ├─ Show change summary                      │
│ └─ List changed files                       │
│                                             │
│ TagComparer                                 │
│ ├─ Fetch repository tags                   │
│ ├─ Provide tag selection dropdowns         │
│ ├─ Compare selected tags                   │
│ └─ Display comparison results               │
│                                             │
│ DiffViewer                                  │
│ ├─ Render file list with status badges     │
│ ├─ Lazy-load diffs on expand               │
│ ├─ Provide file filtering                  │
│ ├─ Color-code diff lines                   │
│ └─ Handle expand/collapse state            │
│                                             │
│ BranchExplorer (existing)                  │
│ ├─ List and group branches                 │
│ └─ Handle branch selection                  │
│                                             │
│ FileTree (existing)                        │
│ ├─ Navigate directory structure            │
│ └─ Handle file selection                    │
│                                             │
│ CodeViewer (existing)                      │
│ └─ Display file contents                    │
│                                             │
└─────────────────────────────────────────────┘
```

## Performance Considerations

```
Performance Strategy:

1. Lazy Loading
   ├─ Files collapsed by default
   ├─ Diffs loaded only on expand
   └─ Reduces initial render time

2. Single API Calls
   ├─ One call for complete comparison
   ├─ All data fetched at once
   └─ No per-file API requests

3. Efficient Rendering
   ├─ Collapsed files don't render diffs
   ├─ React keys prevent re-renders
   └─ Memoized filter calculations

4. Filter Views
   ├─ Reduce visible file count
   ├─ Filter by status client-side
   └─ No additional API calls
```

## Error Handling Flow

```
┌──────────────┐
│  API Call    │
└──────┬───────┘
       │
       ├─ Success → Display data
       │
       └─ Error
          │
          ├─ GitHubApiError (403, remaining=0)
          │  └─ Show: "Rate limit exceeded. Retry after {time}"
          │
          ├─ GitHubApiError (404)
          │  └─ Show: "Resource not found"
          │
          └─ Other Error
             └─ Show: error.message
```

## UI Layout

```
┌────────────────────────────────────────────────────────────────┐
│                     Navigation / Header                         │
├──────────────┬─────────────────────────────────────────────────┤
│              │                                                  │
│  Sidebar     │              Main Area                          │
│  (300px)     │              (flex-1)                           │
│              │                                                  │
│ ┌──────────┐ │  ┌────────────────────────────────────────┐   │
│ │  Repo    │ │  │                                        │   │
│ │  Config  │ │  │                                        │   │
│ └──────────┘ │  │                                        │   │
│              │  │                                        │   │
│ ┌──────────┐ │  │          File Diffs                   │   │
│ │   Mode   │ │  │       (DiffViewer)                    │   │
│ │ Selector │ │  │                                        │   │
│ └──────────┘ │  │  ┌──────────────────────────────┐     │   │
│              │  │  │ [MODIFIED] file1.tsx  +15 -3 │     │   │
│ ┌──────────┐ │  │  └──────────────────────────────┘     │   │
│ │  Commit  │ │  │                                        │   │
│ │ Comparer │ │  │  ┌──────────────────────────────┐     │   │
│ │          │ │  │  │ [ADDED] file2.tsx       +52  │     │   │
│ │  HEAD    │ │  │  └──────────────────────────────┘     │   │
│ │  abc123  │ │  │                                        │   │
│ │          │ │  │  ┌──────────────────────────────┐     │   │
│ │ HEAD~1   │ │  │  │ [REMOVED] file3.tsx     -28  │     │   │
│ │  def456  │ │  │  └──────────────────────────────┘     │   │
│ │          │ │  │                                        │   │
│ │ Files: 5 │ │  │                                        │   │
│ │ +125 -43 │ │  │                                        │   │
│ └──────────┘ │  └────────────────────────────────────────┘   │
│              │                                                  │
└──────────────┴─────────────────────────────────────────────────┘
```

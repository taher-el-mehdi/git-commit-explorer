# Quick Start Guide

## Running the Application

```bash
# Install dependencies (if not already installed)
npm install

# Start development server
npm run dev
```

The application will open in your browser, automatically displaying the latest commit comparison.

## Understanding the Flow

### 1. Latest Commit Comparison (Default)

When the app loads:
```
User opens app
    ↓
App.tsx renders with mode='commit'
    ↓
CommitComparer component loads
    ↓
Calls getLatestCommitComparison()
    ↓
API fetches HEAD commit
    ↓
API fetches HEAD~1 commit
    ↓
API compares commits using GitHub Compare API
    ↓
Results displayed in UI
```

### 2. Viewing Diffs

```
DiffViewer shows collapsed file list
    ↓
User clicks on a file
    ↓
File expands, diff renders (lazy loaded)
    ↓
Diff shown with color coding
```

### 3. Switching to Tag Comparison

```
User clicks "Version Tags" in ModeSelector
    ↓
TagComparer component loads
    ↓
Fetches all repository tags
    ↓
Auto-selects two most recent tags
    ↓
Compares selected tags
    ↓
DiffViewer shows results
```

## Key API Calls

### Get Latest Commit Comparison
```typescript
const result = await getLatestCommitComparison(cfg)
// Returns:
// {
//   current: Commit,      // HEAD
//   previous: Commit,     // HEAD~1
//   comparison: {
//     base_commit: {...},
//     commits: Commit[],
//     files: DiffFile[]
//   }
// }
```

### Compare Any Two Commits
```typescript
const result = await compareCommits(cfg, 'HEAD~5', 'HEAD')
const result2 = await compareCommits(cfg, 'abc123', 'def456')
```

### Compare Tags
```typescript
const result = await compareTags(cfg, 'v26', 'v27')
```

## Component Hierarchy

```
App.tsx
├── Layout
│   ├── Sidebar
│   │   ├── RepoConfigForm
│   │   ├── ModeSelector
│   │   └── Mode-specific component:
│   │       ├── CommitComparer (commit mode)
│   │       ├── TagComparer (tag mode)
│   │       └── BranchExplorer + FileTree (branch mode)
│   │
│   └── Main Area
│       ├── DiffViewer (commit/tag modes)
│       └── CodeViewer (branch mode)
```

## Configuration

### Repository Settings
Located in the sidebar:
- **Owner**: GitHub username or organization
- **Repo**: Repository name
- **Token**: (Optional) GitHub Personal Access Token

### Getting a GitHub Token
1. Go to GitHub Settings → Developer Settings → Personal Access Tokens
2. Generate new token (classic)
3. Select scope: `repo` (for private repos) or `public_repo` (for public repos)
4. Copy token and paste in app settings

## Features in Action

### Commit Information Display
```
Current Commit (HEAD)
  abc1234
  Fix: Update navigation logic
  John Doe • 2/3/2026, 10:30 AM

Previous Commit (HEAD~1)
  def5678
  Feature: Add new component
  Jane Smith • 2/2/2026, 3:15 PM

Changes Summary
  5 files changed
  +125 additions
  -43 deletions
```

### File Change List
```
[MODIFIED] src/App.tsx        +15 -3
[ADDED]    src/NewComponent.tsx   +52
[REMOVED]  src/OldFile.tsx        -28
[RENAMED]  src/utils/helper.ts    +5 -2
```

### Diff Display
```diff
@@ -10,7 +10,8 @@
 export default function App() {
-  const { selectedFile } = useApp()
+  const { mode, selectedFile } = useApp()
+  
   return (
```

## Filtering Files

Click filter buttons to show only:
- **All (15)**: Show all changed files
- **Modified (8)**: Only modified files
- **Added (5)**: Only new files
- **Removed (2)**: Only deleted files

## Mode Switching

### Latest Commit Mode
Best for: Reviewing the most recent changes
- Auto-loads on startup
- No configuration needed
- Shows HEAD vs HEAD~1

### Version Tags Mode
Best for: Comparing releases
- Select any two tags
- See all changes between versions
- Good for release notes

### Branches Mode
Best for: Exploring specific versions
- Browse file tree
- View file contents
- Original functionality

## Tips

1. **Add a GitHub token** to avoid rate limits (60/hour → 5000/hour)
2. **Use filters** when there are many changed files
3. **Collapse diffs** you're not interested in to reduce clutter
4. **Switch modes** based on what you need to see
5. **Check the error messages** - they tell you exactly what went wrong

## Troubleshooting

### "Rate limit exceeded"
- Add a GitHub token in Repository Settings
- Wait for rate limit to reset (shown in error message)

### "404: Not found"
- Check repository owner and name are correct
- Ensure repository is public (or token has access)

### "No commits found"
- Repository might be empty
- Branch might not exist
- Network issue - try refreshing

### Diffs not showing
- File might have no changes (binary file, rename only, etc.)
- Check file status badge
- Try expanding another file to confirm it's working

## Development

### Project Structure
```
src/
├── api/
│   └── github.ts           # API calls
├── components/
│   ├── CommitComparer.tsx   # HEAD vs HEAD~1 UI
│   ├── DiffViewer.tsx       # Lazy-loading diffs
│   ├── TagComparer.tsx      # Tag comparison UI
│   ├── ModeSelector.tsx     # Mode switcher
│   ├── BranchExplorer.tsx   # Branch browser
│   ├── FileTree.tsx         # File navigator
│   ├── CodeViewer.tsx       # File content viewer
│   └── ...
├── context/
│   └── AppContext.tsx       # State management
└── App.tsx                  # Main app
```

### Adding New Features

To add a new comparison mode:
1. Add mode type to `AppContext.tsx`
2. Create new component for the mode
3. Add mode to `ModeSelector.tsx`
4. Update `App.tsx` to handle the mode

## Learn More

- [GitHub Compare API](https://docs.github.com/en/rest/commits/commits#compare-two-commits)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)

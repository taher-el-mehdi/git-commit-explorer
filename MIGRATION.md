# Migration Guide - From Branch Comparison to Commit Comparison

## What Changed?

The application has been enhanced with **new commit and tag comparison features** while **keeping all original functionality intact**.

### Before (v1)
- Browse branches
- Navigate file trees
- View file contents

### After (v2)
- **NEW:** Compare HEAD with HEAD~1 (default mode)
- **NEW:** Compare version tags (e.g., v26 vs v27)
- **NEW:** View file diffs with lazy loading
- **KEPT:** All original branch browsing features

## For Existing Users

### Nothing is Broken! 🎉

Your existing workflow still works exactly the same way:

1. Open the app
2. Click **"Branches"** in the mode selector
3. Continue using the app as before

### New Default Behavior

The app now opens in **"Latest Commit"** mode by default, which:
- Automatically loads the most recent commit comparison
- Shows what changed in the last commit
- Displays file diffs

**To get back to branch mode:** Just click "Branches" in the mode selector.

## New Features You Can Use

### 1. Quick Commit Review (Default Mode)

**Use Case:** You want to see what changed in the latest commit

**How to use:**
1. Open the app (it's already in this mode!)
2. View commit information in the sidebar
3. See all changed files in the main area
4. Click any file to see the diff

**When to use:**
- Reviewing recent changes
- Quick code review
- Checking what was just committed

### 2. Version Tag Comparison

**Use Case:** You want to see all changes between two versions

**How to use:**
1. Click "Version Tags" in the mode selector
2. Select two tags (e.g., v26 and v27)
3. View all changes between those versions

**When to use:**
- Preparing release notes
- Comparing versions
- Understanding version differences

### 3. Branch File Browser (Original Mode)

**Use Case:** You want to explore files in a specific branch

**How to use:**
1. Click "Branches" in the mode selector
2. Select a branch
3. Navigate the file tree
4. View file contents

**When to use:**
- Exploring code structure
- Reading specific file versions
- Original use case

## UI Changes

### New: Mode Selector

Located at the top of the sidebar, shows three buttons:
- **Latest Commit** - HEAD vs HEAD~1 comparison
- **Version Tags** - Compare tags
- **Branches** - Original file browser

### New: Commit Information Display

Shows:
- Commit SHA (short form)
- Commit message
- Author and timestamp
- Change summary

### New: Diff Viewer

Features:
- Collapsible file list
- Status badges (added, modified, removed)
- Color-coded diffs
- Filter by file status

### Unchanged: Branch Explorer & File Tree

Works exactly the same as before!

## Configuration

No changes required! Your existing configuration still works:
- Repository owner
- Repository name
- GitHub token (optional)

## GitHub Token Recommendation

The new features make more API calls, so a GitHub token is **highly recommended**:

**Without token:** 60 requests/hour
**With token:** 5,000 requests/hour

### How to add a token:
1. Go to GitHub Settings → Developer Settings → Personal Access Tokens
2. Generate new token
3. Copy and paste in the app's Repository Settings

## Feature Comparison

| Feature | Old Version | New Version |
|---------|-------------|-------------|
| Browse branches | ✅ | ✅ |
| View file tree | ✅ | ✅ |
| Read file contents | ✅ | ✅ |
| Compare commits | ❌ | ✅ (NEW) |
| View file diffs | ❌ | ✅ (NEW) |
| Compare tags | ❌ | ✅ (NEW) |
| Filter changed files | ❌ | ✅ (NEW) |
| Lazy loading | ❌ | ✅ (NEW) |

## Tips for New Users

### Start Simple
1. Open the app → See latest commit changes
2. Click a file → See what changed
3. Try "Version Tags" → Compare versions
4. Click "Branches" → Use original features

### Keyboard Shortcuts (Coming Soon)
The lazy-loading design sets up potential for:
- Arrow keys to navigate files
- Space to expand/collapse
- 'f' to toggle filters

### Best Practices

**For Code Review:**
- Use "Latest Commit" mode
- Filter by "Modified" to focus on changes
- Expand files one by one

**For Release Notes:**
- Use "Version Tags" mode
- Select version range
- Review all changed files

**For Code Exploration:**
- Use "Branches" mode
- Browse file tree
- Read file contents

## Troubleshooting

### "The app looks different!"
- The new default mode is "Latest Commit"
- Click "Branches" to get back to familiar view

### "I just want to browse files"
- Click "Branches" in the mode selector
- Everything works like before

### "Too many API calls / Rate limited"
- Add a GitHub token in settings
- Consider using branch mode (fewer API calls)

### "How do I see the old view?"
- Click "Branches" button
- The original interface is unchanged

## What's Next?

Future enhancements being considered:
- Compare any two commits (not just HEAD vs HEAD~1)
- Side-by-side diff view
- Syntax highlighting in diffs
- Inline comments
- Download patches
- Custom commit range selection

## Feedback

The new features are designed to enhance, not replace, the original functionality. If you have suggestions or issues:

1. The original branch browsing mode is always available
2. Mode switching is instant
3. All modes share the same configuration

## Summary

✅ **All original features work exactly the same**
✅ **New features add value without complexity**
✅ **Easy to switch between modes**
✅ **Backward compatible**
✅ **No breaking changes**

**Bottom Line:** You can keep using the app exactly as before by clicking "Branches", or explore the new commit comparison features when needed!

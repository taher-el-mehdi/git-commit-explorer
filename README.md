# Git Commit Explorer

A powerful web application for exploring and comparing Git commits in any GitHub repository. View commit history, compare changes between commits or version tags, and examine file diffs with an intuitive interface.

![Demo Screenshot](./assets/imgs/screenshot.png)

## ✨ Features

### 🔍 Multiple Comparison Modes

- **Latest Commit Comparison** (Default)
  - Automatically compares HEAD with HEAD~1 on page load
  - View commit messages, authors, and timestamps
  - See all changed files with additions/deletions summary

- **Version Tag Comparison**
  - Compare any two version tags (e.g., v1.0, v2.0)
  - Perfect for analyzing release changes
  - Auto-selects the two most recent tags

- **Branch Explorer**
  - Browse files across different branches
  - Navigate directory structures
  - View file contents at any branch

### 📊 Smart Diff Viewing

- **Lazy Loading** - Diffs load only when you expand a file (perfect for large repositories)
- **Color-Coded Diffs** - Green for additions, red for deletions, blue for context
- **Filter by Status** - Show only modified, added, or removed files
- **No Timeout Errors** - Works with very large repositories by loading file-by-file

### 🎯 Performance Optimized

- **File-by-File Loading** - Avoids GitHub's "diff taking too long" error
- **Progressive Loading** - View file list immediately, diffs load on demand
- **Large Repository Support** - Tested with enterprise-scale codebases
- **Efficient API Usage** - Minimal API calls with smart caching

### 💡 User-Friendly Features

- **Repository Configuration** - Easily switch between repositories
- **GitHub Token Support** - Add your token to increase rate limits (60/hour → 5,000/hour)
- **Error Handling** - Clear messages for 404s, rate limits, and timeouts
- **Responsive Design** - Works on desktop and tablet screens

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/git-commit-explorer.git

# Navigate to the project directory
cd git-commit-explorer

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will open at `http://localhost:5173`

### First Time Setup

1. **Configure Repository**
   - Click on "Repository Settings" in the sidebar
   - Enter the GitHub repository owner (e.g., `facebook`)
   - Enter the repository name (e.g., `react`)
   - (Optional) Add a GitHub Personal Access Token

2. **Start Exploring**
   - The app will automatically load the latest commit comparison
   - Click on any file to view its diff
   - Use mode selector to switch between comparison modes

## 📖 Usage

### Viewing Latest Commit Changes

1. Open the app (defaults to "Latest Commit" mode)
2. See the current (HEAD) and previous (HEAD~1) commit information
3. Browse the list of changed files
4. Click any file to expand and view the diff

### Comparing Version Tags

1. Click "Version Tags" in the mode selector
2. Select a base tag (older version)
3. Select a head tag (newer version)
4. View all changes between the two versions
5. Click files to see detailed diffs

### Browsing by Branch

1. Click "Branches" in the mode selector
2. Select a branch from the list
3. Navigate the file tree
4. Click files to view their contents

### Filtering Files

- Click "All" to show all changed files
- Click "Modified" to show only modified files
- Click "Added" to show only new files
- Click "Removed" to show only deleted files

## 🔧 Configuration

### GitHub Personal Access Token

To avoid rate limits and access private repositories:

1. Go to [GitHub Settings → Developer Settings → Personal Access Tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Select scopes:
   - `repo` (for private repositories)
   - `public_repo` (for public repositories only)
4. Copy the token
5. In the app, open "Repository Settings" and paste the token

**Rate Limits:**
- Without token: 60 requests/hour
- With token: 5,000 requests/hour

### Custom Default Repository

Edit the default repository in `src/context/AppContext.tsx`:

```typescript
const defaultRepo: RepoConfig = {
  owner: 'your-username',
  repo: 'your-repo',
}
```

## 🛠️ Tech Stack

- **React 18** - UI framework
- **TypeScript 5** - Type safety
- **Vite 5** - Build tool and dev server
- **Tailwind CSS 3** - Styling
- **diff** - Client-side diff generation
- **GitHub REST API** - Data source

## 📁 Project Structure

```
git-commit-explorer/
├── src/
│   ├── api/
│   │   └── github.ts          # GitHub API integration
│   ├── components/
│   │   ├── CommitComparer.tsx # HEAD vs HEAD~1 comparison
│   │   ├── TagComparer.tsx    # Tag comparison UI
│   │   ├── DiffViewer.tsx     # Lazy-loading diff viewer
│   │   ├── BranchExplorer.tsx # Branch browser
│   │   ├── FileTree.tsx       # File navigator
│   │   ├── CodeViewer.tsx     # File content viewer
│   │   ├── ModeSelector.tsx   # Mode switcher
│   │   └── Layout.tsx         # App layout
│   ├── context/
│   │   └── AppContext.tsx     # State management
│   ├── styles/
│   │   └── index.css          # Global styles
│   ├── App.tsx                # Main component
│   └── main.tsx               # Entry point
├── index.html
├── package.json
└── vite.config.ts
```

## 🎨 Features in Detail

### Lazy-Loading Diffs

Instead of loading all diffs at once (which causes timeouts for large repos), the app:
1. Fetches only the list of changed files initially
2. When you click a file, it fetches the old and new versions
3. Generates the diff client-side using the `diff` library
4. Caches the result for instant re-expansion

### File-by-File Approach

**Traditional approach (fails for large repos):**
```
GET /compare/base...head
→ GitHub tries to generate all diffs
→ 422 Error: "Sorry, this diff is taking too long to generate"
```

**Our approach (works for any size):**
```
GET /compare/base...head (without diffs)
→ Returns: list of changed files with metadata

For each file when clicked:
GET /contents/{file}?ref={base}
GET /contents/{file}?ref={head}
→ Generate diff client-side
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- GitHub REST API for providing comprehensive repository data
- The React and Vite teams for excellent developer tools
- The open-source community for inspiration and support

## 📞 Support

If you encounter any issues or have questions:
- Open an issue on GitHub
- Check existing issues for solutions
- Consult the [GitHub API documentation](https://docs.github.com/en/rest)

## 🗺️ Roadmap

- [ ] Side-by-side diff view
- [ ] Syntax highlighting in diffs
- [ ] Download patches
- [ ] Compare arbitrary commits
- [ ] Search within diffs
- [ ] Dark mode
- [ ] Export comparison reports

---

**Built with ❤️ for developers who love exploring code history**

export type Branch = { name: string }
export type ContentItem = {
  type: 'dir' | 'file'
  name: string
  path: string
  size?: number
}

export type GitHubConfig = {
  owner: string
  repo: string
  token?: string
}

export type Commit = {
  sha: string
  message: string
  author: {
    name: string
    email: string
    date: string
  }
  committer: {
    name: string
    email: string
    date: string
  }
}

export type DiffFile = {
  sha: string
  filename: string
  status: 'added' | 'removed' | 'modified' | 'renamed' | 'copied' | 'changed' | 'unchanged'
  additions: number
  deletions: number
  changes: number
  patch?: string
  previous_filename?: string
}

export type CompareResult = {
  base_commit: {
    sha: string
    commit: {
      message: string
      author: { name: string; email: string; date: string }
      committer: { name: string; email: string; date: string }
    }
  }
  commits: Commit[]
  files: DiffFile[]
}

export type Tag = {
  name: string
  commit: {
    sha: string
    url: string
  }
}

const API_BASE = 'https://api.github.com'

function headers(token?: string) {
  const h: Record<string, string> = {
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
  if (token) h['Authorization'] = `Bearer ${token}`
  return h
}

export class GitHubApiError extends Error {
  status: number
  remaining: number
  reset: number
  constructor(message: string, status: number, remaining: number, reset: number) {
    super(message)
    this.name = 'GitHubApiError'
    this.status = status
    this.remaining = remaining
    this.reset = reset
  }
}

async function gh<T>(url: string, token?: string): Promise<{ data: T; rate?: { remaining: number; reset: number } }> {
  const res = await fetch(url, { headers: headers(token) })
  const remaining = Number(res.headers.get('x-ratelimit-remaining') || '0')
  const reset = Number(res.headers.get('x-ratelimit-reset') || '0')
  if (!res.ok) {
    const text = await res.text()
    let msg = text
    try {
      const j = JSON.parse(text)
      msg = j.message || text
    } catch {}
    throw new GitHubApiError(msg, res.status, remaining, reset)
  }
  const data = await res.json()
  return { data, rate: { remaining, reset } }
}

export async function listBranches(cfg: GitHubConfig, page = 1, per_page = 100): Promise<Branch[]> {
  const url = `${API_BASE}/repos/${cfg.owner}/${cfg.repo}/branches?per_page=${per_page}&page=${page}`
  const { data } = await gh<Branch[]>(url, cfg.token)
  return data
}

export async function listAllBranches(cfg: GitHubConfig): Promise<Branch[]> {
  const per = 100
  let page = 1
  let out: Branch[] = []
  // Paginate until less than per results returned
  while (true) {
    const chunk = await listBranches(cfg, page, per)
    out = out.concat(chunk)
    if (chunk.length < per) break
    page += 1
  }
  return out
}

export async function listContents(cfg: GitHubConfig, path = '', ref?: string): Promise<ContentItem[]> {
  const encPath = path ? `/${encodeURIComponent(path).replace(/%2F/g, '/')}` : ''
  const refQuery = ref ? `?ref=${encodeURIComponent(ref)}` : ''
  const url = `${API_BASE}/repos/${cfg.owner}/${cfg.repo}/contents${encPath}${refQuery}`
  const { data } = await gh<any[]>(url, cfg.token)
  return data.map((d) => ({ type: d.type, name: d.name, path: d.path, size: d.size }))
}

export async function getFileContent(cfg: GitHubConfig, path: string, ref?: string): Promise<{ content: string; size?: number }> {
  const encPath = `/${encodeURIComponent(path).replace(/%2F/g, '/')}`
  const refQuery = ref ? `?ref=${encodeURIComponent(ref)}` : ''
  const url = `${API_BASE}/repos/${cfg.owner}/${cfg.repo}/contents${encPath}${refQuery}`
  const { data } = await gh<any>(url, cfg.token)
  if (!data.content || data.encoding !== 'base64') throw new Error('Unexpected file content response')
  const decoded = decodeBase64(data.content)
  return { content: decoded, size: data.size }
}

// Get file content at a specific commit SHA
export async function getFileContentAtCommit(cfg: GitHubConfig, path: string, commitSha: string): Promise<{ content: string; size?: number } | null> {
  try {
    return await getFileContent(cfg, path, commitSha)
  } catch (e: any) {
    // File might not exist at this commit (added or removed)
    if (e instanceof GitHubApiError && e.status === 404) {
      return null
    }
    throw e
  }
}

// Get both old and new versions of a file for diffing
export async function getFileVersions(cfg: GitHubConfig, path: string, baseSha: string, headSha: string): Promise<{
  oldContent: string | null
  newContent: string | null
  oldSize?: number
  newSize?: number
}> {
  const [oldFile, newFile] = await Promise.all([
    getFileContentAtCommit(cfg, path, baseSha),
    getFileContentAtCommit(cfg, path, headSha)
  ])
  
  return {
    oldContent: oldFile?.content || null,
    newContent: newFile?.content || null,
    oldSize: oldFile?.size,
    newSize: newFile?.size,
  }
}

export function decodeBase64(b64: string): string {
  // Handle large/base64 strings and unicode safely
  try {
    return decodeURIComponent(escape(atob(b64.replace(/\n/g, ''))))
  } catch {
    // Fallback
    return atob(b64.replace(/\n/g, ''))
  }
}

export function groupBranchName(name: string): { locale: string; version: string } {
  // Split strictly by the first '-' as requested
  const idx = name.indexOf('-')
  if (idx === -1) {
    return { locale: name.toLowerCase(), version: '' }
  }
  const locale = name.slice(0, idx).toLowerCase()
  const version = name.slice(idx + 1)
  return { locale, version }
}

// Get list of commits
export async function listCommits(cfg: GitHubConfig, per_page = 100, page = 1): Promise<Commit[]> {
  const url = `${API_BASE}/repos/${cfg.owner}/${cfg.repo}/commits?per_page=${per_page}&page=${page}`
  const { data } = await gh<any[]>(url, cfg.token)
  return data.map(c => ({
    sha: c.sha,
    message: c.commit.message,
    author: c.commit.author,
    committer: c.commit.committer,
  }))
}

// Get a specific commit
export async function getCommit(cfg: GitHubConfig, ref: string): Promise<Commit> {
  const url = `${API_BASE}/repos/${cfg.owner}/${cfg.repo}/commits/${encodeURIComponent(ref)}`
  const { data } = await gh<any>(url, cfg.token)
  return {
    sha: data.sha,
    message: data.commit.message,
    author: data.commit.author,
    committer: data.commit.committer,
  }
}

// Compare two commits (or refs like HEAD, HEAD~1, tags)
// NOTE: For large diffs, GitHub won't include the patch field, so we fetch file contents separately
export async function compareCommits(cfg: GitHubConfig, base: string, head: string): Promise<CompareResult> {
  const url = `${API_BASE}/repos/${cfg.owner}/${cfg.repo}/compare/${encodeURIComponent(base)}...${encodeURIComponent(head)}`
  const { data } = await gh<any>(url, cfg.token)
  
  // Map files but don't rely on patch field (it's often missing for large diffs)
  const files: DiffFile[] = data.files?.map((f: any) => ({
    sha: f.sha,
    filename: f.filename,
    status: f.status,
    additions: f.additions,
    deletions: f.deletions,
    changes: f.changes,
    patch: f.patch, // May be undefined for large diffs - that's OK
    previous_filename: f.previous_filename,
  })) || []
  
  return {
    base_commit: data.base_commit,
    commits: data.commits || [],
    files,
  }
}

// Get latest commit and compare with previous
export async function getLatestCommitComparison(cfg: GitHubConfig): Promise<{
  current: Commit
  previous: Commit
  comparison: CompareResult
}> {
  // Get the latest commit (HEAD)
  const current = await getCommit(cfg, 'HEAD')
  
  // Get the previous commit (HEAD~1)
  const previous = await getCommit(cfg, 'HEAD~1')
  
  // Compare them
  const comparison = await compareCommits(cfg, previous.sha, current.sha)
  
  return {
    current,
    previous,
    comparison,
  }
}

// List all tags
export async function listTags(cfg: GitHubConfig, per_page = 100, page = 1): Promise<Tag[]> {
  const url = `${API_BASE}/repos/${cfg.owner}/${cfg.repo}/tags?per_page=${per_page}&page=${page}`
  const { data } = await gh<Tag[]>(url, cfg.token)
  return data
}

// List all tags with pagination
export async function listAllTags(cfg: GitHubConfig): Promise<Tag[]> {
  const per = 100
  let page = 1
  let out: Tag[] = []
  while (true) {
    const chunk = await listTags(cfg, per, page)
    out = out.concat(chunk)
    if (chunk.length < per) break
    page += 1
  }
  return out
}

// Compare two tags
export async function compareTags(cfg: GitHubConfig, baseTag: string, headTag: string): Promise<CompareResult> {
  return compareCommits(cfg, baseTag, headTag)
}

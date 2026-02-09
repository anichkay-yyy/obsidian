const API_BASE = '/api'

export interface FileInfo {
  path: string
  name: string
  isDir: boolean
}

export interface FileContent {
  path: string
  content: string
  html?: string
  links?: Array<{
    raw: string
    target: string
    alias: string
    isDir: boolean
  }>
}

export interface Node {
  id: string
  type: 'file' | 'directory'
  title: string
  path: string
}

export interface Edge {
  source: string
  target: string
}

export interface Graph {
  nodes: Node[]
  edges: Edge[]
}

export interface SearchResult {
  path: string
  title: string
  snippet: string
}

class ApiClient {
  private auth: string

  constructor(username: string, password: string) {
    this.auth = 'Basic ' + btoa(username + ':' + password)
  }

  private async fetch(url: string, options: RequestInit = {}) {
    const response = await fetch(API_BASE + url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': this.auth,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`)
    }

    return response.json()
  }

  async listFiles(): Promise<FileInfo[]> {
    return this.fetch('/files')
  }

  async readFile(path: string): Promise<FileContent> {
    return this.fetch('/files/' + path)
  }

  async writeFile(path: string, content: string): Promise<void> {
    await this.fetch('/files/' + path, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    })
  }

  async deleteFile(path: string): Promise<void> {
    await this.fetch('/files/' + path, {
      method: 'DELETE',
    })
  }

  async getGraph(): Promise<Graph> {
    return this.fetch('/graph')
  }

  async getBacklinks(path: string): Promise<{ path: string; backlinks: string[] }> {
    return this.fetch('/backlinks/' + path)
  }

  async search(query: string): Promise<SearchResult[]> {
    return this.fetch('/search?q=' + encodeURIComponent(query))
  }
}

export default ApiClient

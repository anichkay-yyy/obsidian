import { create } from 'zustand'
import ApiClient, { FileInfo, Graph, Node } from '@/lib/api'

interface AppState {
  // API client
  api: ApiClient | null
  authenticated: boolean

  // Files
  files: FileInfo[]
  currentFile: string | null
  currentContent: string

  // Graph
  graph: Graph | null
  selectedNode: Node | null

  // UI
  showGraph: boolean
  showPreview: boolean
  sidebarCollapsed: boolean

  // Actions
  login: (username: string, password: string) => void
  loadFiles: () => Promise<void>
  loadFile: (path: string) => Promise<void>
  saveFile: (path: string, content: string) => Promise<void>
  deleteFile: (path: string) => Promise<void>
  loadGraph: () => Promise<void>
  setSelectedNode: (node: Node | null) => void
  toggleGraph: () => void
  togglePreview: () => void
  toggleSidebar: () => void
  setCurrentContent: (content: string) => void
}

const useStore = create<AppState>((set, get) => ({
  api: null,
  authenticated: false,
  files: [],
  currentFile: null,
  currentContent: '',
  graph: null,
  selectedNode: null,
  showGraph: false,
  showPreview: true,
  sidebarCollapsed: false,

  login: (username: string, password: string) => {
    const api = new ApiClient(username, password)
    set({ api, authenticated: true })
  },

  loadFiles: async () => {
    const { api } = get()
    if (!api) return

    try {
      const files = await api.listFiles()
      set({ files })
    } catch (error) {
      console.error('Failed to load files:', error)
    }
  },

  loadFile: async (path: string) => {
    const { api } = get()
    if (!api) return

    try {
      const file = await api.readFile(path)
      set({
        currentFile: path,
        currentContent: file.content
      })
    } catch (error) {
      console.error('Failed to load file:', error)
    }
  },

  saveFile: async (path: string, content: string) => {
    const { api } = get()
    if (!api) return

    try {
      await api.writeFile(path, content)
      // Reload graph after save
      await get().loadGraph()
    } catch (error) {
      console.error('Failed to save file:', error)
    }
  },

  deleteFile: async (path: string) => {
    const { api } = get()
    if (!api) return

    try {
      await api.deleteFile(path)
      await get().loadFiles()
      await get().loadGraph()

      // Clear current file if it was deleted
      if (get().currentFile === path) {
        set({ currentFile: null, currentContent: '' })
      }
    } catch (error) {
      console.error('Failed to delete file:', error)
    }
  },

  loadGraph: async () => {
    const { api } = get()
    if (!api) return

    try {
      const graph = await api.getGraph()
      set({ graph })
    } catch (error) {
      console.error('Failed to load graph:', error)
    }
  },

  setSelectedNode: (node: Node | null) => {
    set({ selectedNode: node })
  },

  toggleGraph: () => {
    set({ showGraph: !get().showGraph })
  },

  togglePreview: () => {
    set({ showPreview: !get().showPreview })
  },

  toggleSidebar: () => {
    set({ sidebarCollapsed: !get().sidebarCollapsed })
  },

  setCurrentContent: (content: string) => {
    set({ currentContent: content })
  },
}))

export default useStore
